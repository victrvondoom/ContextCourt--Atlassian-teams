/**
 * Rovo action handlers (rovo:action modules) and the rovo:mcp tool surface.
 *
 * Read-only actions (get-case, investigate-issue, get-evidence, get-impact,
 * get-approval-status) run with the invoking user's permissions via the Jira
 * asUser() fetcher. The single mutating action, prepare-remediation, only
 * creates a proposal in PENDING_APPROVAL — it never touches Jira. Executing a
 * proposal requires a human approval binding (core/approval.ts) and is
 * deliberately not exposed as an agent tool.
 */
import { kvs, WhereConditions } from '@forge/kvs';
import { z } from 'zod';
import { investigateIssueCore, productionJiraFetcher } from '../resolvers';
import { JiraAdapter } from '../integrations/jira';
import { KvsCaseRepository } from '../storage/caseStore';
import { analyzeImpact } from '../core/impact';
import type { DependencyEdge } from '../core/impact';
import { draftProposal } from '../core/remediation';
import { recordAuditEvent, type AuditSink } from '../audit/auditLog';
import { digestPayload } from '../core/digest';
import type { RemediationProposal } from '../core/types';
import type { ProposalDraft } from '../core/remediation';

// ---------------------------------------------------------------------------
// Shared plumbing
// ---------------------------------------------------------------------------

function tenantContext(context: unknown): { tenantId: string; userId: string } | null {
  const c = context as
    { context?: { cloudId?: string; accountIdId?: string; accountId?: string } } | undefined;
  const cloudId = c?.context?.cloudId;
  const accountId = c?.context?.accountId;
  if (!cloudId || !accountId) return null;
  return { tenantId: cloudId, userId: accountId };
}

const caseIdSchema = z.string().regex(/^[A-Za-z0-9_-]+$/, 'valid case id required');
const proposalIdSchema = z.string().regex(/^prop_[A-Za-z0-9_-]+$/, 'valid proposal id required');

/** Forge KVS-backed repository. Keys are tenant-prefixed inside the class. */
const caseRepo = new KvsCaseRepository(kvs as unknown as import('../storage/caseStore').KvsLike);

/** KVS-backed audit sink, tenant-isolated by key prefix + payload check. */
const auditSink: AuditSink = {
  async append(event) {
    await kvs.set(`audit:${event.tenantId}:${event.id}`, event);
  },
  async readAll(tenantId) {
    const events: import('../core/types').AuditEvent[] = [];
    let cursor: string | undefined;
    do {
      const builder = kvs
        .query()
        .where('key', WhereConditions.beginsWith(`audit:${tenantId}:`))
        .limit(50);
      const page = await (cursor ? builder.cursor(cursor) : builder).getMany<
        import('../core/types').AuditEvent
      >();
      for (const item of page.results) {
        if (item.value?.tenantId === tenantId) events.push(item.value);
      }
      cursor = page.nextCursor;
    } while (cursor);
    return events;
  },
};

interface ProposalStored {
  proposal: RemediationProposal;
}

async function putProposal(proposal: RemediationProposal): Promise<void> {
  await kvs.set(`proposal:${proposal.tenantId}:${proposal.id}`, proposal);
}

async function getProposal(tenantId: string, proposalId: string): Promise<RemediationProposal | null> {
  const value = (await kvs.get(`proposal:${tenantId}:${proposalId}`)) as ProposalStored | undefined;
  // Defense in depth: reject records whose tenant does not match the key tenant.
  if (!value?.proposal || value.proposal.tenantId !== tenantId) return null;
  return value.proposal;
}

// ---------------------------------------------------------------------------
// Input schemas (every action validates its input)
// ---------------------------------------------------------------------------

const issueKeySchema = z.string().regex(/^[A-Z][A-Z0-9]*-\d+$/, 'valid Jira issue key required');
const operationSchema = z.enum([
  'create_remediation_issue',
  'request_missing_approval',
  'add_decision_reference',
  'flag_requirement_mismatch',
  'recommend_review',
  'assign_followup_owner',
]);

// ---------------------------------------------------------------------------
// Read-only actions
// ---------------------------------------------------------------------------

