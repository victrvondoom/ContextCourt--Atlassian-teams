# Deployment Readiness — Context Court AI

Status: **ready for authorized deployment; deployment itself is externally
blocked** (Atlassian credentials required — see the credential matrix).

Pre-deploy preflight (all verified locally):
- manifest.yml valid: modules, handlers, scopes, app id present.
- Build artifact at `src/frontend/dist` (vite build green).
- Node runtime pin matches `.nvmrc` (`nodejs24.x` / `>=24.22.1`).
- All CI gates green: typecheck, lint, format, 152/152 tests, build,
  `npm audit --audit-level=high` (exit 0), register validation.

Authorized deploy sequence (requires an Atlassian account):
```bash
npm i -g @forge/cli@latest
forge login
forge register     # one-time app registration (app id already in manifest)
forge deploy
forge install      # into a Jira development site
```
Post-deploy verification checklist (the live gates, in order):
1. Health panel shows a real probed Jira state.
2. Run an analysis on a real issue (live ADF shapes).
3. Prepare → approve (second human) → execute one proposal.
4. Confirm the executed comment/issue and the VERIFIED state in the UI.
5. Invoke one Rovo agent tool from Rovo Studio.
6. Flip `health` labels for rovo/mcp from `not-wired` to probed states.
7. Grant Teamwork Graph scopes, then wire graph enrichment (documented next step).
