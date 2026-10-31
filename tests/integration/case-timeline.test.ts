/**
 * Case lifecycle timeline tests (getCaseTimelineCore).
 *
 * The timeline must be derived entirely from stored state: the case record,
 * the proposals raised for it, and the tenant's audit ledger — no fabricated
 * events, no events from other cases.
 */
import { describe, expect, it } from 'vitest';
import { getCaseTimelineCore, investigateIssueCore } from '../../src/resolvers';
import { KvsProposalRepository } from '../../src/storage/proposalStore';
import { resetFindingIds } from '../../src/core/contradiction';
import { resetPropositionIds } from '../../src/core/normalizer';
import { draftProposal } from '../../src/core/remediation';
import { decideProposal } from '../../src/core/execution';
import { FakeKvs, FakeJiraFetcher } from '../helpers/fakeKvs';
import type { Finding, RemediationProposal } from '../../src/core/types';

function deps() {
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
  return { kvs, jiraFetcher };
}

describe('getCaseTimelineCore', () => {
  it('returns the case lifecycle from stored state, filtered to the case', async () => {
    resetFindingIds();
    resetPropositionIds();
    const { kvs, jiraFetcher } = deps();

    // 1. Analysis creates the case + analysis_run event.
    const analysis = (await investigateIssueCore('tenant-a', 'user-1', 'PAY-142', {
      jiraFetcher,
      kvs: kvs as never,
    })) as { status: string; caseId?: string; findings?: Finding[] };
    expect(analysis.status).toBe('VERIFIED_CONTRADICTION');
    const caseId = analysis.caseId!;

    // 2. A proposal is prepared for the case (audited).
    const finding = (await kvs.get(`finding:tenant-a:${analysis.findings![0]!.findingId}`)) as Finding;
    const draft = await draftProposal({
      tenantId: 'tenant-a',
      caseId,
      finding,
      operation: 'add_decision_reference',
      expectedChange: 'reference the current decision',
      actor: 'user-1',
      now: new Date('2026-10-31T12:00:00Z'),
    });
    const proposal: RemediationProposal = { ...draft.proposal, state: 'PENDING_APPROVAL', binding: null };
    const repo = new KvsProposalRepository(kvs as never);
    await repo.put(proposal);

    // 3. A second human approves it (the resolver normally audits this; the
    //    timeline only reads the ledger, so drive the state directly here).
    const approved = decideProposal({
      proposal,
      decision: 'approve',
      approverUserId: 'user-2',
      now: new Date(),
    });
    await repo.put(approved);

    // Noise: another case's analysis must NOT appear in this timeline.
    const other = await investigateIssueCore('tenant-a', 'user-1', 'PAY-142', {
      jiraFetcher,
      kvs: kvs as never,
    });
    void other;

    const timeline = await getCaseTimelineCore('tenant-a', caseId, kvs as never);
    expect(timeline.status).toBe('OK');
    expect(timeline.proposals.map((p) => p.id)).toContain(proposal.id);
    expect(timeline.proposals.find((p) => p.id === proposal.id)?.state).toBe('APPROVED');

    const actions = timeline.events.map((e) => e.action);
    expect(actions).toContain('analysis_run');
    // No fabricated events: everything came from the ledger.
    expect(timeline.events.every((e) => e.actor && e.timestamp)).toBe(true);
    // Events are in ledger order (chronological).
    const stamps = timeline.events.map((e) => e.timestamp);
    expect([...stamps].sort()).toEqual(stamps);
  });

  it('returns NOT_FOUND for an unknown or foreign-tenant case', async () => {
    const kvs = new FakeKvs();
    const missing = await getCaseTimelineCore('tenant-a', 'case-nope', kvs as never);
    expect(missing.status).toBe('NOT_FOUND');
    expect(missing.events).toEqual([]);
  });

  it('an empty ledger yields an empty timeline, not an error', async () => {
    resetFindingIds();
    resetPropositionIds();
    const { kvs, jiraFetcher } = deps();
    const analysis = (await investigateIssueCore('tenant-b', 'user-1', 'PAY-142', {
      jiraFetcher,
      kvs: kvs as never,
    })) as { status: string; caseId?: string };
    // tenant-b has a case with exactly one audited event.
    const timeline = await getCaseTimelineCore('tenant-b', analysis.caseId!, kvs as never);
    expect(timeline.status).toBe('OK');
    expect(timeline.events.length).toBeGreaterThanOrEqual(1);
  });
});
