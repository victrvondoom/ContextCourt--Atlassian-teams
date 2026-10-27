/**
 * Approval state machine (Layer F support).
 *
 * DRAFT → PENDING_APPROVAL → APPROVED → EXECUTED
 * Alternative states: REJECTED, EXPIRED, CANCELLED, EXECUTION_FAILED.
 *
 * Security invariants enforced here:
 *  - Only valid transitions are permitted.
 *  - An approval must be bound to an authenticated user, tenant, exact target,
 *    exact operation, payload digest, and expiry.
 *  - A replayed approval (same payload digest already EXECUTED) is rejected.
 *  - An agent can never approve its own proposal: the approver must differ
 *    from the actor that created the proposal.
 */
import type { ApprovalBinding, ApprovalState } from './types';

export class ApprovalTransitionError extends Error {
  constructor(from: ApprovalState, to: ApprovalState) {
    super(`invalid approval transition: ${from} → ${to}`);
    this.name = 'ApprovalTransitionError';
  }
}

export class ReplayError extends Error {
  constructor(digest: string) {
    super(`approval replay detected for payload digest ${digest}`);
    this.name = 'ReplayError';
  }
}

export class SelfApprovalError extends Error {
  constructor(actor: string) {
    super(`actor ${actor} may not approve its own proposal`);
    this.name = 'SelfApprovalError';
  }
}

const TRANSITIONS: Record<ApprovalState, ApprovalState[]> = {
  DRAFT: ['PENDING_APPROVAL', 'CANCELLED'],
  PENDING_APPROVAL: ['APPROVED', 'REJECTED', 'EXPIRED', 'CANCELLED'],
  APPROVED: ['EXECUTED', 'EXECUTION_FAILED', 'CANCELLED'],
  EXECUTED: [],
  REJECTED: [],
  EXPIRED: [],
  CANCELLED: [],
  EXECUTION_FAILED: [],
};

export function canTransition(from: ApprovalState, to: ApprovalState): boolean {
  return TRANSITIONS[from].includes(to);
}

export function transition(from: ApprovalState, to: ApprovalState): ApprovalState {
  if (!canTransition(from, to)) {
    throw new ApprovalTransitionError(from, to);
  }
  return to;
}

export interface ExecuteApprovalRequest {
  state: ApprovalState;
  binding: ApprovalBinding | null;
  /** Digest of the payload about to be executed. */
  payloadDigest: string;
  tenantId: string;
  target: string;
  operation: string;
  /** Ids of payload digests already executed for this proposal. */
  executedDigests: string[];
  now: Date;
}

/** Validate everything required before executing an approved write. */
export function assertExecutionAuthorized(req: ExecuteApprovalRequest): void {
  if (req.state !== 'APPROVED') {
    throw new ApprovalTransitionError(req.state, 'EXECUTED');
  }
  if (!req.binding) {
    throw new Error('execution requires an approval binding');
  }
  if (req.binding.tenantId !== req.tenantId) {
    throw new Error('approval tenant does not match execution tenant');
  }
  if (req.binding.target !== req.target || req.binding.operation !== req.operation) {
    throw new Error('approval target/operation mismatch');
  }
  if (req.binding.payloadDigest !== req.payloadDigest) {
    throw new Error('approval payload digest mismatch');
  }
  if (new Date(req.binding.expiresAt) <= req.now) {
    throw new Error('approval expired');
  }
  if (req.executedDigests.includes(req.payloadDigest)) {
    throw new ReplayError(req.payloadDigest);
  }
}

export function bindApproval(args: {
  approverUserId: string;
  tenantId: string;
  target: string;
  operation: string;
  payloadDigest: string;
  now: Date;
  /** Actor that created the proposal — must differ from the approver. */
  proposalActor: string;
  /** Approval validity window; defaults to 1 hour. */
  validityMs?: number;
}): ApprovalBinding {
  if (args.approverUserId === args.proposalActor) {
    throw new SelfApprovalError(args.approverUserId);
  }
  const validityMs = args.validityMs ?? 60 * 60 * 1000;
  return {
    approverUserId: args.approverUserId,
    tenantId: args.tenantId,
    target: args.target,
    operation: args.operation,
    payloadDigest: args.payloadDigest,
    approvedAt: args.now.toISOString(),
    expiresAt: new Date(args.now.getTime() + validityMs).toISOString(),
  };
}
