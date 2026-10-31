/**
 * Deterministic hackathon demo runner — Scenarios A–F.
 *
 *   npm run demo
 *   (equivalently: npx vite-node scripts/demo-scenarios.ts)
 *
 * Runs the REAL production core (analysis → evidence → proposal → approval →
 * execution → independent verification → audit chain) over deterministic
 * fixtures with a scripted Jira transport (writes recorded, never sent) and
 * in-memory KVS. Every scenario prints its evidence and a PASS/FAIL verdict;
 * the runner exits non-zero if any scenario fails, so judges can re-run the
 * entire demonstration with one command and get identical output.
 */
import { investigateIssueCore } from '../src/resolvers';
import { draftProposal } from '../src/core/remediation';
import { decideProposal, executeProposal } from '../src/core/execution';
import { verifyExecutionOutcome } from '../src/core/verification';
import { orderReviewQueue } from '../src/core/queue';
import { recordAuditEvent, verifyAuditChain } from '../src/audit/auditLog';
import { KvsAuditRepository } from '../src/storage/auditStore';
import { KvsProposalRepository } from '../src/storage/proposalStore';
import { rovoActionHandlers } from '../src/rovo/actions';
import { FakeKvs, FakeJiraFetcher } from '../tests/helpers/fakeKvs';
import type { RemediationProposal, Finding } from '../src/core/types';

// ---------------------------------------------------------------------------
// Scripted transports
// ---------------------------------------------------------------------------

type Fetcher = (
  path: string,
  init?: { method?: string; body?: unknown },
) => Promise<{ ok: boolean; status: number; json: unknown }>;

/** Read+write scripted Jira: GET returns the fixture issue; writes recorded. */
function scriptedJira(opts: { failWrites?: boolean; hideCommentAfterWrite?: boolean } = {}) {
  const writes: Array<{ path: string; body: unknown }> = [];
  const fetcher: Fetcher = async (path, init) => {
    if (init?.method === 'POST') {
      writes.push({ path, body: init.body });
      if (opts.failWrites) return { ok: false, status: 403, json: { errors: {} } };
      const body = init.body as { fields?: { project?: { key?: string } } };
      const project = body?.fields?.project?.key ?? 'SANDBOX';
      return { ok: true, status: 201, json: { key: `${project}-900` } };
    }
    if (path.includes('fields=comment')) {
      // Verification read-back: comments visible unless deliberately hidden.
      const issuePath = path.replace('?fields=comment', '');
      const comments = opts.hideCommentAfterWrite
        ? []
        : writes
            .filter((w) => w.path === `${issuePath}/comment`)
            .map((w, i) => ({ id: String(i + 1), body: w.body }));
      return { ok: true, status: 200, json: { fields: { comment: { comments } } } };
    }
    if (path.includes('fields=summary') && writes.some((w) => w.path === '/rest/api/3/issue')) {
      return { ok: true, status: 200, json: { fields: { summary: 'created remediation issue' } } };
    }
    if (path.startsWith('/rest/api/3/issue/')) {
      const fake = new FakeJiraFetcher([
        {
          match: /\/rest\/api\/3\/issue\/PAY-142/,
          respond: () => ({ ok: true, status: 200, json: FakeJiraFetcher.issueResponse() }),
        },
      ]);
      return fake.fetch(path, init);
    }
    return { ok: false, status: 404, json: {} };
  };
  return { fetcher, writes };
}

async function storeFindingForCase(kvs: FakeKvs, tenant: string, caseId: string): Promise<Finding> {
  const record = (await kvs.get(`case:${tenant}:${caseId}`)) as { findingIds: string[] } | undefined;
  const finding = (await kvs.get(`finding:${tenant}:${record!.findingIds[0]}`)) as Finding;
  return finding;
}

// ---------------------------------------------------------------------------
// Scenario runners
// ---------------------------------------------------------------------------

const results: Array<{ scenario: string; pass: boolean; notes: string[] }> = [];
function section(title: string) {
  console.log('\n' + '='.repeat(72));
  console.log(title);
  console.log('='.repeat(72));
}
function note(msg: string) {
  console.log('   ' + msg);
}
function verdict(scenario: string, pass: boolean, notes: string[]) {
  results.push({ scenario, pass, notes });
  console.log(`   ${pass ? 'PASS' : 'FAIL'} — ${scenario}`);
}

