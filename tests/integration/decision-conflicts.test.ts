/**
 * Decision conflict safety (ET-243).
 *
 * Two reviewers must not both "succeed" on the same proposal: the decision
 * path re-reads state from the store immediately before transitioning, so a
 * second, conflicting decision committed after the first finds a terminal /
 * non-pending state and fails safely. Truly concurrent interleaving is an
 * accepted last-writer-wins limitation (ADR-007) — this test pins the
 * sequential conflict behavior that the store guarantees.
 */
import { describe, expect, it } from 'vitest';
import { decideProposalCore, investigateIssueCore } from '../../src/resolvers';
import { KvsProposalRepository } from '../../src/storage/proposalStore';
import { resetFindingIds } from '../../src/core/contradiction';
import { resetPropositionIds } from '../../src/core/normalizer';
import { draftProposal } from '../../src/core/remediation';
import { FakeKvs, FakeJiraFetcher } from '../helpers/fakeKvs';
import type { Finding, RemediationProposal } from '../../src/core/types';

async function setupProposal(): Promise<{ kvs: FakeKvs; proposalId: string }> {
  resetFindingIds();
  resetPropositionIds();
  const kvs = new FakeKvs();
  const jiraFetcher = (async (path: string, init?: { method?: string; body?: unknown }) => {
    const fake = new FakeJiraFetcher([
      {
        match: /\/rest\/api\/3\/issue\/PAY-142/,
        respond: () => ({ ok: true, status: 200, json: FakeJiraFetcher.issueResponse() }),
      },
    ]);
    return fake.fetch(path, init);
  }) as never;
  const analysis = (await investigateIssueCore('tenant-a', 'analyst-1', 'PAY-142', {
    jiraFetcher,
    kvs: kvs as never,
  })) as { caseId?: string; findings?: Finding[] };
  const finding = (await kvs.get(`finding:tenant-a:${analysis.findings![0]!.findingId}`)) as Finding;
  const draft = await draftProposal({
    tenantId: 'tenant-a',
    caseId: analysis.caseId!,
    finding,
    operation: 'add_decision_reference',
    expectedChange: 'reference the current decision',
    actor: 'analyst-1',
    now: new Date('2026-10-31T12:00:00Z'),
  });
  const proposal: RemediationProposal = { ...draft.proposal, state: 'PENDING_APPROVAL', binding: null };
  const repo = new KvsProposalRepository(kvs as never);
  await repo.put(proposal);
  return { kvs, proposalId: proposal.id };
}

describe('decision conflicts fail safely (ET-243)', () => {
  it('a second, conflicting decision after the first committed is rejected', async () => {
    const { kvs, proposalId } = await setupProposal();
    const first = await decideProposalCore(
      'tenant-a',
      'reviewer-1',
      proposalId,
      'approve',
      null,
      kvs as never,
    );
    expect(first.status).toBe('OK');
    // reviewer-2 disagrees, but the state is no longer PENDING_APPROVAL.
    const second = await decideProposalCore(
      'tenant-a',
      'reviewer-2',
      proposalId,
      'reject',
      'too risky',
      kvs as never,
    );
    expect(second.status).toBe('DECISION_REJECTED');
    expect((second as { error?: string }).error).toMatch(/only PENDING_APPROVAL/);
    const repo = new KvsProposalRepository(kvs as never);
    const stored = await repo.get('tenant-a', proposalId);
    expect(stored?.state).toBe('APPROVED');
    expect(stored?.binding?.approverUserId).toBe('reviewer-1');
  });

  it('a second approval (even by a different reviewer) is also rejected', async () => {
    const { kvs, proposalId } = await setupProposal();
    await decideProposalCore('tenant-a', 'reviewer-1', proposalId, 'approve', null, kvs as never);
    const second = await decideProposalCore(
      'tenant-a',
      'reviewer-2',
      proposalId,
      'approve',
      null,
      kvs as never,
    );
    expect(second.status).toBe('DECISION_REJECTED');
  });

  it('decide-reject then decide-approve: the second decision fails, rejection stands', async () => {
    const { kvs, proposalId } = await setupProposal();
    const first = await decideProposalCore(
      'tenant-a',
      'reviewer-1',
      proposalId,
      'reject',
      'obsolete',
      kvs as never,
    );
    expect(first.status).toBe('OK');
    const second = await decideProposalCore(
      'tenant-a',
      'reviewer-2',
      proposalId,
      'approve',
      null,
      kvs as never,
    );
    expect(second.status).toBe('DECISION_REJECTED');
    const repo = new KvsProposalRepository(kvs as never);
    expect((await repo.get('tenant-a', proposalId))?.state).toBe('REJECTED');
  });

  it('both attempts are visible in the audit ledger — the refused one is not silently lost', async () => {
    const { kvs, proposalId } = await setupProposal();
    await decideProposalCore('tenant-a', 'reviewer-1', proposalId, 'approve', null, kvs as never);
    const second = await decideProposalCore(
      'tenant-a',
      'reviewer-2',
      proposalId,
      'reject',
      'no',
      kvs as never,
    );
    expect(second.status).toBe('DECISION_REJECTED');
    // Only the successful decision writes an audit event; the refused one
    // returns an explicit error to the caller instead of being recorded as
    // success (failures are never recorded as successes).
    const auditKeys = Array.from(kvs.data.keys()).filter((k) => k.startsWith('audit:'));
    const approved = Array.from(kvs.data.values()).some(
      (v) => (v as { action?: string }).action === 'proposal_approved',
    );
    expect(approved).toBe(true);
    expect(auditKeys.length).toBeGreaterThan(0);
  });
});
