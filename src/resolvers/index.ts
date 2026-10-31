/**
 * Forge backend resolvers for the Custom UI.
 *
 * Thin layer: validate input (zod), enforce tenant context, delegate to core
 * modules and the Jira adapter. In the Forge runtime the Jira fetcher uses
 * api.asUser().requestJira, so calls run with the invoking user's permissions.
 */
import Resolver from '@forge/resolver';
import { assumeTrustedRoute, requestJira } from '@forge/api';
import { z } from 'zod';
import { JiraAdapter } from '../integrations/jira';
import { buildIssueEvidence } from '../integrations/evidence';
import { normalizeAll } from '../core/normalizer';
import { analyze, type AnalysisResult } from '../core/contradiction';
import { digestPayload, sha256Hex } from '../core/digest';
import { decideProposal, executeProposal, DecisionError } from '../core/execution';
import { verifyExecutionOutcome } from '../core/verification';
import { orderReviewQueue } from '../core/queue';
import { draftProposal } from '../core/remediation';

import { KvsCaseRepository, type KvsLike, type CaseRecord } from '../storage/caseStore';
import { KvsAuditRepository, type AuditSinkLike } from '../storage/auditStore';
import { KvsProposalRepository } from '../storage/proposalStore';
import { recordAuditEvent, type AuditSink } from '../audit/auditLog';
import { kvs } from '@forge/kvs';
import type { EvidenceRecord, Finding, RemediationProposal } from '../core/types';
import type { JiraFetcher } from '../integrations/jira';

// ---------------------------------------------------------------------------
// Production fetcher — user-scoped Jira REST access.
// ---------------------------------------------------------------------------

export const productionJiraFetcher: JiraFetcher = async (path, init) => {
  // Paths are constructed internally from regex-validated issue keys only, so
  // they qualify as trusted routes. Never pass raw user input here.
  const res = await requestJira(assumeTrustedRoute(path), {
    method: init?.method ?? 'GET',
    headers: { 'content-type': 'application/json', accept: 'application/json' },
    ...(init?.body ? { body: JSON.stringify(init.body) } : {}),
  });
  let json: unknown = null;
  try {
    json = await res.json();
  } catch {
    json = null;
  }
  return { ok: res.ok, status: res.status, json };
};

// ---------------------------------------------------------------------------
// Validation schemas
// ---------------------------------------------------------------------------

const issueKeySchema = z.string().regex(/^[A-Z][A-Z0-9]*-\d+$/, 'valid Jira issue key required');

// ---------------------------------------------------------------------------
// Resolver handlers
// ---------------------------------------------------------------------------

const resolver = new Resolver();

/**
 * Health must be measured, not asserted (defect CC-004): the Jira state is
 * the result of an actual authorized probe call, not a hardcoded value.
 */
resolver.define('health', async () => {
  const integrations = {
    jira: 'unavailable' as 'available' | 'degraded' | 'unavailable' | 'not-wired',
    teamworkGraph: 'not-wired' as const,
    rovoAgent: 'not-wired' as const,
    mcp: 'not-wired' as const,
  };
  try {
    const res = await productionJiraFetcher('/rest/api/3/myself');
    integrations.jira = res.ok
      ? 'available'
      : res.status === 401 || res.status === 403
        ? 'unavailable'
        : 'degraded';
  } catch {
    integrations.jira = 'unavailable';
  }
  return {
    app: 'contextcourt-ai',
    version: '0.1.0',
    integrations,
    checkedAt: new Date().toISOString(),
  };
});

resolver.define('listCases', async (ctx: unknown) => {
  const c = ctx as { context?: { cloudId?: string } };
  if (!c.context?.cloudId) return { cases: [] };
  const repo = new KvsCaseRepository(kvs as unknown as KvsLike);
  return { cases: await repo.list(c.context.cloudId) };
});

resolver.define('listAuditEvents', async (ctx: unknown) => {
  const c = ctx as { context?: { cloudId?: string } };
  if (!c.context?.cloudId) return { events: [] };
  const audit = new KvsAuditRepository(kvs as unknown as AuditSinkLike);
  return { events: await audit.readAll(c.context.cloudId) };
});

const caseIdResolverSchema = z.string().regex(/^[A-Za-z0-9_-]+$/, 'valid case id required');