async function scenarioA() {
  section('Scenario A — Normal remediation (analyze → propose → approve → execute → verify)');
  const kvs = new FakeKvs();
  const { fetcher } = scriptedJira();
  const deps = {
    jiraFetcher: fetcher as never,
    kvs: kvs as never,
  };
  const analysis = await investigateIssueCore('tenant-demo', 'analyst-1', 'PAY-142', deps);
  note(`analysis status: ${(analysis as { status: string }).status}`);
  const a = analysis as { status: string; findings: Finding[]; evidenceCount: number; caseId?: string };
  if (a.status !== 'VERIFIED_CONTRADICTION') {
    return verdict('A', false, ['expected VERIFIED_CONTRADICTION']);
  }
  note(`findings: ${a.findings.length}, evidence records: ${a.evidenceCount}, case: ${a.caseId}`);

  const finding = await storeFindingForCase(kvs, 'tenant-demo', a.caseId!);
  note(`finding ${finding.findingId} cites evidence: ${finding.supportingEvidenceIds.join(', ')}`);

  const draft = await draftProposal({
    tenantId: 'tenant-demo',
    caseId: a.caseId!,
    finding,
    operation: 'add_decision_reference',
    expectedChange: 'Reference the current decision in acceptance criteria',
    actor: 'analyst-1',
    now: new Date('2026-10-31T12:00:00Z'),
  });
  const repo = new KvsProposalRepository(kvs as never);
  const audit = new KvsAuditRepository(kvs as never);
  const proposal: RemediationProposal = { ...draft.proposal, state: 'PENDING_APPROVAL', binding: null };
  await repo.put(proposal);
  await recordAuditEvent(
    audit,
    {
      tenantId: 'tenant-demo',
      actor: 'analyst-1',
      action: 'prepare_remediation',
      target: proposal.id,
      result: 'success',
      linkedEvidenceIds: proposal.supportingFindingIds,
      requestFingerprint: 'demo-prepare',
    },
    new Date('2026-10-31T12:02:00Z'),
  );
  note(`proposal ${proposal.id} prepared (PENDING_APPROVAL, risk=${proposal.risk})`);

  const approved = decideProposal({
    proposal,
    decision: 'approve',
    approverUserId: 'reviewer-2',
    now: new Date('2026-10-31T12:05:00Z'),
  });
  await repo.put(approved);
  await recordAuditEvent(
    audit,
    {
      tenantId: 'tenant-demo',
      actor: 'reviewer-2',
      action: 'proposal_approved',
      target: proposal.id,
      result: 'success',
      linkedEvidenceIds: proposal.supportingFindingIds,
      requestFingerprint: 'demo-approve',
    },
    new Date('2026-10-31T12:05:00Z'),
  );
  note(`approved by reviewer-2 (approver≠actor), expires ${approved.binding!.expiresAt}`);

  const executed = await executeProposal({
    proposal: approved,
    executorUserId: 'reviewer-2',
    executedDigests: await repo.executedDigests('tenant-demo', proposal.id),
    now: new Date('2026-10-31T12:10:00Z'),
    fetcher,
  });
  note(`execution: ${executed.state} — ${executed.detail}`);
  if (executed.state !== 'EXECUTED') return verdict('A', false, ['execution failed']);

  await recordAuditEvent(
    audit,
    {
      tenantId: 'tenant-demo',
      actor: 'reviewer-2',
      action: 'proposal_executed',
      target: proposal.id,
      result: 'success',
      linkedEvidenceIds: proposal.supportingFindingIds,
      requestFingerprint: 'demo-execute',
    },
    new Date('2026-10-31T12:10:00Z'),
  );
  const verification = await verifyExecutionOutcome({
    proposal: approved,
    resultRef: executed.resultRef,
    fetcher,
    now: new Date('2026-10-31T12:11:00Z'),
  });
  await recordAuditEvent(
    audit,
    {
      tenantId: 'tenant-demo',
      actor: 'reviewer-2',
      action: 'proposal_verified',
      target: proposal.id,
      result: verification.outcome === 'VERIFIED' ? 'success' : 'failure',
      linkedEvidenceIds: proposal.supportingFindingIds,
      requestFingerprint: 'demo-verify',
    },
    new Date('2026-10-31T12:11:00Z'),
  );
  note(`independent verification: ${verification.outcome} — ${verification.detail}`);

  const chainOk = await verifyAuditChain(audit as never, 'tenant-demo');
  const events = await audit.readAll('tenant-demo');
  note(`audit ledger: ${events.length} chained events, chain intact: ${chainOk}`);
  note(`lifecycle in ledger: ${events.map((e) => e.action).join(' → ')}`);

  const pass = verification.outcome === 'VERIFIED' && chainOk && events.length >= 3;
  verdict('Scenario A: full lifecycle with evidence-cited proposal and verified execution', pass, []);
}

