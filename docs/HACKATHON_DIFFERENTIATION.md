# Hackathon Differentiation — ContextCourt AI

## The one-sentence pitch

**ContextCourt does not merely recommend actions: it produces evidence-backed
remediation proposals that require authorization by a second human, execute
under explicit controls, and are then independently verified against the
resulting state — with the whole lifecycle in a tamper-evident audit chain.**

## Why this is not a generic AI dashboard

| Generic AI app pattern | ContextCourt |
|---|---|
| LLM generates an answer, trust it | Deterministic engine; an explanation can only *downgrade* certainty, never upgrade it |
| "AI suggests… done!" | Proposal → **human approval** (different person, binding, expiry) → execution → **independent verification** |
| API 200 = success | Executed-but-MISMATCH and executed-but-UNVERIFIED are real, audited states |
| Arbitrary priority scores | Queue order = documented utility (severity×100 + risk + age), explained per item, property-tested |
| Agents can do everything | Agents investigate and draft; approve/execute **structurally do not exist** as agent tools |
| Impressive metrics | Only measured numbers; recall is honestly lower *because the product refuses to verify without evidence* |
| Demo theater | One command (`npm run demo`) re-runs everything deterministically; refusals are shown from actual test behavior |

## Technical differentiators (all TEST-VERIFIED)

1. **Evidence-first invariant**: no evidence on both sides → no verified
   contradiction (benchmark F1 trade-off documented and defended).
2. **Human governance as code**: bindings, self-approval rejection,
   approver-only execution, replay-proof digests — 15 numbered invariants,
   each mapped to a test (`docs/SECURITY_AND_GOVERNANCE.md`).
3. **Independent post-execution verification** — rare even in production
   tooling: the write is re-read from the source of truth with trace markers.
4. **Digest-chained audit ledger** with insertion-monotonic ids and a
   verification API — tampering is detectable, demonstrated live.
5. **Deterministic everywhere**: engine replay byte-identical; demo 6/6
   reproducible; queue order stable across permutations.
6. **Honest registers**: 468 capabilities + 459 engineering tasks with
   dispositions and evidence — including explicit REJECT_WITH_REASON entries
   (no vector DB, no Kubernetes, no fake-live indicators, no invented
   competitor comparisons).

## Bonus prize alignment

Maintained in `docs/bonus-evidence-matrix.md` (Rovo agent, MCP, Teamwork
Graph, Marketplace) with honest statuses; live invocation remains BLOCKED on
deployment credentials.

## Submission checklist (as submitted)

- [x] Working product loop end to end (analysis → … → verification → audit)
- [x] 105/105 tests, typecheck/lint/format/build green
- [x] `npm run demo` — Scenarios A–F, deterministic, 6/6
- [x] Measured benchmark with methodology + exact replay
- [x] 468-feature catalogue + 459-task register + traceability (validated)
- [x] Governance invariants documented and tested
- [x] README as-built with quickstart
- [x] Limitations and external blockers disclosed everywhere relevant
- [ ] Live Forge deployment / Marketplace — BLOCKED (external credentials)
- [ ] Demo video — outlined in the demo script, not recorded

## Anticipated judge questions (short answers)

- *"Why is recall only 0.57?"* — by design: stale/restricted evidence is
  refused verification; the invariant outranks the metric (documented).
- *"Can the agent go rogue?"* — it has no approve/execute tool; structurally
  impossible, demonstrated in Scenario B.
- *"What if the write silently failed?"* — verification re-reads the source
  of truth; MISMATCH/UNVERIFIED are distinct audited outcomes.
- *"Is the audit log trustworthy?"* — digest-chained; any edit breaks
  verification (tamper test).
