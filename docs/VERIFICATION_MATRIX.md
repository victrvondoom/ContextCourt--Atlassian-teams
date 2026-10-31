# Verification Matrix — ContextCourt AI

Capability-to-verification mapping for every important behavior. Methods:
UNIT (unit test) · INT (integration test, fake KVS/transport) · SEC (security
test) · PROP (property/invariant test) · REPLAY (deterministic replay) · DEMO
(scenario runner) · DOC (documentation) · BLOCKED (needs external deployment).

## Engine

| Capability | Method | Evidence |
|---|---|---|
| No evidence → no verified contradiction | UNIT | `tests/unit/contradiction.test.ts` |
| Both sides need evidence; single source never verifies | UNIT | same |
| Verification downgrade-only | UNIT | same |
| Stale/restricted evidence explicit | UNIT | same (fixture cases) |
| Sanitization + injection flags | UNIT | injection fixtures in engine tests |
| ADF extraction | UNIT | `tests/unit/adf.test.ts` |
| Evidence age feeds severity | UNIT | `tests/unit/severity.test.ts` |
| Deterministic replay of the whole engine | REPLAY | benchmark reproduces P=0.800/R=0.571/F1=0.667 exactly |

## Governance + execution

| Capability | Method | Evidence |
|---|---|---|
| Approval transitions legal-only | UNIT | `tests/unit/approval.test.ts` |
| Self-approval impossible | UNIT+DEMO | `tests/unit/execution.test.ts`; Scenario B |
| Approver-only execution | UNIT+DEMO | same |
| Expiry enforced | UNIT+DEMO | same |
| Replay rejected permanently | UNIT+INT | `execution.test.ts`, `review-queue.test.ts` |
| Digest-bound approvals (payload swap fails) | UNIT | `approval.test.ts` |
| Agent surface excludes approve/execute | DEMO | Scenario B tool-surface check |
| Explicit EXECUTION_FAILED | UNIT+DEMO | execution tests; Scenario D |
| Tenant isolation | SEC | `tests/security/tenant-isolation.test.ts` |
| Full lifecycle in one test | INT | `tests/integration/review-queue.test.ts` |

## Post-execution verification + queue

| Capability | Method | Evidence |
|---|---|---|
| Executed comment read back with trace marker → VERIFIED | UNIT+DEMO | `tests/unit/verification.test.ts`; Scenario E |
| Comment absent → MISMATCH (not success) | UNIT+DEMO | same |
| Unreadable source → UNVERIFIED (not success) | UNIT | same |
| Created issue read back by key | UNIT | same |
| Queue order deterministic across permutations | PROP | `tests/unit/queue-ordering.test.ts` |
| Severity dominance / age monotonicity / age bound | PROP | same |
| Pending-first ordering | UNIT | same |
| Priority explanations rendered | UNIT+UI | same + ReviewQueue |

## Audit

| Capability | Method | Evidence |
|---|---|---|
| Digest chain construction + verification | UNIT | `tests/unit/audit-log.test.ts` |
| Tamper detection | UNIT | same |
| Same-millisecond insertion order | UNIT | `tests/unit/audit-determinism.test.ts` |
| Lifecycle events chained (analysis→…→verified) | INT+DEMO | review-queue integration; Scenario A ledger |

## Surfaces

| Capability | Method | Evidence |
|---|---|---|
| Sandbox runs the real engine in-browser | INT | `tests/integration/sandbox-engine.test.ts` |
| Resolver/agent proposal parity | INT | review-queue integration |
| Registers complete and traceable | AUTO | `npm run validate:registers` (exit 0) |
| Demo scenarios A–F reproducible | DEMO | `npm run demo` — 6/6, deterministic |

## Honest limits (BLOCKED — external action required)

- Live Forge deployment (real ADF shapes, live KVS, live permissions)
- Rovo agent live invocation + MCP tool call
- Teamwork Graph transport (scopes + dev site)
Everything above those limits is TEST-VERIFIED locally and labeled as such.
