/**
 * Decision + execution core tests (core/execution.ts).
 *
 * Covers the human-approval loop that the Review queue drives:
 * approve (binding, self-approval rejection), reject, execute
 * (authorization invariants, replay, expiry, not-approver, operation
 * dispatch, explicit failure states).
 */
import { describe, expect, it } from 'vitest';
import { cancelProposal, decideProposal, executeProposal, DecisionError } from '../../src/core/execution';
import { draftProposal } from '../../src/core/remediation';
import type { Finding, RemediationProposal } from '../../src/core/types';

const NOW = new Date('2026-10-30T12:00:00Z');
const ACTOR = 'ari:user-1';
const APPROVER = 'ari:user-2';
const OTHER = 'ari:user-3';

function finding(): Finding {
  return {
    findingId: 'finding_1',
    tenantId: 'tenant-a',
    type: 'policy_violation',
    status: 'VERIFIED_CONTRADICTION',
    severity: 'HIGH',
    explanation: 'verified contradiction with evidence on both sides',
    supportingEvidenceIds: ['ev-1', 'ev-2'],
    competingClaims: [
      { statement: 'approval is required', evidenceId: 'ev-1' },
      { statement: 'no approval is required', evidenceId: 'ev-2' },
    ],
    confidence: 0.9,
    detectedAt: NOW.toISOString(),
    affectedWork: [{ type: 'jira_issue', key: 'PAY-142' }],
    provenance: [
      { evidenceId: 'ev-1', sourceSystem: 'jira', sourceObjectId: 'PAY-142' },
      { evidenceId: 'ev-2', sourceSystem: 'jira', sourceObjectId: 'PAY-142:comment:0' },
    ],
  };
}

async function proposal(): Promise<RemediationProposal> {
  const draft = await draftProposal({
    tenantId: 'tenant-a',
    caseId: 'case-pay-142',
    finding: finding(),
    operation: 'add_decision_reference',
    expectedChange: 'Reference DEC-88 in the acceptance criteria',
    actor: ACTOR,
    now: NOW,
  });
  return { ...draft.proposal, state: 'PENDING_APPROVAL', binding: null };
}

describe('decideProposal', () => {
  it('reject moves PENDING_APPROVAL → REJECTED without a binding', async () => {
    const p = await proposal();
    const out = decideProposal({ proposal: p, decision: 'reject', approverUserId: APPROVER, now: NOW });
    expect(out.state).toBe('REJECTED');
    expect(out.binding).toBeNull();
  });

  it('approve creates a binding and moves to APPROVED', async () => {
    const p = await proposal();
    const out = decideProposal({ proposal: p, decision: 'approve', approverUserId: APPROVER, now: NOW });
    expect(out.state).toBe('APPROVED');
    expect(out.binding).not.toBeNull();
    expect(out.binding?.approverUserId).toBe(APPROVER);
    expect(out.binding?.payloadDigest).toBe(p.payloadDigest);
    expect(out.binding?.target).toBe('PAY-142');
    expect(new Date(out.binding!.expiresAt).getTime()).toBeGreaterThan(NOW.getTime());
  });

  it('self-approval is rejected — the proposal actor may not approve', async () => {
    const p = await proposal();
    expect(() =>
      decideProposal({ proposal: p, decision: 'approve', approverUserId: ACTOR, now: NOW }),
    ).toThrow(DecisionError);
    expect(() =>
      decideProposal({ proposal: p, decision: 'approve', approverUserId: ACTOR, now: NOW }),
    ).toThrow(/may not approve its own proposal/);
  });

  it('only PENDING_APPROVAL proposals can be decided', async () => {
    const p = { ...(await proposal()), state: 'REJECTED' as const };
    expect(() =>
      decideProposal({ proposal: p, decision: 'approve', approverUserId: APPROVER, now: NOW }),
    ).toThrow(/only PENDING_APPROVAL/);
  });
});