/** contextcourt-get-case */
export async function getCase({ payload, context }: { payload: unknown; context: unknown }) {
  const tenant = tenantContext(context);
  if (!tenant) return { status: 'UNAUTHENTICATED', error: 'tenant context missing' };
  const parsed = caseIdSchema.safeParse((payload as { caseId?: unknown })?.caseId);
  if (!parsed.success) return { status: 'INVALID_INPUT', error: 'valid caseId required' };
  const record = await caseRepo.get(tenant.tenantId, parsed.data);
  if (!record) return { status: 'NOT_FOUND', case: null };
  return { status: 'OK', case: record };
}

/** contextcourt-investigate-issue */
export async function investigateIssue({ payload, context }: { payload: unknown; context: unknown }) {
  const tenant = tenantContext(context);
  if (!tenant) return { status: 'UNAUTHENTICATED', error: 'tenant context missing' };
  const parsed = issueKeySchema.safeParse((payload as { issueKey?: unknown })?.issueKey);
  if (!parsed.success) return { status: 'INVALID_INPUT', error: 'valid Jira issue key required' };
  return investigateIssueCore(tenant.tenantId, tenant.userId, parsed.data);
}

/** contextcourt-get-evidence */
export async function getEvidence({ payload, context }: { payload: unknown; context: unknown }) {
  const tenant = tenantContext(context);
  if (!tenant) return { status: 'UNAUTHENTICATED', error: 'tenant context missing' };
  const parsed = issueKeySchema.safeParse((payload as { issueKey?: unknown })?.issueKey);
  if (!parsed.success) return { status: 'INVALID_INPUT', error: 'valid Jira issue key required' };
  const adapter = new JiraAdapter(productionJiraFetcher);
  try {
    const issue = await adapter.getIssue(parsed.data);
    const evidence = [];
    if (issue.description) {
      evidence.push({
        id: `ev_${issue.key}`,
        sourceSystem: 'jira' as const,
        sourceObjectId: issue.key,
        extractedText: issue.description,
        sourceUpdatedAt: issue.updated,
        // Content digests let consumers detect altered text between reads.
        contentDigest: await digestPayload(`${issue.key}:${issue.description}`),
        citation: `Jira issue ${issue.key} (description), updated ${issue.updated ?? 'unknown'}`,
      });
    }
    for (let i = 0; i < issue.comments.length; i++) {
      const c = issue.comments[i]!;
      evidence.push({
        id: `ev_${issue.key}-c${i}`,
        sourceSystem: 'jira' as const,
        sourceObjectId: `${issue.key}:comment:${i}`,
        extractedText: c.body,
        sourceUpdatedAt: c.created,
        contentDigest: await digestPayload(`${issue.key}:comment:${i}:${c.body}`),
        citation: `Jira issue ${issue.key}, comment #${i} by ${c.author} at ${c.created}`,
      });
    }
    return { status: 'OK', evidence };
  } catch (err) {
    return {
      status: 'UNAVAILABLE',
      error: err instanceof Error ? err.message : 'jira request failed',
    };
  }
}

/** contextcourt-get-impact */
export async function getImpact({ payload, context }: { payload: unknown; context: unknown }) {
  const tenant = tenantContext(context);
  if (!tenant) return { status: 'UNAUTHENTICATED', error: 'tenant context missing' };
  const parsed = issueKeySchema.safeParse((payload as { issueKey?: unknown })?.issueKey);
  if (!parsed.success) return { status: 'INVALID_INPUT', error: 'valid Jira issue key required' };
  const maxDepth = z.coerce
    .number()
    .int()
    .min(1)
    .max(10)
    .default(4)
    .safeParse((payload as { maxDepth?: unknown })?.maxDepth);
  const adapter = new JiraAdapter(productionJiraFetcher);
  try {
    const issue = await adapter.getIssue(parsed.data);
    // Verified edges come from Jira issuelinks; without links the graph is
    // reported as inferred-only rather than presented as verified.
    const edges: DependencyEdge[] = issue.issuelinks.map((l) => ({
      fromKey: issue.key,
      toKey: l.key,
      kind: l.direction,
      verified: true,
      provenance: `jira issuelinks on ${issue.key}`,
    }));
    const result = analyzeImpact(issue.key, edges, maxDepth.success ? maxDepth.data : 4);
    return {
      status: 'OK',
      rootKey: issue.key,
      affected: result.affected,
      inferredOnly: result.inferredOnly,
      hypothetical: false,
      note:
        result.inferredOnly.length > 0
          ? 'Some affected work was reached through inferred edges only; those paths are not verified.'
          : null,
    };
  } catch (err) {
    return {
      status: 'UNAVAILABLE',
      error: err instanceof Error ? err.message : 'jira request failed',
    };
  }
}

