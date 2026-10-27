# Security Policy

## Supported versions

The `main` branch is the only supported line during active development.

## Reporting a vulnerability

Please do not open public issues for security problems. Use GitHub's private
security advisory feature on this repository.

## Security model (honest disclosure)

- **Tenant isolation.** All persisted records are keyed by tenant (CloudId) and
  validated on read; cross-tenant access is structurally blocked and covered by tests.
- **Authorization.** Jira reads run with the invoking user's permissions
  (`api.asUser()`). Graph reads are user-scoped and permission-filtered by Atlassian.
- **Approval state machine.** Sensitive writes require an explicit human approval
  bound to user, tenant, exact target, operation, payload digest and expiry; replayed
  or tampered payloads are rejected. An agent can never approve its own proposal.
- **Audit trail.** Digest-chained audit events provide tamper-*evidence* (any
  modification of stored history is detectable). Storage is Forge-hosted; it is not a
  write-once immutable ledger, and we do not claim otherwise.
- **Secrets.** No secrets in source, history, logs or bundles. CI includes a secret scan.
- **Prompt-injection defense.** Content from Jira/Confluence/repositories is treated as
  untrusted data, never as instructions to the agent.

## Known limitations

- Live verification against an Atlassian development site is pending account access;
  integration behavior is verified by contract tests only until then.
- The audit chain is per-tenant and Forge-storage-backed.