function approved(validityMs?: number): Promise<RemediationProposal> {
  return proposal().then((p) =>
    decideProposal({ proposal: p, decision: 'approve', approverUserId: APPROVER, now: NOW, validityMs }),
  );
}

describe('executeProposal', () => {
  const okFetcher = async () => ({ ok: true, status: 201, json: {} });

  it('executes an approved proposal as a Jira comment and reports EXECUTED', async () => {
    const p = await approved();
    const calls: unknown[] = [];
    const fetcher = async (path: string, init?: { method?: string; body?: unknown }) => {
      calls.push({ path, init });
      return { ok: true, status: 201, json: {} };
    };
    const out = await executeProposal({
      proposal: p,
      executorUserId: APPROVER,
      executedDigests: [],
      now: new Date('2026-10-30T12:30:00Z'),
      fetcher,
    });
    expect(out.state).toBe('EXECUTED');
    expect(out.resultRef).toBe('PAY-142');
    expect(calls).toHaveLength(1);
    const call = calls[0] as { path: string; init?: { method?: string; body?: unknown } };
    expect(call.path).toBe('/rest/api/3/issue/PAY-142/comment');
    expect(call.init?.method).toBe('POST');
  });

  it('create_remediation_issue posts an issue creation payload with derived project key', async () => {
    const draft = await draftProposal({
      tenantId: 'tenant-a',
      caseId: 'case-pay-142',
      finding: finding(),
      operation: 'create_remediation_issue',
      expectedChange: 'Open a remediation task',
      actor: ACTOR,
      now: NOW,
    });
    const p = decideProposal({
      proposal: { ...draft.proposal, state: 'PENDING_APPROVAL', binding: null },
      decision: 'approve',
      approverUserId: APPROVER,
      now: NOW,
    });
    const calls: unknown[] = [];
    const fetcher = async (path: string, init?: { method?: string; body?: unknown }) => {
      calls.push({ path, init });
      return { ok: true, status: 201, json: { key: 'PAY-200' } };
    };
    const out = await executeProposal({
      proposal: p,
      executorUserId: APPROVER,
      executedDigests: [],
      now: new Date('2026-10-30T12:30:00Z'),
      fetcher,
    });
    expect(out.state).toBe('EXECUTED');
    expect(out.resultRef).toBe('PAY-200');
    const call = calls[0] as { path: string; init?: { body?: { fields?: { project?: { key?: string } } } } };
    expect(call.path).toBe('/rest/api/3/issue');
    expect(call.init?.body?.fields?.project?.key).toBe('PAY');
  });

  it('rejects execution by anyone other than the approver on record', async () => {
    const p = await approved();
    const out = await executeProposal({
      proposal: p,
      executorUserId: OTHER,
      executedDigests: [],
      now: new Date('2026-10-30T12:30:00Z'),
      fetcher: okFetcher,
    });
    expect(out.state).toBe('EXECUTION_FAILED');
    expect(out.detail).toMatch(/only the approver on record/);
  });

  it('rejects a replayed execution (same payload digest already executed)', async () => {
    const p = await approved();
    const fetcher = async () => ({ ok: true, status: 201, json: {} });
    const now = new Date('2026-10-30T12:30:00Z');
    const first = await executeProposal({
      proposal: p,
      executorUserId: APPROVER,
      executedDigests: [],
      now,
      fetcher,
    });
    expect(first.state).toBe('EXECUTED');
    const second = await executeProposal({
      proposal: p,
      executorUserId: APPROVER,
      executedDigests: [p.payloadDigest],
      now,
      fetcher,
    });
    expect(second.state).toBe('EXECUTION_FAILED');
    expect(second.detail).toMatch(/replay/);
  });

  it('rejects execution after the approval expiry window', async () => {
    const p = await approved(60 * 1000); // 1 minute validity
    const out = await executeProposal({
      proposal: p,
      executorUserId: APPROVER,
      executedDigests: [],
      now: new Date('2026-10-30T12:30:00Z'), // 30 minutes later
      fetcher: async () => ({ ok: true, status: 201, json: {} }),
    });
    expect(out.state).toBe('EXECUTION_FAILED');
    expect(out.detail).toMatch(/expired/);
  });

  it('a Jira write failure is reported as EXECUTION_FAILED, never as success', async () => {
    const p = await approved();
    const out = await executeProposal({
      proposal: p,
      executorUserId: APPROVER,
      executedDigests: [],
      now: new Date('2026-10-30T12:30:00Z'),
      fetcher: async () => ({ ok: false, status: 403, json: {} }),
    });
    expect(out.state).toBe('EXECUTION_FAILED');
    expect(out.detail).toMatch(/403/);
  });

  it('cannot execute a proposal that was never approved', async () => {
    const p = await proposal();
    const out = await executeProposal({
      proposal: p,
      executorUserId: APPROVER,
      executedDigests: [],
      now: new Date('2026-10-30T12:30:00Z'),
      fetcher: async () => ({ ok: true, status: 201, json: {} }),
    });
    expect(out.state).toBe('EXECUTION_FAILED');
    expect(out.detail).toMatch(/invalid approval transition/);
  });
});