/** contextcourt-get-approval-status */
export async function getApprovalStatus({ payload, context }: { payload: unknown; context: unknown }) {
  const tenant = tenantContext(context);
  if (!tenant) return { status: 'UNAUTHENTICATED', error: 'tenant context missing' };
  const parsed = proposalIdSchema.safeParse((payload as { proposalId?: unknown })?.proposalId);
  if (!parsed.success) return { status: 'INVALID_INPUT', error: 'valid proposalId required' };
  const proposal = await getProposal(tenant.tenantId, parsed.data);
  if (!proposal) return { status: 'NOT_FOUND', proposal: null };
  // Approval identity is never exposed through agent tools; only its presence.
  return {
    status: 'OK',
    proposalId: proposal.id,
    state: proposal.state,
    operation: proposal.operation,
    target: proposal.target,
    risk: proposal.risk,
    expectedChange: proposal.expectedChange,
    approverPresent: proposal.binding !== null,
    expiresAt: proposal.binding?.expiresAt ?? null,
  };
}

// ---------------------------------------------------------------------------
// Mutating action — proposal only, never execution
// ---------------------------------------------------------------------------

/** contextcourt-prepare-remediation */
export async function prepareRemediation({ payload, context }: { payload: unknown; context: unknown }) {
  const tenant = tenantContext(context);
  if (!tenant) return { status: 'UNAUTHENTICATED', error: 'tenant context missing' };
  const body = (payload ?? {}) as { caseId?: unknown; findingId?: unknown; operation?: unknown };
  const caseId = caseIdSchema.safeParse(body.caseId);
  const findingId = z.string().min(1).safeParse(body.findingId);
  const operation = operationSchema.safeParse(body.operation);
  if (!caseId.success || !findingId.success || !operation.success) {
    return { status: 'INVALID_INPUT', error: 'caseId, findingId and operation are required' };
  }

  const record = await caseRepo.get(tenant.tenantId, caseId.data);
  if (!record) return { status: 'NOT_FOUND', error: 'case not found' };
  const finding = record.findingIds.length > 0 ? await loadFinding(tenant.tenantId, findingId.data) : null;
  if (!finding) {
    return { status: 'NOT_FOUND', error: 'finding not found for this case' };
  }

  try {
    const draft: ProposalDraft = await draftProposal({
      tenantId: tenant.tenantId,
      caseId: record.caseId,
      finding,
      operation: operation.data,
      expectedChange: `Proposed by ContextCourt for case ${record.caseId}: ${operation.data}`,
      actor: tenant.userId,
      now: new Date(),
    });
    // Proposals are created in PENDING_APPROVAL; the actor cannot self-approve.
    const proposal: RemediationProposal = {
      ...draft.proposal,
      state: 'PENDING_APPROVAL',
      binding: null,
    };
    await putProposal(proposal);
    await recordAuditEvent(
      auditSink,
      {
        tenantId: tenant.tenantId,
        actor: tenant.userId,
        action: 'prepare_remediation',
        target: proposal.id,
        result: 'success',
        linkedEvidenceIds: proposal.supportingFindingIds,
        requestFingerprint: await digestPayload(proposal.payloadDigest),
      },
      new Date(),
    );
    return { status: 'OK', proposalId: proposal.id, state: proposal.state };
  } catch (err) {
    return {
      status: 'PROPOSAL_FAILED',
      error: err instanceof Error ? err.message : 'proposal generation failed',
    };
  }
}

/** Load a stored finding by id (findings are stored alongside their case). */
async function loadFinding(tenantId: string, findingId: string) {
  const value = (await kvs.get(`finding:${tenantId}:${findingId}`)) as
    import('../core/types').Finding | undefined;
  if (!value || value.tenantId !== tenantId) return null;
  return value;
}

export const rovoActionHandlers = {
  'contextcourt-get-case': getCase,
  'contextcourt-investigate-issue': investigateIssue,
  'contextcourt-get-evidence': getEvidence,
  'contextcourt-get-impact': getImpact,
  'contextcourt-prepare-remediation': prepareRemediation,
  'contextcourt-get-approval-status': getApprovalStatus,
};
