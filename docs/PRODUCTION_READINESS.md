# Production Readiness — Context Court AI

**Honest position:** locally production-grade, externally not yet live.

## What is production-grade today (verified)
- Deterministic evidence engine with a measured, reproducible benchmark.
- Human-governed remediation: bindings, self-approval rejection, expiry,
  approver-only execution, replay registry — 15 tested invariants
  (docs/SECURITY_AND_GOVERNANCE.md).
- Independent post-execution verification (VERIFIED/MISMATCH/UNVERIFIED).
- Digest-chained, tamper-evident audit ledger covering the full lifecycle.
- Reliability architecture: timeouts, circuit breaker, idempotency-guarded
  retries with jitter, KVS-backed rate limiting with retry guidance.
- Durable tenant-isolated storage (proposals, decisions, executions, audit).
- Supply chain: 0 critical/0 high advisories, CI-gated; licenses compatible.
- 152/152 tests, 22 files; one-command deterministic demo (6/6).

## What blocks production (external, precisely)
1. Forge deployment — requires Atlassian credentials (`forge login`).
2. Live verification of the deployed app (checklist in DEPLOYMENT_READINESS).
3. Teamwork Graph scopes (optional enrichment) and Marketplace listing
   (distribution) — later stage items.

## Known accepted limitations
- 14 moderate audit advisories: no upstream fix / SDK-downgrade-only (ADR doc).
- O(n) audit-chain append (documented trigger for optimization).
- KVS lacks transactions: concurrent decisions accept last-writer-wins with
  full audit visibility (ADR-007).
- Supersession pipeline awaits a DecisionRecord source (no product surface
  claims it runs).

This file is the claim of record: nothing here is marked live without a real
connection. See docs/FINAL_FEATURE_COMPLETION_REPORT.md for the full split.