async function scenarioB() {
  section('Scenario B — Approval security (every refusal demonstrated)');
  const base: RemediationProposal = {
    id: 'prop_case-pay-142_add_decision_reference',
    tenantId: 'tenant-demo',
    caseId: 'case-pay-142',
    targetSystem: 'jira',
    target: 'PAY-142',
    operation: 'add_decision_reference',
    expectedChange: 'x',
    payload: {},
    payloadDigest: 'digest-b',
    supportingFindingIds: ['finding_1'],
    risk: 'low',
    state: 'PENDING_APPROVAL',
    actor: 'analyst-1',
    createdAt: '2026-10-31T12:00:00Z',
    binding: null,
    verificationRequirements: [],
    severity: 'HIGH',
  };
  const ok = async () => ({ ok: true, status: 201, json: {} });

  // 1. Self-approval impossible.
  let msg = 'no error';
  try {
    decideProposal({ proposal: base, decision: 'approve', approverUserId: 'analyst-1', now: new Date() });
  } catch (e) {
    msg = (e as Error).message;
  }
  note(`1. self-approval → ${msg}`);
  const selfBlocked = /may not approve its own proposal/.test(msg);

  // 2. Agent tool surface structurally excludes approve/execute.
  const agentTools = Object.keys(rovoActionHandlers);
  note(`2. agent tool surface: ${agentTools.join(', ')}`);
  const noAgentGovernance = agentTools.every((t) => !/approve|decide|execute/.test(t));

  // 3. Unapproved proposal cannot execute.
  const unapproved = await executeProposal({
    proposal: base,
    executorUserId: 'reviewer-2',
    executedDigests: [],
    now: new Date(),
    fetcher: ok,
  });
  note(`3. unapproved execution → ${unapproved.state} (${unapproved.detail})`);

  // 4. Expired approval cannot execute.
  const expiredApproved = decideProposal({
    proposal: base,
    decision: 'approve',
    approverUserId: 'reviewer-2',
    now: new Date('2026-10-31T12:00:00Z'),
    validityMs: 60 * 1000,
  });
  const expired = await executeProposal({
    proposal: expiredApproved,
    executorUserId: 'reviewer-2',
    executedDigests: [],
    now: new Date('2026-10-31T13:00:00Z'),
    fetcher: ok,
  });
  note(`4. expired approval → ${expired.state} (${expired.detail})`);

  // 5. Non-approver cannot execute.
  const approvedNow = decideProposal({
    proposal: base,
    decision: 'approve',
    approverUserId: 'reviewer-2',
    now: new Date(),
  });
  const nonApprover = await executeProposal({
    proposal: approvedNow,
    executorUserId: 'someone-else',
    executedDigests: [],
    now: new Date(),
    fetcher: ok,
  });
  note(`5. non-approver execution → ${nonApprover.state} (${nonApprover.detail})`);

  // 6. Replay cannot duplicate effects.
  const first = await executeProposal({
    proposal: approvedNow,
    executorUserId: 'reviewer-2',
    executedDigests: [],
    now: new Date(),
    fetcher: ok,
  });
  const replay = await executeProposal({
    proposal: approvedNow,
    executorUserId: 'reviewer-2',
    executedDigests: [approvedNow.payloadDigest],
    now: new Date(),
    fetcher: ok,
  });
  note(`6. first execution ${first.state}; replayed execution → ${replay.state} (${replay.detail})`);

  verdict(
    'Scenario B: governance refusals all enforced',
    selfBlocked &&
      noAgentGovernance &&
      unapproved.state === 'EXECUTION_FAILED' &&
      expired.state === 'EXECUTION_FAILED' &&
      nonApprover.state === 'EXECUTION_FAILED' &&
      replay.state === 'EXECUTION_FAILED' &&
      first.state === 'EXECUTED',
    [],
  );
}

