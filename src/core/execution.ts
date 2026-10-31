/**
 * Human decision + execution of remediation proposals (Layer F, second half).
 *
 * The approval state machine in core/approval.ts defines the transitions and
 * authorization checks; this module implements the reachable paths the
 * Review queue drives:
 *
 *   PENDING_APPROVAL --approve-->  APPROVED  (binding created, self-approval rejected)
 *   PENDING_APPROVAL --reject--->  REJECTED
 *   APPROVED        --execute-->  EXECUTED / EXECUTION_FAILED
 *
 * Execution performs a real Jira write through an injected fetcher and is
 * guarded by assertExecutionAuthorized (tenant, target, operation, payload
 * digest, expiry, replay). An agent can prepare a proposal but can never
 * approve or execute it — both require an authenticated human who is not the
 * proposal actor.
 */
import { assertExecutionAuthorized, bindApproval, SelfApprovalError, transition } from './approval';
import type { RemediationProposal } from './types';
import { textToAdfDoc } from '../integrations/adf';
import { proposalTraceMarker } from './verification';

/** Structurally identical to the Jira adapter's fetcher; kept local to avoid layer coupling. */
export type WriteFetcher = (
  path: string,
  init?: { method?: string; body?: unknown },
) => Promise<{ ok: boolean; status: number; json: unknown }>;

export class DecisionError extends Error {
  constructor(
    message: string,
    public readonly code:
      'INVALID_STATE' | 'SELF_APPROVAL' | 'NOT_APPROVER' | 'UNAUTHORIZED' | 'UNSUPPORTED_TARGET',
  ) {
    super(message);
    this.name = 'DecisionError';
  }
}

/** Apply a human decision to a pending proposal. */
export function decideProposal(args: {
  proposal: RemediationProposal;
  decision: 'approve' | 'reject';
  approverUserId: string;
  now: Date;
  /** Approval validity window in ms; defaults to 1 hour. */
  validityMs?: number;
}): RemediationProposal {
  if (args.proposal.state !== 'PENDING_APPROVAL') {
    throw new DecisionError(
      `proposal is ${args.proposal.state}, only PENDING_APPROVAL proposals can be decided`,
      'INVALID_STATE',
    );
  }
  if (args.decision === 'reject') {
    return { ...args.proposal, state: transition(args.proposal.state, 'REJECTED'), binding: null };
  }
  // bindApproval rejects self-approval (approver === proposal actor).
  let binding;
  try {
    binding = bindApproval({
      approverUserId: args.approverUserId,
      tenantId: args.proposal.tenantId,
      target: args.proposal.target,
      operation: args.proposal.operation,
      payloadDigest: args.proposal.payloadDigest,
      now: args.now,
      proposalActor: args.proposal.actor,
      validityMs: args.validityMs,
    });
  } catch (err) {
    if (err instanceof SelfApprovalError) {
      throw new DecisionError(err.message, 'SELF_APPROVAL');
    }
    throw err;
  }
  return { ...args.proposal, state: transition(args.proposal.state, 'APPROVED'), binding };
}

export interface ExecutionOutcome {
  state: 'EXECUTED' | 'EXECUTION_FAILED';
  /** What actually happened — recorded in the audit ledger. */
  detail: string;
  /** Jira resource created/updated, when the operation succeeded. */
  resultRef: string | null;
}

/**
 * Execute an approved proposal against Jira. Every authorization invariant is
 * re-checked here (defense in depth) before the write is attempted.
 */
export async function executeProposal(args: {
  proposal: RemediationProposal;
  /** Authenticated user requesting execution — must be the approver on record. */
  executorUserId: string;
  executedDigests: string[];
  now: Date;
  fetcher: WriteFetcher;
}): Promise<ExecutionOutcome> {
  const { proposal } = args;
  try {
    assertExecutionAuthorized({
      state: proposal.state,
      binding: proposal.binding,
      payloadDigest: proposal.payloadDigest,
      tenantId: proposal.tenantId,
      target: proposal.target,
      operation: proposal.operation,
      executedDigests: args.executedDigests,
      now: args.now,
    });
    if (proposal.binding!.approverUserId !== args.executorUserId) {
      throw new DecisionError('only the approver on record may execute this proposal', 'NOT_APPROVER');
    }
    const result = await performOperation(proposal, args.executorUserId, args.fetcher);
    return result;
  } catch (err) {
    const detail = err instanceof Error ? err.message : 'execution failed';
    return { state: 'EXECUTION_FAILED', detail, resultRef: null };
  }
}

