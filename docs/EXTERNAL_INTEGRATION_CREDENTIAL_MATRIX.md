# External Integration Credential Matrix — Context Court AI

Closure pass 2026-10-31. Every integration actually present in or required by
the product, its credential requirements, and the exact missing user action.
No credential is invented; nothing is marked live without a real connection.

| Integration | Credential / auth required | Scopes | Env vars | Implementation status | Local test status | Live test status | Missing prerequisite → exact user action |
|---|---|---|---|---|---|---|---|
| Atlassian Forge (deploy) | `forge login` interactive OAuth (Atlassian account) | n/a | none (CLI-managed) | Manifest valid, app id set, build artifacts verified | **TEST_VERIFIED** (all gates; `forge lint` blocked to deploy) | **NOT_LIVE** | Atlassian account with Forge access → run `npm i -g @forge/cli && forge login && forge deploy` |
| Jira REST v3 (reads) | Forge runtime identity (asUser) — no app secret | `read:jira-work`, `read:jira-user` | none | **IMPLEMENTED** — asUser fetcher + ADF mapping + retry/backoff/jitter + timeout + circuit breaker | TEST-VERIFIED (contract tests, fake transport) | **NOT_LIVE** (needs deployed app) | Deploy to a dev site → install into Jira |
| Jira REST v3 (approved writes) | Forge runtime identity (asUser) | `write:jira-work` (in manifest, justified for approved execution only) | none | **IMPLEMENTED** — ADF comment/issue creation, trace markers, single-attempt, replay registry, post-execution verification | TEST-VERIFIED (execution + verification suites, demo Scenario E) | **NOT_LIVE** | Same as above, then approve + execute one proposal on the dev site |
| Rovo agent / actions / MCP | Forge platform (manifest modules) | platform-defined per action | none | **IMPLEMENTED** — 6 actions, skills, MCP module; no approve/execute tool | TEST-VERIFIED (contracts; live invocation BLOCKED) | **NOT_LIVE** | Deploy, then invoke a tool from Rovo Studio |
| Teamwork Graph | Forge asUser + granular graph scopes | `read:graph:issue:jira` (+ user/team scopes) | none | **IMPLEMENTED adapter, contract-tested; NOT wired** (deliberate: wiring without a live transport check would be unverifiable) | TEST-VERIFIED (fixture tests) | **NOT_LIVE** | Grant graph scopes on the dev site → then wire `getImpact` enrichment (documented next step) |
| External AI provider | not used | — | — | **NOT_REQUIRED** — the verified path is deterministic by design (ADR-001); no model dependency exists | n/a | n/a | None — adding an LLM layer is a documented backlog item, not a credential gap |
| External observability provider | not used | — | — | **NOT_REQUIRED** — observability is the audit ledger + CI gates | n/a | n/a | None |
| Deployment provider (GitHub Actions CI) | repository push access | n/a | none | **IMPLEMENTED** — CI runs install/typecheck/lint/format/tests/build/audit/registers/demo-less gates | TEST-VERIFIED (all local gates pass) | First CI run occurs after push | Push `main` to the remote (user-authorized) |

## Secure configuration notes

- No secrets exist in the tree (CI secret-scan green; `.env.example` documents
  variable names only). The Forge runtime supplies all platform credentials;
  the app itself needs **zero** environment secrets.
- Missing-credential behavior is explicit: without a deployment there are no
  live paths, and every live-dependent claim in docs carries
  `EXTERNAL_ACCESS_REQUIRED` — the application never fabricates a connection.
- Adapter completion without credentials (§6.3): Jira read/write adapters,
  error classification, timeouts, retries, idempotency and verification are
  fully implemented and contract-tested with injected transports; the real
  authorized path activates on deployment without code changes.
