# Atlassian Platform Compatibility — ContextCourt AI

This file records verified Atlassian platform capabilities, documentation sources,
verification dates, and resulting platform decisions. Every claim is checked against
current official documentation before use; anything unverified is explicitly marked.

**Legend:** VERIFIED = checked against official docs on the date shown · UNVERIFIED = to be confirmed before use.

---

## Verified against official documentation (2026-10-28)

| Capability | Status | Source | Notes |
|---|---|---|---|
| `rovo:mcp` module (max 1 per app, tools reference `action` keys, ≤50 actions, action keys <64 chars) | VERIFIED | https://developer.atlassian.com/platform/forge/manifest-reference/modules/rovo-mcp/ | Tools are available to custom agents in Rovo Studio; third-party MCP clients are **EAP** |
| `rovo:agent` module (key, name ≤30 chars, prompt, conversationStarters, actions, skills, followUpPrompt) | VERIFIED | https://developer.atlassian.com/platform/forge/manifest-reference/modules/rovo-agent/ | |
| `rovo:action` → official module name is `action` with `actionVerb` | VERIFIED | https://developer.atlassian.com/platform/forge/manifest-reference/modules/rovo-action/ (example shown in rovo:mcp docs) | "rovo:action" is colloquial; manifest uses `action` |
| Teamwork Graph curated queries incl. `atlassianUserAssignedJiraWorkItems`, `jiraWorkItemGoals`, `jiraWorkItemLinkedExternalPullRequests`, `jiraWorkItemLinkedExternalDeployments` | VERIFIED | https://developer.atlassian.com/platform/teamwork-graph/curated-queries/ | Endpoint: `POST https://<site>/gateway/api/graphql/twg` via `api.asUser().requestTeamworkGraph(...)`; every row is permission-filtered for the calling user |
| Teamwork Graph granular scopes `read:graph:<object>:<product>` (e.g. `read:graph:issue:jira`, `read:graph:page:confluence`, `read:graph:user:atlassian`, `read:graph:team:atlassian`, `read:graph:goal:atlassian`) | VERIFIED | https://developer.atlassian.com/platform/teamwork-graph/scopes/ | EAP-era `read:graph:jira` / `read:graph:confluence` are deprecated; admins can revoke individual scopes at runtime |
| Forge Node.js runtime supports Node 22 / 24 (October 2026) | VERIFIED | https://developer.atlassian.com/platform/forge/function-reference/nodejs-runtime/ | `.nvmrc` pins 24.22.1; Forge CLI requires `^22.23.4 \|\| ^24.22.1 \|\| >=26.12.1` |

## Platform decisions

1. **Jira-first, single-product app.** Atlassian's multi-app Forge compatibility
   documentation restricts multi-app Marketplace listings to paid apps
   (https://developer.atlassian.com/platform/forge/app-compatibility/). To keep the
   Marketplace path open (bonus category 4), ContextCourt ships Jira-only by default.
   Confluence/Bitbucket data reaches the app only where the Teamwork Graph exposes
   verified relationships within granted scopes — never assumed.
2. **Teamwork Graph via curated queries.** Common traversals use documented curated
   queries; custom traversals would use registered persisted Cypher queries (not ad hoc
   runtime Cypher). All graph reads are user-scoped and permission-filtered.
3. **Teamwork Graph scope strategy.** Request granular scopes only
   (`read:graph:issue:jira`, `read:graph:user:atlassian`, `read:graph:team:atlassian`
   initially). Handle admin-revoked scopes as `ACCESS_RESTRICTED`, never as empty data.
4. **MCP exposure via `rovo:mcp`.** One module, tools reference real Forge `action`
   keys. Primary verification target: a Rovo Studio custom agent invoking a ContextCourt
   tool. Third-party MCP clients remain EAP and will be labeled as such.
5. **Runtime evidence over mocks.** A passing mocked integration test is not treated as
   live-integration proof. Live verification against an Atlassian development site is a
   separate, explicitly tracked gate for each milestone.

## Unverified / to be confirmed before implementation

| Item | Why it matters | Plan |
|---|---|---|
| Forge KVS limits (key/value size, throughput) | Storage sizing for cases and audit events | Confirm against Forge storage docs before M4 load work |
| Persisted Cypher query registration process | Needed for custom graph traversals | Confirm at M3 before any custom traversal |
| `rovo:skill` module availability in our environment | Reusable skills for the Investigator agent | Confirm at M5; fall back to actions-only if unavailable |
| Marketplace pricing model (paid vs free) final choice | Bonus category 4 | Confirm before M9 |
