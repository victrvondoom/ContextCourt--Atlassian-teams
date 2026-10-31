/**
 * End-to-end review queue flow (integration, fake KVS + fake Jira transport):
 *
 * analysis (real engine, fake Jira) → persisted findings + case → audit event
 * → proposal (draftProposal) → list → approve by a second human → execute
 * with a scripted Jira write → replay rejected → audit chain intact.
 *
 * This is the regression test for the "static review queue" defect: the
 * proposal loop must be reachable and driven by real stored state.
 */
import { describe, expect, it } from 'vitest';
import { investigateIssueCore } from '../../src/resolvers';
import { KvsProposalRepository } from '../../src/storage/proposalStore';
import { KvsCaseRepository, type KvsLike } from '../../src/storage/caseStore';
import { KvsAuditRepository, type AuditSinkLike } from '../../src/storage/auditStore';
import { recordAuditEvent, verifyAuditChain } from '../../src/audit/auditLog';
import { decideProposal, executeProposal } from '../../src/core/execution';
import { draftProposal } from '../../src/core/remediation';
import { resetFindingIds } from '../../src/core/contradiction';
import { resetPropositionIds } from '../../src/core/normalizer';
import { FakeKvs, FakeJiraFetcher } from '../helpers/fakeKvs';
import type { Finding, RemediationProposal } from '../../src/core/types';

const TENANT = 'tenant-a';
const ACTOR = 'user-1'; // analyst who runs the analysis and prepares the proposal
const APPROVER = 'user-2'; // second human who approves and executes

function deps() {
  const kvs = new FakeKvs();
  return {
    kvs,
    jiraFetcher: (async (path: string, init?: { method?: string; body?: unknown }) => {
      const fake = new FakeJiraFetcher([
        {
          match: /\/rest\/api\/3\/issue\/PAY-142/,
          respond: () => ({ ok: true, status: 200, json: FakeJiraFetcher.issueResponse() }),
        },
        {
          match: /\/rest\/api\/3\/issue\/[^/]+\/comment$/,
          respond: () => ({ ok: true, status: 201, json: { id: 'c1' } }),
        },
      ]);
      return fake.fetch(path, init);
    }) as never,
  };
}

