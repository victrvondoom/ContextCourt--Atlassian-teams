# Unfinished Feature Audit — Context Court AI

Closure-pass audit, 2026-10-31 at commit `c4c9223` (verified clean, 137/137
tests before the pass). Method: pattern sweep (`TODO|FIXME|not implemented|
placeholder|hardcoded|mock|fake`), full read of every resolver/action/store
path, and cross-check against the 468-feature register.

## Findings

| ID | Location | Feature | Impact | Actual behavior | Root cause | Required fix | Status |
|---|---|---|---|---|---|---|---|
| UF-001 | `src/resolvers/index.ts` (getCase, prepareProposal) | FR-162 (finding validation) | A malformed/tampered stored finding could be rendered or drafted against on the Custom UI path | Only the rovo `loadFinding` path validated records; the resolver paths used raw tenant checks | The earlier CC-025 edit script failed its pattern assert before writing and the gap was invisible to tsc (no unused-import error) | Wire `isValidFinding` into both resolver read paths | **FIXED this pass** — gates applied + type-checked; covered by `tests/unit/finding-validation.test.ts` |
| UF-002 | `src/integrations/jira.ts` (backoff) | FR-283 (retry safety) | A thundering herd could retry on the same millisecond | Exponential backoff without jitter | Original implementation predated the reliability pass | Add full jitter, bounds-tested | **FIXED this pass** — `backoff(attempt, rng)` with `[exp/2, exp]` jitter |
| UF-003 | external calls | FR-295/FR-296 (breaker/timeouts) | Unbounded waits; cascading failure risk on a struggling Jira | No timeout, no circuit breaker on the production fetcher | Not previously implemented | `withTimeout` + `withCircuitBreaker` wrappers | **FIXED this pass** — `core/reliability.ts`, wired as `resilientProductionJiraFetcher` |
| UF-004 | `investigateIssueCore`, `prepareProposal`, `decideProposalCore` | FR-320/FR-157 (flooding) | An aggressive user could exhaust CPU/quota with unbounded analysis calls | No application-level rate limiting | Not previously implemented | KVS token bucket per tenant+user+action | **FIXED this pass** — `core/rateLimit.ts`; explicit rate-limited responses with retry guidance |
| UF-005 | Teamwork Graph (`src/integrations/teamworkGraph.ts`) | FR-343 | No graph-enriched impact in the product | Adapter implemented + contract-tested, never wired | Requires graph scopes + dev-site verification (external) | Wire on first authorized deploy | **EXTERNAL_ACCESS_REQUIRED** (documented in credential matrix) |
| UF-006 | `src/core/supersession.ts` | FR-101 (patterns) | Supersession decisions not detected in production | Module implemented + tested; no DecisionRecord source exists in the product | No product surface ingests DecisionRecords yet | Requires a decision-source integration (product decision) | **NOT_IMPLEMENTED** (honest backlog; no UI claims it runs) |
| UF-007 | Sandbox (`src/frontend/sandbox/`) | FR-011 | Demo values could be mistaken for live data | Real engine in-browser, scripted transport, labeled banner | Deliberate design (ADR-009) | None — classification in `FIXTURE_AND_MOCK_ELIMINATION.md` | **ACCEPTED (DEMO_ONLY, isolated)** |

## Non-findings (checked, confirmed clean)

- No `TODO`/`FIXME`/stub markers in `src/` (sweep returned none).
- No hardcoded timestamps or static arrays in product paths (the only
  deterministic fixtures live in the sandbox/demo/test surfaces, classified
  in `FIXTURE_AND_MOCK_ELIMINATION.md`).
- No unused resolvers; every resolver is invoked by the frontend or agent
  surface.
- No dead controls: every frontend action routes to a resolver with error,
  loading and permission handling (verified in the dynamics pass).
- All `throw new Error` sites are typed, deliberate guard failures with
  explicit messages (no silent swallows).

## Fixture classification

See `docs/FIXTURE_AND_MOCK_ELIMINATION.md` — every fixture is TEST_ONLY or
DEMO_ONLY; **none sits in a production path** (the production Jira path uses
the real asUser fetcher wrapped in the new resilience layer).
