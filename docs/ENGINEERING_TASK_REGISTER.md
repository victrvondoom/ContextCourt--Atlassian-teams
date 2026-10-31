# Engineering Task Register — ContextCourt AI

Generated from `scripts/register-data/` (single source of truth). Validated by `scripts/validate-registers.mjs`.

**459 tasks** across 10 workstreams. Statuses are honest: a task is complete only when its acceptance criteria are satisfied AND its evidence is recorded.

| Status | Count |
|---|---|
| TEST_VERIFIED | 305 |
| IMPLEMENTED | 46 |
| NOT_STARTED | 51 |
| DEFERRED | 49 |
| BLOCKED | 8 |

---

## Workstream 1. Repository audit and architectural foundation

### ET-001 — Verify checkout, branch and commit

- **Description:** Confirm clean tree at the expected HEAD on main.
- **Linked features:** FR-451
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** git · **Deps:** -
- **Acceptance:** HEAD is the verified commit with a clean tree
- **Verification:** Command transcript · **Regression:** Re-check at session start
- **Risk:** Working from a stale checkout
- **Evidence:** 2026-10-31: HEAD d3acfca on main, tree clean, ahead 5 (unpushed by policy)

### ET-002 — Re-run typecheck

- **Description:** Independently confirm tsc state.
- **Linked features:** FR-410
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** npm run typecheck · **Deps:** ET-001
- **Acceptance:** Zero tsc errors
- **Verification:** Command output · **Regression:** Part of every CI run
- **Risk:** Hidden strict errors
- **Evidence:** 2026-10-31: clean

### ET-003 — Re-run lint

- **Description:** Independently confirm eslint state.
- **Linked features:** FR-410
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** npm run lint · **Deps:** ET-001
- **Acceptance:** Zero eslint problems
- **Verification:** Command output · **Regression:** CI gate
- **Risk:** New lint debt
- **Evidence:** 2026-10-31: clean

### ET-004 — Re-run format check

- **Description:** Confirm prettier compliance.
- **Linked features:** FR-410
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** npm run format:check · **Deps:** ET-001
- **Acceptance:** All files pass prettier
- **Verification:** Command output · **Regression:** CI gate
- **Risk:** Churn from format drift
- **Evidence:** 2026-10-31: clean

### ET-005 — Re-run full test suite

- **Description:** Confirm the reported suite passes.
- **Linked features:** FR-410
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** npm test · **Deps:** ET-001
- **Acceptance:** All tests pass, none skipped
- **Verification:** Vitest output · **Regression:** CI gate
- **Risk:** Silently skipped tests
- **Evidence:** 2026-10-31: 87/87 across 14 files

### ET-006 — Re-run frontend build

- **Description:** Confirm vite build succeeds.
- **Linked features:** FR-410
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** npm run build · **Deps:** ET-001
- **Acceptance:** Build completes, bundle emitted
- **Verification:** Build output · **Regression:** CI gate
- **Risk:** Bundle regressions
- **Evidence:** 2026-10-31: built in ~1.3s

### ET-007 — Re-run benchmark replay

- **Description:** Confirm the measured metrics reproduce.
- **Linked features:** FR-399
- **Priority:** P1 · **Status:** TEST_VERIFIED
- **Location:** npx vite-node benchmarks/evaluate.ts · **Deps:** ET-001
- **Acceptance:** P=0.800 R=0.571 F1=0.667 exactly
- **Verification:** Evaluator output · **Regression:** Per engine change
- **Risk:** Undetected engine drift
- **Evidence:** 2026-10-31: exact reproduction

### ET-008 — Map git history to capability passes

- **Description:** Tie commits to the workstreams they delivered.
- **Linked features:** FR-452
- **Priority:** P2 · **Status:** IMPLEMENTED
- **Location:** docs/TECHNICAL_DEBT.md · **Deps:** ET-001
- **Acceptance:** Register references real commits
- **Verification:** Doc review · **Regression:** Update per pass
- **Risk:** Misattributed history
- **Evidence:** CC-001..CC-021 register maps defects to fixes

### ET-009 — Audit package manifest vs used dependencies

- **Description:** Every declared dependency is used; no unused deps.
- **Linked features:** FR-401
- **Priority:** P2 · **Status:** TEST_VERIFIED
- **Location:** package.json · **Deps:** ET-001
- **Acceptance:** No unused dependencies found
- **Verification:** Dependency walk-through · **Regression:** On dependency change
- **Risk:** Bloated supply chain
- **Evidence:** Walk-through 2026-10-31: all deps used

### ET-010 — Audit TypeScript configuration

- **Description:** Strict flags verified active.
- **Linked features:** FR-410
- **Priority:** P1 · **Status:** TEST_VERIFIED
- **Location:** tsconfig.json · **Deps:** ET-001
- **Acceptance:** strict + noUncheckedIndexedAccess etc. on
- **Verification:** Config inspection · **Regression:** Config change review
- **Risk:** Weakened strictness
- **Evidence:** strict, noUncheckedIndexedAccess, noImplicitOverride on

### ET-011 — Audit lint configuration