describe('analysis → audit → proposal → approval → execution (full loop)', () => {
  it('runs the full review-queue loop on real stored state', async () => {
    resetFindingIds();
    resetPropositionIds();
    const { kvs, jiraFetcher } = deps();
    const audit = new KvsAuditRepository(kvs as unknown as AuditSinkLike);

    // 1. Analysis over fake Jira content — must find the real contradiction.
    const result = await investigateIssueCore(TENANT, ACTOR, 'PAY-142', {
      jiraFetcher,
      kvs: kvs as unknown as KvsLike & AuditSinkLike,
    });
    expect(result.status).toBe('VERIFIED_CONTRADICTION');
    if (!('findings' in result)) throw new Error('expected findings in analysis result');
    expect(result.findings.length).toBeGreaterThan(0);

    // 2. The run is recorded in the digest-chained audit ledger.
    const events = await audit.readAll(TENANT);
    expect(events.some((e) => e.action === 'analysis_run' && e.result === 'success')).toBe(true);
    expect(events[0]!.precedingEventDigest).toBeNull();

    // 3. Case + findings were persisted; prepare a remediation proposal.
    const caseRepo = new KvsCaseRepository(kvs as unknown as KvsLike);
    const record = await caseRepo.get(TENANT, 'case-pay-142');
    expect(record).not.toBeNull();
    const storedFinding = (await kvs.get(`finding:${TENANT}:${record!.findingIds[0]}`)) as Finding;
    expect(storedFinding.tenantId).toBe(TENANT);

    const draft = await draftProposal({
      tenantId: TENANT,
      caseId: record!.caseId,
      finding: storedFinding,
      operation: 'add_decision_reference',
      expectedChange: 'Reference DEC-88 in the acceptance criteria of PAY-142',
      actor: ACTOR,
      now: new Date('2026-10-30T12:00:00Z'),
    });
    const proposal: RemediationProposal = { ...draft.proposal, state: 'PENDING_APPROVAL', binding: null };
    const repo = new KvsProposalRepository(kvs as unknown as KvsLike);
    await repo.put(proposal);

    // 4. The queue lists it; tenant isolation filters other tenants.
    const listed = await repo.list(TENANT);
    expect(listed.map((p) => p.id)).toContain(proposal.id);
    expect((await repo.list('tenant-b')).some((p) => p.id === proposal.id)).toBe(false);

    // 5. Self-approval is impossible; a second human approves.
    expect(() =>
      decideProposal({ proposal, decision: 'approve', approverUserId: ACTOR, now: new Date() }),
    ).toThrow(/may not approve its own proposal/);
    const approved = decideProposal({
      proposal,
      decision: 'approve',
      approverUserId: APPROVER,
      now: new Date(),
    });
    expect(approved.state).toBe('APPROVED');
    await repo.put(approved);
    await recordAuditEvent(
      audit,
      {
        tenantId: TENANT,
        actor: APPROVER,
        action: 'proposal_approved',
        target: proposal.id,
        result: 'success',
        linkedEvidenceIds: proposal.supportingFindingIds,
        requestFingerprint: 'fp-approve',
      },
      new Date(),
    );

    // 6. Execution performs the scripted Jira write, once.
    const executed = await executeProposal({
      proposal: approved,
      executorUserId: APPROVER,
      executedDigests: await repo.executedDigests(TENANT, proposal.id),
      now: new Date(),
      fetcher: jiraFetcher,
    });
    expect(executed.state).toBe('EXECUTED');
    expect(executed.resultRef).toBe('PAY-142');
    await repo.put({ ...approved, state: 'EXECUTED' });
    await repo.recordExecutedDigest(TENANT, proposal.id, proposal.payloadDigest);

    // 7. Replaying the same execution is permanently rejected.
    const replay = await executeProposal({
      proposal: approved,
      executorUserId: APPROVER,
      executedDigests: await repo.executedDigests(TENANT, proposal.id),
      now: new Date(),
      fetcher: jiraFetcher,
    });
    expect(replay.state).toBe('EXECUTION_FAILED');
    expect(replay.detail).toMatch(/replay/);

    // 8. The audit chain is still intact after all appends.
    expect(await verifyAuditChain(audit as never, TENANT)).toBe(true);
  });

  it('records a failure audit event when Jira is unavailable', async () => {
    const kvs = new FakeKvs();
    const failingFetcher = (async () => ({ ok: false, status: 500, json: {} })) as never;
    const result = await investigateIssueCore(TENANT, ACTOR, 'PAY-999', {
      jiraFetcher: failingFetcher,
      kvs: kvs as unknown as KvsLike & AuditSinkLike,
    });
    expect(result.status).toBe('ANALYSIS_FAILED');
    const audit = new KvsAuditRepository(kvs as unknown as AuditSinkLike);
    const events = await audit.readAll(TENANT);
    const run = events.find((e) => e.action === 'analysis_run');
    expect(run?.result).toBe('failure');
  });
});

describe('KvsProposalRepository tenant isolation', () => {
  it('a proposal stored for tenant-a is invisible to tenant-b reads', async () => {
    const kvs = new FakeKvs();
    const repo = new KvsProposalRepository(kvs as unknown as KvsLike);
    const draft = await draftProposal({
      tenantId: 'tenant-a',
      caseId: 'case-pay-142',
      finding: {
        findingId: 'f1',
        tenantId: 'tenant-a',
        type: 'policy_violation',
        status: 'VERIFIED_CONTRADICTION',
        severity: 'HIGH',
        explanation: 'x',
        supportingEvidenceIds: ['ev-1', 'ev-2'],
        competingClaims: [],
        confidence: 0.9,
        detectedAt: '2026-10-30T00:00:00Z',
        affectedWork: [{ type: 'jira_issue', key: 'PAY-142' }],
        provenance: [],
      },
      operation: 'add_decision_reference',
      expectedChange: 'reference the current decision',
      actor: 'user-1',
      now: new Date('2026-10-30T12:00:00Z'),
    });
    await repo.put({ ...draft.proposal, state: 'PENDING_APPROVAL', binding: null });
    expect(await repo.get('tenant-b', draft.proposal.id)).toBeNull();
    expect(await repo.list('tenant-b')).toHaveLength(0);
    expect((await repo.list('tenant-a')).length).toBe(1);
  });
});
