# Existing Feature Inventory — ContextCourt AI

Everything implemented and verified as of 2026-10-31 (test evidence in
parentheses). Full capability catalogue with dispositions:
`docs/FEATURE_CATALOG.md` (468 records).

## Engine (deterministic, no LLM in the verified path)
- Evidence records with provenance, digests, access context, tenant scoping
  (`tests/unit/*`, `tests/security/tenant-isolation.test.ts`)
- ADF→text extraction for Jira v3 descriptions/comments (`tests/unit/adf.test.ts`)
- Shared sanitized evidence builder for resolver + agent paths
  (`tests/integration/review-queue.test.ts`)
- Pattern normalizer (negation-first, one predicate per sentence, provenance
  per proposition) (`tests/unit/contradiction.test.ts` — 10 invariants)
- Verification pipeline: downgrade-only, both-sides-evidence, stale/restricted
  classification, INSUFFICIENT_EVIDENCE instead of guessing
- Severity with recency weight + confidence as a separate axis

## Remediation + governance loop
- Proposal drafting with operation catalog, severity/risk gates, evidence
  requirement (`tests/unit/impact-remediation.test.ts`)
- Review queue ordered by the documented review-utility function with
  per-proposal explanations (`tests/unit/queue-ordering.test.ts` — 9 tests)
- Approval state machine + bindings; self-approval impossible; 1h expiry;
  approver-only execution; permanent replay registry
  (`tests/unit/approval.test.ts`, `tests/unit/execution.test.ts` — 11)
- Execution: ADF comment / issue creation with embedded trace markers;
  explicit EXECUTION_FAILED, never silent
- **Independent post-execution verification**: read-back of the executed
  write with VERIFIED / MISMATCH / UNVERIFIED states
  (`tests/unit/verification.test.ts` — 9)
- Digest-chained audit ledger for the full lifecycle, insertion-monotonic,
  tamper-evident (`tests/unit/audit-log.test.ts`,
  `tests/unit/audit-determinism.test.ts` — incl. same-ms regression)

## Surfaces
- Custom UI: Overview (analysis + dynamic open cases), Cases, CaseDetail
  (findings + prepare-remediation), Review queue (approve/reject/execute with
  governance-reason disabled states, verification pills, priority
  explanations), Audit ledger, Integrations (probed health)
- Rovo agent: 6 actions, MCP tools, 2 skills; **no approve/execute tool**
- Sandbox: the real core running in-browser over deterministic per-key
  fixtures, in-memory stores, scripted Jira transport (writes recorded,
  never sent) (`tests/integration/sandbox-engine.test.ts`)
- Demo: `npm run demo` — Scenarios A–F, deterministic
  (`scripts/demo-scenarios.ts`)

## Registers and tooling
- 468-feature catalogue + 459-task register + traceability, generated and
  validated (`npm run build:registers`, `npm run validate:registers`)

## Deliberately NOT implemented (honest)
- Teamwork Graph wiring (BLOCKED: scopes + dev site)
- Live Forge deployment (BLOCKED: credentials) — all live-path claims stay
  TEST-VERIFIED locally
- Marketplace listing; LLM-assisted extraction; background scheduling
  (rationale in `docs/FEATURE_CATALOG.md` dispositions and
  `docs/OPTIMIZATION_MODEL.md`)