describe('rejection rationale (dynamics pass)', () => {
  it('stores the reviewer rationale with the rejection', async () => {
    const p = await proposal();
    const out = decideProposal({
      proposal: p,
      decision: 'reject',
      approverUserId: APPROVER,
      now: NOW,
      rationale: '  Superseded by DEC-90; no longer applicable.  ',
    });
    expect(out.state).toBe('REJECTED');
    expect(out.decisionRationale).toBe('Superseded by DEC-90; no longer applicable.');
    expect(out.binding).toBeNull();
  });

  it('rejection without rationale stores null, never a fabricated one', async () => {
    const p = await proposal();
    const out = decideProposal({ proposal: p, decision: 'reject', approverUserId: APPROVER, now: NOW });
    expect(out.decisionRationale).toBeNull();
  });
});

describe('cancelProposal (withdrawal / revocation)', () => {
  it('the proposal actor may withdraw their own pending proposal', async () => {
    const p = await proposal();
    const out = cancelProposal({
      proposal: p,
      requesterUserId: ACTOR,
      now: NOW,
      rationale: 'obsolete',
    });
    expect(out.state).toBe('CANCELLED');
    expect(out.decisionRationale).toBe('obsolete');
  });

  it('anyone else may NOT withdraw a pending proposal', async () => {
    const p = await proposal();
    expect(() => cancelProposal({ proposal: p, requesterUserId: OTHER, now: NOW })).toThrow(
      /only the proposal author/,
    );
  });

  it('the approver on record may revoke an approved proposal before execution', async () => {
    const p = await approved();
    const out = cancelProposal({ proposal: p, requesterUserId: APPROVER, now: NOW });
    expect(out.state).toBe('CANCELLED');
    expect(out.binding).toBeNull();
  });

  it('the proposal actor may NOT revoke their own approved proposal', async () => {
    const p = await approved();
    expect(() => cancelProposal({ proposal: p, requesterUserId: ACTOR, now: NOW })).toThrow(
      /only the approver on record/,
    );
  });

  it('executed proposals are irreversible', async () => {
    const p = { ...(await approved()), state: 'EXECUTED' as const };
    expect(() => cancelProposal({ proposal: p, requesterUserId: APPROVER, now: NOW })).toThrow(
      /only PENDING_APPROVAL or APPROVED/,
    );
  });
});

describe('execution transport is single-attempt (no retry duplication)', () => {
  it('an execution write invokes the Jira transport exactly once', async () => {
    const p = await approved();
    let calls = 0;
    const countingFetcher = async () => {
      calls += 1;
      return { ok: true, status: 201, json: {} };
    };
    const out = await executeProposal({
      proposal: p,
      executorUserId: APPROVER,
      executedDigests: [],
      now: new Date('2026-10-30T12:30:00Z'),
      fetcher: countingFetcher,
    });
    expect(out.state).toBe('EXECUTED');
    expect(calls).toBe(1);
  });
});
