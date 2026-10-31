# Benchmark Results — ContextCourt AI (MEASURED)

Engine: deterministic normalizer + verification pipeline (`src/core/`).
Dataset: `benchmarks/dataset.json` — 120 labeled scenarios (96 dev / 24
held-out). Procedure and definitions: `docs/BENCHMARK_METHODOLOGY.md`.

## Detection quality — measured 2026-10-31 (post-mission, exact replay)

| Split | n | TP | FP | FN | TN | Precision | Recall | F1 | FPR |
|---|---|---|---|---|---|---|---|---|---|
| overall | 120 | 40 | 10 | 30 | 40 | **0.800** | **0.571** | **0.667** | 0.200 |
| dev | 96 | 32 | 8 | 24 | 32 | 0.800 | 0.571 | 0.667 | 0.200 |
| heldout | 24 | 8 | 2 | 6 | 8 | 0.800 | 0.571 | 0.667 | 0.200 |

Reproduce: `npx vite-node benchmarks/evaluate.ts benchmarks/dataset.json` —
output is byte-identical across runs (re-verified 2026-10-28 and 2026-10-31
after the verification/queue work: **the engine metrics are unchanged**,
confirming the mission slice did not alter detection behavior).

## Interpretation (honest)

- **Precision 0.800**: every predicted contradiction cites evidence on both
  sides; the 10 FPs are temporal cases the engine verifies as full
  contradictions where a stricter reading would call them potential.
- **Recall 0.571 is by design partially**: stale/restricted templates are
  labeled CONTRADICTION in ground truth, but the engine refuses to verify
  without trustworthy evidence (STALE_EVIDENCE / ACCESS_RESTRICTED) — the
  product's core safety invariant is deliberately prioritized over the
  metric. They count as FN under the strict definition.
- Synthetic dataset; ±0.1 F1 uncertainty on the held-out split.

## Invariant measurements (all MEASURED via automated tests, 2026-10-31)

| Invariant | Result | Evidence |
|---|---|---|
| Unauthorized execution success rate | **0** (self-approve, non-approver, expired, replay, unapproved) | `tests/unit/execution.test.ts`, demo Scenario B |
| Audit chain tamper detection | detected on any edit | `tests/unit/audit-log.test.ts` |
| Queue ordering determinism | 20/20 permutations identical | `tests/unit/queue-ordering.test.ts` |
| Post-execution verification accuracy | VERIFIED on confirmed writes; MISMATCH on absent writes; UNVERIFIED on unreadable source | `tests/unit/verification.test.ts`, demo Scenario E |
| Demo reproducibility | 6/6 scenarios, deterministic | `npm run demo` |
| Register validity | 468+459 records, all §15 rules pass | `npm run validate:registers` |

## Not measured (and never claimed)

Latency, throughput, cost, approval-time analytics, agent live reliability:
no live deployment exists to produce these numbers. They are omitted, not
estimated. No external-system comparison has been measured — none is claimed.