async function scenarioC() {
  section('Scenario C — Evidence contradiction and honest uncertainty');
  const kvs = new FakeKvs();
  const { fetcher } = scriptedJira();
  const analysis = (await investigateIssueCore('tenant-demo', 'analyst-1', 'PAY-142', {
    jiraFetcher: fetcher as never,
    kvs: kvs as never,
  })) as { status: string; findings: Finding[]; evidenceCount: number };
  const f = analysis.findings[0]!;
  note(`contradiction detected: ${analysis.status} (${analysis.evidenceCount} evidence records)`);
  note(
    `both sides cited: ${f.competingClaims.map((c) => `${c.statement} [${c.evidenceId}]`).join('  VS  ')}`,
  );
  note(`confidence ${f.confidence} — separate from severity ${f.severity}`);

  // Missing evidence → explicit INSUFFICIENT_EVIDENCE, never a guess.
  const emptyFetcher: Fetcher = async () => ({
    ok: true,
    status: 200,
    json: {
      id: '2',
      key: 'PAY-999',
      fields: { summary: 'empty', description: null, comment: { comments: [] } },
    },
  });
  const noEvidence = (await investigateIssueCore('tenant-demo', 'analyst-1', 'PAY-999', {
    jiraFetcher: emptyFetcher as never,
    kvs: new FakeKvs() as never,
  })) as { status: string };
  note(`issue with no evidence → ${noEvidence.status} (no verified contradiction without evidence)`);

  verdict(
    'Scenario C: contradiction verified with both sides cited; missing evidence stays unverified',
    analysis.status === 'VERIFIED_CONTRADICTION' &&
      f.supportingEvidenceIds.length >= 2 &&
      noEvidence.status === 'INSUFFICIENT_EVIDENCE',
    [],
  );
}

async function scenarioD() {
  section('Scenario D — Failed execution (controlled failure, honest audit)');
  const { fetcher } = scriptedJira({ failWrites: true });
  const proposal: RemediationProposal = {
    id: 'prop_case-pay-142_add_decision_reference',
    tenantId: 'tenant-demo',
    caseId: 'case-pay-142',
    targetSystem: 'jira',
    target: 'PAY-142',
    operation: 'add_decision_reference',
    expectedChange: 'x',
    payload: {},
    payloadDigest: 'digest-d',
    supportingFindingIds: ['finding_1'],
    risk: 'low',
    state: 'APPROVED',
    actor: 'analyst-1',
    createdAt: '2026-10-31T12:00:00Z',
    binding: {
      approverUserId: 'reviewer-2',
      tenantId: 'tenant-demo',
      target: 'PAY-142',
      operation: 'add_decision_reference',
      payloadDigest: 'digest-d',
      approvedAt: '2026-10-31T12:01:00Z',
      expiresAt: '2026-10-31T13:00:00Z',
    },
    verificationRequirements: [],
    severity: 'HIGH',
  };
  const outcome = await executeProposal({
    proposal,
    executorUserId: 'reviewer-2',
    executedDigests: [],
    now: new Date('2026-10-31T12:05:00Z'),
    fetcher,
  });
  note(`Jira rejected the write (403) → ${outcome.state}: ${outcome.detail}`);
  note(
    'execution failure is never recorded as success (see unit tests); recovery = re-approve a fresh proposal after the blocker is fixed',
  );
  verdict(
    'Scenario D: failed write classified explicitly, no fabricated success',
    outcome.state === 'EXECUTION_FAILED' && /403/.test(outcome.detail),
    [],
  );
}

