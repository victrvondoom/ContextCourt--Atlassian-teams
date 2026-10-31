# Fixture and Mock Elimination — Classification

Closure pass 2026-10-31. Every fixture/mock in the repository, classified.
**Result: no fixture sits in a production application path.**

| Fixture | Location | Class | Rationale / isolation |
|---|---|---|---|
| `tests/helpers/fakeKvs.ts` (FakeKvs, FakeJiraFetcher) | tests/ | **TEST_ONLY** | Shared harness driving the real repository/adapter code; never imported by `src/` production modules |
| Test fixtures in `tests/**` (findings, proposals, ADF docs) | tests/ | **TEST_ONLY** | Deterministic inputs with assertions; not reachable at runtime |
| `benchmarks/dataset.json` | benchmarks/ | **TEST_ONLY** | Labeled synthetic benchmark data with documented limitations |
| Sandbox scenario fixtures (CONTRADICTION/CONSISTENT/INJECTION) | `src/frontend/sandbox/sandboxEngine.ts` | **DEMO_ONLY** | Deterministic per-key fixtures for the in-browser demo; the UI displays a permanent "Sandbox mode — demo data" banner; the sandbox code path performs zero resolver invocations (structurally separated) |
| Sandbox in-memory stores (cases/proposals/audit maps) | `src/frontend/sandbox/sandboxEngine.ts` | **DEMO_ONLY** | In-browser demo state, clearly labeled; production state lives in Forge KVS (tenant-scoped, durable) |
| Sandbox scripted Jira transport (writes recorded, never sent) | `src/frontend/sandbox/sandboxEngine.ts` | **DEMO_ONLY** | Deliberate ADR-009 design: same read-back verification contract, no network. Cannot reach live Jira — no credentials, no fetch, recorded only |
| `scripts/demo-scenarios.ts` scripted transport | scripts/ | **DEMO_ONLY** | Judge demo runner; separate from `src/` runtime; exits non-zero on failure |
| `productionJiraFetcher` | `src/resolvers/index.ts` | **REAL** | Forge `asUser` REST calls; wrapped in timeout + circuit breaker (`resilientProductionJiraFetcher`) |
| KVS repositories (case/audit/proposal) | `src/storage/` | **REAL** | Forge KVS, tenant-prefixed keys, payload tenant re-checks, paginated queries |
| Rate-limit buckets | `ratelimit:{tenant}:{user}:{action}` in KVS | **REAL** | Durable across invocations/instances (token-bucket state persisted) |
| Audit ledger | `audit:{tenant}:*` in KVS | **REAL** | Digest-chained, insertion-monotonic, `verifyAuditChain` on demand |

**Elimination actions this pass:** none required in production paths (audit
confirmed); the only new demo surface addition was kept structurally isolated
in the sandbox module. Historic eliminations already landed: the 1970-dated
mock objects were deleted and replaced by the real in-browser engine (ADR-009);
the static Review queue was replaced by KVS-backed proposals.
