# Implementation Roadmap

Priority-ordered; P0–P2 executed in this pass, later items gated.

## P0 — Critical correctness (this pass)
- CC-001: ADF→plain-text extraction for description + comments; regression fixtures. *Live shape remains LIVE-BLOCKED until a dev-site deploy.*
- CC-002: persist findings + case records during `investigateIssueCore`; `prepareRemediation` becomes reachable; contract test with fake KVS.

## P1 — Reliability & honest measurements (this pass)
- CC-003: deterministic audit ordering + collision-free ids + single chain implementation.
- CC-004: health resolver probes Jira with the caller's credentials instead of hardcoding `available`.
- CC-010: clickable case rows → real case detail; review badge from stored case count.

## P2 — Context provenance (this pass, incremental)
- Evidence age feeds severity (CC-005); issuelink semantics corrected (CC-006); fingerprint corrected (CC-008).
- Provenance already per-evidence (digest, version, access context, extraction method) — extended, not redesigned.

## P3 — Optimization / priority queue
- Current state: findings are ranked by documented explicit weights (`core/severity.ts`); there is **no work queue** (no async jobs exist — Forge is request-scoped). Building a queue/optimizer now would be speculative infrastructure. Documented in `docs/OPTIMIZATION_MODEL.md`; revisit when background scheduling (e.g. scheduled triggers) is introduced.

## P4 — Agent verification matrix
- Every Rovo action gets an explicit verification contract (`docs/AGENT_VERIFICATION_MATRIX.md`); read-only actions verify via contract tests; proposal action gains a KVS round-trip test this pass.

## P5 — Metrics & benchmarks
- Audit of every displayed number in `docs/METRICS_AUDIT.md`; benchmark decision gate in `docs/BENCHMARK_PROPOSAL.md` — **approval required before adding a framework**.

## P6+ — Cloud-native / product
- Modular monolith on Forge is correct for current scale; no K8s/queues until a real need exists (`docs/CLOUD_ARCHITECTURE.md`).
- Product taste review + UI refinements (`docs/PRODUCT_TASTE_REVIEW.md`).

---

## Pass 2026-10-31 — the human-approval loop & full dynamics (executed)

P0/P1 items below are **done and test-verified** (86/86 tests, typecheck/lint/build green):

- **P0** CC-013: the review-queue loop end to end — `KvsProposalRepository`, `prepareProposal`/`listProposals`/`decideProposal`/`executeProposal` resolvers, `core/execution.ts` (decision + execution with authorization invariants, replay registry, scripted-write testability), dynamic Review queue UI. `write:jira-work` scope added to the manifest (approved execution only; agents cannot execute).
- **P0** CC-014: one sanitized evidence builder shared by the resolver and the Rovo get-evidence action.
- **P1** CC-015/016/019/020: analysis runs audited; review badge = pending proposals; typecheck gate repaired; proposal storage unified.
- **P2** CC-017/018: CaseDetail renamed out of `Static.tsx`; **sandbox rebuilt as the real engine** running in-browser over deterministic fixtures (mock data files deleted).
- Docs: OPTIMIZATION_MODEL, AGENT_VERIFICATION_MATRIX, METRICS_AUDIT, BENCHMARK_PROPOSAL, CLOUD_ARCHITECTURE, PRODUCT_TASTE_REVIEW, FINAL_VALIDATION_REPORT written.

### Next actionable steps (in order)

1. External: `forge login` → `forge register` → `forge deploy` → `forge install` on a Jira dev site; verify live: health probe, analysis on a real issue (ADF shape), approve+execute one proposal, Rovo tool invocation.
2. On live verification: change `health` labels for `rovoAgent`/`mcp` from `not-wired` to probed states; wire Teamwork Graph enrichment into `getImpact` behind granular graph scopes.
3. Benchmark decision gate: awaiting approval for any framework beyond the existing evaluator (see `docs/BENCHMARK_PROPOSAL.md`).

---

## Mission pass 2026-10-31 — hackathon expansion (executed)

- Re-verified baseline independently (87/87 at `d3acfca`, benchmark exact).
- Registers: 468 features + 459 tasks authored as data modules, generated
  into docs, validated by `npm run validate:registers` (all §15 rules).
- **CC-022 fixed**: independent post-execution verification
  (`src/core/verification.ts` + resolver/sandbox wiring + 9 tests) — execution
  success and verification success are separate audited facts.
- **CC-023 fixed**: queue ordering by the documented review-utility function
  (`src/core/queue.ts`, `docs/QUEUE_DESIGN.md`, 9 invariant/property tests,
  per-item priority explanations in the UI).
- Demo: `scripts/demo-scenarios.ts` (`npm run demo`) — Scenarios A–F through
  the real core with a scripted transport; 6/6, deterministic.
- Docs: audit, as-built architecture, feature inventory, context/evidence
  architecture, agent contracts, queue design, security & governance,
  verification matrix, benchmark methodology/results, demo script,
  differentiation, handoff; README updated.
- Final state: typecheck/lint/format clean, **105/105 tests (16 files)**,
  build ok, registers valid.

Next actionable steps: unchanged — dev-site deploy first, then graph wiring;
see `docs/MISTRAL_VIBE_HANDOFF.md`.