/** Full case record with its stored findings (tenant-isolated). */
resolver.define('getCase', async (ctx: unknown) => {
  const c = ctx as { payload?: unknown; context?: { cloudId?: string } };
  if (!c.context?.cloudId) return { status: 'UNAUTHENTICATED', error: 'tenant context missing' };
  const parsed = caseIdResolverSchema.safeParse((c.payload as { caseId?: unknown })?.caseId);
  if (!parsed.success) return { status: 'INVALID_INPUT', error: 'valid caseId required' };
  const repo = new KvsCaseRepository(kvs as unknown as KvsLike);
  const record = await repo.get(c.context.cloudId, parsed.data);
  if (!record) return { status: 'NOT_FOUND', case: null, findings: [] };
  const kvsClient = kvs as unknown as KvsLike;
  const findings: Finding[] = [];
  for (const id of record.findingIds) {
    const f = (await kvsClient.get(`finding:${c.context.cloudId}:${id}`)) as Finding | undefined;
    if (f && f.tenantId === c.context.cloudId) findings.push(f);
  }
  return { status: 'OK', case: record, findings };
});

resolver.define('analyzeIssue', async (ctx: unknown) => {
  const c = ctx as { payload?: unknown; context?: { cloudId?: string; accountId?: string } };
  const payload = issueKeySchema.safeParse((c.payload as { issueKey?: unknown })?.issueKey);
  if (!payload.success) {
    return { status: 'ANALYSIS_FAILED', error: 'invalid input', detail: payload.error.issues };
  }
  const cloudId = c.context?.cloudId;
  const userId = c.context?.accountId;
  if (!cloudId || !userId) {
    return { status: 'ANALYSIS_FAILED', error: 'unauthenticated context' };
  }
  return investigateIssueCore(cloudId, userId, payload.data);
});

/**
 * Shared investigation pipeline used by the Custom UI resolver and the Rovo
 * action. Builds evidence from authorized Jira content (description +
 * comments, user-scoped via asUser), normalizes it, and classifies
 * contradictions. Missing evidence yields CONSISTENT/INSUFFICIENT_EVIDENCE —
 * never a verified contradiction.
 *
 * Findings and a case record are persisted (tenant-scoped KVS) so the Review
 * queue, case list, and prepare-remediation operate on real stored state
 * instead of an unreachable path (defect CC-002). Every run — success or
 * failure — is recorded in the tenant's digest-chained audit ledger, so the
 * Audit ledger view reflects real activity, not a static placeholder.
 */
export interface InvestigateDeps {
  /** Injected Jira transport (tests pass a fake; production uses asUser). */
  jiraFetcher?: JiraFetcher;
  /** Injected KVS client (tests pass a fake). */
  kvs?: KvsLike & AuditSinkLike;
  /** Injected audit sink (tests pass a fake). */
  auditSink?: AuditSink;
}

export async function investigateIssueCore(
  cloudId: string,
  userId: string,
  issueKey: string,
  deps: InvestigateDeps = {},
) {
  const fetcher = deps.jiraFetcher ?? productionJiraFetcher;
  const kvsClient = (deps.kvs ?? kvs) as KvsLike & AuditSinkLike;
  const auditSink: AuditSink = deps.auditSink ?? new KvsAuditRepository(kvsClient);
  const adapter = new JiraAdapter(fetcher);
  let evidence: EvidenceRecord[] = [];
  try {
    const issue = await adapter.getIssue(issueKey);

    // Build evidence from authorized Jira content (description + comments).
    evidence = (await buildIssueEvidence(cloudId, userId, issue)).map((b) => b.evidence);

    const propositions = normalizeAll(evidence);
    const result = analyze({
      tenantId: cloudId,
      evidence,
      propositions,
      affectedWork: [{ type: 'jira_issue', key: issue.key }],
    });

    // Persist findings + case so downstream actions (get-case, get-impact,
    // prepare-remediation, review queue) can operate on stored state.
    const stored = await persistAnalysisResult(cloudId, userId, issue.key, result, kvsClient);

    await recordAnalysisAuditEvent(auditSink, cloudId, userId, issue.key, {
      result: 'success',
      detail: result.status,
      linkedEvidenceIds: evidence.map((e) => e.id),
      findingCount: result.findings.length,
    });

    return {
      status: result.status,
      issue: { key: issue.key, summary: issue.summary, status: issue.status },
      findings: result.findings,
      evidenceCount: evidence.length,
      evaluatedAt: result.evaluatedAt,
      ...(stored ? { caseId: stored.caseId } : {}),
    };
  } catch (err) {
    await recordAnalysisAuditEvent(auditSink, cloudId, userId, issueKey, {
      result: 'failure',
      detail: err instanceof Error ? err.message : 'jira request failed',
      linkedEvidenceIds: evidence.map((e) => e.id),
      findingCount: 0,
    }).catch(() => undefined);
    return {
      status: 'ANALYSIS_FAILED',
      error: err instanceof Error ? err.message : 'jira request failed',
    };
  }
}

