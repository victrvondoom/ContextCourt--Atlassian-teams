# Benchmark Proposal — Decision Gate

Written 2026-10-31. Per the project protocol, **no new benchmark framework is
introduced by this document** — it is a recommendation awaiting approval. The
existing lightweight evaluator (`benchmarks/evaluate.ts`) is unchanged and was
re-run to confirm reproducibility (P=0.800 / R=0.571 / F1=0.667 — exact replay).

## Which agentic actions are actually performance-sensitive?

| Action | Perf-sensitive? | Correctness risk? | Needs reproducibility? |
|---|---|---|---|
| investigate-issue (contradiction detection) | No (sub-ms deterministic) | **Yes** — false verified contradictions damage trust | **Yes** — deterministic engine makes this free |
| get-evidence (sanitized retrieval) | No | Yes — injection handling | Yes |
| get-impact (BFS over verified edges) | Only at large graph depth | Medium | Yes |
| prepare-remediation (gating) | No | **Yes** — severity gates | Yes |
| decide/execute (human loop) | No | **Yes** — authorization invariants | Yes |
| Rovo agent *prompt* behavior (LLM) | Unknown until live | Yes — citation discipline | Cannot benchmark without live Rovo access |

Key observation: correctness risk is concentrated in **invariant tests**, not
in performance. All of it is already covered by the 86-test suite. Performance
benchmarks would measure a deterministic function over trivially small inputs —
vanity numbers.

## Proposed benchmark matrix

| Agent/action | Metric | Baseline | Dataset | Evaluation method | Frequency | Expected value | Cost |
|---|---|---|---|---|---|---|---|
| Contradiction engine | P/R/F1 | 0.80/0.57/0.67 (**existing**) | current 120-scenario set | existing evaluator | per engine change | ≥ baseline | done |
| Engine | FP on injection fixtures | 0 (invariant) | injection scenarios | unit tests | per change | 0 verified-from-injection | done |
| Execution loop | unauthorized-execution success rate | 0 (invariant) | adversarial cases (self-approve, replay, expired, non-approver) | `tests/unit/execution.test.ts` | per change | 0 | done |
| Rovo agent citation discipline | % claims with evidence id | none | 20+ live investigations | human rubric + script on dev site | per release | ≥95% | **requires dev site** |
| Live analysis latency | p50/p95 | none | real issues on dev site | Forge logs | per release | informative only | **requires dev site** |
| Graph-enriched impact | edge precision vs Jira links | Jira-links-only (current) | dev-site issues with links | differential check | after wiring | ≥ baseline | **requires dev site + scopes** |

## Recommendation

**A. Implement immediately** — already implemented (no new framework): engine
quality evaluator, injection/authorization invariant tests, replay
regression. These are the benchmarks with real product value.

**B. Implement later (after live deploy):** Rovo citation-discipline rubric,
live latency percentiles, graph-impact differential. All depend on external
infrastructure; pre-building them now would produce untestable code.

**C. Unnecessary:** token/cost benchmarks (no LLM in the verified path),
throughput/queue benchmarks (no queue exists — see OPTIMIZATION_MODEL.md),
UI micro-benchmarks.

**D. Requires real data/infra:** everything in B.

**Decision requested:** none needed for A (done, lightweight, no new
dependencies). For B, approval is deferred until the dev-site deployment
unblocks real measurement — building them earlier would violate the
no-fabricated-measurements rule.
