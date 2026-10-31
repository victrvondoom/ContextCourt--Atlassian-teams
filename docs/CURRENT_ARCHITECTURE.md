# Current Architecture (as-built, 2026-10-30)

```
                    ┌────────────────────────── Forge runtime (per-tenant, user-scoped) ──────────────────────────┐
 Custom UI (React)  │   resolvers/index.ts ─┐                     rovo/actions.ts ────────────┐                    │
  Overview/Cases/   │   health/listCases/   │                     get-case/get-evidence/          │                    │
  Review/Audit      │   listAuditEvents/    │                     get-impact/prepare-remediation  │                    │
        │           │   analyzeIssue ───────┤                            │                                        │
        └──invoke──▶│                       ▼                            ▼                                        │
                    │              integrations/jira.ts (asUser, retry, pagination)                               │
                    │                       │                                                                     │
                    │   security/injection.ts ─▶ core/normalizer.ts ─▶ core/contradiction.ts ─▶ core/severity.ts   │
                    │                            (Layer B)          (Layers C+D)            (Layer E)            │
                    │                                                                                             │
                    │   core/supersession.ts · core/impact.ts · core/remediation.ts · core/approval.ts            │
                    │   storage/caseStore.ts (KVS) · storage/auditStore.ts + audit/auditLog.ts (digest chain)     │
                    │   integrations/teamworkGraph.ts (implemented, not wired to any resolver/action)             │
                    └─────────────────────────────────────────────────────────────────────────────────────────────┘
```

## Data flow (analysis)

USER REQUEST (issue key, zod-validated) → EVIDENCE (Jira description + comments, sanitized, digested, user-scoped) → NORMALIZATION (deterministic patterns, provenance pointer per proposition) → CANDIDATE GENERATION (opposing predicates, subject-token compatibility) → VERIFICATION PIPELINE (source availability → permission → temporal validity → supersession → claim compatibility → evidence sufficiency) → FINDINGS (severity + confidence separated) → JSON to caller.

## Invariants actually enforced in code

- No evidence → no verified contradiction (`analyze` returns INSUFFICIENT_EVIDENCE).
- Verification can only downgrade or confirm with evidence; never upgrade.
- Both sides need evidence; single-source claims never verify.
- Stale/restricted evidence → explicit STALE_EVIDENCE / ACCESS_RESTRICTED.
- Integration failure → ANALYSIS_FAILED, never silent CONSISTENT.
- Approval: no self-approval, digest-bound, expiry, replay rejection; **execution re-checks every invariant server-side and only the approver on record may execute** (core/execution.ts).
- Every analysis run, proposal preparation, decision and execution is audited into the digest-chained tenant ledger.
- Tenant isolation: key prefix + payload tenant check in every store (case, audit, proposal).

## Review-queue loop (added 2026-10-31)

```
analyzeIssue / rovo investigate ──► findings + case (KVS) ──► prepareProposal (UI) or
                                        │                     rovo prepare-remediation
                                        ▼                                          │
                                   PENDING_APPROVAL proposal (KvsProposalRepository) ◄─┘
                                        │
                     human (≠ proposal actor) ── decideProposal ──► APPROVED (+ApprovalBinding) / REJECTED
                                        │
                          approver only ── executeProposal ──► assertExecutionAuthorized
                                        │                        + executed-digest registry (replay)
                                 Jira write (asUser): create remediation issue | approval-traced comment
                                        │
                              EXECUTED / EXECUTION_FAILED ──► audit ledger (chained)
```

Sandbox mode runs this same graph in-browser (`src/frontend/sandbox/sandboxEngine.ts`) over deterministic per-key fixtures with in-memory stores and a scripted Jira transport — every displayed value is computed, nothing is mocked.

## Known unreachable-in-production modules

`core/supersession.ts` (no DecisionRecord source) and `integrations/teamworkGraph.ts` (not wired; needs graph scopes + live verification). These are gaps, not fabrications — no UI claims they run. The approval *execution* half is no longer in this list: it is implemented, wired, and test-verified.
