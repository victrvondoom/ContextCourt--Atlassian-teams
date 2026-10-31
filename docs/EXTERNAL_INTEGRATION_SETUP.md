# External Integration Setup — Context Court AI

Per-integration setup, requirements and honest status. Full matrix with
credentials/scopes: docs/EXTERNAL_INTEGRATION_CREDENTIAL_MATRIX.md.

## Atlassian Forge (deployment host)
Platform-managed hosting (API gateway, TLS, auth, tenant isolation, scaling —
see docs/CLOUD_ARCHITECTURE.md). Setup: `forge login` → `forge deploy` →
`forge install` on a Jira dev site. Status: code-ready, **awaiting
credentials**.

## Jira REST v3
Reads: asUser with `read:jira-work`/`read:jira-user`; ADF in/out; bounded
retry (idempotent-only) with jitter; 10s timeout; circuit breaker (5
failures / 30s cooldown). Writes: only via the human-approved execution path
(`write:jira-work`), single-attempt, trace-marker embedded, replay-proof,
independently verified post-execution. Status: fully implemented and
contract-tested; live verification requires deployment.

## Rovo (agent, actions, MCP, skills)
Manifest-defined; agents investigate and draft only — no approve/execute tool
exists (structural). Setup: deploy the app; invoke from Rovo Studio. Status:
implemented; live invocation EXTERNAL_ACCESS_REQUIRED.

## Teamwork Graph
Adapter implemented with curated queries, permission-aware error mapping and
fixture tests. Wiring into `getImpact` is deliberately deferred until graph
scopes exist on a dev site (wiring an unverifiable transport would create a
false-live claim). Setup: grant `read:graph:issue:jira` (+ user/team scopes)
on the dev site, then wire per docs/IMPLEMENTATION_ROADMAP.md.
