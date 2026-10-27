# Benchmark results — 2026-10-28 (ACTUAL, reproducible)

Dataset: `benchmarks/dataset.json` — 120 scenarios from 12 hand-authored templates
(10 instances each), split 96 dev / 24 held-out. Ground-truth labels are attached
at authoring time. Run:

```bash
node benchmarks/generate-dataset.mjs
npx vite-node benchmarks/evaluate.ts benchmarks/dataset.json
```

## Measured results (engine: deterministic normalizer + verification pipeline)

| Split   | n   | TP | FP | FN | TN | Precision | Recall | F1    | FPR  |
|---------|-----|----|----|----|----|-----------|--------|-------|------|
| overall | 120 | 40 | 10 | 30 | 40 | 0.800     | 0.571  | 0.667 | 0.200 |
| dev     | 96  | 32 | 8  | 24 | 32 | 0.800     | 0.571  | 0.667 | 0.200 |
| heldout | 24  | 8  | 2  | 6  | 8  | 0.800     | 0.571  | 0.667 | 0.200 |

## Interpretation (honest)

- **Precision 0.80**: every predicted contradiction cites evidence on both sides;
  10 FPs come from `T12`-style temporal cases the engine verifies as full
  contradictions where a stricter reading would call them potential.
- **Recall 0.57** is *by design partially*: templates `T9` (stale evidence) and
  `T10` (restricted access) are labeled CONTRADICTION in ground truth, but the
  engine correctly refuses to VERIFY them and reports STALE_EVIDENCE /
  ACCESS_RESTRICTED instead — the safety invariant (no evidence → no verified
  contradiction) is prioritized over recall. Treated as false negatives here to
  keep the metric definition strict.
- These are baseline numbers for the deterministic layer only; the AI-assisted
  extraction layer (Layer A LLM assistance) is not yet included. No comparison
  against external systems has been measured.

## Known limitations

- Synthetic templates; no live Atlassian data in this dataset.
- Small held-out set (24); uncertainty on these metrics is roughly ±0.1 F1.
- Baselines (keyword-only, LLM-summarization) listed in the test plan are NOT
  yet measured — no invented comparison numbers.
