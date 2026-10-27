# Verification results (2026-10-28)

All commands executed in this environment; results captured verbatim.

| Check | Command | Result |
|---|---|---|
| TypeScript strict | `npx tsc --noEmit` | PASS (exit 0) |
| Unit + security + integration tests | `npx vitest run` | PASS — 53/53 tests, 8 files |
| ESLint | `npx eslint src tests` | PASS (exit 0) |
| Prettier | `npx prettier --check ...` | PASS |
| Frontend build | `npx vite build` | PASS — src/frontend/dist emitted |
| Forge manifest lint | `CI=true FORGE_DISABLE_ANALYTICS=1 npx @forge/cli lint` | 1 remaining error: `app must have required property 'id'` — id is written by `forge register`, which requires Atlassian login |
| Benchmark evaluation | `npx vite-node benchmarks/evaluate.ts benchmarks/dataset.json` | PASS — 120 scenarios; P=0.800, R=0.571, F1=0.667 (see benchmarks/RESULTS.md) |
| Secret scan | grep pattern over src/tests/scripts | clean |

## Git / GitHub

- Local branch `main` at commit `9cbe6bde8d7f4324fa1d56979d7335a0e947a5fb`
- Pushed to `https://github.com/uhuhyogiyfitufyktyhvfukyku/Context-Court-AI.git` → verified via `git ls-remote`: remote `refs/heads/main` = `9cbe6bd...` (match)
- Push to `victrvondoom/Context-Court-Atlassian-teams-` remains blocked: authenticated
  account `uhuhyogiyfitufyktyhvfukyku` has pull-only permission there (HTTP 403, exact
  error captured in the session log). Required user action: grant that account write
  access, or provide a token for an account with write access.

## Forge / Atlassian live verification

- NOT performed: `forge login` requires interactive Atlassian authentication (CLI
  reports "Not logged in"). Adapter and engine logic verified by contract tests only;
  this is explicitly NOT proof of live integration.
