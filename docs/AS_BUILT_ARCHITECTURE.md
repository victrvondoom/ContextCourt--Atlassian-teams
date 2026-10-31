# As-Built Architecture — ContextCourt AI

State at mission end 2026-10-31. Every component below exists in code and is
covered by tests unless explicitly marked BLOCKED.

```
┌──────────────────────── Forge runtime (per-tenant, user-scoped) ─────────────────────────┐
│                                                                                           │
│  Custom UI (React, src/frontend)          Rovo agent + MCP (manifest, src/rovo)           │
│  Overview·Cases·CaseDetail·Review·Audit    investigate·get-case·get-evidence·get-impact·  │
│  sandbox = real core in-browser           prepare-remediation·get-approval-status         │
│        │ invoke()                              │ action modules                         │
│        ▼                                        ▼                                        │
│  resolvers/index.ts ────────────────► investigateIssueCore (shared pipeline)              │
│  analyzeIssue·health·listCases·getCase·listAuditEvents                                     │
│  prepareProposal·listProposals·decideProposal·executeProposal                             │
│        │                                                                                   │
│        ▼                                                                                   │
│  JiraAdapter (asUser, retry/backoff, ADF↔text) ── evidence.ts (single sanitized builder)  │
│        │                                   │                                              │
│        ▼                                   ▼                                              │
│  core/normalizer (deterministic propositions, provenance per claim)                        │
│        ▼                                                                                   │
│  core/contradiction (candidates → verification pipeline → findings; downgrade-only)       │
│        ▼                                                                                   │
│  persistAnalysisResult → KVS findings + case                                               │
│        ▼                                                                                   │
│  core/remediation (operation catalog, severity/risk gates) → PENDING_APPROVAL proposal     │
│        ▼                                                                                   │
│  core/queue (documented review utility: severity×100 + risk + age; pending-first)         │
│        ▼                                                                                   │
│  core/execution.decideProposal (binding; self-approval impossible)                        │
│        ▼                                                                                   │
│  core/execution.executeProposal (assertExecutionAuthorized + approver-only + replay        │
│        registry) → Jira write (ADF comment / issue creation, trace marker embedded)       │
│        ▼                                                                                   │
│  core/verification.verifyExecutionOutcome (independent read-back: VERIFIED /             │
│        MISMATCH / UNVERIFIED — execution success ≠ verified state)                         │
│        ▼                                                                                   │
│  audit/auditLog (digest-chained, insertion-monotonic: analysis_run, prepare_remediation,  │
│        proposal_approved/rejected/executed/verified)                                      │
│                                                                                            │
│  storage: KvsCaseRepository · KvsAuditRepository · KvsProposalRepository (+executed digests)│
│  All stores: tenant-prefixed keys + payload tenant re-check.                              │
│  Unwired (BLOCKED): integrations/teamworkGraph.ts, core/supersession.ts (no source).      │
└───────────────────────────────────────────────────────────────────────────────────────────┘
```

## The product lifecycle this implements

**Evidence → Reasoning → Proposal → Human Judgment → Authorized Execution →
Independent Verification → Tamper-Evident Audit.**

Key files: `src/core/{types,normalizer,contradiction,severity,remediation,
approval,execution,verification,queue,impact,digest}.ts`,
`src/integrations/{jira,adf,evidence,teamworkGraph}.ts`,
`src/security/injection.ts`, `src/audit/auditLog.ts`,
`src/storage/{caseStore,auditStore,proposalStore}.ts`,
`src/resolvers/index.ts`, `src/rovo/actions.ts`,
`src/frontend/sandbox/sandboxEngine.ts`, `scripts/demo-scenarios.ts`.

## Verification state

- 105/105 tests (16 files) — engine invariants, governance refusals,
  execution authorization, replay, verification outcomes, queue ordering,
  tenant isolation, sandbox engine, audit chain.
- `npm run demo` — Scenarios A–F, deterministic, exits non-zero on failure.
- Registers: 468 FR + 459 ET, validated (`npm run validate:registers`).
- BLOCKED (external): live Forge deploy, Teamwork Graph scopes, Marketplace.
