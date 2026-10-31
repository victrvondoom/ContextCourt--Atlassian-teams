# Local Development — Context Court AI

Requirements: Node `>=24.22.1` (pinned in `.nvmrc` / `engines`).

```bash
npm ci                    # install locked dependencies
npm run typecheck         # tsc --noEmit (src, tests, scripts)
npm run lint              # eslint 9 (flat config)
npm run format:check      # prettier
npm test                  # full suite (152 tests, 22 files)
npm run build             # vite build → src/frontend/dist (Forge resource)
npm run demo              # Scenarios A–F, deterministic, non-zero exit on failure
npm run build:registers   # regenerate + validate the 927-record registers
npm run validate:registers
npm audit --audit-level=high
```

One-command verification of everything local:

```bash
npm ci && npm run typecheck && npm run lint && npm run format:check && npm test && npm run build && npm run demo && npm run validate:registers
```

No environment variables are required for local development — the app needs
no secrets; external platform access is Forge-CLI mediated (see
docs/ENVIRONMENT_CONFIGURATION.md).
