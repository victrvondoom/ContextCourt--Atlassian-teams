# Technical Debt & Defect Register

Evidence classes: code-verified unless marked LIVE-BLOCKED (needs a real Jira site to confirm live behavior).

| ID | Severity | Location | Finding | Evidence | Status |
|---|---|---|---|---|---|
| CC-001 | **Critical** | `src/integrations/jira.ts` `mapIssue`; `src/resolvers/index.ts` `buildEvidence` | Jira REST v3 returns `description` and comment `body` as ADF documents, not strings. `mapIssue` keeps strings only → `description: null`, `body: ''` → evidence set is empty for every real issue → engine always returns INSUFFICIENT_EVIDENCE. Core product promise silently non-functional in production. | v3 `fields=description,comment`; code: `typeof fields.description === 'string' ? … : null`. LIVE-BLOCKED for live shape; ADF-on-v3 is documented platform behavior. | **FIXED** (ADF→text extraction + fixtures) |
| CC-002 | **Critical** | `src/resolvers/index.ts` `analyzeIssue`; `src/rovo/actions.ts` `prepareRemediation`,`loadFinding` | Findings and cases are never persisted. `prepareRemediation` requires a stored case AND a stored finding (`finding:{tenant}:{id}`) — nothing writes either → always `NOT_FOUND`. The only mutating agent action can never succeed. | Code path audit: `caseRepo.put` and `kvs.set('finding:…')` have zero production callers. | **FIXED** (persist findings + case on analysis; contract test) |
| CC-003 | High | `src/audit/auditLog.ts`; `src/storage/auditStore.ts`; `src/rovo/actions.ts` `auditSink` | Audit event id = `existing.length + 1` → collisions under concurrent appends; `readAll` relies on unsorted KVS query order → digest chain can break or validate wrongly. Two divergent append implementations. | Read of both implementations. | **FIXED** (unique ids, deterministic sort, single chain logic) |
| CC-004 | High | `src/resolvers/index.ts` `health` | Health hardcodes `jira: 'available'` without any probe — a fabricated measurement surfaced in UI and Integrations view. | Read of resolver. | **FIXED** (real `/rest/api/3/myself` probe, mapped states) |
| CC-005 | Medium | `src/core/contradiction.ts` `analyze()` | `newestEvidenceAgeDays: 0` hardcoded → recency weight always 1.0; severity inflated regardless of evidence age. | Read of `analyze`. | **FIXED** (age computed from evidence `sourceUpdatedAt`) |
| CC-006 | Medium | `src/integrations/jira.ts` `mapIssue` issuelinks | Non-Blocks link types (Relates, Duplicate, …) all mapped to invented `'dependsOn'`; inward links inherit outward type. Feeds `getImpact` verified edges with wrong semantics. | Read of `mapIssue`. | **FIXED** (direction from inward/outward; non-Blocks → `'related'`, Blocks → `'blocks'`) |
| CC-007 | Low | `src/rovo/actions.ts` `tenantContext` | Dead typo field `accountIdId`. | Read. | **FIXED** |
| CC-008 | Low | `src/rovo/actions.ts` `prepareRemediation` | `requestFingerprint = digest(payloadDigest)` — digest of a digest, no added tamper value. | Read. | **FIXED** (fingerprint over payload + actor + timestamp) |
| CC-009 | Medium (docs) | `README.md` | Status table says Teamwork Graph / Rovo / MCP "NOT STARTED" — all implemented (unverified live). Misleads contributors. | Diff vs manifest + code. | **FIXED** |
| CC-010 | Medium (product) | `src/frontend/views/Cases.tsx`, `Static.tsx`, `App.tsx` | Case rows not clickable; CaseDetail unreachable stub; review badge count hardcoded (0 / sandbox 1) — workflow dead-ends after a case exists. | Read. | **FIXED** (clickable rows → real case detail; badge from case data) |
| CC-011 | Low | `src/frontend/App.tsx` | `listCases`/`listAuditEvents` failures show raw error strings to users. | Read. | Deferred (cosmetic; states already distinguishable) |
| CC-012 | Low | `src/rovo/actions.ts` | Duplicate audit append logic vs `KvsAuditRepository`. | Read. | **FIXED** (actions now use `KvsAuditRepository`) |

## Session 2026-10-31 — review-queue & dynamics audit