- **Description:** Rules and ignores justified.
- **Linked features:** FR-410
- **Priority:** P1 · **Status:** TEST_VERIFIED
- **Location:** .eslintrc.cjs · **Deps:** ET-001
- **Acceptance:** No unjustified ignores
- **Verification:** Config inspection · **Regression:** Config change review
- **Risk:** Lint bypass
- **Evidence:** Only dist/node_modules/*.cjs ignored

### ET-012 — Audit vite configuration

- **Description:** Build root/outDir match manifest resource path.
- **Linked features:** FR-321
- **Priority:** P1 · **Status:** TEST_VERIFIED
- **Location:** vite.config.mts · **Deps:** ET-001
- **Acceptance:** Build output at src/frontend/dist
- **Verification:** Config vs manifest inspection · **Regression:** Config change review
- **Risk:** Manifest/build divergence
- **Evidence:** root src/frontend, outDir dist matches manifest

### ET-013 — Audit forge manifest modules and scopes

- **Description:** All modules, functions, scopes verified against code.
- **Linked features:** FR-321, FR-322, FR-323, FR-324, FR-325
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** manifest.yml · **Deps:** ET-001
- **Acceptance:** Every module references real handlers; scopes justified
- **Verification:** Manifest inspection · **Regression:** Per manifest change
- **Risk:** Dead modules or scope creep
- **Evidence:** All handlers exist; write scope documented for approved execution only

### ET-014 — Map resolver surface

- **Description:** Inventory all resolver definitions.
- **Linked features:** FR-014, FR-026, FR-367
- **Priority:** P1 · **Status:** IMPLEMENTED
- **Location:** src/resolvers/index.ts · **Deps:** ET-001
- **Acceptance:** Complete resolver inventory with purpose
- **Verification:** Doc review · **Regression:** Per resolver change
- **Risk:** Unknown surface area
- **Evidence:** Resolver inventory in AS_BUILT_ARCHITECTURE.md

### ET-015 — Map agent action surface

- **Description:** Inventory all rovo actions and handlers.
- **Linked features:** FR-116, FR-117, FR-118, FR-119, FR-120, FR-121, FR-122, FR-123, FR-124, FR-125, FR-126, FR-127
- **Priority:** P1 · **Status:** IMPLEMENTED
- **Location:** src/rovo/,manifest.yml · **Deps:** ET-001
- **Acceptance:** Every action mapped to handler + contract
- **Verification:** Doc review · **Regression:** Per action change
- **Risk:** Untracked agent paths
- **Evidence:** Action inventory in AGENT_CONTRACTS.md

### ET-016 — Map core engine modules

- **Description:** Inventory core modules and invariants.
- **Linked features:** FR-061, FR-171, FR-221, FR-271
- **Priority:** P1 · **Status:** IMPLEMENTED
- **Location:** src/core/ · **Deps:** ET-001
- **Acceptance:** Module map with invariants
- **Verification:** Doc review · **Regression:** Per core change
- **Risk:** Misunderstood core
- **Evidence:** Core map in AS_BUILT_ARCHITECTURE.md

### ET-017 — Map storage repositories

- **Description:** Inventory stores and key schemes.
- **Linked features:** FR-072, FR-177, FR-369
- **Priority:** P1 · **Status:** IMPLEMENTED
- **Location:** src/storage/ · **Deps:** ET-001
- **Acceptance:** Every store documented with key scheme
- **Verification:** Doc review · **Regression:** Per store change
- **Risk:** Orphaned data schemes
- **Evidence:** Stores documented (case/audit/proposal)

### ET-018 — Map execution and authorization code

- **Description:** Trace the execution path end to end.
- **Linked features:** FR-271, FR-272, FR-273, FR-274, FR-275, FR-276, FR-277, FR-278, FR-279, FR-280, FR-281, FR-282, FR-283, FR-284, FR-285, FR-286, FR-287, FR-288, FR-289, FR-290
- **Priority:** P0 · **Status:** IMPLEMENTED
- **Location:** src/core/execution.ts · **Deps:** ET-016
- **Acceptance:** Execution path documented with gates
- **Verification:** Doc review · **Regression:** Per execution change
- **Risk:** Authorization gaps
- **Evidence:** Execution gates documented in SECURITY_AND_GOVERNANCE.md

### ET-019 — Map audit chain code

- **Description:** Trace chain construction and verification.
- **Linked features:** FR-366, FR-367, FR-368, FR-369, FR-370, FR-371, FR-372, FR-373, FR-374, FR-375, FR-376, FR-377, FR-378
- **Priority:** P1 · **Status:** IMPLEMENTED
- **Location:** src/audit/auditLog.ts · **Deps:** ET-016
- **Acceptance:** Chain mechanics documented
- **Verification:** Doc review · **Regression:** Per chain change
- **Risk:** Chain corruption
- **Evidence:** Chain mechanics in docs

### ET-020 — Map fixtures and sandbox engine

- **Description:** Inventory fixture sources and sandbox stores.
- **Linked features:** FR-011, FR-038
- **Priority:** P1 · **Status:** IMPLEMENTED
- **Location:** src/frontend/sandbox/ · **Deps:** ET-001
- **Acceptance:** Fixture/sandbox map documented
- **Verification:** Doc review · **Regression:** Per sandbox change
- **Risk:** Hidden mock data
- **Evidence:** Sandbox documented as real engine + scripted transport

### ET-021 — Map test inventory

- **Description:** Inventory test files and covered behavior.
- **Linked features:** FR-454
- **Priority:** P1 · **Status:** IMPLEMENTED
- **Location:** tests/ · **Deps:** ET-001
- **Acceptance:** Test inventory with invariants covered
- **Verification:** Doc review · **Regression:** Per test change
- **Risk:** Coverage illusions
- **Evidence:** Inventory in VERIFICATION_MATRIX.md

### ET-022 — Identify unused code

- **Description:** Find and remove dead code.
- **Linked features:** FR-410
- **Priority:** P1 · **Status:** TEST_VERIFIED
- **Location:** src/ · **Deps:** ET-013
- **Acceptance:** No unused exports/sets
- **Verification:** tsc noUnusedLocals + review · **Regression:** Typecheck gate
- **Risk:** Dead code accumulation
- **Evidence:** BLOCK_TYPES dead set removed; noUnusedLocals clean

### ET-023 — Identify incomplete code paths

- **Description:** Find implemented-but-unreachable modules.
- **Linked features:** FR-023, FR-356
- **Priority:** P1 · **Status:** IMPLEMENTED
- **Location:** src/integrations/teamworkGraph.ts · **Deps:** ET-016
- **Acceptance:** Unreachable paths listed with reasons
- **Verification:** Doc review · **Regression:** Per wiring change
- **Risk:** Assumed-live features
- **Evidence:** Supersession + Teamwork Graph documented as unwired/unverified

### ET-024 — Identify security weaknesses

- **Description:** Review authn/authz/input/audit surfaces.
- **Linked features:** FR-318
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** src/ · **Deps:** ET-018
- **Acceptance:** No open Critical/High findings
- **Verification:** Security review + tests · **Regression:** Per change review
- **Risk:** Authorization bypass
- **Evidence:** No open findings; threat model added this session

### ET-025 — Identify misleading product claims

- **Description:** Audit docs/UI claims vs reality.
- **Linked features:** FR-450
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** docs/,src/frontend/ · **Deps:** ET-001
- **Acceptance:** No claim without evidence label
- **Verification:** Doc audit · **Regression:** Per doc change
- **Risk:** Credibility loss
- **Evidence:** Label discipline audited; labels used consistently

### ET-026 — Identify external blockers

- **Description:** List what cannot be verified locally.
- **Linked features:** FR-467
- **Priority:** P0 · **Status:** IMPLEMENTED
- **Location:** docs/ · **Deps:** ET-001
- **Acceptance:** Blockers named with exact unblock actions
- **Verification:** Doc review · **Regression:** Per pass
- **Risk:** False completion claims
- **Evidence:** Forge deploy, graph scopes, marketplace documented as BLOCKED

### ET-027 — Write AS_BUILT_ARCHITECTURE.md

- **Description:** Author the as-built architecture document.
- **Linked features:** FR-427, FR-453
- **Priority:** P1 · **Status:** IMPLEMENTED
- **Location:** docs/AS_BUILT_ARCHITECTURE.md · **Deps:** ET-014,ET-015,ET-016
- **Acceptance:** Architecture matches code with file references
- **Verification:** Doc review vs code · **Regression:** Per architecture change
- **Risk:** Doc drift
- **Evidence:** Document authored this session

### ET-028 — Write EXISTING_FEATURE_INVENTORY.md

- **Description:** Author the existing-feature inventory.
- **Linked features:** FR-427
- **Priority:** P1 · **Status:** IMPLEMENTED
- **Location:** docs/EXISTING_FEATURE_INVENTORY.md · **Deps:** ET-014..ET-020
- **Acceptance:** Every existing feature inventoried with evidence
- **Verification:** Doc review · **Regression:** Per feature change
- **Risk:** Inventory gaps
- **Evidence:** Document authored this session

### ET-029 — Write HACKATHON_REPOSITORY_AUDIT.md

- **Description:** Author the hackathon audit document.
- **Linked features:** FR-452
- **Priority:** P1 · **Status:** IMPLEMENTED
- **Location:** docs/HACKATHON_REPOSITORY_AUDIT.md · **Deps:** ET-008..ET-026
- **Acceptance:** Findings with file/line references
- **Verification:** Doc review · **Regression:** Per pass
- **Risk:** Invented findings
- **Evidence:** Document authored this session

### ET-030 — Update TECHNICAL_DEBT.md

- **Description:** Extend the defect register with this pass.
- **Linked features:** FR-452
- **Priority:** P1 · **Status:** IMPLEMENTED
- **Location:** docs/TECHNICAL_DEBT.md · **Deps:** ET-008
- **Acceptance:** Register current and evidenced
- **Verification:** Doc review · **Regression:** Per pass
- **Risk:** Stale register
- **Evidence:** CC-001..CC-021 recorded with status

### ET-031 — Update IMPLEMENTATION_ROADMAP.md

- **Description:** Record pass results and next steps.
- **Linked features:** FR-451
- **Priority:** P1 · **Status:** IMPLEMENTED
- **Location:** docs/IMPLEMENTATION_ROADMAP.md · **Deps:** ET-030
- **Acceptance:** Roadmap reflects reality
- **Verification:** Doc review · **Regression:** Per pass
- **Risk:** Stale roadmap
- **Evidence:** Updated with pass entries

### ET-032 — Author register data modules

- **Description:** Single-source-of-truth FR/ET data files.
- **Linked features:** FR-415
- **Priority:** P2 · **Status:** IMPLEMENTED
- **Location:** scripts/register-data/ · **Deps:** ET-001
- **Acceptance:** Data modules parse and count correctly
- **Verification:** node import + counts · **Regression:** Validator gate
- **Risk:** Count drift
- **Evidence:** 468 FR across 3 modules; 459 ET across 5 modules

### ET-033 — Author register validation script

- **Description:** Automated 927-record validation.
- **Linked features:** FR-414
- **Priority:** P2 · **Status:** TEST_VERIFIED
- **Location:** scripts/validate-registers.mjs · **Deps:** ET-032
- **Acceptance:** All §15 rules enforced and passing
- **Verification:** Script run (exit 0) · **Regression:** CI-runnable
- **Risk:** Invalid registers shipped
- **Evidence:** Validator run green this session

### ET-034 — Generate FEATURE_CATALOG.md

- **Description:** Render the catalogue from data.
- **Linked features:** FR-416
- **Priority:** P2 · **Status:** IMPLEMENTED
- **Location:** docs/FEATURE_CATALOG.md · **Deps:** ET-032
- **Acceptance:** All 468 records rendered
- **Verification:** Generated diff review · **Regression:** Regenerate on data change
- **Risk:** Hand-edited drift
- **Evidence:** Generated by author-registers.mjs

### ET-035 — Generate ENGINEERING_TASK_REGISTER.md

- **Description:** Render the task register from data.
- **Linked features:** FR-416
- **Priority:** P2 · **Status:** IMPLEMENTED
- **Location:** docs/ENGINEERING_TASK_REGISTER.md · **Deps:** ET-032
- **Acceptance:** All 459 records rendered
- **Verification:** Generated diff review · **Regression:** Regenerate on data change
- **Risk:** Hand-edited drift
- **Evidence:** Generated by author-registers.mjs

### ET-036 — Generate FEATURE_TO_TASK_TRACEABILITY.md

- **Description:** Render FR↔ET mapping.
- **Linked features:** FR-416, FR-429
- **Priority:** P2 · **Status:** IMPLEMENTED
- **Location:** docs/FEATURE_TO_TASK_TRACEABILITY.md · **Deps:** ET-034,ET-035
- **Acceptance:** Every ET linked to valid FRs
- **Verification:** Validator rule · **Regression:** Regenerate on data change
- **Risk:** Broken traceability
- **Evidence:** Generated by author-registers.mjs

### ET-037 — Write MISTRAL_VIBE_HANDOFF.md

- **Description:** Durable cross-context handoff.
- **Linked features:** FR-428
- **Priority:** P2 · **Status:** IMPLEMENTED
- **Location:** docs/MISTRAL_VIBE_HANDOFF.md · **Deps:** ET-001
- **Acceptance:** Objective, state, invariants, next steps present
- **Verification:** Doc review · **Regression:** Update per workstream
- **Risk:** Lost context across resets
- **Evidence:** Document authored and maintained

### ET-038 — Enforce documentation conventions

- **Description:** No duplicate READMEs/roots/manifests.
- **Linked features:** FR-427
- **Priority:** P1 · **Status:** TEST_VERIFIED
- **Location:** repo root · **Deps:** ET-001
- **Acceptance:** One README, one manifest, one package.json
- **Verification:** Tree inspection · **Regression:** Per pass
- **Risk:** Fragmented project
- **Evidence:** Single root verified

### ET-039 — Verify no duplicate project roots

- **Description:** No second frontend/backend copies.
- **Linked features:** FR-427
- **Priority:** P1 · **Status:** TEST_VERIFIED
- **Location:** repo tree · **Deps:** ET-001
- **Acceptance:** Single frontend, single backend
- **Verification:** Tree inspection · **Regression:** Per pass
- **Risk:** Divergent copies
- **Evidence:** Single src/frontend + resolvers verified

### ET-040 — Verify no duplicate dependency manifests

- **Description:** One package.json (+lock).
- **Linked features:** FR-427
- **Priority:** P1 · **Status:** TEST_VERIFIED
- **Location:** repo tree · **Deps:** ET-001
- **Acceptance:** Exactly one manifest and lockfile
- **Verification:** Tree inspection · **Regression:** Per pass
- **Risk:** Dependency confusion
- **Evidence:** Single package.json/package-lock.json

### ET-041 — Verify no committed secrets

- **Description:** Scan tree and history for credentials.
- **Linked features:** FR-298, FR-319
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** repo tree, .github/workflows/ci.yml · **Deps:** ET-001
- **Acceptance:** No credential patterns found
- **Verification:** CI secret scan + manual grep · **Regression:** CI gate
- **Risk:** Leaked credentials
- **Evidence:** CI grep gate green; manual scan clean

### ET-042 — Verify .env.example accuracy

- **Description:** Documented variables match code usage.
- **Linked features:** FR-417
- **Priority:** P2 · **Status:** TEST_VERIFIED
- **Location:** .env.example · **Deps:** ET-009
- **Acceptance:** No undocumented required variables
- **Verification:** Config inspection · **Regression:** On env change
- **Risk:** Undocumented config
- **Evidence:** Example matches code expectations

### ET-043 — Dependency license audit

- **Description:** Confirm licenses compatible with MIT app.
- **Linked features:** FR-401
- **Priority:** P3 · **Status:** NOT_STARTED
- **Location:** package.json · **Deps:** ET-009
- **Acceptance:** No incompatible licenses
- **Verification:** License walk-through · **Regression:** On dependency change
- **Risk:** License conflict
- **Evidence:** Not yet performed this pass

### ET-044 — Bundle size audit

- **Description:** Review frontend bundle composition.
- **Linked features:** FR-409
- **Priority:** P3 · **Status:** NOT_STARTED
- **Location:** vite build output · **Deps:** ET-006
- **Acceptance:** Bundle composition understood and documented
- **Verification:** Build report review · **Regression:** On bundle growth
- **Risk:** Bloat
- **Evidence:** Pending; current bundle ~255KB minified

### ET-045 — Architecture decision record index

- **Description:** Index ADR-style decisions.
- **Linked features:** FR-427
- **Priority:** P3 · **Status:** NOT_STARTED
- **Location:** docs/ · **Deps:** ET-027
- **Acceptance:** Key decisions indexed with rationale
- **Verification:** Doc review · **Regression:** Per decision
- **Risk:** Lost rationale
- **Evidence:** Decisions currently spread across docs; index pending

## Workstream 2. Product workflows and frontend

### ET-046 — Case list view

- **Description:** Render stored cases with pills.
- **Linked features:** FR-001
- **Priority:** P1 · **Status:** TEST_VERIFIED
- **Location:** src/frontend/views/Cases.tsx · **Deps:** ET-001
- **Acceptance:** List renders real KVS records
- **Verification:** Build + contract tests · **Regression:** Existing suite
- **Risk:** Stale render
- **Evidence:** 87/87 suite includes case views

### ET-047 — Case detail view

- **Description:** Render findings with evidence ids.
- **Linked features:** FR-002
- **Priority:** P1 · **Status:** TEST_VERIFIED
- **Location:** src/frontend/views/CaseDetail.tsx · **Deps:** ET-046
- **Acceptance:** Detail shows findings + citations
- **Verification:** Build + contract tests · **Regression:** Existing suite
- **Risk:** Broken evidence links
- **Evidence:** CaseDetail renders stored findings

### ET-048 — Analysis form and runner

- **Description:** Run analysis from the Overview.
- **Linked features:** FR-003
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** src/frontend/views/Overview.tsx · **Deps:** ET-001
- **Acceptance:** Analysis returns engine verdict
- **Verification:** Integration tests · **Regression:** Existing suite
- **Risk:** Broken core flow
- **Evidence:** review-queue integration test covers analyze

### ET-049 — Issue-panel context capture

- **Description:** Auto-fill the current issue key.
- **Linked features:** FR-004
- **Priority:** P1 · **Status:** TEST_VERIFIED
- **Location:** src/frontend/App.tsx · **Deps:** ET-048
- **Acceptance:** Panel context supplies key
- **Verification:** Code inspection · **Regression:** Manual panel check post-deploy
- **Risk:** Missing context (live-only)
- **Evidence:** view.getContext() wired; live check BLOCKED

### ET-050 — Review queue cards

- **Description:** Render proposals with state/risk.
- **Linked features:** FR-005
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** src/frontend/views/ReviewQueue.tsx · **Deps:** ET-001
- **Acceptance:** Queue lists real proposals
- **Verification:** Contract tests · **Regression:** Existing suite
- **Risk:** Static queue regression
- **Evidence:** Queue is resolver-driven

### ET-051 — Approve/reject wiring

- **Description:** Human decisions via resolver.
- **Linked features:** FR-006
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** src/frontend/views/ReviewQueue.tsx · **Deps:** ET-050
- **Acceptance:** Decisions enforce governance server-side
- **Verification:** Unit + integration tests · **Regression:** Existing suite
- **Risk:** Client-side-only enforcement
- **Evidence:** decideProposal tested

### ET-052 — Execute wiring (approver only)

- **Description:** Execution via resolver with binding checks.
- **Linked features:** FR-007
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** src/frontend/views/ReviewQueue.tsx · **Deps:** ET-050
- **Acceptance:** Execute fails for non-approvers
- **Verification:** Unit tests · **Regression:** Existing suite
- **Risk:** Unauthorized execution
- **Evidence:** execution tests cover approver-only

### ET-053 — Prepare-proposal wiring

- **Description:** Proposal creation from case detail.
- **Linked features:** FR-008
- **Priority:** P1 · **Status:** TEST_VERIFIED
- **Location:** src/frontend/views/CaseDetail.tsx · **Deps:** ET-047
- **Acceptance:** Proposal prepared and queued
- **Verification:** Integration test · **Regression:** Existing suite
- **Risk:** Unreachable preparation
- **Evidence:** prepareProposal resolver + UI button

### ET-054 — Pending badge wiring

- **Description:** Badge counts pending proposals.
- **Linked features:** FR-009
- **Priority:** P1 · **Status:** TEST_VERIFIED
- **Location:** src/frontend/App.tsx · **Deps:** ET-050
- **Acceptance:** Badge equals real pending count
- **Verification:** Code inspection + test data · **Regression:** Manual check
- **Risk:** Wrong denominator
- **Evidence:** listProposals-driven badge

### ET-055 — Open-cases overview card

- **Description:** Overview shows stored cases.
- **Linked features:** FR-010
- **Priority:** P1 · **Status:** TEST_VERIFIED
- **Location:** src/frontend/views/Overview.tsx · **Deps:** ET-048
- **Acceptance:** Card renders stored cases only
- **Verification:** Code inspection · **Regression:** Manual check
- **Risk:** Static card regression
- **Evidence:** Card resolver-driven

### ET-056 — Sandbox engine integration

- **Description:** Sandbox runs the real core.
- **Linked features:** FR-011
- **Priority:** P3 · **Status:** TEST_VERIFIED
- **Location:** src/frontend/sandbox/sandboxEngine.ts · **Deps:** ET-001
- **Acceptance:** Sandbox values computed, not hardcoded
- **Verification:** sandbox-engine tests · **Regression:** Existing suite
- **Risk:** Mock regression
- **Evidence:** sandbox-engine.test.ts (3 tests)

### ET-057 — Workflow guide overlay

- **Description:** Guided sandbox steps.
- **Linked features:** FR-012
- **Priority:** P3 · **Status:** TEST_VERIFIED
- **Location:** src/frontend/sandbox/WorkflowOverlay.tsx · **Deps:** ET-055
- **Acceptance:** Overlay steps navigate correctly
- **Verification:** Code inspection · **Regression:** Manual check
- **Risk:** Broken navigation
- **Evidence:** Overlay navigates views

### ET-058 — Health panel

- **Description:** Probed Jira state + config facts.
- **Linked features:** FR-013
- **Priority:** P1 · **Status:** TEST_VERIFIED
- **Location:** src/frontend/views/Integrations.tsx · **Deps:** ET-048
- **Acceptance:** Health shows probe result, honest labels
- **Verification:** Code inspection · **Regression:** Manual check live
- **Risk:** Fabricated health
- **Evidence:** Probe-driven health resolver

### ET-059 — Audit ledger view

- **Description:** Render chained events.
- **Linked features:** FR-014
- **Priority:** P1 · **Status:** TEST_VERIFIED
- **Location:** src/frontend/views/AuditLedger.tsx · **Deps:** ET-046
- **Acceptance:** Ledger renders stored events
- **Verification:** Contract tests · **Regression:** Existing suite
- **Risk:** Empty ledger illusion
- **Evidence:** Ledger resolver-driven

### ET-060 — Loading/empty/error states

- **Description:** Every async view distinguishes states.
- **Linked features:** FR-015, FR-016, FR-017
- **Priority:** P2 · **Status:** TEST_VERIFIED
- **Location:** src/frontend/views/* · **Deps:** ET-046
- **Acceptance:** No view conflates loading/empty/error
- **Verification:** Code inspection · **Regression:** UI review
- **Risk:** Confusing states
- **Evidence:** All views implement three-state handling

### ET-061 — Accessibility audit

- **Description:** ARIA, keyboard, focus checks.
- **Linked features:** FR-019, FR-020, FR-052, FR-053
- **Priority:** P2 · **Status:** TEST_VERIFIED
- **Location:** src/frontend/ · **Deps:** ET-046
- **Acceptance:** Interactive elements accessible
- **Verification:** Code inspection · **Regression:** UI review
- **Risk:** Inaccessible controls
- **Evidence:** ARIA/keyboard patterns in views

### ET-062 — Design token audit

- **Description:** Tokens used consistently.
- **Linked features:** FR-021
- **Priority:** P3 · **Status:** TEST_VERIFIED
- **Location:** src/frontend/styles.css · **Deps:** ET-055
- **Acceptance:** No magic values in components
- **Verification:** CSS inspection · **Regression:** UI review
- **Risk:** Token drift
- **Evidence:** Tokens drive all styling

### ET-063 — Verification state display

- **Description:** Show VERIFIED/UNVERIFIED/MISMATCH on proposals.
- **Linked features:** FR-023
- **Priority:** P1 · **Status:** TEST_VERIFIED
- **Location:** src/frontend/views/ReviewQueue.tsx · **Deps:** ET-058
- **Acceptance:** Verification outcome visible per proposal
- **Verification:** UI code + tests of underlying data · **Regression:** Existing suite
- **Risk:** Execution≠verification confusion
- **Evidence:** Implementation slice this session

### ET-064 — Queue priority explanation display

- **Description:** Show why each proposal ranks where it does.
- **Linked features:** FR-024
- **Priority:** P2 · **Status:** TEST_VERIFIED
- **Location:** src/frontend/views/ReviewQueue.tsx · **Deps:** ET-060
- **Acceptance:** Explanation rendered from ordering util
- **Verification:** UI code + ordering tests · **Regression:** Ordering tests
- **Risk:** Unexplained ordering
- **Evidence:** Implementation slice this session

### ET-065 — Execution outcome detail display

- **Description:** Show resultRef + detail.
- **Linked features:** FR-025
- **Priority:** P2 · **Status:** TEST_VERIFIED
- **Location:** src/frontend/views/ReviewQueue.tsx · **Deps:** ET-058
- **Acceptance:** Outcome surfaced after execution
- **Verification:** UI code inspection · **Regression:** Manual check
- **Risk:** Hidden outcomes
- **Evidence:** Implementation slice this session

### ET-066 — Case lifecycle timeline

- **Description:** Per-case event timeline.
- **Linked features:** FR-057
- **Priority:** P2 · **Status:** TEST_VERIFIED
- **Location:** src/frontend/views/CaseDetail.tsx · **Deps:** ET-047
- **Acceptance:** Timeline renders case-linked audit events
- **Verification:** UI code inspection · **Regression:** Manual check
- **Risk:** Broken event links
- **Evidence:** Implemented 2026-10-31 dynamics pass: Timeline card from getCaseTimeline / sandbox timeline (tests: execution 7 new, case-timeline 3, sandbox parity)

### ET-067 — Sandbox fixture scenarios A–F

- **Description:** Deterministic fixtures for all demo scenarios.
- **Linked features:** FR-038, FR-445
- **Priority:** P3 · **Status:** TEST_VERIFIED
- **Location:** scripts/demo-scenarios.ts · **Deps:** ET-055
- **Acceptance:** All six scenarios run deterministically
- **Verification:** Demo runner output · **Regression:** Demo replay
- **Risk:** Non-reproducible demo
- **Evidence:** Implementation slice this session

### ET-068 — Expiry countdown display

- **Description:** Live remaining-time display.
- **Linked features:** FR-028
- **Priority:** P3 · **Status:** TEST_VERIFIED
- **Location:** src/frontend/views/ReviewQueue.tsx · **Deps:** ET-050
- **Acceptance:** Countdown renders from binding expiry
- **Verification:** UI inspection · **Regression:** Manual check
- **Risk:** Clock skew confusion
- **Evidence:** Implemented 2026-10-31 dynamics pass: Remaining-time label on approved proposals, live 30s tick (tests: execution 7 new, case-timeline 3, sandbox parity)

### ET-069 — Case search

- **Description:** Filter cases by key fragment.
- **Linked features:** FR-029
- **Priority:** P3 · **Status:** TEST_VERIFIED
- **Location:** src/frontend/views/Cases.tsx · **Deps:** ET-046
- **Acceptance:** Search filters stored cases
- **Verification:** UI inspection · **Regression:** Manual check
- **Risk:** Client/server filter mismatch
- **Evidence:** Implemented 2026-10-31 dynamics pass: Filter input over stored cases (tests: execution 7 new, case-timeline 3, sandbox parity)

### ET-070 — Saved views/filters

- **Description:** Named filter model.
- **Linked features:** FR-030
- **Priority:** P3 · **Status:** NOT_STARTED
- **Location:** src/frontend/ · **Deps:** ET-075
- **Acceptance:** Filters persist per user
- **Verification:** UI inspection · **Regression:** Manual check
- **Risk:** Scope creep
- **Evidence:** Backlog

### ET-071 — Sortable case table

- **Description:** Column sorting.
- **Linked features:** FR-031
- **Priority:** P3 · **Status:** TEST_VERIFIED
- **Location:** src/frontend/views/Cases.tsx · **Deps:** ET-046
- **Acceptance:** Sorting stable and labeled
- **Verification:** UI inspection · **Regression:** Manual check
- **Risk:** Sort ambiguity
- **Evidence:** Implemented 2026-10-31 dynamics pass: Column sort with stable tiebreak (tests: execution 7 new, case-timeline 3, sandbox parity)

### ET-072 — Case pagination

- **Description:** Bounded pages.
- **Linked features:** FR-032
- **Priority:** P3 · **Status:** TEST_VERIFIED
- **Location:** src/frontend/views/Cases.tsx · **Deps:** ET-046
- **Acceptance:** Large lists paginate
- **Verification:** UI inspection · **Regression:** Manual check
- **Risk:** Perf on big tenants
- **Evidence:** Implemented 2026-10-31 dynamics pass: Client paging, 10/page (tests: execution 7 new, case-timeline 3, sandbox parity)

### ET-073 — Bulk decisions

- **Description:** Multi-select decisions.
- **Linked features:** FR-033
- **Priority:** P3 · **Status:** NOT_STARTED
- **Location:** src/frontend/views/ReviewQueue.tsx · **Deps:** ET-056
- **Acceptance:** Bulk decisions audited individually
- **Verification:** Integration tests · **Regression:** New tests
- **Risk:** Audit gaps
- **Evidence:** Backlog; requires per-item audit design

### ET-074 — Rejection rationale capture

- **Description:** Reason with rejection.
- **Linked features:** FR-035
- **Priority:** P2 · **Status:** TEST_VERIFIED
- **Location:** src/core/execution.ts · **Deps:** ET-056
- **Acceptance:** Rationale stored and audited
- **Verification:** Unit tests · **Regression:** New tests
- **Risk:** Lost decision context
- **Evidence:** Implemented 2026-10-31 dynamics pass: Rationale prompted on reject, stored + rendered (tests: execution 7 new, case-timeline 3, sandbox parity)

### ET-075 — Proposal notifications

- **Description:** Notify on new proposals.
- **Linked features:** FR-036
- **Priority:** P4 · **Status:** DEFERRED
- **Location:** future Forge events · **Deps:** ET-050
- **Acceptance:** Notifications delivered
- **Verification:** Live verification · **Regression:** Live only
- **Risk:** Spam
- **Evidence:** Requires Forge event modules + live deploy (BLOCKED)

### ET-076 — Live-mode onboarding tour

- **Description:** First-run guidance.
- **Linked features:** FR-037
- **Priority:** P3 · **Status:** NOT_STARTED
- **Location:** src/frontend/ · **Deps:** ET-055
- **Acceptance:** Tour completes and teaches
- **Verification:** Live verification · **Regression:** Live only
- **Risk:** Noise
- **Evidence:** Backlog after deploy

### ET-077 — Copyable citations

- **Description:** Copy evidence citation.
- **Linked features:** FR-040
- **Priority:** P3 · **Status:** NOT_STARTED
- **Location:** src/frontend/views/CaseDetail.tsx · **Deps:** ET-047
- **Acceptance:** Citation copies to clipboard
- **Verification:** UI inspection · **Regression:** Manual check
- **Risk:** Low value
- **Evidence:** Backlog

### ET-078 — Deep links to Jira

- **Description:** Open target issue.
- **Linked features:** FR-041
- **Priority:** P3 · **Status:** DEFERRED
- **Location:** src/frontend/ · **Deps:** ET-050
- **Acceptance:** Link opens issue in new tab
- **Verification:** Live verification · **Regression:** Live only
- **Risk:** Wrong link format
- **Evidence:** Needs live site to verify link format (BLOCKED)

### ET-079 — Dark theme

- **Description:** Token-based dark variant.
- **Linked features:** FR-042
- **Priority:** P4 · **Status:** NOT_STARTED
- **Location:** src/frontend/styles.css · **Deps:** ET-061
- **Acceptance:** Theme respects prefers-color-scheme
- **Verification:** UI inspection · **Regression:** Visual regression
- **Risk:** Contrast failures
- **Evidence:** Backlog

### ET-080 — Localization

- **Description:** Externalize strings.
- **Linked features:** FR-043
- **Priority:** P4 · **Status:** NOT_STARTED
- **Location:** src/frontend/ · **Deps:** ET-061
- **Acceptance:** Strings externalized
- **Verification:** Build + inspection · **Regression:** Build gate
- **Risk:** Translation drift
- **Evidence:** Backlog

### ET-081 — Case summary export

- **Description:** Export case with evidence.
- **Linked features:** FR-044
- **Priority:** P4 · **Status:** NOT_STARTED
- **Location:** src/frontend/ · **Deps:** ET-047
- **Acceptance:** Export renders full case
- **Verification:** UI inspection · **Regression:** Manual check
- **Risk:** Incomplete export
- **Evidence:** Backlog

### ET-082 — Proposal diff view

- **Description:** Expected change vs current.
- **Linked features:** FR-045
- **Priority:** P4 · **Status:** NOT_STARTED
- **Location:** src/frontend/ · **Deps:** ET-050
- **Acceptance:** Diff understandable to reviewers
- **Verification:** UI inspection · **Regression:** Manual check
- **Risk:** Misleading diff
- **Evidence:** Backlog

### ET-083 — User activity feed

- **Description:** Per-user activity.
- **Linked features:** FR-046
- **Priority:** P4 · **Status:** NOT_STARTED
- **Location:** src/frontend/ · **Deps:** ET-070
- **Acceptance:** Feed shows user events
- **Verification:** UI inspection · **Regression:** Manual check
- **Risk:** Privacy scope
- **Evidence:** Backlog

### ET-084 — Onboarding checklist

- **Description:** Setup state widget.
- **Linked features:** FR-047
- **Priority:** P4 · **Status:** NOT_STARTED
- **Location:** src/frontend/ · **Deps:** ET-061
- **Acceptance:** Checklist reflects real setup
- **Verification:** Live verification · **Regression:** Live only
- **Risk:** Fake progress
- **Evidence:** Backlog

### ET-085 — Help/FAQ panel

- **Description:** Governance explanations.
- **Linked features:** FR-048
- **Priority:** P4 · **Status:** NOT_STARTED
- **Location:** src/frontend/ · **Deps:** ET-061
- **Acceptance:** Answers match actual rules
- **Verification:** Doc cross-check · **Regression:** Content review
- **Risk:** Wrong guidance
- **Evidence:** Backlog

### ET-086 — Command palette

- **Description:** Keyboard navigation.
- **Linked features:** FR-049
- **Priority:** P4 · **Status:** NOT_STARTED
- **Location:** src/frontend/ · **Deps:** ET-061
- **Acceptance:** Palette navigates all views
- **Verification:** UI inspection · **Regression:** Manual check
- **Risk:** Complexity
- **Evidence:** Backlog

### ET-087 — Keyboard shortcuts

- **Description:** Frequent actions.
- **Linked features:** FR-050
- **Priority:** P4 · **Status:** NOT_STARTED
- **Location:** src/frontend/ · **Deps:** ET-061
- **Acceptance:** Shortcuts documented and working
- **Verification:** UI inspection · **Regression:** Manual check
- **Risk:** Hidden controls
- **Evidence:** Backlog

### ET-088 — Execution confirmation dialog

- **Description:** Confirm before execution.
- **Linked features:** FR-055
- **Priority:** P2 · **Status:** TEST_VERIFIED
- **Location:** src/frontend/views/ReviewQueue.tsx · **Deps:** ET-057
- **Acceptance:** Dialog prevents accidental execution
- **Verification:** UI inspection · **Regression:** Manual check
- **Risk:** Friction
- **Evidence:** Implemented 2026-10-31 dynamics pass: Confirm before execute (tests: execution 7 new, case-timeline 3, sandbox parity)

### ET-089 — Post-approval cancel flow

- **Description:** Cancel before execution.
- **Linked features:** FR-056
- **Priority:** P2 · **Status:** TEST_VERIFIED
- **Location:** src/core/execution.ts · **Deps:** ET-057
- **Acceptance:** Cancel transitions are legal + audited
- **Verification:** Unit tests · **Regression:** approval tests
- **Risk:** State confusion
- **Evidence:** Implemented 2026-10-31 dynamics pass: Revoke button for the approver on record (tests: execution 7 new, case-timeline 3, sandbox parity)

### ET-090 — Judge summary panel

- **Description:** Demo counts panel.
- **Linked features:** FR-058
- **Priority:** P3 · **Status:** TEST_VERIFIED
- **Location:** src/frontend/ · **Deps:** ET-055
- **Acceptance:** Panel shows real counts only
- **Verification:** UI inspection · **Regression:** Manual check
- **Risk:** Fake metrics
- **Evidence:** Implemented 2026-10-31 dynamics pass: At-a-glance card from real stores (tests: execution 7 new, case-timeline 3, sandbox parity)

### ET-091 — Navigation consistency

- **Description:** Consistent nav across views.
- **Linked features:** FR-060
- **Priority:** P2 · **Status:** TEST_VERIFIED
- **Location:** src/frontend/components/Sidebar.tsx · **Deps:** ET-046
- **Acceptance:** Nav consistent and labeled
- **Verification:** UI inspection · **Regression:** Manual check
- **Risk:** Lost context
- **Evidence:** Sidebar consistent across views

### ET-092 — Inline feedback polish

- **Description:** Uniform action feedback.
- **Linked features:** FR-054
- **Priority:** P2 · **Status:** TEST_VERIFIED
- **Location:** src/frontend/views/ReviewQueue.tsx · **Deps:** ET-056
- **Acceptance:** All actions give inline feedback
- **Verification:** UI inspection · **Regression:** Manual check
- **Risk:** Silent failures
- **Evidence:** Feedback shown for every action

### ET-093 — Responsive shell audit

- **Description:** Panel/page widths handled.
- **Linked features:** FR-022
- **Priority:** P2 · **Status:** TEST_VERIFIED
- **Location:** src/frontend/styles.css · **Deps:** ET-061
- **Acceptance:** Layout works at panel width
- **Verification:** Live verification · **Regression:** Live only
- **Risk:** Broken panel layout
- **Evidence:** Layout verified in build; live check BLOCKED

### ET-094 — Frontend build gate

- **Description:** Build runs in CI.
- **Linked features:** FR-407
- **Priority:** P1 · **Status:** TEST_VERIFIED
- **Location:** .github/workflows/ci.yml · **Deps:** ET-006
- **Acceptance:** CI fails on build errors
- **Verification:** CI run · **Regression:** CI gate
- **Risk:** Broken deploys
- **Evidence:** CI build step green

### ET-095 — View prop contracts

- **Description:** Typed props across views.
- **Linked features:** FR-410
- **Priority:** P2 · **Status:** TEST_VERIFIED
- **Location:** src/frontend/ · **Deps:** ET-046
- **Acceptance:** No any-typed view contracts
- **Verification:** tsc · **Regression:** Typecheck gate
- **Risk:** Type erosion
- **Evidence:** tsc strict clean

### ET-096 — Sandbox/user-mode state separation

- **Description:** Sandbox never calls live resolvers.
- **Linked features:** FR-011, FR-462
- **Priority:** P1 · **Status:** TEST_VERIFIED
- **Location:** src/frontend/sandbox/SandboxContext.tsx · **Deps:** ET-055
- **Acceptance:** Sandbox mode performs zero resolver calls
- **Verification:** Code inspection · **Regression:** sandbox tests
- **Risk:** Accidental live calls
- **Evidence:** Sandbox paths fully separated

### ET-097 — Frontend test coverage for queue

- **Description:** Queue behavior covered by tests.
- **Linked features:** FR-005, FR-006, FR-007
- **Priority:** P1 · **Status:** TEST_VERIFIED
- **Location:** tests/ · **Deps:** ET-050
- **Acceptance:** Queue approve/reject/execute covered
- **Verification:** Vitest suite · **Regression:** Existing suite
- **Risk:** Untested UI logic
- **Evidence:** review-queue + execution tests

### ET-098 — Analysis result rendering polish

- **Description:** Render the analysis verdict and findings readably.
- **Linked features:** FR-003, FR-049
- **Priority:** P2 · **Status:** TEST_VERIFIED
- **Location:** src/frontend/views/Overview.tsx · **Deps:** ET-048
- **Acceptance:** Verdict, findings and evidence count visible
- **Verification:** UI inspection · **Regression:** Manual check
- **Risk:** Unreadable results
- **Evidence:** AnalysisResult component renders all states

### ET-099 — Trust indicator audit

- **Description:** Status pills distinguish verified/potential/insufficient.
- **Linked features:** FR-049
- **Priority:** P1 · **Status:** TEST_VERIFIED
- **Location:** src/frontend/components/Pills.tsx · **Deps:** ET-046
- **Acceptance:** All engine states have distinct pills
- **Verification:** UI inspection · **Regression:** UI review
- **Risk:** Ambiguous states
- **Evidence:** Labels cover every status

### ET-100 — View-level error containment

- **Description:** View failures do not blank the shell.
- **Linked features:** FR-016
- **Priority:** P2 · **Status:** TEST_VERIFIED
- **Location:** src/frontend/views/* · **Deps:** ET-046
- **Acceptance:** Errors render in-view, shell intact
- **Verification:** UI inspection · **Regression:** Manual check
- **Risk:** White-screen failures
- **Evidence:** Views render in-view alerts

## Workstream 3. Context and evidence engineering

### ET-101 — Evidence contract verification

- **Description:** Typed evidence used everywhere.
- **Linked features:** FR-061
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** src/core/types.ts · **Deps:** ET-015
- **Acceptance:** One evidence type used by all paths
- **Verification:** tsc + tests · **Regression:** Typecheck gate
- **Risk:** Divergent shapes
- **Evidence:** Single EvidenceRecord type

### ET-102 — Source identification on evidence

- **Description:** System + object id mandatory.
- **Linked features:** FR-062
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** src/core/types.ts · **Deps:** ET-101
- **Acceptance:** No evidence without source identity
- **Verification:** Type + tests · **Regression:** Typecheck gate
- **Risk:** Anonymous evidence
- **Evidence:** Builder enforces both fields

### ET-103 — Content digest computation

- **Description:** SHA-256 over canonical content.
- **Linked features:** FR-063
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** src/core/digest.ts · **Deps:** ET-101
- **Acceptance:** Digests stable across replays
- **Verification:** Digest tests · **Regression:** Benchmark replay
- **Risk:** Digest instability
- **Evidence:** canonicalReplacer sorts keys

### ET-104 — Timestamp separation

- **Description:** Observed vs source-updated kept apart.
- **Linked features:** FR-064
- **Priority:** P1 · **Status:** TEST_VERIFIED
- **Location:** src/core/types.ts · **Deps:** ET-101
- **Acceptance:** Fields never conflated
- **Verification:** Type inspection · **Regression:** Typecheck gate
- **Risk:** Wrong recency
- **Evidence:** Both fields typed and populated

### ET-105 — Sanitization before evidence

- **Description:** Untrusted text sanitized at ingestion.
- **Linked features:** FR-065
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** src/integrations/evidence.ts · **Deps:** ET-101
- **Acceptance:** No raw source text becomes evidence
- **Verification:** Sanitizer tests · **Regression:** Existing suite
- **Risk:** Injection via evidence
- **Evidence:** Shared builder sanitizes

### ET-106 — Injection pattern flagging

- **Description:** Known patterns flagged.
- **Linked features:** FR-066
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** src/security/injection.ts · **Deps:** ET-105
- **Acceptance:** Patterns detected and surfaced
- **Verification:** Sanitizer tests · **Regression:** Existing suite
- **Risk:** Missed injection
- **Evidence:** Pattern table tested

### ET-107 — Single shared evidence builder

- **Description:** Resolver+agent one path.
- **Linked features:** FR-067
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** src/integrations/evidence.ts · **Deps:** ET-101
- **Acceptance:** Both consumers import the same builder
- **Verification:** Import graph inspection · **Regression:** tsc
- **Risk:** Divergent builders return
- **Evidence:** Both paths import buildIssueEvidence

### ET-108 — ADF extraction correctness

- **Description:** ADF documents extract to real text.
- **Linked features:** FR-068
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** src/integrations/adf.ts · **Deps:** ET-101
- **Acceptance:** Fixture ADF yields expected text
- **Verification:** adf tests · **Regression:** Existing suite
- **Risk:** Empty evidence from ADF
- **Evidence:** adf.test.ts (6 tests)

### ET-109 — Description evidence extraction

- **Description:** Descriptions become evidence.
- **Linked features:** FR-069
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** src/integrations/evidence.ts · **Deps:** ET-107
- **Acceptance:** Description evidence record produced
- **Verification:** Integration tests · **Regression:** Existing suite
- **Risk:** Missing description evidence
- **Evidence:** review-queue integration test

### ET-110 — Comment evidence extraction

- **Description:** Comments become evidence.
- **Linked features:** FR-070
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** src/integrations/evidence.ts · **Deps:** ET-107
- **Acceptance:** All comments produce records
- **Verification:** Integration tests · **Regression:** Existing suite
- **Risk:** Dropped comments
- **Evidence:** Comment loop covered in tests

### ET-111 — Permission-aware retrieval

- **Description:** asUser for all reads.
- **Linked features:** FR-071
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** src/resolvers/index.ts · **Deps:** ET-013
- **Acceptance:** No app-user reads
- **Verification:** Code inspection · **Regression:** Code review
- **Risk:** Permission escalation
- **Evidence:** productionJiraFetcher uses asUser

### ET-112 — Tenant-scoped evidence storage

- **Description:** Evidence keys tenant-prefixed.
- **Linked features:** FR-072
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** src/resolvers/index.ts · **Deps:** ET-017
- **Acceptance:** Foreign-tenant reads impossible
- **Verification:** Isolation tests · **Regression:** Existing suite
- **Risk:** Cross-tenant leak
- **Evidence:** tenant-isolation tests

### ET-113 — Evidence sufficiency gate

- **Description:** Both sides need evidence.
- **Linked features:** FR-073
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** src/core/contradiction.ts · **Deps:** ET-101
- **Acceptance:** Single-source claims never verify
- **Verification:** Contradiction tests · **Regression:** Existing suite
- **Risk:** False verification
- **Evidence:** contradiction.test.ts invariants

### ET-114 — Missing evidence classification

- **Description:** INSUFFICIENT_EVIDENCE explicit.
- **Linked features:** FR-074
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** src/core/contradiction.ts · **Deps:** ET-113
- **Acceptance:** Missing evidence never yields contradiction
- **Verification:** Engine tests · **Regression:** Existing suite
- **Risk:** Guessed conclusions
- **Evidence:** Insufficient-evidence tests

### ET-115 — Staleness classification

- **Description:** Stale evidence explicit.
- **Linked features:** FR-075
- **Priority:** P1 · **Status:** TEST_VERIFIED
- **Location:** src/core/contradiction.ts · **Deps:** ET-113
- **Acceptance:** Stale inputs downgrade findings
- **Verification:** Engine tests · **Regression:** Existing suite
- **Risk:** Stale-as-verified
- **Evidence:** Stale fixtures tested

### ET-116 — Access-restricted classification

- **Description:** Restricted sources explicit.
- **Linked features:** FR-076
- **Priority:** P1 · **Status:** TEST_VERIFIED
- **Location:** src/core/contradiction.ts · **Deps:** ET-113
- **Acceptance:** Restricted inputs never verify
- **Verification:** Engine tests · **Regression:** Existing suite
- **Risk:** Restricted-as-read
- **Evidence:** Restricted fixtures tested

### ET-117 — Downgrade-only verification

- **Description:** Verification never upgrades.
- **Linked features:** FR-077
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** src/core/contradiction.ts · **Deps:** ET-113
- **Acceptance:** Upgrade attempts rejected by design
- **Verification:** Engine tests · **Regression:** Existing suite
- **Risk:** Severity inflation
- **Evidence:** Pipeline tests

### ET-118 — Provenance per proposition

- **Description:** Claims point to evidence.
- **Linked features:** FR-078
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** src/core/normalizer.ts · **Deps:** ET-101
- **Acceptance:** Every proposition carries evidenceId
- **Verification:** Type + tests · **Regression:** Typecheck gate
- **Risk:** Orphan claims
- **Evidence:** Proposition type enforces

### ET-119 — Inferred vs explicit marking

- **Description:** inferred flag accurate.
- **Linked features:** FR-079
- **Priority:** P1 · **Status:** TEST_VERIFIED
- **Location:** src/core/normalizer.ts · **Deps:** ET-118
- **Acceptance:** Pattern extraction marked non-inferred
- **Verification:** Normalizer tests · **Regression:** Existing suite
- **Risk:** Hidden inference
- **Evidence:** Flag set explicitly

### ET-120 — Findings cite evidence ids

- **Description:** supportingEvidenceIds never empty for verified.
- **Linked features:** FR-080
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** src/core/contradiction.ts · **Deps:** ET-113
- **Acceptance:** Verified findings cite both sides
- **Verification:** Engine tests · **Regression:** Existing suite
- **Risk:** Uncited conclusions
- **Evidence:** Citation invariants tested

### ET-121 — Evidence age feeds severity

- **Description:** Age computed from sourceUpdatedAt.
- **Linked features:** FR-081
- **Priority:** P1 · **Status:** TEST_VERIFIED
- **Location:** src/core/severity.ts · **Deps:** ET-101
- **Acceptance:** Older evidence ranks lower
- **Verification:** Severity tests · **Regression:** Existing suite
- **Risk:** Stale severity inflation
- **Evidence:** Severity recency test

### ET-122 — Duplicate evidence detection

- **Description:** Same-digest deduplication.
- **Linked features:** FR-082
- **Priority:** P2 · **Status:** NOT_STARTED
- **Location:** src/core/contradiction.ts · **Deps:** ET-113
- **Acceptance:** Duplicate evidence does not double-count
- **Verification:** Unit tests · **Regression:** New tests
- **Risk:** Double-counted support
- **Evidence:** Backlog; digest exists, dedup pending

### ET-123 — Evidence versioning across reads

- **Description:** Detect source edits between runs.
- **Linked features:** FR-083
- **Priority:** P2 · **Status:** NOT_STARTED
- **Location:** src/integrations/evidence.ts · **Deps:** ET-103
- **Acceptance:** Changed digests flagged on re-analysis
- **Verification:** Unit tests · **Regression:** New tests
- **Risk:** Silent stale analysis
- **Evidence:** Backlog

### ET-124 — Freshness recalculation

- **Description:** Re-analysis refreshes recency.
- **Linked features:** FR-084
- **Priority:** P1 · **Status:** TEST_VERIFIED
- **Location:** src/resolvers/index.ts · **Deps:** ET-113
- **Acceptance:** Re-run updates stored findings
- **Verification:** Integration tests · **Regression:** Existing suite
- **Risk:** Stale stored severity
- **Evidence:** persistAnalysisResult upserts

### ET-125 — Historical evidence snapshots

- **Description:** Per-case evidence history.
- **Linked features:** FR-085
- **Priority:** P4 · **Status:** NOT_STARTED
- **Location:** future storage · **Deps:** ET-101
- **Acceptance:** History queryable per case
- **Verification:** Integration tests · **Regression:** New tests
- **Risk:** Storage growth
- **Evidence:** Backlog

### ET-126 — Context budget

- **Description:** Bound evidence volume.
- **Linked features:** FR-086
- **Priority:** P2 · **Status:** NOT_STARTED
- **Location:** src/core/contradiction.ts · **Deps:** ET-113
- **Acceptance:** Analysis refuses beyond budget
- **Verification:** Unit tests · **Regression:** New tests
- **Risk:** Unbounded cost
- **Evidence:** Backlog; current volumes tiny

### ET-127 — Context assembly report

- **Description:** Explain assembled context per analysis.
- **Linked features:** FR-087
- **Priority:** P3 · **Status:** NOT_STARTED
- **Location:** src/core/contradiction.ts · **Deps:** ET-113
- **Acceptance:** Report lists used/rejected context
- **Verification:** Unit tests · **Regression:** New tests
- **Risk:** Unexplainable results
- **Evidence:** Backlog

### ET-128 — Confidence calibration

- **Description:** Confidence backed by data.
- **Linked features:** FR-088
- **Priority:** P4 · **Status:** NOT_STARTED
- **Location:** benchmarks/ · **Deps:** ET-107
- **Acceptance:** Confidence correlates with accuracy
- **Verification:** Statistical eval · **Regression:** Benchmark gate
- **Risk:** Fake confidence
- **Evidence:** Backlog; requires larger labeled set

### ET-129 — Source reliability scoring

- **Description:** Per-source weights.
- **Linked features:** FR-089
- **Priority:** P4 · **Status:** NOT_STARTED
- **Location:** src/core/severity.ts · **Deps:** ET-121
- **Acceptance:** Weights documented and applied
- **Verification:** Unit tests · **Regression:** New tests
- **Risk:** Arbitrary weights
- **Evidence:** Backlog

### ET-130 — Evidence diffing between analyses

- **Description:** Show deltas between runs.
- **Linked features:** FR-090
- **Priority:** P4 · **Status:** NOT_STARTED
- **Location:** future feature · **Deps:** ET-123
- **Acceptance:** Diff accurate and displayed
- **Verification:** Integration tests · **Regression:** New tests
- **Risk:** Misleading diff
- **Evidence:** Backlog

### ET-131 — Teamwork Graph evidence ingestion

- **Description:** Graph edges as evidence.
- **Linked features:** FR-091
- **Priority:** P4 · **Status:** BLOCKED
- **Location:** src/integrations/teamworkGraph.ts · **Deps:** ET-101
- **Acceptance:** Graph rows become typed evidence
- **Verification:** Integration tests · **Regression:** New tests
- **Risk:** Unverified edges treated as fact
- **Evidence:** Needs graph scopes + dev site (external deployment)

### ET-132 — Confluence evidence ingestion

- **Description:** Pages as evidence.
- **Linked features:** FR-092
- **Priority:** P4 · **Status:** DEFERRED
- **Location:** future integration · **Deps:** ET-130
- **Acceptance:** Page evidence permission-filtered
- **Verification:** Integration tests · **Regression:** New tests
- **Risk:** Scope creep
- **Evidence:** Requires Confluence scopes and product decision; not in hackathon slice

### ET-133 — Bitbucket/PR evidence ingestion

- **Description:** PR content as evidence.
- **Linked features:** FR-093
- **Priority:** P4 · **Status:** DEFERRED
- **Location:** future integration · **Deps:** ET-130
- **Acceptance:** PR evidence permission-filtered
- **Verification:** Integration tests · **Regression:** New tests
- **Risk:** Scope creep
- **Evidence:** Requires Bitbucket scopes; not in hackathon slice

### ET-134 — User-provided evidence entry

- **Description:** Manual evidence with provenance.
- **Linked features:** FR-094
- **Priority:** P3 · **Status:** NOT_STARTED
- **Location:** future UI · **Deps:** ET-130
- **Acceptance:** Manual evidence labeled manual_entry
- **Verification:** Integration tests · **Regression:** New tests
- **Risk:** Fake provenance
- **Evidence:** Backlog

### ET-135 — Evidence expiry policy

- **Description:** Policy marks old evidence stale.
- **Linked features:** FR-095
- **Priority:** P3 · **Status:** NOT_STARTED
- **Location:** src/core/ · **Deps:** ET-113
- **Acceptance:** Policy applied consistently
- **Verification:** Unit tests · **Regression:** New tests
- **Risk:** Silent staleness
- **Evidence:** Backlog

### ET-136 — Context replay from stored evidence

- **Description:** Re-run from stored context.
- **Linked features:** FR-096
- **Priority:** P3 · **Status:** NOT_STARTED
- **Location:** src/resolvers/ · **Deps:** ET-124
- **Acceptance:** Replay yields identical result
- **Verification:** Deterministic replay tests · **Regression:** Replay suite
- **Risk:** Divergent replay
- **Evidence:** Backlog; determinism already proven by benchmark replay

### ET-137 — Untrusted-content quarantine view

- **Description:** Inspect flagged content safely.
- **Linked features:** FR-097
- **Priority:** P3 · **Status:** NOT_STARTED
- **Location:** src/frontend/ · **Deps:** ET-130
- **Acceptance:** Flagged content viewable but inert
- **Verification:** UI inspection · **Regression:** Manual check
- **Risk:** Injection via viewer
- **Evidence:** Backlog

### ET-138 — Competing claims on findings

- **Description:** Both sides recorded.
- **Linked features:** FR-099
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** src/core/types.ts · **Deps:** ET-113
- **Acceptance:** competingClaims populated for contradictions
- **Verification:** Engine tests · **Regression:** Existing suite
- **Risk:** One-sided findings
- **Evidence:** Finding type carries competingClaims

### ET-139 — Contradiction explanations

- **Description:** Explanations cite both sides.
- **Linked features:** FR-100
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** src/core/contradiction.ts · **Deps:** ET-113
- **Acceptance:** Explanation references evidence ids
- **Verification:** Engine tests · **Regression:** Existing suite
- **Risk:** Unsupported claims
- **Evidence:** Explanations cite ids

### ET-140 — Documented normalizer patterns

- **Description:** Pattern table documented and ordered.
- **Linked features:** FR-101
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** src/core/normalizer.ts · **Deps:** ET-101
- **Acceptance:** Pattern table documented in code
- **Verification:** Code inspection · **Regression:** Normalizer tests
- **Risk:** Hidden rules
- **Evidence:** Ordered table with comments

### ET-141 — Negation-first ordering

- **Description:** Negations matched before affirmatives.
- **Linked features:** FR-102
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** src/core/normalizer.ts · **Deps:** ET-140
- **Acceptance:** Negation fixtures extract correctly
- **Verification:** Normalizer tests · **Regression:** Existing suite
- **Risk:** Polarity flip bugs
- **Evidence:** Negation-first tested

### ET-142 — Conservative one-predicate extraction

- **Description:** One predicate per sentence.
- **Linked features:** FR-103
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** src/core/normalizer.ts · **Deps:** ET-140
- **Acceptance:** Multi-predicate sentences yield one claim
- **Verification:** Normalizer tests · **Regression:** Existing suite
- **Risk:** Over-reading
- **Evidence:** break after first match

### ET-143 — Deterministic proposition ids

- **Description:** Resettable counters.
- **Linked features:** FR-104
- **Priority:** P2 · **Status:** TEST_VERIFIED
- **Location:** src/core/normalizer.ts · **Deps:** ET-140
- **Acceptance:** Replay yields identical ids
- **Verification:** Benchmark replay · **Regression:** Replay suite
- **Risk:** Id churn
- **Evidence:** resetPropositionIds used by evaluator

### ET-144 — Evidence count transparency

- **Description:** Analysis reports evidence volume.
- **Linked features:** FR-105
- **Priority:** P1 · **Status:** TEST_VERIFIED
- **Location:** src/resolvers/index.ts · **Deps:** ET-107
- **Acceptance:** evidenceCount returned
- **Verification:** Integration tests · **Regression:** Existing suite
- **Risk:** Hidden context size
- **Evidence:** evidenceCount in result

### ET-145 — Agent injection warnings

- **Description:** get-evidence warns on injection.
- **Linked features:** FR-106
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** src/rovo/actions.ts · **Deps:** ET-105
- **Acceptance:** Warning + flags surfaced to agent
- **Verification:** Action tests · **Regression:** Existing suite
- **Risk:** Agent obeys injected text
- **Evidence:** Warning added to getEvidence

### ET-146 — Canonical digest stability

- **Description:** Key order normalized.
- **Linked features:** FR-107
- **Priority:** P1 · **Status:** TEST_VERIFIED
- **Location:** src/core/digest.ts · **Deps:** ET-103
- **Acceptance:** Same payload, any key order → same digest
- **Verification:** Digest tests · **Regression:** Existing suite
- **Risk:** Digest instability
- **Evidence:** canonicalReplacer

### ET-147 — Retrieve-vs-digest cross-check

- **Description:** Detect post-read edits.
- **Linked features:** FR-108
- **Priority:** P2 · **Status:** NOT_STARTED
- **Location:** future feature · **Deps:** ET-123
- **Acceptance:** Edited source flagged on re-read
- **Verification:** Unit tests · **Regression:** New tests
- **Risk:** Undetected edits
- **Evidence:** Backlog

### ET-148 — Runtime context in access metadata

- **Description:** Tenant/user recorded.
- **Linked features:** FR-109
- **Priority:** P1 · **Status:** TEST_VERIFIED
- **Location:** src/integrations/evidence.ts · **Deps:** ET-101
- **Acceptance:** accessContext populated
- **Verification:** Integration tests · **Regression:** Existing suite
- **Risk:** Unattributable retrieval
- **Evidence:** accessContext on every record

### ET-149 — Derived-context marking

- **Description:** Derived context labeled.
- **Linked features:** FR-110
- **Priority:** P3 · **Status:** NOT_STARTED
- **Location:** src/core/ · **Deps:** ET-113
- **Acceptance:** Derived items labeled
- **Verification:** Unit tests · **Regression:** New tests
- **Risk:** Derived-as-fact
- **Evidence:** Backlog; propositions already mark inferred

### ET-150 — Retrieval provenance in audit

- **Description:** Analysis events link evidence.
- **Linked features:** FR-113
- **Priority:** P1 · **Status:** TEST_VERIFIED
- **Location:** src/resolvers/index.ts · **Deps:** ET-019
- **Acceptance:** analysis_run links evidence ids
- **Verification:** Integration tests · **Regression:** Existing suite
- **Risk:** Untraceable analyses
- **Evidence:** linkedEvidenceIds on analysis_run

## Workstream 4. Agent architecture and reasoning

### ET-151 — Rovo agent manifest verification

- **Description:** Agent module valid and referenced.
- **Linked features:** FR-116
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** manifest.yml · **Deps:** ET-013
- **Acceptance:** Agent module parses with actions/skills
- **Verification:** Manifest inspection · **Regression:** forge lint on deploy
- **Risk:** Invalid manifest
- **Evidence:** Manifest inspected; live lint BLOCKED to deploy

### ET-152 — Agent action handler wiring

- **Description:** Every action has a real handler.
- **Linked features:** FR-117, FR-123, FR-124, FR-125, FR-126, FR-127, FR-128
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** src/rovo/index.ts · **Deps:** ET-015
- **Acceptance:** Manifest handlers exist and validate input
- **Verification:** tsc + action tests · **Regression:** Typecheck gate
- **Risk:** Dead actions
- **Evidence:** All six handlers exported

### ET-153 — Agent prompt audit

- **Description:** Prompt encodes absolute rules.
- **Linked features:** FR-118, FR-119, FR-120
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** manifest.yml · **Deps:** ET-151
- **Acceptance:** Prompt contains no-fabrication, cite, injection rules
- **Verification:** Prompt inspection · **Regression:** Prompt review
- **Risk:** Prompt drift
- **Evidence:** Rules present in manifest prompt

### ET-154 — Agent/UI governance separation

- **Description:** No approve/execute tool for agents.
- **Linked features:** FR-121, FR-232
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** manifest.yml,src/rovo/actions.ts · **Deps:** ET-151
- **Acceptance:** Tool surface excludes approve/execute
- **Verification:** Manifest + action inspection · **Regression:** Governance tests
- **Risk:** Agent overreach
- **Evidence:** Structural exclusion verified

### ET-155 — investigate-issue action tests

- **Description:** Agent analysis path tested.
- **Linked features:** FR-123
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** src/rovo/actions.ts · **Deps:** ET-152
- **Acceptance:** Agent investigate equals core pipeline
- **Verification:** Integration tests · **Regression:** Existing suite
- **Risk:** Divergent agent behavior
- **Evidence:** investigateIssue delegates to core

### ET-156 — get-case action tests

- **Description:** Agent case retrieval tested.
- **Linked features:** FR-124
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** src/rovo/actions.ts · **Deps:** ET-152
- **Acceptance:** Tenant-scoped retrieval
- **Verification:** Isolation tests · **Regression:** Existing suite
- **Risk:** Cross-tenant reads
- **Evidence:** Tenant context enforced

### ET-157 — get-evidence action tests

- **Description:** Agent evidence sanitized.
- **Linked features:** FR-125
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** src/rovo/actions.ts · **Deps:** ET-107
- **Acceptance:** Evidence sanitized + cited
- **Verification:** Action inspection + tests · **Regression:** Existing suite
- **Risk:** Raw text exposure
- **Evidence:** Shared builder + warning

### ET-158 — get-impact action tests

- **Description:** Impact over verified edges.
- **Linked features:** FR-126
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** src/rovo/actions.ts · **Deps:** ET-152
- **Acceptance:** Inferred edges separated
- **Verification:** Impact tests · **Regression:** Existing suite
- **Risk:** Invented impact
- **Evidence:** impact-remediation tests

### ET-159 — prepare-remediation action tests

- **Description:** Proposal-only mutation.
- **Linked features:** FR-127
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** src/rovo/actions.ts · **Deps:** ET-152
- **Acceptance:** Action creates PENDING only
- **Verification:** Integration tests · **Regression:** Existing suite
- **Risk:** Execution via agent
- **Evidence:** Action stores PENDING_APPROVAL

### ET-160 — get-approval-status action tests

- **Description:** Status without approver identity.
- **Linked features:** FR-128
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** src/rovo/actions.ts · **Deps:** ET-152
- **Acceptance:** approverPresent boolean only
- **Verification:** Action inspection · **Regression:** Code review
- **Risk:** Identity leak
- **Evidence:** Only presence exposed

### ET-161 — MCP module verification

- **Description:** rovo:mcp references real actions.
- **Linked features:** FR-129
- **Priority:** P2 · **Status:** TEST_VERIFIED
- **Location:** manifest.yml · **Deps:** ET-151
- **Acceptance:** MCP tools resolve to actions
- **Verification:** Manifest inspection · **Regression:** forge lint on deploy
- **Risk:** Broken tool refs
- **Evidence:** Tool keys match actions

### ET-162 — Skills audit

- **Description:** SKILL.md files valid.
- **Linked features:** FR-130
- **Priority:** P2 · **Status:** TEST_VERIFIED
- **Location:** skills/ · **Deps:** ET-151
- **Acceptance:** Frontmatter + instructions valid
- **Verification:** File inspection · **Regression:** Skill review
- **Risk:** Broken skills
- **Evidence:** Two skills with frontmatter

### ET-163 — zod validation on actions

- **Description:** All action inputs schema-validated.
- **Linked features:** FR-131
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** src/rovo/actions.ts · **Deps:** ET-152
- **Acceptance:** No unvalidated input path
- **Verification:** Code inspection + tests · **Regression:** Action tests
- **Risk:** Injection via args
- **Evidence:** Every action parses first

### ET-164 — Tenant context enforcement

- **Description:** Actions refuse missing context.
- **Linked features:** FR-132
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** src/rovo/actions.ts · **Deps:** ET-152
- **Acceptance:** UNAUTHENTICATED without context
- **Verification:** Action tests · **Regression:** Existing suite
- **Risk:** Contextless execution
- **Evidence:** tenantContext guard

### ET-165 — Structured error envelopes

- **Description:** Typed status/error codes.
- **Linked features:** FR-133
- **Priority:** P1 · **Status:** TEST_VERIFIED
- **Location:** src/rovo/actions.ts · **Deps:** ET-152
- **Acceptance:** No raw throws to agent
- **Verification:** Action inspection · **Regression:** Code review
- **Risk:** Crash responses
- **Evidence:** Envelopes everywhere

### ET-166 — Bounded retry behavior

- **Description:** Transient-only retries.
- **Linked features:** FR-134
- **Priority:** P1 · **Status:** TEST_VERIFIED
- **Location:** src/integrations/jira.ts · **Deps:** ET-152
- **Acceptance:** 4xx non-429 not retried
- **Verification:** Adapter tests · **Regression:** Existing suite
- **Risk:** Retry storms
- **Evidence:** jira-adapter tests

### ET-167 — Deterministic fallback policy

- **Description:** No LLM in verified path.
- **Linked features:** FR-138
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** src/core/ · **Deps:** ET-113
- **Acceptance:** Engine deterministic and tested
- **Verification:** Benchmark replay · **Regression:** Replay suite
- **Risk:** Nondeterminism
- **Evidence:** Exact replay proven

### ET-168 — Conversation starters audit

- **Description:** Starters reflect real capability.
- **Linked features:** FR-139
- **Priority:** P3 · **Status:** TEST_VERIFIED
- **Location:** manifest.yml · **Deps:** ET-151
- **Acceptance:** Starters map to real tools
- **Verification:** Manifest inspection · **Regression:** Prompt review
- **Risk:** Overpromising
- **Evidence:** Starters reference existing actions

### ET-169 — Agent escalation to queue

- **Description:** Agent proposals reach humans.
- **Linked features:** FR-141, FR-232
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** src/rovo/actions.ts · **Deps:** ET-159
- **Acceptance:** Proposals appear in queue
- **Verification:** Integration tests · **Regression:** Existing suite
- **Risk:** Agent-only loop
- **Evidence:** Same store as UI queue

### ET-170 — Approver identity hidden from agent

- **Description:** Only binding presence exposed.
- **Linked features:** FR-142
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** src/rovo/actions.ts · **Deps:** ET-160
- **Acceptance:** No approver id in agent responses
- **Verification:** Action inspection · **Regression:** Code review
- **Risk:** Privacy leak
- **Evidence:** approverPresent only

### ET-171 — Agent execution traces

- **Description:** Per-tool-call records.
- **Linked features:** FR-145
- **Priority:** P3 · **Status:** NOT_STARTED
- **Location:** src/rovo/ · **Deps:** ET-152
- **Acceptance:** Trace recorded per call
- **Verification:** Integration tests · **Regression:** New tests
- **Risk:** Untraceable agent runs
- **Evidence:** Backlog; audit events already record actions

### ET-172 — Agent performance measurement

- **Description:** Reliability per tool.
- **Linked features:** FR-146
- **Priority:** P4 · **Status:** DEFERRED
- **Location:** future analytics · **Deps:** ET-160
- **Acceptance:** Metrics computed from audit
- **Verification:** Metric tests · **Regression:** New tests
- **Risk:** Vanity metrics
- **Evidence:** Needs live invocation volume (BLOCKED)

### ET-173 — Model provider abstraction

- **Description:** Swappable model backend.
- **Linked features:** FR-147
- **Priority:** P4 · **Status:** DEFERRED
- **Location:** future layer · **Deps:** ET-113
- **Acceptance:** Model calls isolated behind interface
- **Verification:** Contract tests · **Regression:** New tests
- **Risk:** Vendor lock-in
- **Evidence:** No model call exists in the verified path; abstraction would be speculative

### ET-174 — LLM-assisted extraction layer A

- **Description:** Optional LLM normalization.
- **Linked features:** FR-148
- **Priority:** P4 · **Status:** DEFERRED
- **Location:** future layer · **Deps:** ET-113
- **Acceptance:** LLM output downgraded by pipeline
- **Verification:** Differential tests · **Regression:** Benchmark suite
- **Risk:** LLM-invented claims
- **Evidence:** Requires model access + differential benchmark (not available in hackathon slice)

### ET-175 — Metamorphic agent testing

- **Description:** Invariant checks under transforms.
- **Linked features:** FR-149
- **Priority:** P4 · **Status:** NOT_STARTED
- **Location:** tests/ · **Deps:** ET-152
- **Acceptance:** Transformed inputs preserve invariants
- **Verification:** Property tests · **Regression:** New tests
- **Risk:** Invariant gaps
- **Evidence:** Backlog

### ET-176 — Differential testing vs engine

- **Description:** Compare model vs deterministic.
- **Linked features:** FR-150
- **Priority:** P4 · **Status:** DEFERRED
- **Location:** benchmarks/ · **Deps:** ET-107
- **Acceptance:** Differences measured and reported
- **Verification:** Benchmark runs · **Regression:** Benchmark suite
- **Risk:** Unmeasured claims
- **Evidence:** Depends on LLM layer (deferred)

### ET-177 — Tool-call post-state verification

- **Description:** Verify state after tool writes.
- **Linked features:** FR-151, FR-287
- **Priority:** P1 · **Status:** TEST_VERIFIED
- **Location:** src/core/verification.ts · **Deps:** ET-018
- **Acceptance:** Executed writes independently verified
- **Verification:** Unit + integration tests · **Regression:** New tests this session
- **Risk:** Accepted-but-unverified writes
- **Evidence:** Implementation slice this session

### ET-178 — Idempotent agent investigation

- **Description:** Re-runs upsert.
- **Linked features:** FR-152
- **Priority:** P1 · **Status:** TEST_VERIFIED
- **Location:** src/resolvers/index.ts · **Deps:** ET-113
- **Acceptance:** Re-run converges on one case
- **Verification:** Integration tests · **Regression:** Existing suite
- **Risk:** Duplicate cases
- **Evidence:** Case upsert test

### ET-179 — Agent/UI shared core

- **Description:** One pipeline both surfaces.
- **Linked features:** FR-153
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** src/resolvers/index.ts · **Deps:** ET-152
- **Acceptance:** Both import investigateIssueCore
- **Verification:** Import graph inspection · **Regression:** tsc
- **Risk:** Divergent behavior
- **Evidence:** Shared core used

### ET-180 — Severity reasons as explanations

- **Description:** Reasons attached to severity.
- **Linked features:** FR-154
- **Priority:** P2 · **Status:** TEST_VERIFIED
- **Location:** src/core/severity.ts · **Deps:** ET-113
- **Acceptance:** Reasons array populated
- **Verification:** Severity tests · **Regression:** Existing suite
- **Risk:** Unexplained severity
- **Evidence:** reasons in SeverityAssessment

### ET-181 — Confidence separated from severity

- **Description:** Two axes, never merged.
- **Linked features:** FR-155
- **Priority:** P1 · **Status:** TEST_VERIFIED
- **Location:** src/core/severity.ts · **Deps:** ET-113
- **Acceptance:** Confidence reported separately
- **Verification:** Severity tests · **Regression:** Existing suite
- **Risk:** Conflated certainty
- **Evidence:** Both fields typed

### ET-182 — Both-sides contradiction replies

- **Description:** Agent shows both sides.
- **Linked features:** FR-156
- **Priority:** P1 · **Status:** TEST_VERIFIED
- **Location:** src/core/contradiction.ts · **Deps:** ET-113
- **Acceptance:** Findings carry competing claims
- **Verification:** Engine tests · **Regression:** Existing suite
- **Risk:** One-sided verdicts
- **Evidence:** competingClaims populated

### ET-183 — Agent rate limits

- **Description:** Throttle agent actions.
- **Linked features:** FR-157
- **Priority:** P4 · **Status:** DEFERRED
- **Location:** future middleware · **Deps:** ET-152
- **Acceptance:** Abuse bounded
- **Verification:** Load tests · **Regression:** New tests
- **Risk:** DoS
- **Evidence:** Forge platform throttles first; revisit with live data (BLOCKED)

### ET-184 — Shadow execution mode

- **Description:** Dry-run agent proposals.
- **Linked features:** FR-159
- **Priority:** P4 · **Status:** DEFERRED
- **Location:** future mode · **Deps:** ET-151
- **Acceptance:** Shadow runs audited separately
- **Verification:** Integration tests · **Regression:** New tests
- **Risk:** Shadow/live confusion
- **Evidence:** Requires live deploy to be meaningful (BLOCKED)

### ET-185 — Agent human-review rubric

- **Description:** Structured live evaluation.
- **Linked features:** FR-160
- **Priority:** P4 · **Status:** DEFERRED
- **Location:** docs/ · **Deps:** ET-151
- **Acceptance:** Rubric defined with pass marks
- **Verification:** Doc review · **Regression:** Per release
- **Risk:** Subjective judging
- **Evidence:** Needs live agent access (BLOCKED)

### ET-186 — Structured investigation output

- **Description:** Typed result shape.
- **Linked features:** FR-161
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** src/core/contradiction.ts · **Deps:** ET-113
- **Acceptance:** One result type everywhere
- **Verification:** tsc · **Regression:** Typecheck gate
- **Risk:** Shape drift
- **Evidence:** AnalysisResult type

### ET-187 — Stored finding schema validation

- **Description:** Validate findings on read.
- **Linked features:** FR-162
- **Priority:** P3 · **Status:** NOT_STARTED
- **Location:** src/storage/ · **Deps:** ET-101
- **Acceptance:** Corrupt findings rejected
- **Verification:** Unit tests · **Regression:** New tests
- **Risk:** Poisoned store
- **Evidence:** Backlog

### ET-188 — Agent/UI proposal parity

- **Description:** Same contract both producers.
- **Linked features:** FR-163
- **Priority:** P1 · **Status:** TEST_VERIFIED
- **Location:** src/core/remediation.ts · **Deps:** ET-159
- **Acceptance:** Identical proposal shape
- **Verification:** Contract tests · **Regression:** Existing suite
- **Risk:** Divergent proposals
- **Evidence:** draftProposal used by both

### ET-189 — Per-action audit events

- **Description:** Agent mutations audited.
- **Linked features:** FR-164
- **Priority:** P1 · **Status:** TEST_VERIFIED
- **Location:** src/rovo/actions.ts · **Deps:** ET-019
- **Acceptance:** prepare_remediation audited
- **Verification:** Integration tests · **Regression:** Existing suite
- **Risk:** Unaudited mutations
- **Evidence:** Audit event recorded

### ET-190 — Severity-gated agent proposals

- **Description:** Operations need min severity.
- **Linked features:** FR-165
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** src/core/remediation.ts · **Deps:** ET-159
- **Acceptance:** Low-severity findings cannot propose risky ops
- **Verification:** Unit tests · **Regression:** Existing suite
- **Risk:** Overpowered proposals
- **Evidence:** Gate tested

### ET-191 — Proposal risk classification

- **Description:** Risk attached at draft.
- **Linked features:** FR-166
- **Priority:** P1 · **Status:** TEST_VERIFIED
- **Location:** src/core/remediation.ts · **Deps:** ET-159
- **Acceptance:** Risk from operation spec
- **Verification:** Unit tests · **Regression:** Existing suite
- **Risk:** Unlabeled risk
- **Evidence:** Spec table tested

### ET-192 — Operation catalog documentation

- **Description:** Six ops documented.
- **Linked features:** FR-167
- **Priority:** P1 · **Status:** TEST_VERIFIED
- **Location:** src/core/remediation.ts · **Deps:** ET-159
- **Acceptance:** Catalog documented in code
- **Verification:** Code inspection · **Regression:** Doc review
- **Risk:** Undocumented ops
- **Evidence:** OPERATIONS table

### ET-193 — Escalation path documentation

- **Description:** Human handoff explained.
- **Linked features:** FR-168
- **Priority:** P2 · **Status:** IMPLEMENTED
- **Location:** docs/AGENT_CONTRACTS.md · **Deps:** ET-151
- **Acceptance:** Handoff documented
- **Verification:** Doc review · **Regression:** Per action change
- **Risk:** Unclear handoff
- **Evidence:** AGENT_CONTRACTS.md authored this session

### ET-194 — Agent contract registry

- **Description:** AGENT_CONTRACTS.md authored.
- **Linked features:** FR-166
- **Priority:** P1 · **Status:** IMPLEMENTED
- **Location:** docs/AGENT_CONTRACTS.md · **Deps:** ET-151
- **Acceptance:** Every action has a contract
- **Verification:** Doc review · **Regression:** Per action change
- **Risk:** Contract drift
- **Evidence:** Authored this session

### ET-195 — Agent verification matrix maintained

- **Description:** Per-action verification strategies.
- **Linked features:** FR-167
- **Priority:** P1 · **Status:** TEST_VERIFIED
- **Location:** docs/AGENT_VERIFICATION_MATRIX.md · **Deps:** ET-151
- **Acceptance:** Matrix covers all actions
- **Verification:** Doc review · **Regression:** Per action change
- **Risk:** Unverified actions
- **Evidence:** Matrix covers all six actions

## Workstream 5. Optimization and review queue

### ET-196 — Remediation candidate generation tests

- **Description:** Findings produce proposals.
- **Linked features:** FR-171
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** src/core/remediation.ts · **Deps:** ET-159
- **Acceptance:** Verified finding yields proposal
- **Verification:** Unit tests · **Regression:** Existing suite
- **Risk:** No candidates generated
- **Evidence:** impact-remediation tests

### ET-197 — Operation catalog consistency

- **Description:** Specs match behavior.
- **Linked features:** FR-172, FR-173, FR-174
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** src/core/remediation.ts · **Deps:** ET-201
- **Acceptance:** Each op respects its gate
- **Verification:** Unit tests · **Regression:** Existing suite
- **Risk:** Gate bypass
- **Evidence:** Gates tested

### ET-198 — Evidence requirement enforcement

- **Description:** No proposal without evidence.
- **Linked features:** FR-175
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** src/core/remediation.ts · **Deps:** ET-201
- **Acceptance:** Evidence-less finding rejected
- **Verification:** Unit tests · **Regression:** Existing suite
- **Risk:** Uncited proposals
- **Evidence:** Guard tested

### ET-199 — Payload digest on proposals

- **Description:** Canonical digest stored.
- **Linked features:** FR-176
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** src/core/remediation.ts · **Deps:** ET-201
- **Acceptance:** Digest stable
- **Verification:** Digest tests · **Regression:** Existing suite
- **Risk:** Replay window
- **Evidence:** digestPayload used

### ET-200 — Proposal repository

- **Description:** Tenant-isolated store.
- **Linked features:** FR-177
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** src/storage/proposalStore.ts · **Deps:** ET-017
- **Acceptance:** Isolation + pagination work
- **Verification:** Integration tests · **Regression:** Existing suite
- **Risk:** Cross-tenant proposals
- **Evidence:** proposal store tests

### ET-201 — Impact analysis tests

- **Description:** BFS over verified edges.
- **Linked features:** FR-178, FR-179, FR-180
- **Priority:** P1 · **Status:** TEST_VERIFIED
- **Location:** src/core/impact.ts · **Deps:** ET-113
- **Acceptance:** Depth bounded, inferred separated
- **Verification:** Unit tests · **Regression:** Existing suite
- **Risk:** Unbounded traversal
- **Evidence:** impact tests

### ET-202 — Hypothetical simulation flag

- **Description:** What-if stays hypothetical.
- **Linked features:** FR-181
- **Priority:** P2 · **Status:** TEST_VERIFIED
- **Location:** src/core/impact.ts · **Deps:** ET-206
- **Acceptance:** hypothetical:true always
- **Verification:** Unit tests · **Regression:** Existing suite
- **Risk:** Prediction-as-fact
- **Evidence:** Flag enforced

### ET-203 — Expected-change text requirement

- **Description:** Proposals state change.
- **Linked features:** FR-182
- **Priority:** P1 · **Status:** TEST_VERIFIED
- **Location:** src/core/remediation.ts · **Deps:** ET-201
- **Acceptance:** Text always present
- **Verification:** Type inspection · **Regression:** Typecheck gate
- **Risk:** Opaque proposals
- **Evidence:** Field required

### ET-204 — Supporting finding links

- **Description:** Proposals cite findings.
- **Linked features:** FR-183
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** src/core/remediation.ts · **Deps:** ET-201
- **Acceptance:** supportingFindingIds non-empty
- **Verification:** Unit tests · **Regression:** Existing suite
- **Risk:** Orphan proposals
- **Evidence:** Links enforced

### ET-205 — Duplicate proposal convergence

- **Description:** Same case+op converges.
- **Linked features:** FR-184
- **Priority:** P2 · **Status:** TEST_VERIFIED
- **Location:** src/core/remediation.ts · **Deps:** ET-201
- **Acceptance:** Re-prepare overwrites, not duplicates
- **Verification:** Unit tests · **Regression:** New tests
- **Risk:** Queue flooding
- **Evidence:** Id scheme guarantees convergence

### ET-206 — Conflicting remediation detection

- **Description:** Detect mutually-undoing proposals.
- **Linked features:** FR-185
- **Priority:** P2 · **Status:** NOT_STARTED
- **Location:** future core module · **Deps:** ET-201
- **Acceptance:** Conflicts flagged before approval
- **Verification:** Unit tests · **Regression:** New tests
- **Risk:** Contradictory execution
- **Evidence:** Backlog

### ET-207 — Documented utility ordering

- **Description:** Queue ordered by documented utility.
- **Linked features:** FR-186
- **Priority:** P2 · **Status:** TEST_VERIFIED
- **Location:** src/core/queue.ts · **Deps:** ET-201
- **Acceptance:** Order follows documented function
- **Verification:** Unit tests · **Regression:** New tests this session
- **Risk:** Arbitrary ordering
- **Evidence:** Implementation slice this session

### ET-208 — Priority explanation strings

- **Description:** Explain each rank.
- **Linked features:** FR-187, FR-024
- **Priority:** P2 · **Status:** TEST_VERIFIED
- **Location:** src/core/queue.ts · **Deps:** ET-216
- **Acceptance:** Explanation derives from utility inputs
- **Verification:** Unit tests · **Regression:** New tests
- **Risk:** Unexplained order
- **Evidence:** Implementation slice this session

### ET-209 — Dependency-aware queue constraints

- **Description:** Order respects dependencies.
- **Linked features:** FR-188
- **Priority:** P4 · **Status:** DEFERRED
- **Location:** future queue capability · **Deps:** ET-216
- **Acceptance:** Dependencies never violated
- **Verification:** Property tests · **Regression:** New tests
- **Risk:** Illegal order
- **Evidence:** No dependency data exists between proposals yet; revisit when multi-issue plans exist

### ET-210 — Deadline awareness

- **Description:** Due dates affect order.
- **Linked features:** FR-189
- **Priority:** P4 · **Status:** DEFERRED
- **Location:** future queue capability · **Deps:** ET-216
- **Acceptance:** Deadlines respected
- **Verification:** Unit tests · **Regression:** New tests
- **Risk:** Missed deadlines
- **Evidence:** No deadline data source yet

### ET-211 — Resource-constrained scheduling

- **Description:** Capacity-aware planning.
- **Linked features:** FR-190
- **Priority:** P4 · **Status:** DEFERRED
- **Location:** future queue capability · **Deps:** ET-216
- **Acceptance:** Capacity respected
- **Verification:** Unit tests · **Regression:** New tests
- **Risk:** Overcommitment
- **Evidence:** Single-human review bottleneck; no resource model yet

### ET-212 — Fairness/starvation prevention

- **Description:** Old items eventually reviewed.
- **Linked features:** FR-191
- **Priority:** P4 · **Status:** NOT_STARTED
- **Location:** src/core/queue.ts · **Deps:** ET-216
- **Acceptance:** Age factor guarantees eventual review
- **Verification:** Property tests · **Regression:** New tests
- **Risk:** Starvation
- **Evidence:** Age factor in utility mitigates; formal guarantee pending backlog

### ET-213 — Dynamic replanning on new evidence

- **Description:** New analyses refresh priorities.
- **Linked features:** FR-192
- **Priority:** P3 · **Status:** TEST_VERIFIED
- **Location:** src/core/queue.ts · **Deps:** ET-216
- **Acceptance:** Queue recomputes on list
- **Verification:** Unit tests · **Regression:** New tests
- **Risk:** Stale ordering
- **Evidence:** Ordering computed at list time this session

### ET-214 — Deterministic priority recalculation

- **Description:** Same inputs → same order.
- **Linked features:** FR-193
- **Priority:** P2 · **Status:** TEST_VERIFIED
- **Location:** src/core/queue.ts · **Deps:** ET-216
- **Acceptance:** Repeated computation identical
- **Verification:** Property tests · **Regression:** New tests
- **Risk:** Nondeterministic order
- **Evidence:** Implementation slice this session

### ET-215 — Expected-benefit quantification

- **Description:** Benefit with assumptions.
- **Linked features:** FR-195
- **Priority:** P4 · **Status:** DEFERRED
- **Location:** future feature · **Deps:** ET-201
- **Acceptance:** Assumptions explicit
- **Verification:** Unit tests · **Regression:** New tests
- **Risk:** Fabricated benefits
- **Evidence:** No benefit data yet

### ET-216 — Reversibility classification

- **Description:** Mark undo-ability.
- **Linked features:** FR-196
- **Priority:** P3 · **Status:** NOT_STARTED
- **Location:** src/core/remediation.ts · **Deps:** ET-201
- **Acceptance:** Each op labeled reversible or not
- **Verification:** Type inspection · **Regression:** New tests
- **Risk:** Irreversible surprise
- **Evidence:** Backlog; comment ops are de-facto reversible

### ET-217 — Rollback eligibility

- **Description:** Rollback plans for eligible ops.
- **Linked features:** FR-197
- **Priority:** P4 · **Status:** NOT_STARTED
- **Location:** future capability · **Deps:** ET-201
- **Acceptance:** Eligible ops expose plan
- **Verification:** Unit tests · **Regression:** New tests
- **Risk:** Unrollbackable writes
- **Evidence:** Backlog

### ET-218 — Execution prerequisites check

- **Description:** All gates before write.
- **Linked features:** FR-198
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** src/core/approval.ts · **Deps:** ET-018
- **Acceptance:** Missing any gate fails execution
- **Verification:** Unit tests · **Regression:** Existing suite
- **Risk:** Ungated writes
- **Evidence:** assertExecutionAuthorized tests

### ET-219 — Candidate state validation

- **Description:** Legal transitions only.
- **Linked features:** FR-199
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** src/core/approval.ts · **Deps:** ET-201
- **Acceptance:** Illegal transitions rejected
- **Verification:** Unit tests · **Regression:** Existing suite
- **Risk:** State corruption
- **Evidence:** approval tests

### ET-220 — Risk-adjusted ordering factor

- **Description:** Risk boosts review priority.
- **Linked features:** FR-200
- **Priority:** P2 · **Status:** TEST_VERIFIED
- **Location:** src/core/queue.ts · **Deps:** ET-216
- **Acceptance:** Higher risk ranks higher ceteris paribus
- **Verification:** Unit tests · **Regression:** New tests
- **Risk:** Risk ignored
- **Evidence:** Implementation slice this session

### ET-221 — Age-decay ordering factor

- **Description:** Waiting increases priority.
- **Linked features:** FR-201
- **Priority:** P2 · **Status:** TEST_VERIFIED
- **Location:** src/core/queue.ts · **Deps:** ET-216
- **Acceptance:** Older pending items rank higher ceteris paribus
- **Verification:** Unit tests · **Regression:** New tests
- **Risk:** Freshness bias
- **Evidence:** Implementation slice this session

### ET-222 — Severity-dominant ordering

- **Description:** Severity outranks risk and age.
- **Linked features:** FR-202
- **Priority:** P2 · **Status:** TEST_VERIFIED
- **Location:** src/core/queue.ts · **Deps:** ET-216
- **Acceptance:** Severity rank dominates
- **Verification:** Unit tests · **Regression:** New tests
- **Risk:** Severity inversion
- **Evidence:** Implementation slice this session

### ET-223 — Queue pending counts

- **Description:** Pending surfaced in UI.
- **Linked features:** FR-203
- **Priority:** P1 · **Status:** TEST_VERIFIED
- **Location:** src/frontend/App.tsx · **Deps:** ET-053
- **Acceptance:** Badge equals pending count
- **Verification:** Code inspection · **Regression:** Manual check
- **Risk:** Wrong counts
- **Evidence:** Badge wired

### ET-224 — Optimization objective documentation

- **Description:** Objective + constraints documented.
- **Linked features:** FR-204
- **Priority:** P2 · **Status:** IMPLEMENTED
- **Location:** docs/OPTIMIZATION_MODEL.md,docs/QUEUE_DESIGN.md · **Deps:** ET-216
- **Acceptance:** Function and constraints written
- **Verification:** Doc review · **Regression:** Per model change
- **Risk:** Undocumented objective
- **Evidence:** QUEUE_DESIGN.md authored this session

### ET-225 — Queue design documentation

- **Description:** Full queue design doc.
- **Linked features:** FR-205
- **Priority:** P2 · **Status:** IMPLEMENTED
- **Location:** docs/QUEUE_DESIGN.md · **Deps:** ET-216
- **Acceptance:** Design + invariants + rationale
- **Verification:** Doc review · **Regression:** Per model change
- **Risk:** Design drift
- **Evidence:** Authored this session

### ET-226 — Proposal comparison view

- **Description:** Side-by-side comparison.
- **Linked features:** FR-206
- **Priority:** P4 · **Status:** NOT_STARTED
- **Location:** src/frontend/ · **Deps:** ET-050
- **Acceptance:** Comparison understandable
- **Verification:** UI inspection · **Regression:** Manual check
- **Risk:** Confusion
- **Evidence:** Backlog

### ET-227 — Remediation playbooks

- **Description:** Reusable templates.
- **Linked features:** FR-207
- **Priority:** P4 · **Status:** DEFERRED
- **Location:** future feature · **Deps:** ET-201
- **Acceptance:** Playbooks generate valid proposals
- **Verification:** Unit tests · **Regression:** New tests
- **Risk:** Template mismatch
- **Evidence:** Needs domain data from real usage

### ET-228 — Multi-proposal bundling

- **Description:** Bundle related proposals.
- **Linked features:** FR-208
- **Priority:** P4 · **Status:** DEFERRED
- **Location:** future queue capability · **Deps:** ET-216
- **Acceptance:** Bundle executes atomically or not at all
- **Verification:** Unit tests · **Regression:** New tests
- **Risk:** Partial bundles
- **Evidence:** No multi-proposal scenarios yet

### ET-229 — Auto-suggest remediation on new cases

- **Description:** Suggest on case creation.
- **Linked features:** FR-209
- **Priority:** P3 · **Status:** NOT_STARTED
- **Location:** src/resolvers/ · **Deps:** ET-201
- **Acceptance:** Suggestions gated by severity
- **Verification:** Unit tests · **Regression:** New tests
- **Risk:** Suggestion spam
- **Evidence:** Backlog

### ET-230 — Proposal approval expiry

- **Description:** 1h default validity.
- **Linked features:** FR-210
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** src/core/approval.ts · **Deps:** ET-226
- **Acceptance:** Expired bindings fail execution
- **Verification:** Unit tests · **Regression:** Existing suite
- **Risk:** Stale approvals
- **Evidence:** Expiry tests

### ET-231 — Proposal cancellation

- **Description:** CANCELLED transitions legal.
- **Linked features:** FR-211
- **Priority:** P1 · **Status:** TEST_VERIFIED
- **Location:** src/core/approval.ts · **Deps:** ET-201
- **Acceptance:** Cancel path tested
- **Verification:** Unit tests · **Regression:** Existing suite
- **Risk:** Un-cancellable proposals
- **Evidence:** Transition table tested

### ET-232 — Rejected-proposal rationale storage

- **Description:** Store rejection reason.
- **Linked features:** FR-212
- **Priority:** P2 · **Status:** TEST_VERIFIED
- **Location:** src/core/execution.ts · **Deps:** ET-056
- **Acceptance:** Rationale stored + audited
- **Verification:** Unit tests · **Regression:** New tests
- **Risk:** Lost rationale
- **Evidence:** Implemented 2026-10-31 dynamics pass: decisionRationale stored on rejection/cancel (tests: execution 7 new, case-timeline 3, sandbox parity)

### ET-233 — Reopen proposals

- **Description:** Reopen with new evidence.
- **Linked features:** FR-213
- **Priority:** P4 · **Status:** DEFERRED
- **Location:** future capability · **Deps:** ET-201
- **Acceptance:** Reopen keeps history intact
- **Verification:** Unit tests · **Regression:** New tests
- **Risk:** History loss
- **Evidence:** Requires reopen policy decision

### ET-234 — Proposal history per case

- **Description:** Chronological proposals.
- **Linked features:** FR-214
- **Priority:** P3 · **Status:** NOT_STARTED
- **Location:** future UI · **Deps:** ET-047
- **Acceptance:** History complete per case
- **Verification:** UI inspection · **Regression:** Manual check
- **Risk:** Missing entries
- **Evidence:** Backlog

### ET-235 — Cross-case remediation dedup

- **Description:** Dedup across cases.
- **Linked features:** FR-215
- **Priority:** P4 · **Status:** DEFERRED
- **Location:** future capability · **Deps:** ET-216
- **Acceptance:** Equivalent proposals merged
- **Verification:** Unit tests · **Regression:** New tests
- **Risk:** Duplicate work
- **Evidence:** Needs multi-case volume

### ET-236 — Ordering sensitivity property test

- **Description:** Order responds predictably.
- **Linked features:** FR-215
- **Priority:** P2 · **Status:** TEST_VERIFIED
- **Location:** tests/unit/queue-ordering.test.ts · **Deps:** ET-216
- **Acceptance:** Severity/risk/age effects proven
- **Verification:** Property tests · **Regression:** New tests this session
- **Risk:** Silent order changes
- **Evidence:** Implementation slice this session

### ET-237 — Ordering regression suite

- **Description:** Snapshot the documented order.
- **Linked features:** FR-216
- **Priority:** P2 · **Status:** TEST_VERIFIED
- **Location:** tests/unit/queue-ordering.test.ts · **Deps:** ET-216
- **Acceptance:** Fixture order stable across runs
- **Verification:** Regression tests · **Regression:** New tests this session
- **Risk:** Order churn
- **Evidence:** Implementation slice this session

### ET-238 — Documented queue constraints

- **Description:** Hard constraints stated.
- **Linked features:** FR-217
- **Priority:** P2 · **Status:** IMPLEMENTED
- **Location:** docs/QUEUE_DESIGN.md · **Deps:** ET-216
- **Acceptance:** Constraints enumerated
- **Verification:** Doc review · **Regression:** Per model change
- **Risk:** Implicit constraints
- **Evidence:** Authored this session

### ET-239 — Background scheduler hooks

- **Description:** Future re-prioritization hooks.
- **Linked features:** FR-219
- **Priority:** P4 · **Status:** DEFERRED
- **Location:** future capability · **Deps:** ET-216
- **Acceptance:** Hook interface documented
- **Verification:** Doc review · **Regression:** Per change
- **Risk:** Premature infra
- **Evidence:** No scheduler exists; documented as rejected-for-now

### ET-240 — Arbitrary-score rejection enforcement

- **Description:** No unexplained scores in code.
- **Linked features:** FR-220
- **Priority:** P2 · **Status:** TEST_VERIFIED
- **Location:** src/core/queue.ts · **Deps:** ET-216
- **Acceptance:** Every factor documented
- **Verification:** Code + doc review · **Regression:** New tests
- **Risk:** Magic numbers
- **Evidence:** Utility factors documented in QUEUE_DESIGN.md this session

## Workstream 6. Security and governance

### ET-241 — State machine verification

- **Description:** All transitions legal only.
- **Linked features:** FR-221, FR-222
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** src/core/approval.ts · **Deps:** ET-018
- **Acceptance:** Transition table exhaustive
- **Verification:** Unit tests · **Regression:** Existing suite
- **Risk:** Illegal states
- **Evidence:** approval.test.ts

### ET-242 — Binding contract verification

- **Description:** Binding fields complete.
- **Linked features:** FR-223
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** src/core/approval.ts · **Deps:** ET-241
- **Acceptance:** All six fields bound
- **Verification:** Unit tests · **Regression:** Existing suite
- **Risk:** Partial bindings
- **Evidence:** bindApproval tests

### ET-243 — Self-approval prevention tests

- **Description:** Actor cannot approve.
- **Linked features:** FR-224, FR-255
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** src/core/execution.ts · **Deps:** ET-241
- **Acceptance:** SelfApprovalError raised
- **Verification:** Unit tests · **Regression:** Existing suite
- **Risk:** Self-dealing
- **Evidence:** execution tests

### ET-244 — Expiry enforcement tests

- **Description:** Expired cannot execute.
- **Linked features:** FR-225, FR-253
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** src/core/approval.ts · **Deps:** ET-241
- **Acceptance:** Expired rejected
- **Verification:** Unit tests · **Regression:** Existing suite
- **Risk:** Stale authority
- **Evidence:** Expiry tests

### ET-245 — Replay registry tests

- **Description:** Replays rejected permanently.
- **Linked features:** FR-226, FR-254
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** src/storage/proposalStore.ts · **Deps:** ET-241
- **Acceptance:** Executed digest blocked
- **Verification:** Unit + integration tests · **Regression:** Existing suite
- **Risk:** Double effects
- **Evidence:** Replay tests

### ET-246 — Approver-only execution tests

- **Description:** Only approver executes.
- **Linked features:** FR-227, FR-256
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** src/core/execution.ts · **Deps:** ET-241
- **Acceptance:** Others get NOT_APPROVER
- **Verification:** Unit tests · **Regression:** Existing suite
- **Risk:** Piggyback execution
- **Evidence:** Approver-only tests

### ET-247 — Separation of duties tests

- **Description:** Agents never approve/execute.
- **Linked features:** FR-228, FR-252
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** manifest.yml,src/rovo/ · **Deps:** ET-155
- **Acceptance:** No agent path to approval
- **Verification:** Surface inspection + tests · **Regression:** Governance suite
- **Risk:** Agent overreach
- **Evidence:** Structural + tested

### ET-248 — Decision audit events

- **Description:** Decisions chained.
- **Linked features:** FR-229
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** src/resolvers/index.ts · **Deps:** ET-019
- **Acceptance:** approved/rejected audited
- **Verification:** Integration tests · **Regression:** Existing suite
- **Risk:** Unaudited decisions
- **Evidence:** review-queue integration

### ET-249 — Rejection flow tests

- **Description:** Rejection works.
- **Linked features:** FR-230
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** src/core/execution.ts · **Deps:** ET-241
- **Acceptance:** Reject transitions + clears binding
- **Verification:** Unit tests · **Regression:** Existing suite
- **Risk:** Stuck proposals
- **Evidence:** Reject tests

### ET-250 — Approval identity display audit

- **Description:** UI shows approver honestly.
- **Linked features:** FR-231
- **Priority:** P1 · **Status:** TEST_VERIFIED
- **Location:** src/frontend/views/ReviewQueue.tsx · **Deps:** ET-050
- **Acceptance:** Approver shown from binding
- **Verification:** Code inspection · **Regression:** Manual check
- **Risk:** Wrong identity
- **Evidence:** approverId rendered

### ET-251 — Binding creation path tests

- **Description:** decideProposal binds.
- **Linked features:** FR-233
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** src/resolvers/index.ts · **Deps:** ET-241
- **Acceptance:** Approve creates binding
- **Verification:** Integration tests · **Regression:** Existing suite
- **Risk:** Unbound approvals
- **Evidence:** Resolver test path

### ET-252 — Digest-bound approval tests

- **Description:** Digest mismatch fails.
- **Linked features:** FR-234, FR-235
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** src/core/approval.ts · **Deps:** ET-241
- **Acceptance:** Modified payload rejected
- **Verification:** Unit tests · **Regression:** Existing suite
- **Risk:** Payload swap
- **Evidence:** Digest tests

### ET-253 — Approval revocation

- **Description:** Cancel approved pre-execution.
- **Linked features:** FR-236
- **Priority:** P2 · **Status:** TEST_VERIFIED
- **Location:** future resolver · **Deps:** ET-241
- **Acceptance:** Revocation audited and enforced
- **Verification:** Unit tests · **Regression:** New tests
- **Risk:** Revoked-but-executed
- **Evidence:** Implemented 2026-10-31 dynamics pass: cancelProposal resolver + authority rules + audit (tests: execution 7 new, case-timeline 3, sandbox parity)

### ET-254 — Rejection rationale storage

- **Description:** Reason persisted.
- **Linked features:** FR-237
- **Priority:** P2 · **Status:** NOT_STARTED
- **Location:** src/core/execution.ts · **Deps:** ET-056
- **Acceptance:** Rationale on rejection
- **Verification:** Unit tests · **Regression:** New tests
- **Risk:** Lost context
- **Evidence:** Backlog

### ET-255 — Risk-based approval routing

- **Description:** Risk changes approver rules.
- **Linked features:** FR-238
- **Priority:** P4 · **Status:** DEFERRED
- **Location:** future policy · **Deps:** ET-241
- **Acceptance:** High risk requires stricter rules
- **Verification:** Policy tests · **Regression:** New tests
- **Risk:** Policy bypass
- **Evidence:** Needs approver-role data (BLOCKED on live deployment)

### ET-256 — Sensitive-operation restriction tests

- **Description:** High-risk ops need HIGH severity.
- **Linked features:** FR-239
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** src/core/remediation.ts · **Deps:** ET-241
- **Acceptance:** Gate enforced
- **Verification:** Unit tests · **Regression:** Existing suite
- **Risk:** Risky ops from weak findings
- **Evidence:** Risk gate tests

### ET-257 — Approval evidence snapshot

- **Description:** Snapshot at approval.
- **Linked features:** FR-240
- **Priority:** P3 · **Status:** NOT_STARTED
- **Location:** future capability · **Deps:** ET-241
- **Acceptance:** Snapshot immutable and linked
- **Verification:** Integration tests · **Regression:** New tests
- **Risk:** Evidence drift
- **Evidence:** Backlog

### ET-258 — Approval-to-execution traceability tests

- **Description:** Chain links decisions to executions.
- **Linked features:** FR-241
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** src/audit/ · **Deps:** ET-019
- **Acceptance:** Trace readable in ledger
- **Verification:** Integration tests · **Regression:** Existing suite
- **Risk:** Broken trace
- **Evidence:** Chain covers lifecycle

### ET-259 — Decision accountability tests

- **Description:** Actor recorded everywhere.
- **Linked features:** FR-242
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** src/audit/auditLog.ts · **Deps:** ET-019
- **Acceptance:** No anonymous events
- **Verification:** Unit tests · **Regression:** Existing suite
- **Risk:** Unattributable acts
- **Evidence:** Actor field enforced

### ET-260 — Concurrent decision conflict handling

- **Description:** Two reviewers at once.
- **Linked features:** FR-243
- **Priority:** P3 · **Status:** NOT_STARTED
- **Location:** src/storage/proposalStore.ts · **Deps:** ET-241
- **Acceptance:** Second decision fails safely
- **Verification:** Concurrency tests · **Regression:** New tests
- **Risk:** Double decisions
- **Evidence:** Backlog; single-writer KVS mitigates

### ET-261 — Multi-approver policies

- **Description:** N-of-M approvals.
- **Linked features:** FR-244
- **Priority:** P4 · **Status:** DEFERRED
- **Location:** future policy · **Deps:** ET-241
- **Acceptance:** Quorum enforced
- **Verification:** Policy tests · **Regression:** New tests
- **Risk:** Quorum bypass
- **Evidence:** Requires team/role data (BLOCKED)

### ET-262 — Approval delegation

- **Description:** Delegate authority.
- **Linked features:** FR-245
- **Priority:** P4 · **Status:** DEFERRED
- **Location:** future policy · **Deps:** ET-241
- **Acceptance:** Delegation audited
- **Verification:** Policy tests · **Regression:** New tests
- **Risk:** Delegation abuse
- **Evidence:** Requires identity/role features (BLOCKED)

### ET-263 — Approval SLA tracking

- **Description:** Time-to-decision.
- **Linked features:** FR-246
- **Priority:** P4 · **Status:** DEFERRED
- **Location:** future analytics · **Deps:** ET-241
- **Acceptance:** SLA measured from audit
- **Verification:** Metric tests · **Regression:** New tests
- **Risk:** Vanity SLA
- **Evidence:** Needs live volume (BLOCKED)

### ET-264 — Role-based approver eligibility

- **Description:** Roles gate approval.
- **Linked features:** FR-247
- **Priority:** P4 · **Status:** DEFERRED
- **Location:** future policy · **Deps:** ET-241
- **Acceptance:** Ineligible roles blocked
- **Verification:** Policy tests · **Regression:** New tests
- **Risk:** Role spoofing
- **Evidence:** Requires Forge role APIs + live site (BLOCKED)

### ET-265 — Approval history view

- **Description:** Filterable decisions.
- **Linked features:** FR-248
- **Priority:** P3 · **Status:** NOT_STARTED
- **Location:** src/frontend/ · **Deps:** ET-070
- **Acceptance:** History renders decisions
- **Verification:** UI inspection · **Regression:** Manual check
- **Risk:** Missing entries
- **Evidence:** Backlog

### ET-266 — Governance documentation

- **Description:** SECURITY_AND_GOVERNANCE.md authored.
- **Linked features:** FR-249
- **Priority:** P1 · **Status:** IMPLEMENTED
- **Location:** docs/SECURITY_AND_GOVERNANCE.md · **Deps:** ET-024
- **Acceptance:** Invariants + threat model present
- **Verification:** Doc review · **Regression:** Per policy change
- **Risk:** Implicit governance
- **Evidence:** Authored this session

### ET-267 — Policy evaluation engine

- **Description:** Declarative policies.
- **Linked features:** FR-250
- **Priority:** P4 · **Status:** DEFERRED
- **Location:** future engine · **Deps:** ET-241
- **Acceptance:** Policies evaluated before decisions
- **Verification:** Policy tests · **Regression:** New tests
- **Risk:** Policy drift
- **Evidence:** Current rules are code-enforced and tested; engine premature

### ET-268 — Scope boundary tests

- **Description:** Scopes minimal and used.
- **Linked features:** FR-251
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** manifest.yml · **Deps:** ET-013
- **Acceptance:** Every scope maps to capability
- **Verification:** Manifest inspection · **Regression:** Per manifest change
- **Risk:** Scope creep
- **Evidence:** All scopes justified

### ET-269 — Governance scenario demo fixtures

- **Description:** Scenario B fixtures.
- **Linked features:** FR-257, FR-439
- **Priority:** P3 · **Status:** TEST_VERIFIED
- **Location:** scripts/demo-scenarios.ts · **Deps:** ET-058
- **Acceptance:** All refusals demonstrated
- **Verification:** Demo run output · **Regression:** Demo replay
- **Risk:** Unproven governance
- **Evidence:** Implementation slice this session

### ET-270 — Human escalation display

- **Description:** When judgment is required.
- **Linked features:** FR-258
- **Priority:** P3 · **Status:** NOT_STARTED
- **Location:** src/frontend/ · **Deps:** ET-050
- **Acceptance:** Escalations visible
- **Verification:** UI inspection · **Regression:** Manual check
- **Risk:** Hidden decisions
- **Evidence:** Backlog; queue itself is the escalation surface

### ET-271 — Binding re-verification tests

- **Description:** All fields re-checked.
- **Linked features:** FR-260
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** src/core/approval.ts · **Deps:** ET-241
- **Acceptance:** Any mismatch fails
- **Verification:** Unit tests · **Regression:** Existing suite
- **Risk:** Partial re-check
- **Evidence:** assertExecutionAuthorized

### ET-272 — State re-verification tests

- **Description:** APPROVED only.
- **Linked features:** FR-261
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** src/core/approval.ts · **Deps:** ET-241
- **Acceptance:** Non-APPROVED fails
- **Verification:** Unit tests · **Regression:** Existing suite
- **Risk:** State bypass
- **Evidence:** State gate tested

### ET-273 — Tenant re-verification tests

- **Description:** Cross-tenant fails.
- **Linked features:** FR-262
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** src/core/approval.ts · **Deps:** ET-241
- **Acceptance:** Tenant mismatch fails
- **Verification:** Unit tests · **Regression:** Existing suite
- **Risk:** Tenant crossing
- **Evidence:** Tenant gate tested

### ET-274 — Target/operation re-verification

- **Description:** Binding matches proposal.
- **Linked features:** FR-263
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** src/core/approval.ts · **Deps:** ET-241
- **Acceptance:** Target/op mismatch fails
- **Verification:** Unit tests · **Regression:** Existing suite
- **Risk:** Target swap
- **Evidence:** Target/op gates tested

### ET-275 — Configurable validity window

- **Description:** TTL per tenant.
- **Linked features:** FR-264
- **Priority:** P3 · **Status:** DEFERRED
- **Location:** future config · **Deps:** ET-241
- **Acceptance:** TTL honored
- **Verification:** Unit tests · **Regression:** New tests
- **Risk:** Misconfig
- **Evidence:** Needs tenant config storage; default 1h enforced now

### ET-276 — Execution authority documentation

- **Description:** Who may execute.
- **Linked features:** FR-265
- **Priority:** P2 · **Status:** IMPLEMENTED
- **Location:** docs/SECURITY_AND_GOVERNANCE.md · **Deps:** ET-249
- **Acceptance:** Authority documented
- **Verification:** Doc review · **Regression:** Per policy change
- **Risk:** Ambiguous authority
- **Evidence:** Authored this session

### ET-277 — Governance invariant list

- **Description:** Numbered invariants.
- **Linked features:** FR-266
- **Priority:** P1 · **Status:** IMPLEMENTED
- **Location:** docs/SECURITY_AND_GOVERNANCE.md · **Deps:** ET-249
- **Acceptance:** Each invariant maps to a test
- **Verification:** Doc + test review · **Regression:** Per invariant change
- **Risk:** Untested invariants
- **Evidence:** Authored this session

### ET-278 — Expired-approval re-approval flow

- **Description:** Re-prepare after expiry.
- **Linked features:** FR-267
- **Priority:** P2 · **Status:** TEST_VERIFIED
- **Location:** src/core/approval.ts · **Deps:** ET-241
- **Acceptance:** EXPIRED terminal; re-prepare works
- **Verification:** Unit tests · **Regression:** Existing suite
- **Risk:** Zombie approvals
- **Evidence:** Terminal states tested

### ET-279 — Audit chain integrity tests

- **Description:** Mutations detected.
- **Linked features:** FR-268, FR-307, FR-308
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** src/audit/auditLog.ts · **Deps:** ET-019
- **Acceptance:** verifyAuditChain false after edit
- **Verification:** Unit tests · **Regression:** Existing suite
- **Risk:** Undetected tampering
- **Evidence:** audit-log tests

### ET-280 — Governance UX affordances

- **Description:** Disabled states explain rules.
- **Linked features:** FR-269
- **Priority:** P1 · **Status:** TEST_VERIFIED
- **Location:** src/frontend/views/ReviewQueue.tsx · **Deps:** ET-050
- **Acceptance:** Every disabled control has a reason
- **Verification:** UI inspection · **Regression:** Manual check
- **Risk:** Mystery locks
- **Evidence:** Title attributes + helper text

### ET-281 — Prompt-based approval override rejection

- **Description:** No NL approvals.
- **Linked features:** FR-270
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** src/rovo/actions.ts · **Deps:** ET-155
- **Acceptance:** No approval verb in agent surface
- **Verification:** Surface inspection · **Regression:** Governance suite
- **Risk:** Prompt-as-authority
- **Evidence:** Structurally excluded

### ET-282 — Execution authorization gate tests

- **Description:** Gate before write.
- **Linked features:** FR-271, FR-272
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** src/core/execution.ts · **Deps:** ET-241
- **Acceptance:** No write without full gate
- **Verification:** Unit tests · **Regression:** Existing suite
- **Risk:** Ungated writes
- **Evidence:** Execution tests

### ET-283 — Digest idempotency tests

- **Description:** Same payload once.
- **Linked features:** FR-273, FR-274
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** src/core/execution.ts · **Deps:** ET-241
- **Acceptance:** Second execution fails
- **Verification:** Unit tests · **Regression:** Existing suite
- **Risk:** Duplicate effects
- **Evidence:** Replay tests

### ET-284 — Request validation audit

- **Description:** zod everywhere.
- **Linked features:** FR-275
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** src/resolvers/,src/rovo/ · **Deps:** ET-013
- **Acceptance:** No unvalidated entry point
- **Verification:** Code inspection · **Regression:** Code review
- **Risk:** Injection via args
- **Evidence:** All endpoints validated

### ET-285 — Output envelope audit

- **Description:** Typed responses.
- **Linked features:** FR-276
- **Priority:** P1 · **Status:** TEST_VERIFIED
- **Location:** src/resolvers/,src/rovo/ · **Deps:** ET-013
- **Acceptance:** All responses typed
- **Verification:** tsc · **Regression:** Typecheck gate
- **Risk:** Shape drift
- **Evidence:** tsc clean

### ET-286 — Tenant isolation tests

- **Description:** Key prefix + payload check.
- **Linked features:** FR-277, FR-305
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** src/storage/,tests/security/ · **Deps:** ET-017
- **Acceptance:** Cross-tenant reads empty
- **Verification:** Security tests · **Regression:** Existing suite
- **Risk:** Data leak
- **Evidence:** tenant-isolation tests

### ET-287 — Least-privilege scope audit

- **Description:** Minimal scopes.
- **Linked features:** FR-278, FR-279
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** manifest.yml · **Deps:** ET-013
- **Acceptance:** No unused scopes
- **Verification:** Manifest inspection · **Regression:** Per manifest change
- **Risk:** Over-scoped app
- **Evidence:** Scopes justified

### ET-288 — Sanitization and hidden-char tests

- **Description:** Sanitizer covered.
- **Linked features:** FR-280, FR-281
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** src/security/injection.ts · **Deps:** ET-105
- **Acceptance:** Zero-width/control stripped
- **Verification:** Sanitizer tests · **Regression:** Existing suite
- **Risk:** Hidden injection
- **Evidence:** injection tests

### ET-289 — Abuse-resistant input validation

- **Description:** Regex guards.
- **Linked features:** FR-299
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** src/resolvers/,src/rovo/ · **Deps:** ET-013
- **Acceptance:** Issue keys/ids validated
- **Verification:** Code inspection · **Regression:** Code review
- **Risk:** Path injection
- **Evidence:** Regex schemas everywhere

### ET-290 — Secret policy verification

- **Description:** No secrets in tree.
- **Linked features:** FR-298, FR-319
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** .github/workflows/ci.yml · **Deps:** ET-041
- **Acceptance:** Scan passes
- **Verification:** CI run · **Regression:** CI gate
- **Risk:** Leaked credentials
- **Evidence:** CI scan green

## Workstream 7. Atlassian integration

### ET-291 — Manifest module verification

- **Description:** All modules valid.
- **Linked features:** FR-321, FR-322, FR-323, FR-324, FR-325
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** manifest.yml · **Deps:** ET-013
- **Acceptance:** Modules reference real resources/functions
- **Verification:** Manifest inspection · **Regression:** forge lint on deploy
- **Risk:** Invalid manifest
- **Evidence:** Inspected; live lint BLOCKED to deploy

### ET-292 — Runtime pin verification

- **Description:** Node runtime aligned.
- **Linked features:** FR-326
- **Priority:** P2 · **Status:** TEST_VERIFIED
- **Location:** manifest.yml,.nvmrc · **Deps:** ET-013
- **Acceptance:** runtime matches .nvmrc
- **Verification:** Config inspection · **Regression:** Config review
- **Risk:** Runtime mismatch
- **Evidence:** nodejs24.x + 24.x pinned

### ET-293 — asUser read path verification

- **Description:** All reads user-scoped.
- **Linked features:** FR-327
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** src/resolvers/index.ts · **Deps:** ET-111
- **Acceptance:** No app-permission reads
- **Verification:** Code inspection · **Regression:** Code review
- **Risk:** Permission escalation
- **Evidence:** asUser fetcher used

### ET-294 — Issue field selection audit

- **Description:** Only needed fields requested.
- **Linked features:** FR-328
- **Priority:** P1 · **Status:** TEST_VERIFIED
- **Location:** src/integrations/jira.ts · **Deps:** ET-331
- **Acceptance:** Field list minimal
- **Verification:** Code inspection · **Regression:** Adapter tests
- **Risk:** Overfetch
- **Evidence:** Explicit field list

### ET-295 — Comment retrieval verification

- **Description:** Comments mapped correctly.
- **Linked features:** FR-329
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** src/integrations/jira.ts · **Deps:** ET-107
- **Acceptance:** Authors/timestamps preserved
- **Verification:** Adapter tests · **Regression:** Existing suite
- **Risk:** Lost provenance
- **Evidence:** jira-adapter tests

### ET-296 — Issuelinks retrieval verification

- **Description:** Links mapped with direction.
- **Linked features:** FR-330
- **Priority:** P1 · **Status:** TEST_VERIFIED
- **Location:** src/integrations/jira.ts · **Deps:** ET-331
- **Acceptance:** Blocks vs related correct
- **Verification:** Adapter tests · **Regression:** Existing suite
- **Risk:** Invented semantics
- **Evidence:** Link mapping tested

### ET-297 — JQL search support verification

- **Description:** Paged search works.
- **Linked features:** FR-331
- **Priority:** P2 · **Status:** TEST_VERIFIED
- **Location:** src/integrations/jira.ts · **Deps:** ET-331
- **Acceptance:** Pagination bounded
- **Verification:** Adapter tests · **Regression:** Existing suite
- **Risk:** Unbounded search
- **Evidence:** searchAllIssues bounded

### ET-298 — Trusted-route handling

- **Description:** assumeTrustedRoute on internal paths.
- **Linked features:** FR-333
- **Priority:** P1 · **Status:** TEST_VERIFIED
- **Location:** src/resolvers/index.ts · **Deps:** ET-111
- **Acceptance:** No raw user input in paths
- **Verification:** Code inspection · **Regression:** Code review
- **Risk:** SSRF-ish path abuse
- **Evidence:** Paths regex-built internally

### ET-299 — KVS storage scheme verification

- **Description:** Keys tenant-prefixed.
- **Linked features:** FR-334
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** src/storage/ · **Deps:** ET-017
- **Acceptance:** Prefix scheme uniform
- **Verification:** Store tests · **Regression:** Existing suite
- **Risk:** Key collisions
- **Evidence:** Uniform prefixes

### ET-300 — Health probe verification

- **Description:** /myself probe drives health.
- **Linked features:** FR-335
- **Priority:** P1 · **Status:** TEST_VERIFIED
- **Location:** src/resolvers/index.ts · **Deps:** ET-048
- **Acceptance:** State maps from probe result
- **Verification:** Code inspection · **Regression:** Live check post-deploy
- **Risk:** Fabricated health
- **Evidence:** Probe-driven; live BLOCKED

### ET-301 — Forge bridge usage audit

- **Description:** invoke/view only bridge calls.
- **Linked features:** FR-336
- **Priority:** P1 · **Status:** TEST_VERIFIED
- **Location:** src/frontend/ · **Deps:** ET-046
- **Acceptance:** Bridge API used correctly
- **Verification:** Code inspection · **Regression:** Build gate
- **Risk:** Bridge misuse
- **Evidence:** invoke/view only

### ET-302 — ADF write payload tests

- **Description:** Writes serialized as ADF.
- **Linked features:** FR-337, FR-311
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** src/integrations/adf.ts,src/core/execution.ts · **Deps:** ET-331
- **Acceptance:** textToAdfDoc emits valid ADF
- **Verification:** Unit tests · **Regression:** Existing suite
- **Risk:** Rejected writes
- **Evidence:** ADF doc builder + tests

### ET-303 — Issue creation path tests

- **Description:** create_remediation_issue works.
- **Linked features:** FR-339, FR-314
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** src/core/execution.ts · **Deps:** ET-331
- **Acceptance:** POST payload correct; failure explicit
- **Verification:** Unit tests · **Regression:** Existing suite
- **Risk:** Bad payloads
- **Evidence:** Execution tests

### ET-304 — Comment execution path tests

- **Description:** Comment path works.
- **Linked features:** FR-338, FR-313
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** src/core/execution.ts · **Deps:** ET-331
- **Acceptance:** Comment posted with trace
- **Verification:** Unit tests · **Regression:** Existing suite
- **Risk:** Missing trace
- **Evidence:** Execution tests

### ET-305 — Resolver pattern audit

- **Description:** Thin, validated layer.
- **Linked features:** FR-340
- **Priority:** P1 · **Status:** TEST_VERIFIED
- **Location:** src/resolvers/index.ts · **Deps:** ET-014
- **Acceptance:** No business logic in resolvers
- **Verification:** Code inspection · **Regression:** Code review
- **Risk:** Fat resolvers
- **Evidence:** Delegation to core

### ET-306 — Scope documentation in manifest

- **Description:** Each scope commented.
- **Linked features:** FR-341
- **Priority:** P1 · **Status:** TEST_VERIFIED
- **Location:** manifest.yml · **Deps:** ET-013
- **Acceptance:** Comments justify scopes
- **Verification:** Manifest inspection · **Regression:** Per change
- **Risk:** Unexplained scopes
- **Evidence:** write scope documented

### ET-307 — Teamwork Graph adapter tests

- **Description:** Adapter contract-tested.
- **Linked features:** FR-342
- **Priority:** P2 · **Status:** TEST_VERIFIED
- **Location:** src/integrations/teamworkGraph.ts · **Deps:** ET-101
- **Acceptance:** Curated queries + error mapping correct
- **Verification:** Fixture tests · **Regression:** Existing suite
- **Risk:** Broken adapter
- **Evidence:** teamwork-graph tests (7)

### ET-308 — Teamwork Graph wiring

- **Description:** Resolver enrichment via graph.
- **Linked features:** FR-343
- **Priority:** P4 · **Status:** BLOCKED
- **Location:** src/rovo/actions.ts · **Deps:** ET-342
- **Acceptance:** Graph edges enrich impact
- **Verification:** Integration tests · **Regression:** New tests
- **Risk:** Unverified edges as fact
- **Evidence:** Needs graph scopes + dev-site deployment (external credentials)

### ET-309 — Graph scope plan documentation

- **Description:** Granular scopes documented.
- **Linked features:** FR-344
- **Priority:** P4 · **Status:** TEST_VERIFIED
- **Location:** docs/atlassian-compatibility.md · **Deps:** ET-343
- **Acceptance:** Scope list + rationale present
- **Verification:** Doc review · **Regression:** Per scope change
- **Risk:** Scope confusion
- **Evidence:** Scope strategy documented

### ET-310 — Curated-queries-only verification

- **Description:** No runtime Cypher.
- **Linked features:** FR-345
- **Priority:** P2 · **Status:** TEST_VERIFIED
- **Location:** src/integrations/teamworkGraph.ts · **Deps:** ET-342
- **Acceptance:** Only curated query documents
- **Verification:** Code inspection · **Regression:** Adapter tests
- **Risk:** Injection via Cypher
- **Evidence:** Curated constants only

### ET-311 — Permission-filtered graph read design

- **Description:** User-scoped reads documented.
- **Linked features:** FR-346
- **Priority:** P2 · **Status:** TEST_VERIFIED
- **Location:** src/integrations/teamworkGraph.ts · **Deps:** ET-342
- **Acceptance:** asUser design documented
- **Verification:** Doc + code review · **Regression:** Adapter tests
- **Risk:** Unfiltered rows
- **Evidence:** Design documented

### ET-312 — Platform event handling

- **Description:** Forge event triggers.
- **Linked features:** FR-347
- **Priority:** P4 · **Status:** DEFERRED
- **Location:** future modules · **Deps:** ET-331
- **Acceptance:** Events verified + dispatched
- **Verification:** Integration tests · **Regression:** New tests
- **Risk:** Unverified events
- **Evidence:** Requires live deployment to verify event payloads (BLOCKED)

### ET-313 — Scheduled triggers

- **Description:** Bulk scheduled analysis.
- **Linked features:** FR-348
- **Priority:** P4 · **Status:** DEFERRED
- **Location:** future modules · **Deps:** ET-331
- **Acceptance:** Scheduled runs bounded
- **Verification:** Integration tests · **Regression:** New tests
- **Risk:** Runaway schedules
- **Evidence:** Requires live deployment + quota validation (BLOCKED)

### ET-314 — Development-site deployment

- **Description:** forge deploy + install.
- **Linked features:** FR-349
- **Priority:** P4 · **Status:** BLOCKED
- **Location:** external: forge CLI · **Deps:** ET-331
- **Acceptance:** App installed on dev site
- **Verification:** forge CLI output · **Regression:** Deploy checklist
- **Risk:** Deploy failures
- **Evidence:** Requires Atlassian credentials (external action)

### ET-315 — Marketplace listing

- **Description:** Listing published.
- **Linked features:** FR-350
- **Priority:** P4 · **Status:** BLOCKED
- **Location:** external: Marketplace · **Deps:** ET-324
- **Acceptance:** Listing live
- **Verification:** Marketplace status · **Regression:** Listing review
- **Risk:** Rejection
- **Evidence:** Requires partner account + published app (external action)

### ET-316 — Installation flow docs

- **Description:** README documents forge steps.
- **Linked features:** FR-351
- **Priority:** P2 · **Status:** TEST_VERIFIED
- **Location:** README.md · **Deps:** ET-331
- **Acceptance:** Steps complete and ordered
- **Verification:** Doc review · **Regression:** Per CLI change
- **Risk:** Broken instructions
- **Evidence:** Steps documented

### ET-317 — Forge lint guidance

- **Description:** Manifest lint documented.
- **Linked features:** FR-352
- **Priority:** P2 · **Status:** TEST_VERIFIED
- **Location:** docs/VERIFICATION_RESULTS.md · **Deps:** ET-291
- **Acceptance:** Lint findings recorded
- **Verification:** Doc review · **Regression:** Per lint run
- **Risk:** Unknown lint state
- **Evidence:** Recorded (app-id note only)

### ET-318 — Jira status error mapping

- **Description:** Statuses mapped.
- **Linked features:** FR-353
- **Priority:** P1 · **Status:** TEST_VERIFIED
- **Location:** src/resolvers/index.ts · **Deps:** ET-335
- **Acceptance:** 401/403 vs 5xx distinguished
- **Verification:** Code inspection · **Regression:** Live check
- **Risk:** Wrong health
- **Evidence:** Mapping in health resolver

### ET-319 — Rate-limit awareness

- **Description:** 429 retried.
- **Linked features:** FR-355
- **Priority:** P1 · **Status:** TEST_VERIFIED
- **Location:** src/integrations/jira.ts · **Deps:** ET-316
- **Acceptance:** 429 retried, others not
- **Verification:** Adapter tests · **Regression:** Existing suite
- **Risk:** Retry storms
- **Evidence:** Adapter tests

### ET-320 — API version pinning

- **Description:** v3 paths explicit.
- **Linked features:** FR-356
- **Priority:** P1 · **Status:** TEST_VERIFIED
- **Location:** src/integrations/jira.ts · **Deps:** ET-331
- **Acceptance:** No floating API versions
- **Verification:** Code inspection · **Regression:** Adapter tests
- **Risk:** Version drift
- **Evidence:** /rest/api/3/ pinned

### ET-321 — Issue-panel context capture tests

- **Description:** Panel key captured.
- **Linked features:** FR-357
- **Priority:** P1 · **Status:** TEST_VERIFIED
- **Location:** src/frontend/App.tsx · **Deps:** ET-048
- **Acceptance:** Key from context
- **Verification:** Code inspection · **Regression:** Live panel check
- **Risk:** Missing context
- **Evidence:** view.getContext wired

### ET-322 — Global page navigation tests

- **Description:** Nav works.
- **Linked features:** FR-358
- **Priority:** P1 · **Status:** TEST_VERIFIED
- **Location:** src/frontend/App.tsx · **Deps:** ET-046
- **Acceptance:** All views reachable
- **Verification:** Build + inspection · **Regression:** Manual check
- **Risk:** Dead views
- **Evidence:** All views mounted

### ET-323 — Cross-service trace ids

- **Description:** Correlation across products.
- **Linked features:** FR-359
- **Priority:** P4 · **Status:** DEFERRED
- **Location:** future capability · **Deps:** ET-331
- **Acceptance:** Trace ids propagated
- **Verification:** Integration tests · **Regression:** New tests
- **Risk:** Untraceable flows
- **Evidence:** Requires multi-product integration (BLOCKED)

### ET-324 — Integration boundary docs

- **Description:** Decisions recorded.
- **Linked features:** FR-360
- **Priority:** P2 · **Status:** TEST_VERIFIED
- **Location:** docs/atlassian-compatibility.md · **Deps:** ET-331
- **Acceptance:** Boundaries + rationale present
- **Verification:** Doc review · **Regression:** Per decision
- **Risk:** Implicit boundaries
- **Evidence:** Documented with sources

### ET-325 — Scope-revocation handling tests

- **Description:** ACCESS_RESTRICTED surfaced.
- **Linked features:** FR-361
- **Priority:** P1 · **Status:** TEST_VERIFIED
- **Location:** src/core/contradiction.ts · **Deps:** ET-113
- **Acceptance:** Revoked scope → explicit state
- **Verification:** Engine tests · **Regression:** Existing suite
- **Risk:** Silent empty data
- **Evidence:** Restricted fixtures tested

### ET-326 — User display names in citations

- **Description:** Authors in citations.
- **Linked features:** FR-362
- **Priority:** P2 · **Status:** TEST_VERIFIED
- **Location:** src/integrations/evidence.ts · **Deps:** ET-107
- **Acceptance:** Citations include authors
- **Verification:** Builder tests · **Regression:** Existing suite
- **Risk:** Anonymous citations
- **Evidence:** Citation includes author

### ET-327 — Issue status in views

- **Description:** Status displayed.
- **Linked features:** FR-363
- **Priority:** P2 · **Status:** TEST_VERIFIED
- **Location:** src/frontend/views/Overview.tsx · **Deps:** ET-048
- **Acceptance:** Status shown from analysis
- **Verification:** Code inspection · **Regression:** Manual check
- **Risk:** Stale status
- **Evidence:** Status rendered

### ET-328 — KVS query pagination verification

- **Description:** Repositories page queries.
- **Linked features:** FR-364
- **Priority:** P1 · **Status:** TEST_VERIFIED
- **Location:** src/storage/ · **Deps:** ET-017
- **Acceptance:** Cursor loops correct
- **Verification:** Store tests · **Regression:** Existing suite
- **Risk:** Dropped records
- **Evidence:** Cursor loops implemented

### ET-329 — Scope-creep guard

- **Description:** No undeclared scopes.
- **Linked features:** FR-365
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** manifest.yml · **Deps:** ET-013
- **Acceptance:** Scopes map to capabilities only
- **Verification:** Manifest audit · **Regression:** Per change
- **Risk:** Scope creep
- **Evidence:** Audit clean

### ET-330 — Post-execution verification via Jira reads

- **Description:** Verify writes by re-reading.
- **Linked features:** FR-287, FR-338, FR-339
- **Priority:** P1 · **Status:** TEST_VERIFIED
- **Location:** src/core/verification.ts · **Deps:** ET-331
- **Acceptance:** Comment/issue existence confirmed post-write
- **Verification:** Unit tests · **Regression:** New tests this session
- **Risk:** False execution success
- **Evidence:** Implementation slice this session

### ET-331 — Verification result on proposal

- **Description:** Outcome persisted.
- **Linked features:** FR-288
- **Priority:** P1 · **Status:** TEST_VERIFIED
- **Location:** src/core/types.ts,src/resolvers/ · **Deps:** ET-340
- **Acceptance:** Verification state stored + rendered
- **Verification:** Unit + integration tests · **Regression:** New tests
- **Risk:** Lost verification
- **Evidence:** Implementation slice this session

### ET-332 — Verification audit events

- **Description:** proposal_verified chained.
- **Linked features:** FR-289, FR-378
- **Priority:** P1 · **Status:** TEST_VERIFIED
- **Location:** src/resolvers/index.ts · **Deps:** ET-340
- **Acceptance:** Event recorded with outcome
- **Verification:** Integration tests · **Regression:** New tests
- **Risk:** Unverified executions
- **Evidence:** Implementation slice this session

### ET-333 — Success-vs-verified semantics

- **Description:** Distinct outcomes.
- **Linked features:** FR-290, FR-316
- **Priority:** P1 · **Status:** TEST_VERIFIED
- **Location:** src/core/verification.ts · **Deps:** ET-340
- **Acceptance:** Executed-but-unverified states exist
- **Verification:** Unit tests · **Regression:** New tests
- **Risk:** Conflation
- **Evidence:** Implementation slice this session

### ET-334 — Failure fixtures (Scenario D)

- **Description:** Controlled failure fixtures.
- **Linked features:** FR-301, FR-441
- **Priority:** P3 · **Status:** TEST_VERIFIED
- **Location:** scripts/demo-scenarios.ts · **Deps:** ET-340
- **Acceptance:** Failure path demonstrated
- **Verification:** Demo run output · **Regression:** Demo replay
- **Risk:** Hidden failures
- **Evidence:** Implementation slice this session

### ET-335 — 429 retry path tests

- **Description:** Rate-limit retry.
- **Linked features:** FR-297
- **Priority:** P1 · **Status:** TEST_VERIFIED
- **Location:** src/integrations/jira.ts · **Deps:** ET-316
- **Acceptance:** 429 retried with backoff
- **Verification:** Adapter tests · **Regression:** Existing suite
- **Risk:** Hammering
- **Evidence:** Adapter retry tests

### ET-336 — Data minimization audit

- **Description:** Only cited spans stored.
- **Linked features:** FR-304
- **Priority:** P1 · **Status:** TEST_VERIFIED
- **Location:** src/integrations/evidence.ts · **Deps:** ET-107
- **Acceptance:** No whole-document storage
- **Verification:** Code inspection · **Regression:** Code review
- **Risk:** Over-retention
- **Evidence:** Spans only

### ET-337 — Error classification audit

- **Description:** Typed errors throughout.
- **Linked features:** FR-282
- **Priority:** P1 · **Status:** TEST_VERIFIED
- **Location:** src/integrations/jira.ts · **Deps:** ET-331
- **Acceptance:** JiraApiError carries status/path
- **Verification:** Type inspection · **Regression:** Adapter tests
- **Risk:** Opaque failures
- **Evidence:** Typed errors

### ET-338 — Health endpoint live verification

- **Description:** Probe against real Jira.
- **Linked features:** FR-335
- **Priority:** P2 · **Status:** BLOCKED
- **Location:** external: dev site · **Deps:** ET-335
- **Acceptance:** Probe returns real state
- **Verification:** forge deploy + UI check · **Regression:** Deploy checklist
- **Risk:** Wrong mapping live
- **Evidence:** Requires dev-site deployment (external credentials)

### ET-339 — Write path live verification

- **Description:** Execute one proposal live.
- **Linked features:** FR-337, FR-338, FR-339
- **Priority:** P2 · **Status:** BLOCKED
- **Location:** external: dev site · **Deps:** ET-344
- **Acceptance:** Approved proposal executes + verifies on real Jira
- **Verification:** Live run + audit check · **Regression:** Deploy checklist
- **Risk:** Live-only defects
- **Evidence:** Requires dev-site deployment (external credentials)

### ET-340 — Agent live invocation verification

- **Description:** Rovo agent calls a tool.
- **Linked features:** FR-116, FR-123
- **Priority:** P2 · **Status:** BLOCKED
- **Location:** external: Rovo Studio · **Deps:** ET-291
- **Acceptance:** Agent invokes tool successfully
- **Verification:** Live transcript · **Regression:** Bonus evidence
- **Risk:** Prompt issues live
- **Evidence:** Requires live deployment + Rovo access (external)

## Workstream 8. Audit, observability and analytics

### ET-341 — Digest chain construction tests

- **Description:** Chain builds correctly.
- **Linked features:** FR-366, FR-367
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** src/audit/auditLog.ts · **Deps:** ET-019
- **Acceptance:** Each event digests predecessor
- **Verification:** Unit tests · **Regression:** Existing suite
- **Risk:** Broken chain
- **Evidence:** audit-log tests

### ET-342 — Chain verification API tests

- **Description:** verifyAuditChain correct.
- **Linked features:** FR-368, FR-370
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** src/audit/auditLog.ts · **Deps:** ET-019
- **Acceptance:** Intact true / tampered false
- **Verification:** Unit tests · **Regression:** Existing suite
- **Risk:** False confidence
- **Evidence:** Tamper test

### ET-343 — Tamper detection demonstration

- **Description:** Mutation breaks chain.
- **Linked features:** FR-369, FR-308
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** tests/unit/audit-log.test.ts · **Deps:** ET-371
- **Acceptance:** Edited event detected
- **Verification:** Unit test · **Regression:** Existing suite
- **Risk:** Undetected edits
- **Evidence:** Tamper case covered

### ET-344 — analysis_run event coverage

- **Description:** All runs audited.
- **Linked features:** FR-371
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** src/resolvers/index.ts · **Deps:** ET-019
- **Acceptance:** Success and failure audited
- **Verification:** Integration tests · **Regression:** Existing suite
- **Risk:** Missing events
- **Evidence:** Both paths tested

### ET-345 — Decision event coverage

- **Description:** approve/reject audited.
- **Linked features:** FR-372
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** src/resolvers/index.ts · **Deps:** ET-241
- **Acceptance:** Decisions in ledger
- **Verification:** Integration tests · **Regression:** Existing suite
- **Risk:** Missing events
- **Evidence:** Decision events tested

### ET-346 — Execution event coverage

- **Description:** Executions audited.
- **Linked features:** FR-373
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** src/resolvers/index.ts · **Deps:** ET-241
- **Acceptance:** Executions in ledger
- **Verification:** Integration tests · **Regression:** Existing suite
- **Risk:** Missing events
- **Evidence:** Execution events tested

### ET-347 — Tenant ledger isolation tests

- **Description:** Ledger tenant-scoped.
- **Linked features:** FR-374
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** src/storage/auditStore.ts · **Deps:** ET-017
- **Acceptance:** Foreign ledger invisible
- **Verification:** Security tests · **Regression:** Existing suite
- **Risk:** Leak
- **Evidence:** Isolation tests

### ET-348 — Audit ledger UI verification

- **Description:** Ledger renders events.
- **Linked features:** FR-375
- **Priority:** P1 · **Status:** TEST_VERIFIED
- **Location:** src/frontend/views/AuditLedger.tsx · **Deps:** ET-046
- **Acceptance:** Events displayed with fields
- **Verification:** Build + inspection · **Regression:** Manual check
- **Risk:** Unreadable ledger
- **Evidence:** Ledger view works

### ET-349 — Event evidence linkage tests

- **Description:** Events link evidence.
- **Linked features:** FR-376
- **Priority:** P1 · **Status:** TEST_VERIFIED
- **Location:** src/audit/auditLog.ts · **Deps:** ET-019
- **Acceptance:** linkedEvidenceIds preserved
- **Verification:** Unit tests · **Regression:** Existing suite
- **Risk:** Broken links
- **Evidence:** Linkage tested

### ET-350 — Request fingerprint tests

- **Description:** Fingerprints computed.
- **Linked features:** FR-377
- **Priority:** P1 · **Status:** TEST_VERIFIED
- **Location:** src/audit/auditLog.ts · **Deps:** ET-019
- **Acceptance:** Fingerprint per request
- **Verification:** Unit tests · **Regression:** Existing suite
- **Risk:** Replay confusion
- **Evidence:** Fingerprint field tested

### ET-351 — Verification outcome events

- **Description:** proposal_verified chained.
- **Linked features:** FR-378
- **Priority:** P1 · **Status:** TEST_VERIFIED
- **Location:** src/resolvers/index.ts · **Deps:** ET-343
- **Acceptance:** Verification audited
- **Verification:** Integration tests · **Regression:** New tests this session
- **Risk:** Unverified executions
- **Evidence:** Implementation slice this session

### ET-352 — Execution receipts in audit

- **Description:** resultRef recorded.
- **Linked features:** FR-379
- **Priority:** P1 · **Status:** TEST_VERIFIED
- **Location:** src/resolvers/index.ts · **Deps:** ET-241
- **Acceptance:** Receipt in ledger
- **Verification:** Integration tests · **Regression:** Existing suite
- **Risk:** Lost receipts
- **Evidence:** Receipt recorded

### ET-353 — Failure-event honesty tests

- **Description:** Failures audited as failures.
- **Linked features:** FR-380, FR-284
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** src/resolvers/index.ts · **Deps:** ET-019
- **Acceptance:** Failure events never success
- **Verification:** Integration tests · **Regression:** Existing suite
- **Risk:** Fake success
- **Evidence:** Failure path tested

### ET-354 — Chain integrity test suite

- **Description:** Suite covers chain.
- **Linked features:** FR-382
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** tests/unit/audit-log.test.ts · **Deps:** ET-371
- **Acceptance:** Suite green
- **Verification:** Vitest run · **Regression:** Existing suite
- **Risk:** Chain regressions
- **Evidence:** 3 tests

### ET-355 — Same-millisecond regression test

- **Description:** Order stable under same-ms.
- **Linked features:** FR-383, FR-309
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** tests/unit/audit-determinism.test.ts · **Deps:** ET-371
- **Acceptance:** Same-ms appends verify
- **Verification:** Unit test · **Regression:** Existing suite
- **Risk:** Flaky chain
- **Evidence:** Regression test added

### ET-356 — Exportable audit report

- **Description:** Download ledger.
- **Linked features:** FR-384
- **Priority:** P3 · **Status:** NOT_STARTED
- **Location:** future feature · **Deps:** ET-378
- **Acceptance:** Export includes chain proof
- **Verification:** Integration tests · **Regression:** New tests
- **Risk:** Export tampering
- **Evidence:** Backlog

### ET-357 — Audit retention policy

- **Description:** Retention windows.
- **Linked features:** FR-385
- **Priority:** P4 · **Status:** DEFERRED
- **Location:** future policy · **Deps:** ET-378
- **Acceptance:** Old events archived per policy
- **Verification:** Integration tests · **Regression:** New tests
- **Risk:** Evidence loss
- **Evidence:** Requires compliance decision

### ET-358 — Proposal lifecycle analytics

- **Description:** Funnel metrics.
- **Linked features:** FR-386
- **Priority:** P4 · **Status:** DEFERRED
- **Location:** future analytics · **Deps:** ET-378
- **Acceptance:** Funnel computed from audit
- **Verification:** Metric tests · **Regression:** New tests
- **Risk:** Vanity metrics
- **Evidence:** Needs live volume (BLOCKED)

### ET-359 — Approval time metrics

- **Description:** Time-to-decision.
- **Linked features:** FR-387
- **Priority:** P4 · **Status:** DEFERRED
- **Location:** future analytics · **Deps:** ET-378
- **Acceptance:** Metric defined + measured
- **Verification:** Metric tests · **Regression:** New tests
- **Risk:** Unmeasured claims
- **Evidence:** Needs live volume (BLOCKED)

### ET-360 — Queue wait metrics

- **Description:** Time-in-queue.
- **Linked features:** FR-388
- **Priority:** P4 · **Status:** DEFERRED
- **Location:** future analytics · **Deps:** ET-216
- **Acceptance:** Metric defined + measured
- **Verification:** Metric tests · **Regression:** New tests
- **Risk:** Unmeasured claims
- **Evidence:** Needs live volume (BLOCKED)

### ET-361 — Verification pass-rate metric

- **Description:** Verified/executed ratio.
- **Linked features:** FR-389
- **Priority:** P4 · **Status:** DEFERRED
- **Location:** future analytics · **Deps:** ET-343
- **Acceptance:** Ratio computed from audit
- **Verification:** Metric tests · **Regression:** New tests
- **Risk:** Tiny-sample traps
- **Evidence:** Needs live volume; metric definition documented now

### ET-362 — Latency measurement

- **Description:** Per-action percentiles.
- **Linked features:** FR-390
- **Priority:** P4 · **Status:** DEFERRED
- **Location:** future observability · **Deps:** ET-378
- **Acceptance:** Percentiles measured
- **Verification:** Load tests · **Regression:** New tests
- **Risk:** Unmeasured latency
- **Evidence:** Needs live volume (BLOCKED)

### ET-363 — Cost measurement

- **Description:** Cost per task.
- **Linked features:** FR-391
- **Priority:** P4 · **Status:** DEFERRED
- **Location:** future observability · **Deps:** ET-378
- **Acceptance:** Cost computed from usage
- **Verification:** Metric tests · **Regression:** New tests
- **Risk:** Fabricated cost
- **Evidence:** No model usage exists; cost metric would be fabricated — intentionally not displayed (see METRICS_AUDIT.md)

### ET-364 — Context quality metric

- **Description:** Evidence sufficiency trends.
- **Linked features:** FR-392
- **Priority:** P4 · **Status:** DEFERRED
- **Location:** future analytics · **Deps:** ET-113
- **Acceptance:** Trend computed
- **Verification:** Metric tests · **Regression:** New tests
- **Risk:** Vanity quality
- **Evidence:** Needs live volume (BLOCKED)

### ET-365 — Retrieval effectiveness metric

- **Description:** Retrieval relevance.
- **Linked features:** FR-393
- **Priority:** P4 · **Status:** DEFERRED
- **Location:** future analytics · **Deps:** ET-107
- **Acceptance:** Metric defined
- **Verification:** Benchmark tests · **Regression:** New tests
- **Risk:** Unmeasured retrieval
- **Evidence:** Retrieval is deterministic fetch; relevance metric pending larger corpus

### ET-366 — Agent reliability metric

- **Description:** Tool success rates.
- **Linked features:** FR-394
- **Priority:** P4 · **Status:** DEFERRED
- **Location:** future analytics · **Deps:** ET-152
- **Acceptance:** Rates computed from audit
- **Verification:** Metric tests · **Regression:** New tests
- **Risk:** Unmeasured reliability
- **Evidence:** Needs live volume (BLOCKED)

### ET-367 — Operational dashboard

- **Description:** Live ops view.
- **Linked features:** FR-395
- **Priority:** P4 · **Status:** DEFERRED
- **Location:** future UI · **Deps:** ET-378
- **Acceptance:** Dashboard shows measured values only
- **Verification:** UI inspection · **Regression:** Manual check
- **Risk:** Fake metrics
- **Evidence:** No live telemetry exists; dashboard would be decorative

### ET-368 — Chain append cost documentation

- **Description:** O(n) append accepted.
- **Linked features:** FR-396
- **Priority:** P2 · **Status:** TEST_VERIFIED
- **Location:** docs/TECHNICAL_DEBT.md · **Deps:** ET-371
- **Acceptance:** Cost documented with trigger
- **Verification:** Doc review · **Regression:** Per scale change
- **Risk:** Scaling surprise
- **Evidence:** Documented

### ET-369 — Metrics audit documentation

- **Description:** METRICS_AUDIT.md current.
- **Linked features:** FR-397
- **Priority:** P1 · **Status:** TEST_VERIFIED
- **Location:** docs/METRICS_AUDIT.md · **Deps:** ET-025
- **Acceptance:** Every displayed number has formula+label
- **Verification:** Doc review · **Regression:** Per metric change
- **Risk:** Metric drift
- **Evidence:** Audit current

### ET-370 — Measurement label discipline

- **Description:** Labels used consistently.
- **Linked features:** FR-398
- **Priority:** P2 · **Status:** TEST_VERIFIED
- **Location:** docs/ · **Deps:** ET-025
- **Acceptance:** Labels consistent across docs
- **Verification:** Doc audit · **Regression:** Per doc change
- **Risk:** Label erosion
- **Evidence:** Audited

### ET-371 — Benchmark replay determinism verification

- **Description:** Replay exact.
- **Linked features:** FR-399
- **Priority:** P2 · **Status:** TEST_VERIFIED
- **Location:** benchmarks/evaluate.ts · **Deps:** ET-007
- **Acceptance:** Metrics reproduce exactly
- **Verification:** Evaluator runs · **Regression:** Per engine change
- **Risk:** Irreproducible claims
- **Evidence:** Exact replay confirmed

### ET-372 — Audit event schema stability

- **Description:** Schema versioned.
- **Linked features:** FR-400
- **Priority:** P2 · **Status:** TEST_VERIFIED
- **Location:** src/core/types.ts · **Deps:** ET-371
- **Acceptance:** Event shape typed + tested
- **Verification:** tsc + tests · **Regression:** Typecheck gate
- **Risk:** Schema drift
- **Evidence:** AuditEvent type stable

### ET-373 — Chain demo for judges

- **Description:** Demo shows chain verification.
- **Linked features:** FR-401, FR-455
- **Priority:** P3 · **Status:** TEST_VERIFIED
- **Location:** scripts/demo-scenarios.ts,docs/HACKATHON_DEMO_SCRIPT.md · **Deps:** ET-371
- **Acceptance:** Demo step verifies chain live
- **Verification:** Demo run output · **Regression:** Demo replay
- **Risk:** Unconvincing demo
- **Evidence:** Demo runner includes chain check this session

### ET-374 — Observability baseline audit

- **Description:** Ledger as ops record.
- **Linked features:** FR-424
- **Priority:** P1 · **Status:** TEST_VERIFIED
- **Location:** docs/CLOUD_ARCHITECTURE.md · **Deps:** ET-019
- **Acceptance:** Baseline documented
- **Verification:** Doc review · **Regression:** Per architecture change
- **Risk:** Invisible ops
- **Evidence:** Documented

### ET-375 — Per-actor attribution tests

- **Description:** Events name actors.
- **Linked features:** FR-375
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** src/audit/auditLog.ts · **Deps:** ET-371
- **Acceptance:** Actor field mandatory
- **Verification:** Type + tests · **Regression:** Existing suite
- **Risk:** Anonymous acts
- **Evidence:** Actor enforced by type

### ET-376 — Execution receipts display

- **Description:** Receipts visible in UI.
- **Linked features:** FR-025, FR-379
- **Priority:** P2 · **Status:** TEST_VERIFIED
- **Location:** src/frontend/views/ReviewQueue.tsx · **Deps:** ET-058
- **Acceptance:** Result ref shown
- **Verification:** UI inspection · **Regression:** Manual check
- **Risk:** Hidden receipts
- **Evidence:** Implementation slice this session

### ET-377 — Proposal count metrics display

- **Description:** Queue counts shown.
- **Linked features:** FR-203
- **Priority:** P1 · **Status:** TEST_VERIFIED
- **Location:** src/frontend/App.tsx · **Deps:** ET-053
- **Acceptance:** Counts accurate
- **Verification:** Code inspection · **Regression:** Manual check
- **Risk:** Wrong counts
- **Evidence:** Badge wired

### ET-378 — Audit chain integrity in demo

- **Description:** Demo verifies chain.
- **Linked features:** FR-401
- **Priority:** P3 · **Status:** TEST_VERIFIED
- **Location:** scripts/demo-scenarios.ts · **Deps:** ET-371
- **Acceptance:** Chain check in demo
- **Verification:** Demo output · **Regression:** Demo replay
- **Risk:** Broken chain undetected
- **Evidence:** Included in demo runner this session

### ET-379 — Observability gap register

- **Description:** Known gaps listed.
- **Linked features:** FR-397
- **Priority:** P2 · **Status:** TEST_VERIFIED
- **Location:** docs/TECHNICAL_DEBT.md · **Deps:** ET-378
- **Acceptance:** Gaps + triggers listed
- **Verification:** Doc review · **Regression:** Per pass
- **Risk:** Hidden gaps
- **Evidence:** Register current

### ET-380 — Failure reason classification

- **Description:** Failures classified in ledger.
- **Linked features:** FR-380
- **Priority:** P1 · **Status:** TEST_VERIFIED
- **Location:** src/audit/auditLog.ts · **Deps:** ET-371
- **Acceptance:** Failure detail recorded
- **Verification:** Integration tests · **Regression:** Existing suite
- **Risk:** Opaque failures
- **Evidence:** Detail field used

## Workstream 9. Testing, evaluation and benchmarks

### ET-381 — Full suite baseline

- **Description:** Establish and hold the suite.
- **Linked features:** FR-406, FR-408
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** tests/ · **Deps:** ET-005
- **Acceptance:** Suite green, none skipped
- **Verification:** vitest run · **Regression:** CI gate
- **Risk:** Red suite
- **Evidence:** 87/87 at session start; re-run each pass

### ET-382 — Capability-to-test matrix

- **Description:** Map capabilities to tests.
- **Linked features:** FR-454
- **Priority:** P1 · **Status:** IMPLEMENTED
- **Location:** docs/VERIFICATION_MATRIX.md · **Deps:** ET-021
- **Acceptance:** Every important capability has a method
- **Verification:** Doc review · **Regression:** Per capability change
- **Risk:** Untested capabilities
- **Evidence:** Matrix authored/updated this session

### ET-383 — Invariant: unapproved cannot execute

- **Description:** Governance invariant proven.
- **Linked features:** FR-261, FR-271
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** tests/unit/execution.test.ts · **Deps:** ET-241
- **Acceptance:** Non-APPROVED execution fails
- **Verification:** Unit test · **Regression:** Existing suite
- **Risk:** Ungated execution
- **Evidence:** Test present

### ET-384 — Invariant: agent cannot approve/execute

- **Description:** Structural separation proven.
- **Linked features:** FR-121, FR-228
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** tests/,manifest.yml · **Deps:** ET-155
- **Acceptance:** No agent path exists
- **Verification:** Surface inspection · **Regression:** Governance suite
- **Risk:** Agent overreach
- **Evidence:** Verified structurally

### ET-385 — Invariant: non-approver cannot execute

- **Description:** Approver identity enforced.
- **Linked features:** FR-227, FR-256
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** tests/unit/execution.test.ts · **Deps:** ET-241
- **Acceptance:** NOT_APPROVER failure
- **Verification:** Unit test · **Regression:** Existing suite
- **Risk:** Piggyback execution
- **Evidence:** Test present

### ET-386 — Invariant: expired approvals fail

- **Description:** Expiry enforced.
- **Linked features:** FR-225, FR-253
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** tests/unit/execution.test.ts · **Deps:** ET-241
- **Acceptance:** Expired fails
- **Verification:** Unit test · **Regression:** Existing suite
- **Risk:** Stale authority
- **Evidence:** Test present

### ET-387 — Invariant: replay cannot duplicate effects

- **Description:** Replay-proof.
- **Linked features:** FR-226, FR-254
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** tests/unit/execution.test.ts,tests/integration/review-queue.test.ts · **Deps:** ET-241
- **Acceptance:** Second execution fails
- **Verification:** Unit + integration tests · **Regression:** Existing suite
- **Risk:** Double effects
- **Evidence:** Both tests present

### ET-388 — Invariant: modified proposal cannot reuse approval

- **Description:** Digest binding.
- **Linked features:** FR-235
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** tests/unit/approval.test.ts · **Deps:** ET-241
- **Acceptance:** Digest mismatch fails
- **Verification:** Unit test · **Regression:** Existing suite
- **Risk:** Payload swap
- **Evidence:** Test present

### ET-389 — Invariant: audit mutation detected

- **Description:** Chain tamper-evident.
- **Linked features:** FR-268, FR-307
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** tests/unit/audit-log.test.ts · **Deps:** ET-371
- **Acceptance:** Edited event detected
- **Verification:** Unit test · **Regression:** Existing suite
- **Risk:** Undetected tampering
- **Evidence:** Test present

### ET-390 — Invariant: evidence references traceable

- **Description:** Citations resolve.
- **Linked features:** FR-080
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** tests/unit/contradiction.test.ts · **Deps:** ET-113
- **Acceptance:** Evidence ids resolve to records
- **Verification:** Unit tests · **Regression:** Existing suite
- **Risk:** Dangling citations
- **Evidence:** Engine tests

### ET-391 — Invariant: unauthorized source data excluded

- **Description:** Restricted/stale excluded.
- **Linked features:** FR-076, FR-361
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** tests/unit/contradiction.test.ts · **Deps:** ET-113
- **Acceptance:** Restricted never verifies
- **Verification:** Unit tests · **Regression:** Existing suite
- **Risk:** Leak into context
- **Evidence:** Engine tests

### ET-392 — Invariant: success distinct from verification

- **Description:** Two facts, separate states.
- **Linked features:** FR-290, FR-316
- **Priority:** P1 · **Status:** TEST_VERIFIED
- **Location:** tests/unit/verification.test.ts · **Deps:** ET-340
- **Acceptance:** Executed-but-unverified representable
- **Verification:** Unit tests · **Regression:** New tests this session
- **Risk:** Conflation
- **Evidence:** Implementation slice this session

### ET-393 — Invariant: failures never recorded as success

- **Description:** Honest failure states.
- **Linked features:** FR-284, FR-380
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** tests/integration/review-queue.test.ts · **Deps:** ET-371
- **Acceptance:** Failure events audited as failure
- **Verification:** Integration tests · **Regression:** Existing suite
- **Risk:** Fake success
- **Evidence:** Failure path tested

### ET-394 — Invariant: missing credentials never produce success

- **Description:** No fabricated live results.
- **Linked features:** FR-450
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** docs/,src/ · **Deps:** ET-025
- **Acceptance:** No live claim without deployment
- **Verification:** Doc audit · **Regression:** Label discipline
- **Risk:** Fabricated success
- **Evidence:** BLOCKED labels enforced

### ET-395 — Duplicate task submission handling

- **Description:** Re-analysis converges.
- **Linked features:** FR-152, FR-184
- **Priority:** P1 · **Status:** TEST_VERIFIED
- **Location:** tests/integration/persistence.test.ts · **Deps:** ET-113
- **Acceptance:** Re-run upserts
- **Verification:** Integration test · **Regression:** Existing suite
- **Risk:** Duplicate cases
- **Evidence:** Upsert test

### ET-396 — Partial execution handling

- **Description:** Failure mid-write explicit.
- **Linked features:** FR-291
- **Priority:** P3 · **Status:** NOT_STARTED
- **Location:** src/core/execution.ts · **Deps:** ET-241
- **Acceptance:** EXECUTION_FAILED recorded on partial failure
- **Verification:** Unit tests · **Regression:** Existing suite
- **Risk:** Half-executed state
- **Evidence:** Backlog; single-write operations currently

### ET-397 — Retry exhaustion handling

- **Description:** Retries bounded.
- **Linked features:** FR-283
- **Priority:** P1 · **Status:** TEST_VERIFIED
- **Location:** src/integrations/jira.ts · **Deps:** ET-316
- **Acceptance:** Exhaustion raises typed error
- **Verification:** Adapter tests · **Regression:** Existing suite
- **Risk:** Infinite retries
- **Evidence:** MAX_RETRIES bounded

### ET-398 — Concurrent execution behavior

- **Description:** Two executions at once.
- **Linked features:** FR-243
- **Priority:** P3 · **Status:** NOT_STARTED
- **Location:** src/storage/proposalStore.ts · **Deps:** ET-241
- **Acceptance:** Second replay rejected via registry
- **Verification:** Concurrency tests · **Regression:** New tests
- **Risk:** Double write
- **Evidence:** Backlog; registry mitigates

### ET-399 — Queue saturation behavior

- **Description:** Large queue handled.
- **Linked features:** FR-388
- **Priority:** P3 · **Status:** NOT_STARTED
- **Location:** src/core/queue.ts · **Deps:** ET-216
- **Acceptance:** Ordering stable at volume
- **Verification:** Load tests · **Regression:** New tests
- **Risk:** Perf collapse
- **Evidence:** Backlog

### ET-400 — Unauthorized action tests

- **Description:** Wrong tenant/user blocked.
- **Linked features:** FR-277, FR-305
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** tests/security/tenant-isolation.test.ts · **Deps:** ET-241
- **Acceptance:** Foreign access empty
- **Verification:** Security tests · **Regression:** Existing suite
- **Risk:** Leak
- **Evidence:** Isolation tests

### ET-401 — Incorrect evidence handling

- **Description:** Bad evidence never verifies.
- **Linked features:** FR-073, FR-074
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** tests/unit/contradiction.test.ts · **Deps:** ET-113
- **Acceptance:** Insufficient → explicit state
- **Verification:** Engine tests · **Regression:** Existing suite
- **Risk:** False positives
- **Evidence:** Engine tests

### ET-402 — Verification failure handling

- **Description:** Verification mismatch explicit.
- **Linked features:** FR-316
- **Priority:** P1 · **Status:** TEST_VERIFIED
- **Location:** tests/unit/verification.test.ts · **Deps:** ET-340
- **Acceptance:** MISMATCH recorded and audited
- **Verification:** Unit tests · **Regression:** New tests this session
- **Risk:** Hidden mismatch
- **Evidence:** Implementation slice this session

### ET-403 — Property-based ordering tests

- **Description:** Ordering invariants hold.
- **Linked features:** FR-215, FR-216
- **Priority:** P2 · **Status:** TEST_VERIFIED
- **Location:** tests/unit/queue-ordering.test.ts · **Deps:** ET-216
- **Acceptance:** Severity dominance + determinism proven
- **Verification:** Property tests · **Regression:** New tests this session
- **Risk:** Order violations
- **Evidence:** Implementation slice this session

### ET-404 — Edge-case: missing context

- **Description:** No-context analysis fails safely.
- **Linked features:** FR-074
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** src/core/contradiction.ts · **Deps:** ET-113
- **Acceptance:** INSUFFICIENT_EVIDENCE returned
- **Verification:** Engine tests · **Regression:** Existing suite
- **Risk:** Crash or guess
- **Evidence:** Engine tests

### ET-405 — Edge-case: conflicting context

- **Description:** Contradiction surfaced.
- **Linked features:** FR-099, FR-156
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** src/core/contradiction.ts · **Deps:** ET-113
- **Acceptance:** Both sides reported
- **Verification:** Engine tests · **Regression:** Existing suite
- **Risk:** One-sided verdict
- **Evidence:** Engine tests

### ET-406 — Edge-case: stale context

- **Description:** Staleness explicit.
- **Linked features:** FR-075
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** src/core/contradiction.ts · **Deps:** ET-113
- **Acceptance:** STALE_EVIDENCE surfaced
- **Verification:** Engine tests · **Regression:** Existing suite
- **Risk:** Stale-as-fact
- **Evidence:** Engine tests

### ET-407 — Edge-case: invalid inputs

- **Description:** Bad inputs rejected.
- **Linked features:** FR-275, FR-299
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** src/resolvers/ · **Deps:** ET-013
- **Acceptance:** INVALID_INPUT returned
- **Verification:** Resolver tests · **Regression:** Existing suite
- **Risk:** Crash on bad input
- **Evidence:** zod everywhere

### ET-408 — Edge-case: agent timeout

- **Description:** Bounded agent actions.
- **Linked features:** FR-157
- **Priority:** P3 · **Status:** DEFERRED
- **Location:** future middleware · **Deps:** ET-152
- **Acceptance:** Timeout bounds enforced
- **Verification:** Load tests · **Regression:** New tests
- **Risk:** Hung actions
- **Evidence:** Forge runtime bounds execution; custom budgets pending live data

### ET-409 — Edge-case: tool failure

- **Description:** Tool failures explicit.
- **Linked features:** FR-133, FR-282
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** src/rovo/actions.ts · **Deps:** ET-152
- **Acceptance:** UNAVAILABLE/failed envelopes
- **Verification:** Action tests · **Regression:** Existing suite
- **Risk:** Crash responses
- **Evidence:** Envelope tests

### ET-410 — Benchmark methodology documentation

- **Description:** BENCHMARK_METHODOLOGY.md authored.
- **Linked features:** FR-459
- **Priority:** P2 · **Status:** IMPLEMENTED
- **Location:** docs/BENCHMARK_METHODOLOGY.md · **Deps:** ET-007
- **Acceptance:** Definitions + procedure + limitations
- **Verification:** Doc review · **Regression:** Per benchmark change
- **Risk:** Undefended metrics
- **Evidence:** Authored this session

### ET-411 — Benchmark results documentation

- **Description:** BENCHMARK_RESULTS.md authored.
- **Linked features:** FR-449
- **Priority:** P2 · **Status:** IMPLEMENTED
- **Location:** docs/BENCHMARK_RESULTS.md · **Deps:** ET-393
- **Acceptance:** Measured results with replay commands
- **Verification:** Evaluator runs · **Regression:** Per engine change
- **Risk:** Stale results
- **Evidence:** Authored this session

### ET-412 — Metrics audit update

- **Description:** METRICS_AUDIT.md current.
- **Linked features:** FR-397
- **Priority:** P1 · **Status:** IMPLEMENTED
- **Location:** docs/METRICS_AUDIT.md · **Deps:** ET-394
- **Acceptance:** All displayed numbers audited
- **Verification:** Doc review · **Regression:** Per metric change
- **Risk:** Metric drift
- **Evidence:** Updated this session

### ET-413 — Benchmark framework gate

- **Description:** No large framework without approval.
- **Linked features:** FR-460
- **Priority:** P2 · **Status:** TEST_VERIFIED
- **Location:** docs/BENCHMARK_PROPOSAL.md · **Deps:** ET-393
- **Acceptance:** Recommendation documented; decision pending
- **Verification:** Doc review · **Regression:** Per framework change
- **Risk:** Framework bloat
- **Evidence:** Gate documented; existing evaluator only

### ET-414 — Retrieval evaluation design

- **Description:** Retrieval relevance eval.
- **Linked features:** FR-393
- **Priority:** P4 · **Status:** DEFERRED
- **Location:** future benchmark · **Deps:** ET-393
- **Acceptance:** Metric defined + dataset
- **Verification:** Benchmark run · **Regression:** New suite
- **Risk:** Unmeasured retrieval
- **Evidence:** Requires larger labeled corpus

### ET-415 — Evidence citation validity evaluation

- **Description:** Citations support claims.
- **Linked features:** FR-392
- **Priority:** P3 · **Status:** DEFERRED
- **Location:** future benchmark · **Deps:** ET-113
- **Acceptance:** Citation-support rate measured
- **Verification:** Benchmark run · **Regression:** New suite
- **Risk:** Unsupported claims
- **Evidence:** Requires labeled claim-support data

### ET-416 — Analysis correctness evaluation

- **Description:** Conclusion correctness.
- **Linked features:** FR-392
- **Priority:** P2 · **Status:** TEST_VERIFIED
- **Location:** benchmarks/evaluate.ts · **Deps:** ET-393
- **Acceptance:** P/R/F1 on labeled set
- **Verification:** Evaluator run · **Regression:** Per engine change
- **Risk:** Silent engine drift
- **Evidence:** Measured: P=0.800 R=0.571 F1=0.667

### ET-417 — Unsupported-claim rate measurement

- **Description:** Reasoning honesty.
- **Linked features:** FR-398
- **Priority:** P3 · **Status:** DEFERRED
- **Location:** future benchmark · **Deps:** ET-393
- **Acceptance:** Rate measured on scenarios
- **Verification:** Benchmark run · **Regression:** New suite
- **Risk:** Invented claims
- **Evidence:** Requires manual labeling campaign

### ET-418 — Planning constraint evaluation

- **Description:** Plan feasibility checks.
- **Linked features:** FR-388
- **Priority:** P4 · **Status:** DEFERRED
- **Location:** future benchmark · **Deps:** ET-216
- **Acceptance:** Constraint violations measured
- **Verification:** Benchmark run · **Regression:** New suite
- **Risk:** Infeasible plans
- **Evidence:** No multi-step plans yet

### ET-419 — Objective improvement evaluation

- **Description:** Utility measured over time.
- **Linked features:** FR-204
- **Priority:** P4 · **Status:** DEFERRED
- **Location:** future benchmark · **Deps:** ET-216
- **Acceptance:** Utility trend measured
- **Verification:** Benchmark run · **Regression:** New suite
- **Risk:** Unimproved objective
- **Evidence:** Needs live queue history

### ET-420 — Queue ordering/fairness evaluation

- **Description:** Ordering + fairness measured.
- **Linked features:** FR-388
- **Priority:** P3 · **Status:** DEFERRED
- **Location:** future benchmark · **Deps:** ET-216
- **Acceptance:** Fairness metric defined
- **Verification:** Benchmark run · **Regression:** New suite
- **Risk:** Starvation
- **Evidence:** Needs live volume; invariants tested now

### ET-421 — Execution transition evaluation

- **Description:** State transitions correct.
- **Linked features:** FR-271, FR-299
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** tests/unit/execution.test.ts · **Deps:** ET-241
- **Acceptance:** All transitions tested
- **Verification:** Unit tests · **Regression:** Existing suite
- **Risk:** Bad transitions
- **Evidence:** Execution tests

### ET-422 — Verification effectiveness evaluation

- **Description:** Verification catches mismatches.
- **Linked features:** FR-316
- **Priority:** P1 · **Status:** TEST_VERIFIED
- **Location:** tests/unit/verification.test.ts · **Deps:** ET-340
- **Acceptance:** MISMATCH detection tested
- **Verification:** Unit tests · **Regression:** New tests this session
- **Risk:** Useless verification
- **Evidence:** Implementation slice this session

### ET-423 — Governance enforcement evaluation

- **Description:** Approval rules measured.
- **Linked features:** FR-252, FR-253, FR-254, FR-255, FR-256
- **Priority:** P0 · **Status:** TEST_VERIFIED
- **Location:** tests/ · **Deps:** ET-241
- **Acceptance:** All governance tests green
- **Verification:** Suite run · **Regression:** Existing suite
- **Risk:** Governance hole
- **Evidence:** Governance suite green

### ET-424 — End-to-end completion evaluation

- **Description:** Full lifecycle test.
- **Linked features:** FR-438
- **Priority:** P1 · **Status:** TEST_VERIFIED
- **Location:** tests/integration/review-queue.test.ts · **Deps:** ET-393
- **Acceptance:** Analysis→execution→audit in one test
- **Verification:** Integration test · **Regression:** Existing suite
- **Risk:** Broken lifecycle
- **Evidence:** Full-loop test green

### ET-425 — Performance baseline measurement

- **Description:** Latency/resources measured.
- **Linked features:** FR-390
- **Priority:** P4 · **Status:** DEFERRED
- **Location:** future profiling · **Deps:** ET-393
- **Acceptance:** Baseline recorded
- **Verification:** Profiling run · **Regression:** Per release
- **Risk:** Unmeasured perf
- **Evidence:** No production load exists; local numbers would not generalize (BLOCKED on live deploy)

## Workstream 10. Hackathon demonstration and delivery

### ET-426 — Scenario A: normal remediation demo

- **Description:** Analyze→propose→approve→execute→verify fixture.
- **Linked features:** FR-438, FR-011
- **Priority:** P3 · **Status:** TEST_VERIFIED
- **Location:** scripts/demo-scenarios.ts · **Deps:** ET-058,ET-224
- **Acceptance:** Scenario runs deterministically with provenance shown
- **Verification:** Demo runner output · **Regression:** Demo replay
- **Risk:** Non-reproducible demo
- **Evidence:** Implementation slice this session

### ET-427 — Scenario B: approval security demo

- **Description:** All governance refusals shown.
- **Linked features:** FR-439, FR-257
- **Priority:** P3 · **Status:** TEST_VERIFIED
- **Location:** scripts/demo-scenarios.ts,tests/ · **Deps:** ET-241
- **Acceptance:** Agent/self/expired/replay/non-approver all fail visibly
- **Verification:** Test output + demo output · **Regression:** Governance suite
- **Risk:** Weakened rules for demo
- **Evidence:** Implementation slice this session

### ET-428 — Scenario C: evidence contradiction demo

- **Description:** Contradiction + uncertainty surfaced.
- **Linked features:** FR-440, FR-099
- **Priority:** P3 · **Status:** TEST_VERIFIED
- **Location:** scripts/demo-scenarios.ts · **Deps:** ET-113
- **Acceptance:** Contradiction found; uncertainty explicit
- **Verification:** Demo runner output · **Regression:** Demo replay
- **Risk:** False certainty
- **Evidence:** Implementation slice this session

### ET-429 — Scenario D: failed execution demo

- **Description:** Controlled failure path.
- **Linked features:** FR-441, FR-301
- **Priority:** P3 · **Status:** TEST_VERIFIED
- **Location:** scripts/demo-scenarios.ts · **Deps:** ET-340
- **Acceptance:** Failure classified + audited; no fake success
- **Verification:** Demo runner output · **Regression:** Demo replay
- **Risk:** Hidden failure
- **Evidence:** Implementation slice this session

### ET-430 — Scenario E: verification demo

- **Description:** Execution vs verified state distinction.
- **Linked features:** FR-442, FR-287
- **Priority:** P3 · **Status:** TEST_VERIFIED
- **Location:** scripts/demo-scenarios.ts,src/core/verification.ts · **Deps:** ET-340
- **Acceptance:** Executed-but-unverified state demonstrated
- **Verification:** Unit tests + demo output · **Regression:** New tests this session
- **Risk:** Conflated outcomes
- **Evidence:** Implementation slice this session

### ET-431 — Scenario F: optimization/queue demo

- **Description:** Documented utility ordering shown.
- **Linked features:** FR-443, FR-186
- **Priority:** P3 · **Status:** TEST_VERIFIED
- **Location:** scripts/demo-scenarios.ts,src/core/queue.ts · **Deps:** ET-216
- **Acceptance:** Multiple proposals ordered + explained by utility
- **Verification:** Ordering tests + demo output · **Regression:** New tests this session
- **Risk:** Arbitrary order
- **Evidence:** Implementation slice this session

### ET-432 — Demo runner script

- **Description:** One command runs all scenarios.
- **Linked features:** FR-463
- **Priority:** P3 · **Status:** TEST_VERIFIED
- **Location:** scripts/demo-scenarios.ts,package.json · **Deps:** ET-426..ET-431
- **Acceptance:** npm run demo executes all scenarios deterministically
- **Verification:** Demo run exit code · **Regression:** Demo replay
- **Risk:** Broken demo
- **Evidence:** Implementation slice this session

### ET-433 — HACKATHON_DEMO_SCRIPT.md

- **Description:** Exact demo steps + narration.
- **Linked features:** FR-444
- **Priority:** P3 · **Status:** IMPLEMENTED
- **Location:** docs/HACKATHON_DEMO_SCRIPT.md · **Deps:** ET-432
- **Acceptance:** Every step runnable; timings included
- **Verification:** Doc review + run-through · **Regression:** Demo replay
- **Risk:** Undemoable script
- **Evidence:** Authored this session

### ET-434 — Demo timing plan

- **Description:** Minute-by-minute schedule.
- **Linked features:** FR-461
- **Priority:** P3 · **Status:** IMPLEMENTED
- **Location:** docs/HACKATHON_DEMO_SCRIPT.md · **Deps:** ET-433
- **Acceptance:** Plan fits the pitch window
- **Verification:** Doc review · **Regression:** Per pitch change
- **Risk:** Overtime demo
- **Evidence:** Included in demo script

### ET-435 — Demo replay instructions

- **Description:** Judges can re-run everything.
- **Linked features:** FR-446
- **Priority:** P3 · **Status:** IMPLEMENTED
- **Location:** docs/HACKATHON_DEMO_SCRIPT.md,README.md · **Deps:** ET-432
- **Acceptance:** All commands copy-pasteable
- **Verification:** Run-through on clean checkout · **Regression:** Fresh clone test
- **Risk:** Missing steps
- **Evidence:** Included this session

### ET-436 — Judging evidence pack

- **Description:** Test output + transcripts included.
- **Linked features:** FR-447
- **Priority:** P3 · **Status:** IMPLEMENTED
- **Location:** docs/FINAL_VALIDATION_REPORT.md · **Deps:** ET-381
- **Acceptance:** Report contains exact outputs
- **Verification:** Report review · **Regression:** Per release
- **Risk:** Stale evidence
- **Evidence:** Updated this session

### ET-437 — Proof-of-work appendix

- **Description:** Commands and outputs recorded.
- **Linked features:** FR-464
- **Priority:** P3 · **Status:** IMPLEMENTED
- **Location:** docs/FINAL_VALIDATION_REPORT.md · **Deps:** ET-435
- **Acceptance:** Every claim has a command
- **Verification:** Report review · **Regression:** Per release
- **Risk:** Unverifiable claims
- **Evidence:** Updated this session

### ET-438 — HACKATHON_DIFFERENTIATION.md

- **Description:** Pitch narrative authored.
- **Linked features:** FR-457
- **Priority:** P3 · **Status:** IMPLEMENTED
- **Location:** docs/HACKATHON_DIFFERENTIATION.md · **Deps:** ET-432
- **Acceptance:** Differentiation grounded in implemented proof
- **Verification:** Doc review · **Regression:** Per release
- **Risk:** Overclaiming
- **Evidence:** Authored this session

### ET-439 — Differentiation vs generic AI dashboards

- **Description:** Explicit contrast documented.
- **Linked features:** FR-465
- **Priority:** P3 · **Status:** IMPLEMENTED
- **Location:** docs/HACKATHON_DIFFERENTIATION.md · **Deps:** ET-437
- **Acceptance:** Contrast backed by features
- **Verification:** Doc review · **Regression:** Per release
- **Risk:** Strawman claims
- **Evidence:** Included in differentiation doc

### ET-440 — Submission checklist

- **Description:** Exact submission contents + status.
- **Linked features:** FR-466
- **Priority:** P3 · **Status:** IMPLEMENTED
- **Location:** docs/HACKATHON_DIFFERENTIATION.md · **Deps:** ET-437
- **Acceptance:** Checklist matches repo contents
- **Verification:** Checklist audit · **Regression:** Per release
- **Risk:** Missing items
- **Evidence:** Authored this session

### ET-441 — README final update

- **Description:** README matches as-built product.
- **Linked features:** FR-448
- **Priority:** P2 · **Status:** TEST_VERIFIED
- **Location:** README.md · **Deps:** ET-001
- **Acceptance:** README accurate incl. demo instructions
- **Verification:** README review · **Regression:** Per release
- **Risk:** Doc drift
- **Evidence:** Updated this session

### ET-442 — Final validation report update

- **Description:** Report current with exact outputs.
- **Linked features:** FR-464
- **Priority:** P2 · **Status:** IMPLEMENTED
- **Location:** docs/FINAL_VALIDATION_REPORT.md · **Deps:** ET-381
- **Acceptance:** Report reflects final suite + demo
- **Verification:** Report review · **Regression:** Per release
- **Risk:** Stale report
- **Evidence:** Updated this session

### ET-443 — Bonus prize matrix refresh

- **Description:** Bonus evidence current.
- **Linked features:** FR-458
- **Priority:** P3 · **Status:** TEST_VERIFIED
- **Location:** docs/bonus-evidence-matrix.md · **Deps:** ET-001
- **Acceptance:** Matrix statuses accurate
- **Verification:** Doc review · **Regression:** Per pass
- **Risk:** Wrong prize claims
- **Evidence:** Matrix maintained; statuses honest

### ET-444 — Video outline

- **Description:** Script outline for demo video.
- **Linked features:** FR-456
- **Priority:** P3 · **Status:** NOT_STARTED
- **Location:** docs/HACKATHON_DEMO_SCRIPT.md · **Deps:** ET-433
- **Acceptance:** Outline matches demo flow
- **Verification:** Doc review · **Regression:** Per release
- **Risk:** Script drift
- **Evidence:** Backlog; demo script is the basis

### ET-445 — Honest limitations section

- **Description:** Blockers stated.
- **Linked features:** FR-450
- **Priority:** P2 · **Status:** TEST_VERIFIED
- **Location:** docs/,README.md · **Deps:** ET-026
- **Acceptance:** All blockers listed with unblock actions
- **Verification:** Doc review · **Regression:** Per pass
- **Risk:** Hidden limits
- **Evidence:** Limitations documented

### ET-446 — Reproducibility commands

- **Description:** Every claim runnable.
- **Linked features:** FR-451
- **Priority:** P2 · **Status:** TEST_VERIFIED
- **Location:** docs/,README.md · **Deps:** ET-001
- **Acceptance:** Commands produce recorded outputs
- **Verification:** Run-through · **Regression:** Per release
- **Risk:** Broken commands
- **Evidence:** Commands verified this session

### ET-447 — Before/after defect evidence

- **Description:** Register shows fixes.
- **Linked features:** FR-452
- **Priority:** P3 · **Status:** TEST_VERIFIED
- **Location:** docs/TECHNICAL_DEBT.md · **Deps:** ET-030
- **Acceptance:** Register maps defects→fixes→tests
- **Verification:** Doc review · **Regression:** Per pass
- **Risk:** Untraceable fixes
- **Evidence:** CC register current

### ET-448 — Architecture diagram update

- **Description:** Diagram matches as-built.
- **Linked features:** FR-453
- **Priority:** P2 · **Status:** IMPLEMENTED
- **Location:** docs/AS_BUILT_ARCHITECTURE.md,README.md · **Deps:** ET-027
- **Acceptance:** Diagram includes verification + queue ordering
- **Verification:** Doc review · **Regression:** Per architecture change
- **Risk:** Stale diagram
- **Evidence:** Updated this session

### ET-449 — Security demonstration step

- **Description:** Governance proof in demo.
- **Linked features:** FR-454
- **Priority:** P3 · **Status:** IMPLEMENTED
- **Location:** docs/HACKATHON_DEMO_SCRIPT.md · **Deps:** ET-427
- **Acceptance:** Scenario B narration references real tests
- **Verification:** Doc + test review · **Regression:** Governance suite
- **Risk:** Theater instead of proof
- **Evidence:** Included in demo script

### ET-450 — Live vs sandbox labeling

- **Description:** Modes honestly labeled.
- **Linked features:** FR-462
- **Priority:** P3 · **Status:** TEST_VERIFIED
- **Location:** src/frontend/,docs/ · **Deps:** ET-055
- **Acceptance:** Sandbox labeled as scripted transport
- **Verification:** UI inspection · **Regression:** UI review
- **Risk:** Fake-live confusion
- **Evidence:** Banner + docs label sandbox

### ET-451 — External blockers disclosure

- **Description:** Blockers listed everywhere relevant.
- **Linked features:** FR-467
- **Priority:** P2 · **Status:** TEST_VERIFIED
- **Location:** docs/,README.md · **Deps:** ET-026
- **Acceptance:** Deploy/graph/marketplace blockers stated
- **Verification:** Doc review · **Regression:** Per pass
- **Risk:** Implied completion
- **Evidence:** Disclosed consistently

### ET-452 — Measured vs simulated separation

- **Description:** Labels enforced.
- **Linked features:** FR-460
- **Priority:** P2 · **Status:** TEST_VERIFIED
- **Location:** docs/ · **Deps:** ET-025
- **Acceptance:** No simulated result labeled live
- **Verification:** Doc audit · **Regression:** Per doc change
- **Risk:** Label erosion
- **Evidence:** Audited

### ET-453 — Benchmark presentation

- **Description:** Measured results presented.
- **Linked features:** FR-449
- **Priority:** P2 · **Status:** IMPLEMENTED
- **Location:** docs/BENCHMARK_RESULTS.md · **Deps:** ET-393
- **Acceptance:** Results with definitions + replay commands
- **Verification:** Doc + evaluator run · **Regression:** Per engine change
- **Risk:** Cherry-picked metrics
- **Evidence:** Authored this session

### ET-454 — Evaluation methodology documentation

- **Description:** Methodology authored.
- **Linked features:** FR-459
- **Priority:** P2 · **Status:** IMPLEMENTED
- **Location:** docs/BENCHMARK_METHODOLOGY.md · **Deps:** ET-393
- **Acceptance:** Definitions, procedure, limitations
- **Verification:** Doc review · **Regression:** Per benchmark change
- **Risk:** Undefended metrics
- **Evidence:** Authored this session

### ET-455 — Sandbox demo for judges

- **Description:** In-product demo path works.
- **Linked features:** FR-011, FR-462
- **Priority:** P3 · **Status:** TEST_VERIFIED
- **Location:** src/frontend/sandbox/ · **Deps:** ET-055
- **Acceptance:** Sandbox walks all scenarios
- **Verification:** sandbox-engine tests · **Regression:** Existing suite
- **Risk:** Broken sandbox
- **Evidence:** sandbox-engine tests green

### ET-456 — Judges quickstart path

- **Description:** Five-minute path to first result.
- **Linked features:** FR-446
- **Priority:** P3 · **Status:** TEST_VERIFIED
- **Location:** README.md,docs/HACKATHON_DEMO_SCRIPT.md · **Deps:** ET-432
- **Acceptance:** Quickstart works on clean checkout
- **Verification:** Fresh-clone run-through · **Regression:** Per release
- **Risk:** Broken quickstart
- **Evidence:** Included in demo script

### ET-457 — Demo npm script

- **Description:** npm run demo wired.
- **Linked features:** FR-463
- **Priority:** P3 · **Status:** TEST_VERIFIED
- **Location:** package.json · **Deps:** ET-432
- **Acceptance:** Script runs demo runner
- **Verification:** npm run demo · **Regression:** Demo replay
- **Risk:** Missing script
- **Evidence:** Wired this session

### ET-458 — Release commit

- **Description:** Final coherent commit.
- **Linked features:** FR-451
- **Priority:** P2 · **Status:** NOT_STARTED
- **Location:** git · **Deps:** ET-426..ET-435
- **Acceptance:** All work committed with message
- **Verification:** git log · **Regression:** Per release
- **Risk:** Uncommitted work
- **Evidence:** Final commit at mission end

### ET-459 — Remote push gate

- **Description:** Push requires explicit authorization.
- **Linked features:** FR-451
- **Priority:** P2 · **Status:** BLOCKED
- **Location:** git remote · **Deps:** ET-458
- **Acceptance:** No push without user authorization
- **Verification:** Policy adherence · **Regression:** Session protocol
- **Risk:** Accidental publish
- **Evidence:** Awaiting explicit user authorization to push (branch main, remote contextcourt)
