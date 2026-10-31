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
| Forge app scaffold, core engine, Jira adapter, tests, CI | VERIFIED LOCALLY (87/87 tests; live Forge deployment BLOCKED — credentials) |
| Evidence + contradiction engine (deterministic, evidence-cited) | VERIFIED LOCALLY |
| **Human approval loop: prepare → review → approve/reject → execute (Jira write, replay-proof, approver-only)** | VERIFIED LOCALLY (integration + unit tests) |
| Audit ledger (digest-chained: analysis, preparation, decision, execution) | VERIFIED LOCALLY |
| Custom UI — fully dynamic: analysis, cases, review queue, audit ledger | VERIFIED LOCALLY (build + contract tests) |
| **Independent post-execution verification** (VERIFIED / MISMATCH / UNVERIFIED read-back) | VERIFIED LOCALLY (`tests/unit/verification.test.ts`) |
| **Documented queue ordering** (review utility: severity × risk × age, per-item explanations) | VERIFIED LOCALLY (`tests/unit/queue-ordering.test.ts`) |
| One-command demo of Scenarios A–F | VERIFIED LOCALLY (`npm run demo`, deterministic 6/6) |
| Dynamics: cancel/revocation, rejection rationale, case timeline, search/sort/paging, live countdown | VERIFIED LOCALLY (116/116 tests) |
| Capability registers: 468 features + 459 engineering tasks, validated | VERIFIED LOCALLY (`npm run validate:registers`) |
| Sandbox demo — the real engine running in-browser over deterministic fixtures | VERIFIED LOCALLY |
| Teamwork Graph adapter | IMPLEMENTED — UNVERIFIED (adapter tested; not wired, needs graph scopes + dev site) |
| Rovo agent + 6 actions + 2 skills + MCP tools | IMPLEMENTED — UNVERIFIED (live invocation BLOCKED) |
| Marketplace listing | NOT STARTED |

See `docs/` for the full verification trail. Statuses are used truthfully:
`IMPLEMENTED — UNVERIFIED`, `VERIFIED LOCALLY`, `BLOCKED — EXTERNAL ACTION REQUIRED`.

## Development

Requirements: Node `>=24.22.1` (see `.nvmrc`).

```bash
npm ci
npm run typecheck
npm run lint
npm test                  # 105 tests (engine, governance, verification, queue, isolation)
npm run build             # builds src/frontend/dist for the Forge resource
npm run demo              # Scenarios A–F, deterministic, exits non-zero on failure
npm run validate:registers # validates the 468-feature + 459-task registers
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
Teamwork Graph (planned,  ├──►  Evidence layer ──► Contradiction engine ──► Findings ──► Cases
  scoped, not wired yet)  │      (provenance)       (detect + verify)            │
                          ┘                                                   ▼
                                               Review queue ──► Human approval (binding) ──► Approved execution (Jira write)
                                                                                     │
                                                                        Audit ledger (digest-chained, tamper-evident)
```

- `src/core/` — domain model, contradiction engine, severity, approval state machine, decision + execution
- `src/integrations/` — Jira adapter (user-scoped REST, ADF in/out), shared sanitized evidence builder, Teamwork Graph (unwired)
- `src/resolvers/` — Forge backend resolvers (analysis, cases, proposals, decisions, execution, health)
- `src/rovo/` — Rovo agent actions and MCP tool surface (agents investigate and draft; **never approve or execute**)
- `src/frontend/` — Custom UI (React); the sandbox demo runs the real `src/core` engine in-browser
- `src/storage/` — tenant-isolated Forge KVS repositories (cases, findings, proposals, audit)
- `tests/` — unit, security, integration (incl. the full approval→execution loop), sandbox engine

See `docs/atlassian-compatibility.md` for verified platform capabilities and decisions,
and `docs/FINAL_VALIDATION_REPORT.md` for the current verification state.

## License

MIT — see LICENSE.
