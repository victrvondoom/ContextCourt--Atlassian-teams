# Environment Configuration — Context Court AI

## Local development / test
- **Required environment variables: none.** All tests and the demo run with
  injected transports and in-memory fixtures.
- `.env.example` documents the (currently empty) set of expected variables;
  no secret values are committed (CI secret-scan gate).

## Forge runtime (production)
- Authentication: platform-managed (`forge login` interactive OAuth). The app
  holds no API tokens.
- Scopes (manifest.yml): `read:jira-work`, `read:jira-user`,
  `write:jira-work` (approved execution only, documented), `storage:app`.
- Runtime: `nodejs24.x` (pinned); KVS via `@forge/kvs` (tenant-isolated keys).

## Missing-configuration behavior
- Without a deployment, there is no live path: resolvers surface explicit
  errors (ANALYSIS_FAILED / UNAVAILABLE / RATE_LIMITED) — never fabricated
  success. See docs/EXTERNAL_INTEGRATION_CREDENTIAL_MATRIX.md for the exact
  unblock actions.
