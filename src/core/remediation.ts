/**
 * Remediation proposal generation and execution authorization (Layer F).
 *
 * Proposals never execute anything themselves. Sensitive operations go
 * through the approval state machine (core/approval.ts): proposal actor and
 * approver must differ, permissions are revalidated at execution time, and
 * payload digests prevent replay.
 */
import { digestPayload } from './digest';
import type { Finding, RemediationProposal, Severity } from './types';

export type RemediationOperation =
  | 'create_remediation_issue'
  | 'request_missing_approval'
  | 'add_decision_reference'
  | 'flag_requirement_mismatch'
  | 'recommend_review'
  | 'assign_followup_owner';

interface OperationSpec {
  target: 'jira';
  risk: 'low' | 'medium' | 'high';
  minSeverity: Severity;
}

const OPERATIONS: Record<RemediationOperation, OperationSpec> = {
  create_remediation_issue: { target: 'jira', risk: 'medium', minSeverity: 'MEDIUM' },
  request_missing_approval: { target: 'jira', risk: 'low', minSeverity: 'HIGH' },
  add_decision_reference: { target: 'jira', risk: 'low', minSeverity: 'LOW' },
  flag_requirement_mismatch: { target: 'jira', risk: 'low', minSeverity: 'LOW' },
  recommend_review: { target: 'jira', risk: 'low', minSeverity: 'LOW' },
  assign_followup_owner: { target: 'jira', risk: 'low', minSeverity: 'LOW' },
};

const SEVERITY_ORDER: Severity[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

export function operationSpec(op: RemediationOperation): OperationSpec {
  return OPERATIONS[op];
}

export interface ProposalRequest {
  tenantId: string;
  caseId: string;
  finding: Finding;
  operation: RemediationOperation;
  /** Human- or agent-facing summary of the expected change. */
  expectedChange: string;
  actor: string;
  now: Date;
}

export interface ProposalDraft {
  proposal: Omit<RemediationProposal, 'state' | 'binding'>;
  suggestedState: 'DRAFT' | 'PENDING_APPROVAL';
}

/** Build a remediation proposal from a verified/potential finding. */
export async function draftProposal(req: ProposalRequest): Promise<ProposalDraft> {
  const spec = OPERATIONS[req.operation];
  if (spec.target !== 'jira') {
    throw new Error(`unsupported remediation target: ${spec.target}`);
  }
  // A sensitive operation requires at least a potential contradiction —
  // consistent or insufficient-evidence findings never generate proposals.
  if (
    req.finding.status !== 'VERIFIED_CONTRADICTION' &&
    req.finding.status !== 'POTENTIAL_CONTRADICTION'
  ) {
    throw new Error(`finding status ${req.finding.status} cannot generate remediation`);
  }
  // Risk gating: high-risk operations require at least HIGH severity findings.
  const severityRank = (s: Severity) => SEVERITY_ORDER.indexOf(s);
  if (spec.risk === 'high' && severityRank(req.finding.severity) < severityRank('HIGH')) {
    throw new Error('high-risk remediation requires HIGH or CRITICAL severity');
  }
  if (!req.finding.supportingEvidenceIds.length) {
    throw new Error('remediation requires cited evidence');
  }

  const payload = {
    operation: req.operation,
    target: req.finding.affectedWork[0]?.key ?? null,
    caseId: req.caseId,
    findingIds: [req.finding.findingId],
    expectedChange: req.expectedChange,
  };
  const payloadDigest = await digestPayload(payload);

  return {
    proposal: {
      id: `prop_${req.caseId}_${req.operation}`,
      tenantId: req.tenantId,
      caseId: req.caseId,
      targetSystem: 'jira',
      target: payload.target ?? 'unspecified',
      operation: req.operation,
      expectedChange: req.expectedChange,
      payload,
      payloadDigest,
      supportingFindingIds: [req.finding.findingId],
      risk: spec.risk,
      actor: req.actor,
      createdAt: req.now.toISOString(),
      verificationRequirements: [
        'revalidate actor permissions on target at execution time',
        'approval binding digest must match payload digest',
        'approval must not be expired',
      ],
    },
    suggestedState: 'PENDING_APPROVAL',
  };
}
