# Contributing

1. Fork/branch from `main` (conventional commits: `feat:`, `fix:`, `test:`, `docs:`, `chore:`).
2. `npm ci && npm run typecheck && npm run lint && npm test` must pass locally.
3. New behavior needs tests — especially anything touching the contradiction engine,
   approval state machine, or tenant isolation.
4. Never commit secrets. Never mark a feature verified without evidence recorded in
   `docs/`.

## Truthful status reporting

Contributor-facing rule: distinguish *implemented* from *verified*. Use the statuses
defined in the README (`IMPLEMENTED — UNVERIFIED`, `VERIFIED LOCALLY`,
`VERIFIED ON ATLASSIAN DEVELOPMENT SITE`, `BLOCKED — EXTERNAL ACTION REQUIRED`).
