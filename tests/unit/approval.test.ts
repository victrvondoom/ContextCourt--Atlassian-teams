import {
  ApprovalTransitionError,
  ReplayError,
  SelfApprovalError,
  assertExecutionAuthorized,
  bindApproval,
  canTransition,
  transition,
} from '../../src/core/approval';
import { digestPayload } from '../../src/core/digest';

const NOW = new Date('2026-10-28T12:00:00Z');

describe('approval state machine', () => {
  it('allows the canonical happy path DRAFT → PENDING → APPROVED → EXECUTED', () => {
    expect(canTransition('DRAFT', 'PENDING_APPROVAL')).toBe(true);
    expect(canTransition('PENDING_APPROVAL', 'APPROVED')).toBe(true);
    expect(canTransition('APPROVED', 'EXECUTED')).toBe(true);
    expect(() => transition('DRAFT', 'APPROVED')).toThrow(ApprovalTransitionError);
  });

  it('INVARIANT: unapproved sensitive operation → no execution', () => {
    const payload = { summary: 'Add controller approval to PAY-142' };
    expect(() =>
      assertExecutionAuthorized({
        state: 'PENDING_APPROVAL',
        binding: null,
        payloadDigest: 'x',
        tenantId: 't1',
        target: 'PAY-142',
        operation: 'create_remediation_issue',
        executedDigests: [],
        now: NOW,
      }),
    ).toThrow(ApprovalTransitionError);
    void payload;
  });

  it('rejects invalid transitions like REJECTED → EXECUTED', () => {
    expect(() => transition('REJECTED', 'EXECUTED')).toThrow(ApprovalTransitionError);
    expect(() => transition('EXECUTED', 'APPROVED')).toThrow(ApprovalTransitionError);
  });

  it('binds approval to user, tenant, target, operation and digest', async () => {
    const digest = await digestPayload({ summary: 'test' });
    const binding = bindApproval({
      approverUserId: 'human-1',
      tenantId: 't1',
      target: 'PAY-142',
      operation: 'create_remediation_issue',
      payloadDigest: digest,
      proposalActor: 'agent-ai',
      now: NOW,
    });
    expect(binding.approverUserId).toBe('human-1');
    expect(binding.tenantId).toBe('t1');
    expect(binding.payloadDigest).toBe(digest);
    expect(new Date(binding.expiresAt).getTime()).toBeGreaterThan(NOW.getTime());
  });

  it('INVARIANT: an agent cannot approve its own proposal', () => {
    expect(() =>
      bindApproval({
        approverUserId: 'agent-ai',
        tenantId: 't1',
        target: 'PAY-142',
        operation: 'create_remediation_issue',
        payloadDigest: 'd',
        proposalActor: 'agent-ai',
        now: NOW,
      }),
    ).toThrow(SelfApprovalError);
  });

  it('enforces tenant, target, operation and digest match at execution', async () => {
    const digest = await digestPayload({ summary: 'test' });
    const binding = bindApproval({
      approverUserId: 'human-1',
      tenantId: 't1',
      target: 'PAY-142',
      operation: 'create_remediation_issue',
      payloadDigest: digest,
      proposalActor: 'agent-ai',
      now: NOW,
    });
    const base = {
      state: 'APPROVED' as const,
      binding,
      payloadDigest: digest,
      tenantId: 't1',
      target: 'PAY-142',
      operation: 'create_remediation_issue',
      executedDigests: [],
      now: NOW,
    };
    expect(() => assertExecutionAuthorized({ ...base, tenantId: 't2' })).toThrow(/tenant/);
    expect(() => assertExecutionAuthorized({ ...base, target: 'PAY-999' })).toThrow(/target/);
    expect(() => assertExecutionAuthorized({ ...base, operation: 'delete_issue' })).toThrow(
      /target\/operation/,
    );
    expect(() => assertExecutionAuthorized({ ...base, payloadDigest: 'tampered' })).toThrow(/digest/);
    expect(() => assertExecutionAuthorized({ ...base, now: new Date('2027-10-28T12:00:00Z') })).toThrow(
      /expired/,
    );
  });

  it('INVARIANT: replayed approval cannot duplicate the mutation', async () => {
    const digest = await digestPayload({ summary: 'test' });
    const binding = bindApproval({
      approverUserId: 'human-1',
      tenantId: 't1',
      target: 'PAY-142',
      operation: 'create_remediation_issue',
      payloadDigest: digest,
      proposalActor: 'agent-ai',
      now: NOW,
    });
    const req = {
      state: 'APPROVED' as const,
      binding,
      payloadDigest: digest,
      tenantId: 't1',
      target: 'PAY-142',
      operation: 'create_remediation_issue',
      executedDigests: [digest],
      now: NOW,
    };
    expect(() => assertExecutionAuthorized(req)).toThrow(ReplayError);
  });
});