async function scenarioE() {
  section('Scenario E — Post-execution verification (API 200 ≠ verified)');
  const proposal: RemediationProposal = {
    id: 'prop_case-pay-142_add_decision_reference',
    tenantId: 'tenant-demo',
    caseId: 'case-pay-142',
    targetSystem: 'jira',
    target: 'PAY-142',
    operation: 'add_decision_reference',
    expectedChange: 'x',
    payload: {},
    payloadDigest: 'digest-e',
    supportingFindingIds: ['finding_1'],
    risk: 'low',
    state: 'EXECUTED',
    actor: 'analyst-1',
    createdAt: '2026-10-31T12:00:00Z',
    binding: null,
    verificationRequirements: [],
    severity: 'HIGH',
  };

  // Good path: write accepted AND read back with the trace marker.
  const good = scriptedJira();
  await good.fetcher('/rest/api/3/issue/PAY-142/comment', {
    method: 'POST',
    body: {
      type: 'doc',
      version: 1,
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'done [contextcourt:prop_case-pay-142_add_decision_reference]' }],
        },
      ],
    },
  });
  const verified = await verifyExecutionOutcome({
    proposal,
    resultRef: 'PAY-142',
    fetcher: good.fetcher,
    now: new Date(),
  });
  note(`accepted write + confirmed read-back → ${verified.outcome} (${verified.detail})`);

  // Bad path: write "accepted" but the comment is absent from the source of truth.
  const missing = scriptedJira({ hideCommentAfterWrite: true });
  await missing.fetcher('/rest/api/3/issue/PAY-142/comment', {
    method: 'POST',
    body: {
      type: 'doc',
      version: 1,
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'done [contextcourt:prop_case-pay-142_add_decision_reference]' }],
        },
      ],
    },
  });
  const mismatch = await verifyExecutionOutcome({
    proposal,
    resultRef: 'PAY-142',
    fetcher: missing.fetcher,
    now: new Date(),
  });
  note(`accepted write, comment absent in Jira → ${mismatch.outcome} (${mismatch.detail})`);

  verdict(
    'Scenario E: execution success and verified state are separate, honestly-reported facts',
    verified.outcome === 'VERIFIED' && mismatch.outcome === 'MISMATCH',
    [],
  );
}

async function scenarioF() {
  section('Scenario F — Optimization and queue (documented utility, not magic numbers)');
  const mk = (
    id: string,
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW',
    risk: 'low' | 'medium' | 'high',
    hoursOld: number,
  ): RemediationProposal => ({
    id,
    tenantId: 'tenant-demo',
    caseId: 'case-x',
    targetSystem: 'jira',
    target: 'PAY-1',
    operation: 'add_decision_reference',
    expectedChange: 'x',
    payload: {},
    payloadDigest: 'd-' + id,
    supportingFindingIds: ['f'],
    risk,
    state: 'PENDING_APPROVAL',
    actor: 'a',
    createdAt: new Date(NOW() - hoursOld * 3600 * 1000).toISOString(),
    binding: null,
    verificationRequirements: [],
    severity,
  });
  const NOW = () => new Date('2026-10-31T12:00:00Z').getTime();
  const queue = [
    mk('prop-low-old', 'LOW', 'low', 80),
    mk('prop-high-risky', 'HIGH', 'high', 0.5),
    mk('prop-critical', 'CRITICAL', 'low', 1),
    mk('prop-medium', 'MEDIUM', 'medium', 30),
  ];
  const ranked = orderReviewQueue(queue, new Date(NOW()));
  note('queue order (documented utility: severity×100 + risk + age, pending first):');
  for (const r of ranked) {
    note(`   ${r.proposal.id.padEnd(16)} utility=${String(r.utility).padEnd(6)} ${r.priorityExplanation}`);
  }
  note('why prop-critical is first: CRITICAL severity dominates risk and waiting time (invariant tested)');
  verdict(
    'Scenario F: queue order follows the documented utility with explanations',
    ranked[0]!.proposal.id === 'prop-critical' &&
      ranked.map((r) => r.proposal.id).join(',') === 'prop-critical,prop-high-risky,prop-medium,prop-low-old',
    [],
  );
}

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

section('ContextCourt AI — deterministic demo (real engine, scripted Jira transport)');
console.log('   Every value below is computed by the production core modules.');
console.log('   Live Forge deployment remains BLOCKED (external credentials) — see docs.');

await scenarioA();
await scenarioB();
await scenarioC();
await scenarioD();
await scenarioE();
await scenarioF();

section('Demo summary');
const failed = results.filter((r) => !r.pass);
for (const r of results) console.log(`   ${r.pass ? 'PASS' : 'FAIL'}  ${r.scenario}`);
console.log(
  `\n   ${results.length - failed.length}/${results.length} scenarios passed. Output is deterministic: re-run with \`npm run demo\`.`,
);
if (failed.length > 0) {
  // Node is available when run via vite-node; declared lazily for the browser-safe type surface.
  (globalThis as { process?: { exit: (code: number) => void } }).process?.exit(1);
}
