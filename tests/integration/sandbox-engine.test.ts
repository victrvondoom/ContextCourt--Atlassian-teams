/**
 * Sandbox engine tests — the in-browser demo must be REAL code, not fixtures.
 *
 * Every sandbox surface (analysis, cases, proposals, decisions, execution,
 * audit chain) is driven by the same core modules the backend uses; these
 * tests prove the demo path computes its results.
 */
import { describe, expect, it } from 'vitest';
import {
  cancelSandboxProposal,
  listSandboxAuditEvents,
  listSandboxCases,
  listSandboxProposals,
  runSandboxAnalysis,
  decideSandboxProposal,
  executeSandboxProposal,
  prepareSandboxProposal,
  sandboxJiraWrites,
  getSandboxCaseTimeline,
  sandboxStoreCounts,
} from '../../src/frontend/sandbox/sandboxEngine';
import { verifyAuditChain } from '../../src/audit/auditLog';

describe('sandbox engine (dynamic demo, real code)', () => {
  it('analysis is computed by the real engine and deterministic per key', async () => {
    const a = await runSandboxAnalysis('PAY-142');
    const b = await runSandboxAnalysis('PAY-142');
    expect(a.status).toBe(b.status);
    expect(a.findings?.length).toBe(b.findings?.length);
    // The deterministic scenario for PAY-142 is the contradiction fixture.
    expect([
      'VERIFIED_CONTRADICTION',
      'POTENTIAL_CONTRADICTION',
      'CONSISTENT',
      'INSUFFICIENT_EVIDENCE',
    ]).toContain(a.status);
  });

  it('creates a real in-memory case and audit event for a contradiction', async () => {
    const before = sandboxStoreCounts();
    const result = await runSandboxAnalysis('PAY-142');
    const cases = listSandboxCases();
    expect(cases.length).toBeGreaterThanOrEqual(before.cases);
    if (result.status === 'VERIFIED_CONTRADICTION' || result.status === 'POTENTIAL_CONTRADICTION') {
      expect(cases.some((c) => c.caseId === 'case-pay-142')).toBe(true);
    }
    expect(listSandboxAuditEvents().some((e) => e.action === 'analysis_run')).toBe(true);
  });

  it('runs the full proposal → approve → execute loop with a scripted write', async () => {
    const analysis = await runSandboxAnalysis('PAY-142');
    expect(['VERIFIED_CONTRADICTION', 'POTENTIAL_CONTRADICTION']).toContain(analysis.status);
    const caseRecord = listSandboxCases().find((c) => c.caseId === 'case-pay-142');
    expect(caseRecord).toBeDefined();
    const findingId = caseRecord!.findingIds[0]!;

    const prepared = await prepareSandboxProposal('case-pay-142', findingId);
    expect(prepared.status).toBe('OK');
    const proposal = listSandboxProposals().find((p) => p.state === 'PENDING_APPROVAL');
    expect(proposal).toBeDefined();

    // The sandbox reviewer is a different actor from the analyst — approval succeeds.
    const approved = await decideSandboxProposal(proposal!.id, 'approve');
    expect(approved.status).toBe('OK');
    expect(listSandboxProposals().find((p) => p.id === proposal!.id)?.state).toBe('APPROVED');

    const writesBefore = sandboxJiraWrites().length;
    const executed = await executeSandboxProposal(proposal!.id);
    expect(executed.status).toBe('OK');
    expect(executed.outcome?.state).toBe('EXECUTED');
    // The Jira write was scripted and recorded, never sent.
    expect(sandboxJiraWrites().length).toBe(writesBefore + 1);

    // Executing again is impossible: the proposal is in a terminal state, and
    // the executed-digest registry would reject the payload regardless.
    const replay = await executeSandboxProposal(proposal!.id);
    expect(replay.outcome?.state).toBe('EXECUTION_FAILED');
    expect(replay.outcome?.detail).toMatch(/replay|invalid approval transition/);

    // The audit chain in the sandbox is a real, verifiable chain.
    const chainOk = await verifyAuditChain(
      {
        async append() {},
        async readAll() {
          return listSandboxAuditEvents() as never;
        },
      } as never,
      'sandbox',
    );
    expect(chainOk).toBe(true);
  });

  describe('sandbox dynamics parity (cancel, rationale, timeline)', () => {
    it('reject with rationale stores it; cancel authority mirrors production', async () => {
      const analysis = await runSandboxAnalysis('PAY-142');
      expect(['VERIFIED_CONTRADICTION', 'POTENTIAL_CONTRADICTION']).toContain(analysis.status);
      const caseRecord = listSandboxCases().find((c) => c.caseId === 'case-pay-142');
      expect(caseRecord).toBeDefined();
      const prepared = await prepareSandboxProposal('case-pay-142', caseRecord!.findingIds[0]!);
      expect(prepared.status).toBe('OK');
      const proposal = listSandboxProposals().find((p) => p.state === 'PENDING_APPROVAL');
      expect(proposal).toBeDefined();

      // Rejection carries a stored rationale.
      const rejected = await decideSandboxProposal(
        proposal!.id,
        'reject',
        'Not applicable under the current decision record.',
      );
      expect(rejected.status).toBe('OK');
      expect(listSandboxProposals().find((p) => p.id === proposal!.id)?.decisionRationale).toBe(
        'Not applicable under the current decision record.',
      );

      // A second proposal: approve, then revoke as the approver — cancel works.
      const prepared2 = await prepareSandboxProposal('case-pay-142', caseRecord!.findingIds[0]!);
      expect(prepared2.status).toBe('OK');
      const approved = await decideSandboxProposal(prepared2.proposalId!, 'approve');
      expect(approved.status).toBe('OK');
      const cancelled = await cancelSandboxProposal(prepared2.proposalId!, 'Withdrawn for rework.');
      expect(cancelled.status).toBe('OK');
      expect(listSandboxProposals().find((p) => p.id === prepared2.proposalId)?.state).toBe('CANCELLED');
      expect(
        listSandboxAuditEvents().some(
          (e) => e.action === 'proposal_cancelled' && e.target === prepared2.proposalId,
        ),
      ).toBe(true);

      // The case timeline surfaces the audited lifecycle from sandbox stores.
      const timeline = getSandboxCaseTimeline('case-pay-142');
      expect(timeline.status).toBe('OK');
      const actions = timeline.events.map((e) => e.action);
      expect(actions).toContain('analysis_run');
      expect(actions).toContain('prepare_remediation');
      expect(actions).toContain('proposal_cancelled');
    });
  });
});
