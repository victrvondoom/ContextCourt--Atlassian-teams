# Repository Forensics — ContextCourt AI

Date: 2026-10-30, re-audited 2026-10-31. Sources: full read of `src/`, `tests/`, `benchmarks/`, `docs/`, `.github/`, `manifest.yml`. The README was **not** treated as evidence.

## Inventory (actual)

| Area | Files | Real state |
|---|---|---|
| Core engine | `src/core/{types,normalizer,digest,contradiction,severity,supersession,impact,remediation,approval}.ts` (~1,200 LOC) | Implemented, deterministic, well-invarianted. Unit-tested. |
| Jira integration | `src/integrations/jira.ts` (181) | Adapter + retries + pagination implemented; **production mapping bug CC-001 (ADF)** |
| Teamwork Graph | `src/integrations/teamworkGraph.ts` (312) | Adapter implemented with curated queries + error mapping; never called by any production path (integration surface only) |
| Forge backend | `src/resolvers/index.ts` (193) | 4 resolvers: health, listCases, listAuditEvents, analyzeIssue |
| Rovo actions | `src/rovo/{actions,index}.ts` (339) | 6 actions wired in manifest; `prepareRemediation` is a **dead path (CC-002)** |
| Storage | `src/storage/{caseStore,auditStore}.ts` (154) | KVS repos, tenant-prefixed, defense-in-depth payload check |
| Audit | `src/audit/auditLog.ts` (62) | Digest-chained events; nondeterminism risks (CC-003) |
| Security | `src/security/injection.ts` (56) | Injection pattern flags, zero-width/control strip, content delimiting |
| Frontend | `src/frontend/**` (~900 LOC React + CSS) | 5 views + sandbox demo mode; cases not clickable (CC-010) |
| Tests | 8 files, 53 tests | All green locally (2026-10-30 run) |
| Benchmarks | `benchmarks/` | Real evaluator over 120 synthetic scenarios; measured P=0.800 R=0.571 F1=0.667 |
| CI | `.github/workflows/ci.yml` | typecheck, lint, format, tests, build, secret grep |
| Docs | `docs/` (4 files) | Statuses mostly honest; README status table stale (CC-009) |

## Real execution paths

1. **UI analysis** `Overview → invoke('analyzeIssue') → issueKeySchema → investigateIssueCore → JiraAdapter.getIssue (asUser) → buildEvidence(description+comments) → sanitizeUntrusted → normalizeAll → analyze() → findings JSON → UI`. **In production this returns INSUFFICIENT_EVIDENCE for every real issue** because Jira REST v3 returns ADF documents, not strings, and `mapIssue` silently maps them to `null` (CC-001).
2. **Rovo investigate** `manifest action → agent-investigate-issue → actions.investigateIssue → same investigateIssueCore`. Same CC-001 impact.
3. **Rovo prepare-remediation** → `prepareRemediation` → `caseRepo.get` + `loadFinding('finding:…')` → **no code path ever writes cases or findings to KVS** → always `NOT_FOUND` (CC-002).
4. **Audit** `prepareRemediation → recordAuditEvent → kvs.set`. Read path via `listAuditEvents`. Id/ordering hazards (CC-003).
5. **Approval execution** state machine + `assertExecutionAuthorized` exist and are tested, but **no production caller**: no UI or tool can create an approval binding or execute an approved proposal. Honest gap, not a fake.
6. **Supersession / DecisionRecord pipeline**: implemented + tested but unreachable in production (no source extracts DecisionRecords). Documented gap; UI makes no claim about it.
7. **Teamwork Graph adapter**: implemented, contract-tested, unreachable from resolvers/actions (no resolver wires it). Health reports it `not-wired` — honest.
8. **Frontend sandbox mode**: explicitly banner-labeled demo data; does not call resolvers while active. Not a fake-data risk.

## Duplicate / dead / divergent code

- Two audit append implementations: `audit/auditLog.recordAuditEvent` (computes chain digest) and `storage/auditStore.KvsAuditRepository.append` (recomputes digest itself). `rovo/actions.ts` uses the former with a hand-rolled sink; resolvers read via the latter. (CC-012)
- `tenantContext` typo `accountIdId` (CC-007); `requestFingerprint = digest(digest)` (CC-008).
- `benchmarks/evaluate.ts` has a hack `{ ...s, sourceSystem: undefined } as never` — works but fragile.

## Documentation vs reality

- README claims Teamwork Graph adapter, Rovo agent, MCP tools "NOT STARTED" — all three are implemented (unverified live). (CC-009)
- `docs/IMPLEMENTATION_STATUS.md` and `docs/VERIFICATION_RESULTS.md` statuses are accurate and honest (evidence labels used correctly).

## Dependency on live verification (BLOCKED)

`forge login` / dev-site deployment unavailable in this environment. Live Jira behavior (ADF shapes, permissions) cannot be executed here; fixes are verified with contract tests using realistic fixtures and labeled accordingly.

## Re-audit 2026-10-31 — the review-queue loop (closed)

Every previously "unfinished/static" surface was re-traced end to end. Current real paths:

1. **UI analysis** `Overview → analyzeIssue → investigateIssueCore(deps-injectable) → JiraAdapter → buildIssueEvidence (shared, sanitized) → normalizeAll → analyze → persistAnalysisResult (findings+case in KVS) → analysis_run audit event → UI + dynamic open-cases card`.
2. **Rovo investigate** — same core; identical evidence semantics (CC-014 fixed).
3. **Rovo get-evidence** — shared sanitized builder; injection flags surfaced as an explicit warning.
4. **Proposal creation** — Rovo `prepare-remediation` action **and** Custom UI `prepareProposal` resolver both produce `PENDING_APPROVAL` proposals in `KvsProposalRepository` (`proposal:{tenant}:{id}`), each with a `prepare_remediation` audit event.
5. **Human decision** — `listProposals` (newest first) → `decideProposal` resolver → `core/execution.decideProposal`: approve creates an `ApprovalBinding` (self-approval impossible; 1h expiry) or reject; audited.
6. **Execution** — `executeProposal` resolver → `core/execution.executeProposal`: re-checks state/binding/tenant/target/operation/digest/expiry/replay + approver-identity, then performs the Jira write (issue creation or approval-traced comment) through the asUser fetcher; `EXECUTED`/`EXECUTION_FAILED` both audited; executed digests registered for permanent replay rejection. **Agents have no approve/execute tool by design.**
7. **Audit ledger** — `analysis_run` (success/failure), `prepare_remediation`, `proposal_approved/rejected`, `proposal_executed` all chained; `listAuditEvents` renders the real chain.
8. **Sandbox** — no mock data files remain; the in-browser engine (same `src/core` modules) computes every displayed value over deterministic per-key fixtures; the scripted Jira transport records writes without sending them.

Verified state after re-audit: `tsc --noEmit` clean, `eslint src tests` clean, 86/86 tests, `vite build` ok, benchmark replay reproduces P=0.800 R=0.571 F1=0.667 exactly.

Still unreachable/unverifiable here (unchanged): live Forge deployment (credentials), Teamwork Graph transport (scopes + dev site), supersession DecisionRecord source. No UI or doc claims otherwise.