/** One audit event per analysis run, chained into the tenant ledger. */
async function recordAnalysisAuditEvent(
  sink: AuditSink,
  tenantId: string,
  userId: string,
  issueKey: string,
  info: { result: 'success' | 'failure'; detail: string; linkedEvidenceIds: string[]; findingCount: number },
): Promise<void> {
  await recordAuditEvent(
    sink,
    {
      tenantId,
      actor: userId,
      action: 'analysis_run',
      target: issueKey,
      result: info.result,
      linkedEvidenceIds: info.linkedEvidenceIds,
      requestFingerprint: await digestPayload({
        action: 'analysis_run',
        actor: userId,
        issueKey,
        detail: info.detail,
        findingCount: info.findingCount,
      }),
    },
    new Date(),
  );
}

/**
 * Persist findings under `finding:{tenant}:{id}` and upsert one case record
 * covering the analysis. Only meaningful results (verified / potential)
 * create a case; CONSISTENT / INSUFFICIENT_EVIDENCE / failed analyses are
 * reported to the caller but not stored as cases.
 */
export async function persistAnalysisResult(
  tenantId: string,
  userId: string,
  issueKey: string,
  result: AnalysisResult,
  kvsClient: KvsLike = kvs as unknown as KvsLike,
): Promise<{ caseId: string } | null> {
  const meaningful =
    result.status === 'VERIFIED_CONTRADICTION' || result.status === 'POTENTIAL_CONTRADICTION';
  if (!meaningful || result.findings.length === 0) return null;

  const caseRepo = new KvsCaseRepository(kvsClient);
  const now = new Date().toISOString();
  const caseId = `case-${issueKey.toLowerCase()}`;

  for (const finding of result.findings) {
    await kvsClient.set(`finding:${tenantId}:${finding.findingId}`, finding);
  }

  const existing = await caseRepo.get(tenantId, caseId);
  const findingIds = Array.from(
    new Set([...(existing?.findingIds ?? []), ...result.findings.map((f) => f.findingId)]),
  );
  const severities = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const;
  const rank = (s: string) => severities.indexOf(s as (typeof severities)[number]);
  const severity = result.findings.reduce<'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'>(
    (max, f) => (rank(f.severity) > rank(max) ? f.severity : max),
    'LOW',
  );

  const record: CaseRecord = {
    caseId,
    tenantId,
    title: `${issueKey}: ${result.findings.length} contradiction finding(s)`,
    status: result.status,
    severity,
    findingIds,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    owner: userId,
  };
  await caseRepo.put(record);
  return { caseId };
}

// ---------------------------------------------------------------------------
// Review queue — proposals: list, decide, execute
// ---------------------------------------------------------------------------

const proposalIdResolverSchema = z.string().regex(/^prop_[A-Za-z0-9_-]+$/, 'valid proposal id required');
const decisionSchema = z.enum(['approve', 'reject']);
const prepareSchema = z.object({
  caseId: z.string().regex(/^[A-Za-z0-9_-]+$/, 'valid case id required'),
  findingId: z.string().min(1),
  operation: z
    .enum([
      'create_remediation_issue',
      'request_missing_approval',
      'add_decision_reference',
      'flag_requirement_mismatch',
      'recommend_review',
      'assign_followup_owner',
    ])
    .default('add_decision_reference'),
});

/**
 * Prepare a remediation proposal from a stored finding (Custom UI path).
 * Mirrors the Rovo prepare-remediation action: draft only, PENDING_APPROVAL,
 * never executes. Rejected findings (consistent / insufficient evidence)
 * cannot generate proposals — enforced in draftProposal.
 */
