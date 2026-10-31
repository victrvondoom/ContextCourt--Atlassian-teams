# Metrics Audit — ContextCourt AI

Written 2026-10-31. Every number the product displays or a doc claims, with
its formula, source, and evidence label. Labels: MEASURED · TEST-VERIFIED ·
SIMULATED · ESTIMATED · MOCK-VERIFIED · UNVERIFIED · BLOCKED.

## Engine quality (benchmark)

| Metric | Value | Formula | Source data | Label |
|---|---|---|---|---|
| Precision | 0.800 | TP/(TP+FP) | 120 labeled synthetic scenarios (96 dev / 24 held-out), run through the real engine | MEASURED (re-run 2026-10-31 reproduces exactly — deterministic replay) |
| Recall | 0.571 | TP/(TP+FN) | same | MEASURED — *by design partially*: stale/restricted templates are correctly refused verification and count as FN under the strict metric |
| F1 | 0.667 | harmonic mean | same | MEASURED |
| FPR | 0.200 | FP/(FP+TN) | same | MEASURED |

Run: `npx vite-node benchmarks/evaluate.ts benchmarks/dataset.json`. Denominator
= all 120 scenarios; no sampling, no estimation. Limitation (documented in
`benchmarks/RESULTS.md`): synthetic templates, no live Atlassian data,
uncertainty ≈ ±0.1 F1 on the 24-item held-out split. **No comparison against
external systems has been measured — none is claimed anywhere.**

## UI-displayed values (all dynamic as of 2026-10-31)

| Displayed value | Source | Label |
|---|---|---|
| Review badge count | `listProposals` → count of `PENDING_APPROVAL` for the tenant | TEST-VERIFIED (live KVS: BLOCKED to display) |
| Case list/detail | `listCases` / `getCase` → stored KVS records | TEST-VERIFIED |
| Audit ledger rows | `listAuditEvents` → chained KVS events (`analysis_run`, `prepare_remediation`, `proposal_approved/rejected`, `proposal_executed`) | TEST-VERIFIED (chain integrity + determinism tested) |
| Integration health (jira) | Real `/rest/api/3/myself` probe per call | TEST-VERIFIED logic; the probe result itself is BLOCKED live |
| Integration health (graph/rovo/mcp) | `not-wired` configuration facts | honest static config, labeled as such |
| Analysis findings | computed per request by the engine | TEST-VERIFIED |
| Sandbox values | computed in-browser by the real engine over deterministic fixtures | TEST-VERIFIED (determinism + loop + chain) |

## Removed / corrected misleading measurements

- **Sandbox timestamps** previously rendered `1970-01-01` (hardcoded mock);
  all mock metric objects were deleted — sandbox now computes its own values.
- **Health** previously asserted `jira: available` without a probe (fixed in
  the prior pass); re-confirmed this pass.
- The review badge previously counted *cases* (wrong denominator) — now
  counts pending proposals.

## Metrics intentionally NOT displayed

Latency, throughput, token usage, cost, agent success rate: the deterministic
engine performs no model calls, and there is no live traffic to measure. Any
dashboard showing these today would be fabricated — they are omitted by
design until a deployed app produces real request telemetry.
