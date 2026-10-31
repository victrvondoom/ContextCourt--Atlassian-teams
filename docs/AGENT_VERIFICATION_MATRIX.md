# Agent Verification Matrix — ContextCourt AI

Written 2026-10-31. Every agentic surface has an explicit verification
strategy. "Completion" (a tool returned 200) is never conflated with
"correctness".

## Rovo actions (manifest `action` modules)

| Action | Objective | Allowed effect | Verification method | Evidence | Status |
|---|---|---|---|---|---|
| `contextcourt-investigate-issue` | Classify contradictions for one issue, evidence-cited | Read Jira; **persist findings/case; write `analysis_run` audit event** | Integration test with fake Jira transport + fake KVS: engine must return VERIFIED_CONTRADICTION for the contradictory fixture, persist findings under exact keys, chain the audit event; failure path must record a failure event and return ANALYSIS_FAILED | `tests/integration/review-queue.test.ts`, `tests/integration/persistence.test.ts`, `tests/unit/contradiction.test.ts` (10 invariants) | TEST-VERIFIED; live invocation BLOCKED (dev site) |
| `contextcourt-get-case` | Retrieve an authorized case | Read KVS | Contract test: tenant-isolated read, NOT_FOUND for foreign tenant | `tests/security/tenant-isolation.test.ts` | TEST-VERIFIED |
| `contextcourt-get-evidence` | Return sanitized evidence + provenance | Read Jira | Shared-builder test path: same sanitizer/digests as analysis; injection fixtures flagged explicitly; untrusted text is never returned raw | `tests/unit/jira-adapter.test.ts` (ADF), `tests/integration/review-queue.test.ts` (builder path), `tests/security/injection` fixtures via contradiction tests | TEST-VERIFIED |
| `contextcourt-get-impact` | Report verified dependency impact | Read Jira | Verified-edges-only BFS with bounded depth; inferred edges never merged (invariant tests) | `tests/unit/impact-remediation.test.ts` | TEST-VERIFIED |
| `contextcourt-prepare-remediation` | Draft a PENDING_APPROVAL proposal | Write KVS proposal only | Risk gating (min severity per operation), rejected findings cannot generate proposals, audit event, no execution path | `tests/unit/impact-remediation.test.ts`, `tests/unit/execution.test.ts`, `tests/integration/review-queue.test.ts` | TEST-VERIFIED |
| `contextcourt-get-approval-status` | Report proposal state | Read KVS | Approver identity never exposed through agent tools (only presence) — enforced by response shape | Code review + type shape | TEST-VERIFIED (shape), UNVERIFIED live |

**Agents deliberately have NO approve/execute tool.** Approval and execution
are reachable only by authenticated humans through the Custom UI resolvers.

## Custom UI resolvers (human-driven actions)

| Surface | Verification | Evidence |
|---|---|---|
| `prepareProposal` | Finding must be stored + tenant-checked; severity gate enforced in `draftProposal`; audited | `tests/unit/impact-remediation.test.ts` (gates), review-queue integration (loop) |
| `decideProposal` | Only PENDING_APPROVAL decidable; self-approval impossible (`SelfApprovalError` → `DECISION_REJECTED`); binding digest-bound with expiry; audited | `tests/unit/execution.test.ts` (4 decision tests), `tests/unit/approval.test.ts` (7) |
| `executeProposal` | `assertExecutionAuthorized` (state, binding, tenant, target, operation, digest, expiry) + approver-identity + executed-digest replay registry; Jira failure → EXECUTION_FAILED (audited), never silent success | `tests/unit/execution.test.ts` (7 execution tests), review-queue integration (replay + chain intact) |
| `analyzeIssue` | zod-validated input; unauthenticated context rejected; all paths audited | review-queue integration tests |
| `health` | Jira state from a real `/rest/api/3/myself` probe, not asserted | resolver code + live BLOCKED for the probe itself |

## Verification of the *sandbox* (an agent-like surface)

The in-browser demo is verified as real code: analysis determinism per key,
full proposal→approve→execute loop, replay rejection, digest chain integrity —
`tests/integration/sandbox-engine.test.ts`. The scripted Jira transport
records writes without sending them; the UI displays this fact.

## Known verification limits (honest)

- All Jira/KVS transports are faked in tests. Live behavior (ADF shapes,
  permission edges, KVS query pagination) is **BLOCKED — EXTERNAL ACTION
  REQUIRED** until a dev-site deploy.
- `create_remediation_issue` assumes the standard `Task` issue type in the
  derived project; a missing type yields an explicit EXECUTION_FAILED with
  status detail — verified in `tests/unit/execution.test.ts` (failure test).
- No LLM operates in any verified path; the Rovo *agent prompt* is a
  deployment artifact whose live behavior can only be verified in Rovo
  Studio (BLOCKED).
