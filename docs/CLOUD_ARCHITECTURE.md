# Cloud Architecture — ContextCourt AI

Written 2026-10-31. Requirement: every infrastructure component must justify
its operational cost. Nothing here is aspirational scaffolding.

## Current platform decision (correct, kept)

ContextCourt runs as a **Forge app**: a modular monolith deployed into
Atlassian's managed runtime. Forge already supplies, per tenant and at no
operational cost to us:

- API gateway, authn/authz (Atlassian identity, asUser scoping)
- Tenant isolation context (cloudId) and per-tenant storage (KVS)
- TLS, secrets handling, horizontal scale, deployment automation

Replacing any of these with self-managed infrastructure (Kubernetes, Kafka,
dedicated queues) would add operational burden with zero product value at
current scale. **Rejected deliberately.**

## What the monolith already provides (implemented)

| Capability | Implementation | Status |
|---|---|---|
| Tenant isolation | key-prefix + payload tenant re-check in case/audit/proposal stores | TEST-VERIFIED (`tests/security/tenant-isolation.test.ts`) |
| Authorization | Forge context (cloudId + accountId) on every resolver/action; self-approval and non-approver execution impossible | TEST-VERIFIED |
| Audit trail | digest-chained event ledger per tenant | TEST-VERIFIED |
| Idempotency / replay safety | payload-digest bindings + executed-digest registry | TEST-VERIFIED |
| Rate/size containment | zod input validation everywhere; bounded retry/backoff; bounded BFS depth; paginated KVS queries | TEST-VERIFIED |
| Secrets | none committed; `.env.example` documents expected variables; CI secret scan | verified by CI grep |

## Real gaps and their honest triggers

| Gap | Trigger to build | Why not now |
|---|---|---|
| Background/scheduled analysis (durable queue) | users request bulk scans; Forge scheduled triggers | No evidence of need; adds a scheduling/optimization problem prematurely (see OPTIMIZATION_MODEL.md) |
| Object storage | evidence exceeding KVS item limits (large attachments) | Evidence is text spans, deliberately small |
| Multi-region / DR | Forge-managed today | not ours to build |
| Usage telemetry / rate limiting per tenant | Marketplace-scale installs | no live install exists |
| Teamwork Graph integration | dev-site deploy + granted graph scopes | cannot verify transport without it |

## Deployment path (BLOCKED — external action required)

`forge login` → `forge register` → `forge deploy` → `forge install` on a Jira
dev site. The manifest now requests `write:jira-work` **solely** for
human-approved remediation execution (issue/comment writes); the scope is
granted by the installing admin at install time, and every write is preceded
by an approval binding check server-side. CI runs typecheck, lint, format,
tests, build and a secret scan on every push to `main`.