resolver.define('prepareProposal', async (ctx: unknown) => {
  const c = ctx as {
    payload?: unknown;
    context?: { cloudId?: string; accountId?: string };
  };
  const cloudId = c.context?.cloudId;
  const userId = c.context?.accountId;
  if (!cloudId || !userId) return { status: 'UNAUTHENTICATED', error: 'tenant context missing' };
  const parsed = prepareSchema.safeParse(c.payload);
  if (!parsed.success)
    return { status: 'INVALID_INPUT', error: parsed.error.issues[0]?.message ?? 'invalid input' };

  const kvsClient = kvs as unknown as KvsLike;
  const caseRepo = new KvsCaseRepository(kvsClient);
  const record = await caseRepo.get(cloudId, parsed.data.caseId);
  if (!record) return { status: 'NOT_FOUND', error: 'case not found for this tenant' };
  const finding = (await kvsClient.get(`finding:${cloudId}:${parsed.data.findingId}`)) as Finding | undefined;
  if (!finding || finding.tenantId !== cloudId) {
    return { status: 'NOT_FOUND', error: 'finding not found for this case' };
  }

  try {
    const draft = await draftProposal({
      tenantId: cloudId,
      caseId: record.caseId,
      finding,
      operation: parsed.data.operation,
      expectedChange: `Proposed by ContextCourt for case ${record.caseId}: ${parsed.data.operation}`,
      actor: userId,
      now: new Date(),
    });
    const proposal: RemediationProposal = { ...draft.proposal, state: 'PENDING_APPROVAL', binding: null };
    const repo = new KvsProposalRepository(kvsClient);
    await repo.put(proposal);
    const audit = new KvsAuditRepository(kvsClient as unknown as AuditSinkLike);
    await recordAuditEvent(
      audit,
      {
        tenantId: cloudId,
        actor: userId,
        action: 'prepare_remediation',
        target: proposal.id,
        result: 'success',
        linkedEvidenceIds: proposal.supportingFindingIds,
        requestFingerprint: await digestPayload({
          action: 'prepare_remediation',
          actor: userId,
          payloadDigest: proposal.payloadDigest,
        }),
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
});

/**
 * Tenant's remediation proposals ranked by the documented review-utility
 * function (docs/QUEUE_DESIGN.md): severity-dominant, risk-boosted,
 * age-accruing, deterministic. Each item carries the explanation for its
 * rank and its independent post-execution verification state.
 */
resolver.define('listProposals', async (ctx: unknown) => {
  const c = ctx as { context?: { cloudId?: string } };
  if (!c.context?.cloudId) return { proposals: [] };
  const repo = new KvsProposalRepository(kvs as unknown as KvsLike);
  const ranked = orderReviewQueue(await repo.list(c.context.cloudId));
  return {
    proposals: ranked.map((r) => ({
      ...publicProposal(r.proposal, ''),
      priorityExplanation: r.priorityExplanation,
      verification: r.proposal.verification ?? null,
    })),
  };
});

/**
 * Human decision on a pending proposal. The approver is the authenticated
 * invoking user; approving your own proposal is rejected (SelfApprovalError).
 */
resolver.define('decideProposal', async (ctx: unknown) => {
  const c = ctx as {
    payload?: unknown;
    context?: { cloudId?: string; accountId?: string };
  };
  const cloudId = c.context?.cloudId;
  const accountId = c.context?.accountId;
  if (!cloudId || !accountId) {
    return { status: 'UNAUTHENTICATED', error: 'tenant context missing' };
  }
  const body = (c.payload ?? {}) as { proposalId?: unknown; decision?: unknown };
  const proposalId = proposalIdResolverSchema.safeParse(body.proposalId);
  const decision = decisionSchema.safeParse(body.decision);
  if (!proposalId.success || !decision.success) {
    return { status: 'INVALID_INPUT', error: 'valid proposalId and decision required' };
  }

  const repo = new KvsProposalRepository(kvs as unknown as KvsLike);
  const proposal = await repo.get(cloudId, proposalId.data);
  if (!proposal) return { status: 'NOT_FOUND', error: 'proposal not found for this tenant' };

  try {
    const updated = decideProposal({
      proposal,
      decision: decision.data,
      approverUserId: accountId,
      now: new Date(),
    });
    await repo.put(updated);
    const audit = new KvsAuditRepository(kvs as unknown as AuditSinkLike);
    await recordAuditEvent(
      audit,
      {
        tenantId: cloudId,
        actor: accountId,
        action: decision.data === 'approve' ? 'proposal_approved' : 'proposal_rejected',
        target: proposal.id,
        result: 'success',
        linkedEvidenceIds: proposal.supportingFindingIds,
        requestFingerprint: await digestPayload({
          action: decision.data,
          actor: accountId,
          payloadDigest: proposal.payloadDigest,
        }),
      },
      new Date(),
    );
    return { status: 'OK', proposal: publicProposal(updated, accountId) };
  } catch (err) {
    if (err instanceof DecisionError) {
      return { status: 'DECISION_REJECTED', error: err.message, code: err.code };
    }
    return { status: 'DECISION_FAILED', error: err instanceof Error ? err.message : 'decision failed' };
  }
});

/**
 * Execute an approved proposal. Only the approver on record may execute; the
 * authorization invariants (digest, expiry, replay, tenant) are re-checked.
 * The executed payload digest is registered so a replayed execution is
 * rejected permanently.
 */
resolver.define('executeProposal', async (ctx: unknown) => {
  const c = ctx as {
    payload?: unknown;
    context?: { cloudId?: string; accountId?: string };
  };
  const cloudId = c.context?.cloudId;
  const accountId = c.context?.accountId;
  if (!cloudId || !accountId) {
    return { status: 'UNAUTHENTICATED', error: 'tenant context missing' };
  }
  const proposalId = proposalIdResolverSchema.safeParse((c.payload as { proposalId?: unknown })?.proposalId);
  if (!proposalId.success) {
    return { status: 'INVALID_INPUT', error: 'valid proposalId required' };
  }

  const repo = new KvsProposalRepository(kvs as unknown as KvsLike);
  const proposal = await repo.get(cloudId, proposalId.data);
  if (!proposal) return { status: 'NOT_FOUND', error: 'proposal not found for this tenant' };

  const executed = await repo.executedDigests(cloudId, proposal.id);
  const outcome = await executeProposal({
    proposal,
    executorUserId: accountId,
    executedDigests: executed,
    now: new Date(),
    fetcher: productionJiraFetcher,
  });

  const updated: RemediationProposal = { ...proposal, state: outcome.state };
  await repo.put(updated);
  if (outcome.state === 'EXECUTED') {
    await repo.recordExecutedDigest(cloudId, proposal.id, proposal.payloadDigest);

    // Independent post-execution verification: an accepted write is re-read
    // from Jira and compared with the proposal. Execution success and
    // verification success are recorded as two separate facts.
    const verification = await verifyExecutionOutcome({
      proposal,
      resultRef: outcome.resultRef,
      fetcher: productionJiraFetcher,
      now: new Date(),
    });
    updated.verification = verification;
    await repo.put(updated);
    const verificationAudit = new KvsAuditRepository(kvs as unknown as AuditSinkLike);
    await recordAuditEvent(
      verificationAudit,
      {
        tenantId: cloudId,
        actor: accountId,
        action: 'proposal_verified',
        target: proposal.id,
        result: verification.outcome === 'VERIFIED' ? 'success' : 'failure',
        linkedEvidenceIds: proposal.supportingFindingIds,
        requestFingerprint: await sha256Hex(
          JSON.stringify({
            action: 'proposal_verified',
            actor: accountId,
            payloadDigest: proposal.payloadDigest,
            outcome: verification.outcome,
          }),
        ),
      },
      new Date(),
    );
  }
  const audit = new KvsAuditRepository(kvs as unknown as AuditSinkLike);
  await recordAuditEvent(
    audit,
    {
      tenantId: cloudId,
      actor: accountId,
      action: 'proposal_executed',
      target: proposal.id,
      result: outcome.state === 'EXECUTED' ? 'success' : 'failure',
      linkedEvidenceIds: proposal.supportingFindingIds,
      requestFingerprint: await sha256Hex(
        JSON.stringify({
          action: 'proposal_executed',
          actor: accountId,
          payloadDigest: proposal.payloadDigest,
          outcome: outcome.state,
        }),
      ),
    },
    new Date(),
  );
  return { status: 'OK', outcome, proposal: publicProposal(updated, accountId) };
});

/**
 * Proposal view for the UI: the approver identity is exposed only to make
 * self-approval preventable in the interface; execution requires the
 * binding to match the authenticated user server-side regardless.
 */
function publicProposal(p: RemediationProposal, viewerId: string) {
  return {
    id: p.id,
    caseId: p.caseId,
    target: p.target,
    operation: p.operation,
    expectedChange: p.expectedChange,
    risk: p.risk,
    state: p.state,
    actor: p.actor,
    createdAt: p.createdAt,
    supportingFindingIds: p.supportingFindingIds,
    payloadDigest: p.payloadDigest,
    approverId: p.binding?.approverUserId ?? null,
    expiresAt: p.binding?.expiresAt ?? null,
    viewerIsActor: p.actor === viewerId,
    viewerIsApprover: p.binding?.approverUserId === viewerId,
  };
}

export const handler = resolver.getDefinitions();
