# Bonus prize evidence matrix (updated 2026-10-28)

At most ONE bonus prize can be won per submission (official rules). This matrix
tracks readiness for all four so the strongest one can be selected.

## A — Best Agents (Rovo)

| Requirement | Status |
|---|---|
| Deployed `rovo:agent` (ContextCourt Investigator) | IMPLEMENTED — UNVERIFIED (manifest + prompt + actions) |
| Reusable Forge `action` modules (6) | IMPLEMENTED — UNVERIFIED |
| `rovo:skill` modules (2, real SKILL.md) | IMPLEMENTED — UNVERIFIED |
| Live invocation in an Atlassian tenant | BLOCKED — EXTERNAL ACTION REQUIRED |

## B — Best App with Atlassian MCP

| Requirement | Status |
|---|---|
| Valid `rovo:mcp` module (≤50 tools, real action keys) | IMPLEMENTED — UNVERIFIED |
| Tool contracts (get-case, investigate-issue, get-evidence, get-impact, prepare-remediation, get-approval-status) | IMPLEMENTED — UNVERIFIED |
| Live tool call by a Rovo Studio agent | BLOCKED — EXTERNAL ACTION REQUIRED |

## C — Best Teamwork Graph Integration

| Requirement | Status |
|---|---|
| `TeamworkGraphAdapter` with documented curated queries | VERIFIED LOCALLY (fixture tests) |
| Granular scopes + permission-aware errors | IMPLEMENTED — UNVERIFIED |
| Live authorized graph request | BLOCKED — EXTERNAL ACTION REQUIRED |

## D — Best Marketplace Published App

| Requirement | Status |
|---|---|
| Marketplace listing | NOT STARTED |
| Developer/partner account, listing assets | NOT STARTED |
| Installable production app | BLOCKED (needs Forge deployment) |
