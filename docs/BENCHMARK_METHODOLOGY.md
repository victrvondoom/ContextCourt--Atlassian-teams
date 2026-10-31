# Benchmark Methodology — ContextCourt AI

## What is measured

Detection quality of the deterministic contradiction engine over a labeled
scenario set: does the engine's verdict match the ground-truth label?

## Definitions (numerators/denominaries explicit)

| Metric | Definition | Formula |
|---|---|---|
| Precision | Of predicted contradictions, how many are true | TP/(TP+FP) |
| Recall | Of true contradictions, how many the engine reports | TP/(TP+FN) |
| F1 | Harmonic mean of P and R | 2PR/(P+R) |
| FPR | Of true consistent scenarios, how many are flagged | FP/(FP+TN) |

TP = engine reports CONTRADICTION on a labeled CONTRADICTION scenario, etc.

## Dataset

`benchmarks/dataset.json` — 120 hand-authored template scenarios (12 templates
× 10 instances), split 96 dev / 24 held-out at authoring time. Ground truth
is attached at authoring time (not inferred). Templates include clean
contradictions, consistent cases, insufficient-evidence cases, stale-evidence
cases, access-restricted cases, and injection cases.

## Measurement procedure (reproduction command)

```bash
npx vite-node benchmarks/evaluate.ts benchmarks/dataset.json
```

The evaluator runs the REAL engine (`src/core/contradiction.ts` +
normalizer) over each scenario and prints the confusion matrix and metrics.
No sampling, no randomness: repeated runs are byte-identical (verified by
replay on 2026-10-28 and again on 2026-10-31 after the mission changes).

## Baseline

The deterministic pattern engine itself is the baseline (v0). No comparison
against external systems has been measured — none is claimed. A keyword-only
and an LLM-summarization baseline are designed but NOT measured; no invented
comparison numbers appear anywhere in this repository.

## Known limitations (stated, not hidden)

- Synthetic templates; no live Atlassian data.
- Recall is *by design partially* low: stale/restricted templates are labeled
  CONTRADICTION in ground truth, but the engine correctly refuses to verify
  them (STALE_EVIDENCE / ACCESS_RESTRICTED) — the safety invariant is
  prioritized over the metric; those cases count as FN under the strict
  definition.
- Held-out n=24 → metric uncertainty ≈ ±0.1 F1.

## Additional invariants measured (not quality metrics)

- Governance refusals: unauthorized execution success rate = 0 (unit tests).
- Queue ordering: determinism + severity dominance (property tests).
- Verification: executed-but-mismatch detection (unit tests).
- Register validity: 468+459 records, all rules (validator exit 0).

## Recommendation on a larger framework

Not justified for this mission: the valuable measurements (engine quality,
governance invariants, ordering, verification) are all covered by the
lightweight evaluator + test suite, which are reproducible and CI-wired.
Live-volume metrics (latency, approval times, funnel analytics) require a
deployed app and are explicitly BLOCKED/DEFERRED with reasons in
`docs/FEATURE_CATALOG.md`.
