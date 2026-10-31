# Mistral Vibe Handoff — ContextCourt AI

Durable project handoff for cross-context continuation. Read this + `git
status` + `git log -3` before continuing after any context reset.

## Objective
Take ContextCourt AI (Atlassian Forge, Jira) to a hackathon-ready,
evidence-driven, human-governed remediation platform. Core identity:
**Evidence → Reasoning → Proposal → Human Judgment → Authorized Execution →
Independent Verification → Audit.** Never fabricate, never weaken governance
for demos, never present simulated as live.

## Repository state (end of mission, 2026-10-31)
- Path: `C:\Users\Administrator\Downloads\context Court - atlassian`
- Branch `main`; mission-start commit `d3acfca` (verified clean tree); mission
  work committed on top (see `git log`). **NOT pushed — push requires explicit
  user authorization.** Remote `contextcourt` → `uhuhyogiyfitufyktyhvfukyku/Context-Court-AI`
  (note: differs from the `updatingmyhim` URL in some briefs).
- Verification: `tsc` clean · `eslint` clean · `prettier` clean ·
  **137/137 tests, 20 files** · `vite build` ok · benchmark replay exact
  (P=0.800 R=0.571 F1=0.667) · `npm run demo` 6/6 ·
  `npm run validate:registers` PASS (468 FR + 459 ET).

## Architecture decisions that must not be reversed
1. Deterministic engine only — no LLM in the verify path.
2. Agents cannot approve/execute — structural (no tool), not prompt-based.
3. Approval = binding (approver≠actor, digest, expiry); execution =
   approver-only, replay-proof via executed-digest registry.
4. Execution success ≠ verification success (`src/core/verification.ts`:
   VERIFIED / MISMATCH / UNVERIFIED; trace markers in every write).
5. Queue order = documented utility (`src/core/queue.ts`, `docs/QUEUE_DESIGN.md`):
   severity×100 + risk(40/20/0) + age(capped 90), pending-first, id tiebreak.
6. Audit chain: insertion-monotonic ids (`time_seq_uuid`), digest-chained,
   `verifyAuditChain` on demand. (Same-ms ordering bug fixed + regression test.)
7. One shared sanitized evidence builder (`src/integrations/evidence.ts`).
8. Sandbox = real core in-browser over deterministic per-key fixtures
   (char-sum % 3: PAY-142 → contradiction), scripted Jira transport recorded,
   never sent.
9. Registers generated from `scripts/register-data/*.mjs` (single source of
   truth) → `docs/registers/*.json` + 3 markdown docs; validated by
   `scripts/validate-registers.mjs`. Never hand-edit generated docs.

## Registers
468 features (A60/B55/C55/D50/E50/F50/G45/H35/I35/J33) + 459 tasks
(WS 45/55/50/45/45/50/50/40/45/34). All 50 IMPLEMENT-disposition features are
covered by tasks; ~24 slice tasks TEST_VERIFIED/IMPLEMENTED this mission;
remaining statuses honest (NOT_STARTED / DEFERRED with reason / BLOCKED with
external dependency). Re-run `npm run build:registers` after editing data.

## External blockers (do not simulate these)
- Forge deploy/install (needs `forge login` credentials) → then: live health
  probe, live ADF shapes, approve+execute one real proposal, Rovo tool call.
- Teamwork Graph wiring (needs graph scopes + dev site).
- Marketplace listing (partner account).
- Push to remote (needs user authorization).

## Key files
`src/core/{verification,queue,execution,approval,remediation,contradiction,normalizer,severity,impact,digest,types}.ts` ·
`src/integrations/{jira,adf,evidence,teamworkGraph}.ts` ·
`src/storage/{caseStore,auditStore,proposalStore}.ts` ·
`src/resolvers/index.ts` · `src/rovo/actions.ts` ·
`src/frontend/sandbox/sandboxEngine.ts` ·
`scripts/demo-scenarios.ts` · `scripts/register-data/` ·
`scripts/{author-registers,validate-registers}.mjs` ·
`tests/unit/{verification,queue-ordering,execution,approval,...}.test.ts` ·
`tests/integration/{review-queue,sandbox-engine,persistence,teamwork-graph}.test.ts` ·
`tests/helpers/fakeKvs.ts`.

## Dynamics pass (2026-10-31, post-mission commit)
Cancel/revocation (actor withdraws pending; approver revokes approved;
terminal irreversible), rejection rationale (stored+rendered), case lifecycle
timeline (getCaseTimeline resolver + CaseDetail card + sandbox), live expiry
countdown, execution confirmation, case search/sort/pagination, at-a-glance
real-counts panel. Registers updated (11 FR DEFER→EXISTING, 11 ET
NOT_STARTED→TEST_VERIFIED) and re-validated. All 116/116 green.

## Reliability/security pass (2026-10-31)
ADR-008 retry-idempotency guard; ADR-007 concurrent-decision handling
(decideProposalCore, sequential conflicts fail safely, last-writer-wins
residual documented); finding validation on every read
(core/findingValidation.ts); injection-governance security tests; dependency
audit remediated (zod 4.6.7, @forge latest, @forge/bridge 5.5.0, vite 8,
vitest 5, vite-node devDep) → 0 critical/0 high/17 moderate; CI gates audit
+ registers; docs/ARCHITECTURE_DECISIONS.md + docs/EXECUTION_STATE.md.
137/137 tests green after all upgrades.

## Closure pass (2026-10-31, final)
UF-001 fixed (CC-025 had silently applied only to the rovo path — resolver
read paths now gated by isValidFinding); timeouts + circuit breaker +
jittered backoff (core/reliability.ts, CC-027); KVS token-bucket rate
limiting on analyze/prepare/decide (core/rateLimit.ts, CC-028); closure docs
generated (FEATURE_CLOSURE_MATRIX, ENGINEERING_COMPLETION_REPORT,
UNFINISHED_FEATURE_AUDIT, FIXTURE_AND_MOCK_ELIMINATION,
EXTERNAL_INTEGRATION_CREDENTIAL_MATRIX, LOCAL_DEVELOPMENT,
ENVIRONMENT_CONFIGURATION, DEPLOYMENT_READINESS, EXTERNAL_INTEGRATION_SETUP,
PRODUCTION_READINESS, FINAL_FEATURE_COMPLETION_REPORT). All 49 IMPLEMENT
dispositions flipped to EXISTING after verification. Final counts: 347/468
features operational, 356/459 tasks verified; 152/152 tests, 22 files.

## Outstanding (highest value next)
1. External: dev-site deploy → verify live paths → flip `health` labels for
   rovo/mcp → wire Teamwork Graph enrichment.
2. npm audit gate (ET-303), license audit (ET-043), ADR index (ET-045).
3. Benchmark category B items — only after live deployment (BLOCKED).

## Commands
`npm test` · `npm run demo` · `npm run build:registers` ·
`npm run validate:registers` · `npm run typecheck` · `npm run lint` ·
`npm run build` · benchmark: `npx vite-node benchmarks/evaluate.ts benchmarks/dataset.json`.