/** Map a remediation operation to its concrete Jira write. */
async function performOperation(
  proposal: RemediationProposal,
  approverId: string,
  fetcher: WriteFetcher,
): Promise<ExecutionOutcome> {
  if (proposal.targetSystem !== 'jira') {
    throw new DecisionError(`unsupported target system: ${proposal.targetSystem}`, 'UNSUPPORTED_TARGET');
  }
  if (proposal.target === 'unspecified') {
    throw new DecisionError(
      'proposal has no concrete Jira target; it cannot be executed',
      'UNSUPPORTED_TARGET',
    );
  }

  if (proposal.operation === 'create_remediation_issue') {
    return createRemediationIssue(proposal, approverId, fetcher);
  }
  return postApprovalComment(proposal, approverId, fetcher);
}

/**
 * create_remediation_issue → POST /rest/api/3/issue.
 * The project is derived from the target issue key prefix (PAY-142 → PAY) and
 * the standard "Task" issue type is used. When a site lacks that type the
 * execution fails explicitly (EXECUTION_FAILED) — never silently.
 */
async function createRemediationIssue(
  proposal: RemediationProposal,
  approverId: string,
  fetcher: WriteFetcher,
): Promise<ExecutionOutcome> {
  const projectKey = proposal.target.split('-')[0]!.toUpperCase();
  if (!/^[A-Z][A-Z0-9]*$/.test(projectKey)) {
    throw new DecisionError(
      `cannot derive a Jira project key from target ${proposal.target}`,
      'UNSUPPORTED_TARGET',
    );
  }
  const summary = `ContextCourt remediation: ${proposal.expectedChange}`.slice(0, 250);
  const description = [
    `This remediation issue was created by ContextCourt AI after a human approval.`,
    ``,
    `Case: ${proposal.caseId}`,
    `Target: ${proposal.target}`,
    `Operation: ${proposal.operation}`,
    `Approved by: ${approverId}`,
    `Supported by findings: ${proposal.supportingFindingIds.join(', ')}`,
    proposalTraceMarker(proposal.id),
  ].join('\n');
  const res = await fetcher('/rest/api/3/issue', {
    method: 'POST',
    body: {
      fields: {
        project: { key: projectKey },
        issuetype: { name: 'Task' },
        summary,
        description: textToAdfDoc(description),
      },
    },
  });
  if (!res.ok) {
    throw new Error(`jira issue creation failed with status ${res.status}`);
  }
  const key = (res.json as { key?: string } | null)?.key ?? null;
  return {
    state: 'EXECUTED',
    detail: `created remediation issue ${key ?? '(key not returned)'} in project ${projectKey}`,
    resultRef: key,
  };
}

/** All other operations → approval-traced comment on the target issue. */
async function postApprovalComment(
  proposal: RemediationProposal,
  approverId: string,
  fetcher: WriteFetcher,
): Promise<ExecutionOutcome> {
  const body = [
    `ContextCourt remediation executed after human approval.`,
    ``,
    `Operation: ${proposal.operation}`,
    `Case: ${proposal.caseId}`,
    `Proposal: ${proposal.id}`,
    `Approved by: ${approverId}`,
    `Change: ${proposal.expectedChange}`,
    `Supported by findings: ${proposal.supportingFindingIds.join(', ')}`,
    proposalTraceMarker(proposal.id),
  ].join('\n');
  const res = await fetcher(`/rest/api/3/issue/${encodeURIComponent(proposal.target)}/comment`, {
    method: 'POST',
    body: textToAdfDoc(body),
  });
  if (!res.ok) {
    throw new Error(`jira comment failed with status ${res.status} on ${proposal.target}`);
  }
  return {
    state: 'EXECUTED',
    detail: `posted approval-traced comment on ${proposal.target}`,
    resultRef: proposal.target,
  };
}
