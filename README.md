# ContextCourt AI

**Your team already made the decision. ContextCourt detects when reality no longer agrees.**

ContextCourt AI is an evidence-driven decision intelligence app for Atlassian Forge/Jira.
It detects contradictions between organizational decisions, project requirements,
implementation activity, and delivery outcomes — always traceable to accessible source
records — and supports safe, human-approved remediation.

**Fundamental invariant: NO EVIDENCE → NO VERIFIED CONTRADICTION.**

Built for Codegeist 2026 (Apps for Software Teams).

## Status

| Workstream | Status |
|---|---|
| Forge app scaffold, core engine, Jira adapter, tests, CI | IMPLEMENTED — UNVERIFIED (live Forge deployment pending credentials) |
| Teamwork Graph adapter | NOT STARTED (docs verified, see docs/atlassian-compatibility.md) |
| Rovo agent | NOT STARTED |
| MCP tools (`rovo:mcp`) | NOT STARTED |
| Marketplace listing | NOT STARTED |

See `docs/` for the full verification trail. Statuses are used truthfully:
`IMPLEMENTED — UNVERIFIED`, `VERIFIED LOCALLY`, `VERIFIED ON ATLASSIAN DEVELOPMENT SITE`, `BLOCKED — EXTERNAL ACTION REQUIRED`.

## Development

Requirements: Node `>=24.22.1` (see `.nvmrc`).

```bash
npm ci
npm run typecheck
npm run lint
npm test
npm run build:frontend   # builds src/frontend/dist for the Forge resource
```

### Deploying to Forge

Forge deployment requires an authenticated Atlassian account:

```bash
npm install -g @forge/cli@latest
forge login
forge register          # one-time app registration
forge deploy
forge install           # into a Jira development site
```

Secrets must never be committed. Use GitHub Codespaces secrets or interactive
`forge login` — never API tokens in files.

## Architecture

```
Jira (issues, comments)  ──┐
Teamwork Graph (verified   ├──►  Evidence layer ──► Contradiction engine ──► Findings ──► Review queue ──► Approved remediation
  relationships, scoped)  ─┘      (provenance)       (detect + verify)                                  (state machine)
```

- `src/core/` — domain model, contradiction engine, severity, approval state machine
- `src/integrations/` — Jira adapter (user-scoped REST), Teamwork Graph (planned)
- `src/resolvers/` — Forge backend resolvers
- `src/frontend/` — Custom UI (React)
- `src/storage/` — tenant-isolated Forge KVS repositories
- `tests/` — unit, security, integration, contract, e2e

See `docs/atlassian-compatibility.md` for verified platform capabilities and decisions.

## License

MIT — see LICENSE.