| ID | Severity | Location | Finding | Evidence | Status |
|---|---|---|---|---|---|
| CC-013 | **Critical (product)** | `src/frontend/views/ReviewQueue.tsx`; resolvers | The Review queue was a static placeholder: proposals were written by the Rovo `prepare-remediation` action but no `listProposals`/`decide`/`execute` path existed anywhere (UI or actions). The approval state machine's binding-creation half was unreachable — the product's core promise (human-approved remediation) could not happen. | Path audit: `proposal:{tenant}:{id}` written by rovo `putProposal`; zero readers. ReviewQueue rendered fixed JSX. | **FIXED** — `KvsProposalRepository`, `prepareProposal`/`listProposals`/`decideProposal`/`executeProposal` resolvers, `core/execution.ts` (decide + execute with injected fetcher, replay registry), dynamic Review queue UI. TEST-VERIFIED (17 new tests). |
| CC-014 | High (security consistency) | `src/rovo/actions.ts` `getEvidence` | The Rovo get-evidence action returned raw, unsanitized description/comment text — divergent from the analysis path which sanitizes. Same source content took two different paths into agent output. | Diff of the two evidence builders. | **FIXED** — single shared `src/integrations/evidence.ts` used by both; injection flags surfaced to the agent as an explicit warning. |
| CC-015 | Medium (observability) | `src/resolvers/index.ts` `investigateIssueCore` | Analysis runs recorded no audit events; the live audit ledger would contain only remediation proposals. The Audit ledger view looked broken-by-design rather than reflecting activity. | Read of pipeline; only rovo `prepareRemediation` called `recordAuditEvent`. | **FIXED** — `analysis_run` audit events on success and failure, chained into the tenant ledger. TEST-VERIFIED (review-queue integration test). |
| CC-016 | Medium (product) | `src/frontend/App.tsx` | Review badge counted *cases*, not pending proposals; in sandbox it was hardcoded `1`. | Read. | **FIXED** — badge = real `PENDING_APPROVAL` count via `listProposals`, refreshed on view change. |
| CC-017 | Low (taste) | `src/frontend/views/Static.tsx` | File named "Static" contained the (dynamic) CaseDetail view — misleading name inviting exactly the wrong conclusion. | Read. | **FIXED** — renamed `CaseDetail.tsx`. |
| CC-018 | Medium (honesty) | `src/frontend/sandbox/mockData.ts` | Sandbox mode displayed hardcoded `MOCK_ANALYSIS`/`MOCK_CASES`/`MOCK_AUDIT_EVENTS` with 1970 timestamps — labeled demo, but nothing was computed. | Read. | **FIXED** — `mockData.ts` deleted; `sandbox/sandboxEngine.ts` runs the REAL engine in-browser (analyze/normalize/draft/decide/execute/audit chain) over deterministic per-key fixtures with in-memory stores and a scripted Jira transport. TEST-VERIFIED (sandbox-engine integration test: full loop + chain verify + replay rejection). |
| CC-019 | Low (hygiene) | `src/integrations/adf.ts`; `tests/unit/audit-determinism.test.ts` | Dead `BLOCK_TYPES` set (TS6133) and an implicit-`any` (TS7006) broke `tsc --noEmit` — CI's first gate was red at HEAD. | Actual tsc output. | **FIXED** — both errors resolved; typecheck clean. |
| CC-020 | Medium (consistency) | `src/rovo/actions.ts` `putProposal`/`getProposal` | Proposals stored wrapped as `{proposal:…}` by hand-rolled functions with no payload-tenant re-check, divergent from every other store's scheme. | Read. | **FIXED** — unified `KvsProposalRepository` (same key scheme, payload tenant re-check, list pagination). |
| CC-021 | High (reliability, found by flaky test) | `src/audit/auditLog.ts` | Audit ids tied same-millisecond events to a random uuid tiebreak, so chain-build order and chain-verify order could differ → `verifyAuditChain` intermittently false. Same CC-003 hazard class, reintroduced by the collision-free id change. | 5× repeated suite runs caught it; root cause = sort key vs insertion order. | **FIXED** — id now carries an insertion sequence (`…_{time}_{seq}_{uuid}`), making (timestamp, id) sort match insertion order; regression test added (same-ms chaining). |

## Mission 2026-10-31 — hackathon expansion audit

| ID | Severity | Location | Finding | Evidence | Status |
|---|---|---|---|---|---|
| CC-022 | **High (correctness/honesty)** | `src/core/execution.ts` (prior) | Execution treated an accepted API response as the end of the story: no read-back of the resulting state, so a failed/unapplied write could be recorded as EXECUTED with no way to notice. | Path audit: no verification module existed; `RemediationProposal` had no verification state. | **FIXED** — `src/core/verification.ts` (VERIFIED / MISMATCH / UNVERIFIED, trace markers embedded in every write), resolver + sandbox wiring, `proposal_verified` audit events, 9 unit tests, demo Scenario E. |
| CC-023 | Medium (product/§4-D) | `KvsProposalRepository.list()` (prior) | Queue order was newest-first with no stated objective — an arbitrary order presented to reviewers. | Read of the sort. | **FIXED** — documented review-utility ordering (`src/core/queue.ts`, `docs/QUEUE_DESIGN.md`) with per-item explanations and 9 invariant/property tests. |

### Remaining open items (accepted, with reasons)

- **Teamwork Graph wiring** — adapter implemented + fixture-tested but no resolver/action calls it; graph scopes are not in the manifest. Wiring without a dev site to verify the `requestTeamworkGraph` transport would produce unverifiable live claims. BLOCKED — EXTERNAL ACTION REQUIRED (deploy + grant `read:graph:*` scopes, then wire `getImpact` enrichment).
- **health resolver labels** — `rovoAgent`/`mcp` report `not-wired` although the manifest wires both; a resolver cannot self-probe its own agent registration. Label change planned with the first live deployment (needs a real probe target).
- **create_remediation_issue execution assumption** — derived project key + `Task` issue type; sites without a `Task` type in that project yield `EXECUTION_FAILED` (explicit, audited) rather than silent success. Acceptable; documented in `docs/AGENT_VERIFICATION_MATRIX.md`.
- **Supersession/DecisionRecord pipeline** — still unreachable in production (no DecisionRecord source). Unchanged from previous audit.

## Deliberate non-changes

- Deterministic normalizer stays pattern-based (no LLM in the verify path) — correct design, kept.
- Approval execution intentionally not exposed as an agent tool — kept.
- Benchmarks: existing measured baseline kept; framework expansion requires approval (see `docs/BENCHMARK_PROPOSAL.md`).
