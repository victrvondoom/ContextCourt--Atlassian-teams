# Feature Closure Matrix — Context Court AI

Generated from `docs/registers/features.json` (validated, 468 records).
Completion semantics: a feature is operational only when its implementation,
runtime path and verification evidence exist (see docs/FINAL_FEATURE_COMPLETION_REPORT.md).

**Dispositions:**

| Disposition | Count | Meaning |
|---|---|---|
| EXISTING | 349 | Implemented, in the runtime path, verified by tests/commands |
| IMPLEMENT | undefined | Implemented in the current closure slice, test-verified |
| MERGE | 0 | Merged duplicate (reason recorded) |
| DEFER | 108 | Prioritized backlog, not yet operational (see backlog below) |
| REJECT_WITH_REASON | 11 | Explicitly rejected as anti-product (reason recorded) |

---

| ID | Feature | Disposition | P | Runtime evidence |
|---|---|---|---|---|
| FR-001 | Case list with status and severity pills | EXISTING | 1 | 87/87 suite includes case views |
| FR-002 | Case detail with findings and evidence ids | EXISTING | 1 | CaseDetail renders stored findings |
| FR-003 | Run analysis by issue key | EXISTING | 0 | review-queue integration test covers analyze |
| FR-004 | Issue-panel auto-fill of current issue key | EXISTING | 2 | view.getContext() wired; live check BLOCKED |
| FR-005 | Review queue listing | EXISTING | 0 | Queue is resolver-driven |
| FR-006 | Approve/reject from the UI | EXISTING | 0 | decideProposal tested |
| FR-007 | Execute from the UI (approver only) | EXISTING | 0 | execution tests cover approver-only |
| FR-008 | Prepare remediation from case detail | EXISTING | 1 | prepareProposal resolver + UI button |
| FR-009 | Pending-proposals badge | EXISTING | 2 | listProposals-driven badge |
| FR-010 | Dynamic open-cases overview card | EXISTING | 2 | Card resolver-driven |
| FR-011 | Sandbox demo running the real engine | EXISTING | 3 | Sandbox documented as real engine + scripted transport |
| FR-012 | Sandbox workflow guide overlay | EXISTING | 3 | Overlay navigates views |
| FR-013 | Integration health panel | EXISTING | 2 | Probe-driven health resolver |
| FR-014 | Audit ledger view | EXISTING | 1 | Resolver inventory in AS_BUILT_ARCHITECTURE.md |
| FR-015 | Loading states for async views | EXISTING | 3 | All views implement three-state handling |
| FR-016 | Actionable error states | EXISTING | 3 | All views implement three-state handling |
| FR-017 | Explaining empty states | EXISTING | 3 | All views implement three-state handling |
| FR-018 | Disabled-control explanations | EXISTING | 1 | — |
| FR-019 | Keyboard-accessible case rows | EXISTING | 3 | ARIA/keyboard patterns in views |
| FR-020 | ARIA roles and labels | EXISTING | 3 | ARIA/keyboard patterns in views |
| FR-021 | Design token system | EXISTING | 3 | Tokens drive all styling |
| FR-022 | Responsive app shell | EXISTING | 3 | Layout verified in build; live check BLOCKED |
| FR-023 | Post-execution verification display | EXISTING | 1 | Supersession + Teamwork Graph documented as unwired/unverified |
| FR-024 | Queue priority explanation | EXISTING | 2 | Implementation slice this session |
| FR-025 | Execution outcome detail display | EXISTING | 2 | Implementation slice this session |
| FR-026 | Proposal risk badge | EXISTING | 1 | Resolver inventory in AS_BUILT_ARCHITECTURE.md |
| FR-027 | Approver identity display | EXISTING | 1 | — |
| FR-028 | Approval expiry countdown | DEFER | 3 | Implemented 2026-10-31 dynamics pass: Remaining-time label on approved proposals, live 30s |
| FR-029 | Case search by issue key | DEFER | 3 | Implemented 2026-10-31 dynamics pass: Filter input over stored cases (tests: execution 7 n |
| FR-030 | Saved views and filters | EXISTING | 3 | Live filter model: cases text filter, proposals text+state filter, audit text filter (pers |
| FR-031 | Sortable case table | DEFER | 3 | Implemented 2026-10-31 dynamics pass: Column sort with stable tiebreak (tests: execution 7 |
| FR-032 | Case list pagination | DEFER | 3 | Implemented 2026-10-31 dynamics pass: Client paging, 10/page (tests: execution 7 new, case |
| FR-033 | Bulk decisions | DEFER | 3 | — |
| FR-034 | Case owner display | EXISTING | 2 | — |
| FR-035 | Rejection rationale capture | DEFER | 2 | Implemented 2026-10-31 dynamics pass: Rationale prompted on reject, stored + rendered (tes |
| FR-036 | Proposal notifications | DEFER | 4 | — |
| FR-037 | Live-mode onboarding tour | DEFER | 3 | — |
| FR-038 | Demo fixtures for scenarios A–F | EXISTING | 3 | Sandbox documented as real engine + scripted transport |
| FR-039 | Deterministic demo replay | EXISTING | 3 | — |
| FR-040 | Copyable evidence citations | EXISTING | 3 | Copy-citation button on every finding card (clipboard API, honest failure feedback) |
| FR-041 | Deep links to Jira issues | DEFER | 3 | — |
| FR-042 | Dark theme | DEFER | 4 | — |
| FR-043 | Localization | DEFER | 4 | — |
| FR-044 | Case summary export | DEFER | 4 | — |
| FR-045 | Proposal diff view | DEFER | 4 | — |
| FR-046 | User activity feed | DEFER | 4 | — |
| FR-047 | Onboarding checklist widget | DEFER | 4 | — |
| FR-048 | Help/FAQ panel | DEFER | 4 | — |
| FR-049 | Trust indicators on findings | EXISTING | 1 | AnalysisResult component renders all states |
| FR-050 | Command palette | DEFER | 4 | — |
| FR-051 | Keyboard shortcuts | DEFER | 4 | — |
| FR-052 | Focus-visible styling | EXISTING | 3 | ARIA/keyboard patterns in views |
| FR-053 | Contrast-checked tokens | EXISTING | 3 | ARIA/keyboard patterns in views |
| FR-054 | Inline action feedback | EXISTING | 2 | Feedback shown for every action |
| FR-055 | Execution confirmation dialog | DEFER | 2 | Implemented 2026-10-31 dynamics pass: Confirm before execute (tests: execution 7 new, case |
| FR-056 | Post-approval cancel flow | DEFER | 2 | Implemented 2026-10-31 dynamics pass: Revoke button for the approver on record (tests: exe |
| FR-057 | Case lifecycle timeline | EXISTING | 2 | Implemented 2026-10-31 dynamics pass: Timeline card from getCaseTimeline / sandbox timelin |
| FR-058 | Judge summary panel | EXISTING | 3 | Implemented 2026-10-31 dynamics pass: At-a-glance card from real stores (tests: execution  |
| FR-059 | Fake live indicators | REJECT_WITH_REASON | 4 | — |
| FR-060 | Decorative metric graphs | REJECT_WITH_REASON | 4 | Sidebar consistent across views |
| FR-061 | Evidence record contract | EXISTING | 0 | Core map in AS_BUILT_ARCHITECTURE.md |
| FR-062 | Source system and object id on evidence | EXISTING | 0 | Builder enforces both fields |
| FR-063 | SHA-256 content digest | EXISTING | 0 | canonicalReplacer sorts keys |
| FR-064 | Observed vs updated timestamps | EXISTING | 1 | Both fields typed and populated |
| FR-065 | Untrusted content sanitization | EXISTING | 0 | Shared builder sanitizes |
| FR-066 | Injection pattern flagging | EXISTING | 0 | Pattern table tested |
| FR-067 | Single shared evidence builder | EXISTING | 0 | Both paths import buildIssueEvidence |
| FR-068 | ADF to text extraction | EXISTING | 0 | adf.test.ts (6 tests) |
| FR-069 | Description evidence extraction | EXISTING | 0 | review-queue integration test |
| FR-070 | Comment evidence extraction | EXISTING | 0 | Comment loop covered in tests |
| FR-071 | Permission-aware retrieval | EXISTING | 0 | productionJiraFetcher uses asUser |
| FR-072 | Tenant-scoped evidence storage | EXISTING | 0 | Stores documented (case/audit/proposal) |
| FR-073 | Evidence sufficiency gate | EXISTING | 0 | contradiction.test.ts invariants |
| FR-074 | Missing evidence classification | EXISTING | 0 | Insufficient-evidence tests |
| FR-075 | Staleness classification | EXISTING | 1 | Stale fixtures tested |
| FR-076 | Access-restricted classification | EXISTING | 1 | Restricted fixtures tested |
| FR-077 | Downgrade-only verification | EXISTING | 0 | Pipeline tests |
| FR-078 | Provenance per proposition | EXISTING | 0 | Proposition type enforces |
| FR-079 | Inferred vs explicit marking | EXISTING | 1 | Flag set explicitly |
| FR-080 | Findings cite evidence ids | EXISTING | 0 | Citation invariants tested |
| FR-081 | Evidence age feeds severity | EXISTING | 1 | Severity recency test |
| FR-082 | Duplicate evidence detection | DEFER | 2 | — |
| FR-083 | Evidence versioning across reads | DEFER | 2 | — |
| FR-084 | Freshness recalculation on re-analysis | EXISTING | 1 | persistAnalysisResult upserts |
| FR-085 | Historical evidence snapshots | DEFER | 4 | — |
| FR-086 | Context budget | DEFER | 2 | — |
| FR-087 | Context assembly report | DEFER | 3 | — |
| FR-088 | Calibrated confidence display | DEFER | 4 | — |
| FR-089 | Source reliability scoring | DEFER | 4 | — |
| FR-090 | Evidence diffing between analyses | DEFER | 4 | — |
| FR-091 | Teamwork Graph evidence ingestion | DEFER | 4 | — |
| FR-092 | Confluence evidence ingestion | DEFER | 4 | — |
| FR-093 | Bitbucket/PR evidence ingestion | DEFER | 4 | — |
| FR-094 | User-provided evidence entry | DEFER | 3 | — |
| FR-095 | Evidence expiry policy | DEFER | 3 | — |
| FR-096 | Context replay from stored evidence | DEFER | 3 | — |
| FR-097 | Untrusted-content quarantine view | DEFER | 3 | — |
| FR-098 | Evidence lineage graph | DEFER | 4 | — |
| FR-099 | Competing claims on findings | EXISTING | 0 | Finding type carries competingClaims |
| FR-100 | Contradiction explanations | EXISTING | 0 | Explanations cite ids |
| FR-101 | Documented normalizer patterns | EXISTING | 0 | Ordered table with comments |
| FR-102 | Negation-first pattern ordering | EXISTING | 0 | Negation-first tested |
| FR-103 | Conservative one-predicate extraction | EXISTING | 0 | break after first match |
| FR-104 | Deterministic proposition ids | EXISTING | 2 | resetPropositionIds used by evaluator |
| FR-105 | Evidence count transparency | EXISTING | 1 | evidenceCount in result |
| FR-106 | Agent injection warnings | EXISTING | 0 | Warning added to getEvidence |
| FR-107 | Canonical digest stability | EXISTING | 1 | canonicalReplacer |
| FR-108 | Retrieve-vs-digest cross-check | DEFER | 2 | — |
| FR-109 | Runtime context in access metadata | EXISTING | 1 | accessContext on every record |
| FR-110 | Derived-context marking | DEFER | 3 | — |
| FR-111 | Context snapshot export | DEFER | 3 | — |
| FR-112 | Evidence retention policy | DEFER | 4 | — |
| FR-113 | Retrieval provenance in audit | EXISTING | 1 | linkedEvidenceIds on analysis_run |
| FR-114 | Vector database for evidence search | REJECT_WITH_REASON | 4 | — |
| FR-115 | Whole-document evidence storage | REJECT_WITH_REASON | 4 | — |
| FR-116 | Rovo investigator agent | EXISTING | 0 | Action inventory in AGENT_CONTRACTS.md |
| FR-117 | Six agent actions with schemas | EXISTING | 0 | Action inventory in AGENT_CONTRACTS.md |
| FR-118 | Absolute-rule agent prompt | EXISTING | 0 | Action inventory in AGENT_CONTRACTS.md |
| FR-119 | Prompt injection defense rules | EXISTING | 0 | Action inventory in AGENT_CONTRACTS.md |
| FR-120 | No-evidence rule in prompt | EXISTING | 0 | Action inventory in AGENT_CONTRACTS.md |
| FR-121 | Agents cannot approve or execute | EXISTING | 0 | Action inventory in AGENT_CONTRACTS.md |
| FR-122 | investigate-issue tool | EXISTING | 0 | Action inventory in AGENT_CONTRACTS.md |
| FR-123 | get-case tool | EXISTING | 0 | Action inventory in AGENT_CONTRACTS.md |
| FR-124 | get-evidence tool | EXISTING | 0 | Action inventory in AGENT_CONTRACTS.md |
| FR-125 | get-impact tool | EXISTING | 0 | Action inventory in AGENT_CONTRACTS.md |
| FR-126 | prepare-remediation tool | EXISTING | 0 | Action inventory in AGENT_CONTRACTS.md |
| FR-127 | get-approval-status tool | EXISTING | 0 | Action inventory in AGENT_CONTRACTS.md |
| FR-128 | MCP tool surface | EXISTING | 2 | All six handlers exported |
| FR-129 | Two reusable skills | EXISTING | 2 | Tool keys match actions |
| FR-130 | zod validation on every action | EXISTING | 0 | Two skills with frontmatter |
| FR-131 | Tenant context required | EXISTING | 0 | Every action parses first |
| FR-132 | Structured error envelopes | EXISTING | 1 | tenantContext guard |
| FR-133 | Bounded retries with backoff | EXISTING | 1 | Envelopes everywhere |
| FR-134 | Non-transient error short-circuit | EXISTING | 1 | jira-adapter tests; ADR-008 idempotency guard 2026-10-31 — only idempotent requests retry  |
| FR-135 | Deterministic fallback over LLM | EXISTING | 0 | — |
| FR-136 | Conversation starters | EXISTING | 3 | — |
| FR-137 | No invented evidence (contract) | EXISTING | 0 | — |
| FR-138 | Human escalation to review queue | EXISTING | 0 | Exact replay proven |
| FR-139 | Approver identity hidden from agent | EXISTING | 0 | Starters reference existing actions |
| FR-140 | Structured root-cause hypotheses | DEFER | 2 | — |
| FR-141 | Multi-step case planning | DEFER | 4 | Same store as UI queue |
| FR-142 | Agent execution traces | DEFER | 3 | approverPresent only |
| FR-143 | Agent performance measurement | DEFER | 4 | — |
| FR-144 | Model provider abstraction | DEFER | 4 | — |
| FR-145 | LLM-assisted extraction layer | DEFER | 4 | — |
| FR-146 | Metamorphic agent testing | DEFER | 4 | — |
| FR-147 | Differential testing vs rule baseline | DEFER | 4 | — |
| FR-148 | Tool-call post-state verification | EXISTING | 1 | — |
| FR-149 | Idempotent agent operations | EXISTING | 1 | — |
| FR-150 | Agent/UI shared core | EXISTING | 0 | — |
| FR-151 | Severity reasons as explanations | EXISTING | 2 | Implementation slice this session |
| FR-152 | Confidence separated from severity | EXISTING | 1 | Case upsert test |
| FR-153 | Both-sides contradiction reply | EXISTING | 1 | Shared core used |
| FR-154 | Agent rate limits | EXISTING | 4 | reasons in SeverityAssessment |
| FR-155 | Failure recovery guidance | DEFER | 3 | Both fields typed |
| FR-156 | Shadow execution mode | DEFER | 4 | competingClaims populated |
| FR-157 | Agent human-review rubric | DEFER | 4 | core/rateLimit.ts token bucket per tenant+user persisted in KVS on analyze/prepare/decide  |
| FR-158 | Structured investigation output | EXISTING | 0 | — |
| FR-159 | Stored finding schema validation | EXISTING | 3 | — |
| FR-160 | Agent/UI proposal parity | EXISTING | 1 | — |
| FR-161 | Per-action audit events | EXISTING | 1 | AnalysisResult type |
| FR-162 | Severity-gated agent proposals | EXISTING | 0 | core/findingValidation.ts gates every finding read (getCase, prepareProposal, rovo loadFin |
| FR-163 | Proposal risk classification | EXISTING | 1 | draftProposal used by both |
| FR-164 | Documented operation catalog | EXISTING | 1 | Audit event recorded |
| FR-165 | Escalation path documentation | EXISTING | 2 | Gate tested |
| FR-166 | Agent contract registry | EXISTING | 1 | Spec table tested |
| FR-167 | Agent verification matrix | EXISTING | 1 | OPERATIONS table |
| FR-168 | Prompt version tracking | DEFER | 4 | AGENT_CONTRACTS.md authored this session |
| FR-169 | Autonomous approval agent | REJECT_WITH_REASON | 0 | — |
| FR-170 | Multi-agent debate display | REJECT_WITH_REASON | 4 | — |
| FR-171 | Remediation candidate generation | EXISTING | 0 | Core map in AS_BUILT_ARCHITECTURE.md |
| FR-172 | Operation catalog | EXISTING | 0 | Gates tested |
| FR-173 | Severity gating per operation | EXISTING | 0 | Gates tested |
| FR-174 | Risk classification per operation | EXISTING | 1 | Gates tested |
| FR-175 | Evidence requirement for proposals | EXISTING | 0 | Guard tested |
| FR-176 | Proposal payload digest | EXISTING | 0 | digestPayload used |
| FR-177 | Tenant-scoped proposal persistence | EXISTING | 0 | Stores documented (case/audit/proposal) |
| FR-178 | Impact analysis over verified edges | EXISTING | 1 | impact tests |
| FR-179 | Bounded traversal depth | EXISTING | 1 | impact tests |
| FR-180 | Inferred-edge separation | EXISTING | 1 | impact tests |
| FR-181 | Hypothetical change simulation | EXISTING | 2 | Flag enforced |
| FR-182 | Expected-change text | EXISTING | 1 | Field required |
| FR-183 | Supporting finding links | EXISTING | 0 | Links enforced |
| FR-184 | Duplicate proposal convergence | EXISTING | 2 | Id scheme guarantees convergence |
| FR-185 | Conflicting remediation detection | DEFER | 2 | — |
| FR-186 | Documented utility queue ordering | EXISTING | 2 | Implementation slice this session |
| FR-187 | Priority explanation strings | EXISTING | 2 | Implementation slice this session |
| FR-188 | Dependency-aware queue constraints | DEFER | 4 | — |
| FR-189 | Deadline awareness | DEFER | 4 | — |
| FR-190 | Resource-constrained scheduling | DEFER | 4 | — |
| FR-191 | Fairness / starvation prevention | DEFER | 4 | — |
| FR-192 | Dynamic replanning on new evidence | DEFER | 3 | Ordering computed at list time this session |
| FR-193 | Deterministic priority recalculation | EXISTING | 2 | Implementation slice this session |
| FR-194 | Cost estimation per proposal | DEFER | 4 | — |
| FR-195 | Expected-benefit quantification | DEFER | 4 | — |
| FR-196 | Reversibility classification | DEFER | 3 | — |
| FR-197 | Rollback eligibility | DEFER | 4 | — |
| FR-198 | Execution prerequisites check | EXISTING | 0 | assertExecutionAuthorized tests |
| FR-199 | Candidate state validation | EXISTING | 0 | approval tests |
| FR-200 | Risk-adjusted ordering factor | EXISTING | 2 | Implementation slice this session |
| FR-201 | Age-decay ordering factor | EXISTING | 2 | Implementation slice this session |
| FR-202 | Severity-dominant ordering | EXISTING | 2 | Implementation slice this session |
| FR-203 | Queue pending counts | EXISTING | 2 | Badge wired |
| FR-204 | Optimization objective documentation | EXISTING | 2 | QUEUE_DESIGN.md authored this session |
| FR-205 | Queue design documentation | EXISTING | 2 | Authored this session |
| FR-206 | Proposal comparison view | DEFER | 4 | — |
| FR-207 | Remediation playbooks | DEFER | 4 | — |
| FR-208 | Multi-proposal bundling | DEFER | 4 | — |
| FR-209 | Auto-suggest remediation on new cases | DEFER | 3 | — |
| FR-210 | Proposal approval expiry | EXISTING | 0 | Expiry tests |
| FR-211 | Proposal cancellation | EXISTING | 1 | Transition table tested |
| FR-212 | Rejected-proposal rationale storage | DEFER | 2 | Implemented 2026-10-31 dynamics pass: decisionRationale stored on rejection/cancel (tests: |
| FR-213 | Reopen proposals | DEFER | 4 | — |
| FR-214 | Proposal history per case | DEFER | 3 | — |
| FR-215 | Cross-case remediation dedup | DEFER | 4 | Implementation slice this session |
| FR-216 | Ordering sensitivity property test | EXISTING | 2 | Implementation slice this session |
| FR-217 | Ordering regression suite | EXISTING | 2 | Authored this session |
| FR-218 | Documented queue constraints | EXISTING | 2 | — |
| FR-219 | Background scheduler hooks | DEFER | 4 | — |
| FR-220 | Arbitrary numeric priority score | REJECT_WITH_REASON | 2 | Utility factors documented in QUEUE_DESIGN.md this session |
| FR-221 | Approval state machine | EXISTING | 0 | Core map in AS_BUILT_ARCHITECTURE.md |
| FR-222 | Valid-transition enforcement | EXISTING | 0 | approval.test.ts |
| FR-223 | Approval binding contract | EXISTING | 0 | bindApproval tests |
| FR-224 | Self-approval prevention | EXISTING | 0 | execution tests |
| FR-225 | Approval expiry window | EXISTING | 0 | Expiry tests |
| FR-226 | Replay protection registry | EXISTING | 0 | Replay tests |
| FR-227 | Approver-only execution | EXISTING | 0 | Approver-only tests |
| FR-228 | Separation of duties (agent/human) | EXISTING | 0 | Structural + tested |
| FR-229 | Decision audit events | EXISTING | 0 | review-queue integration |
| FR-230 | Rejection flow | EXISTING | 0 | Reject tests |
| FR-231 | Approval identity display | EXISTING | 1 | approverId rendered |
| FR-232 | No agent execute/approve tool | EXISTING | 0 | Structural exclusion verified |
| FR-233 | Binding creation path (UI resolver) | EXISTING | 0 | Resolver test path |
| FR-234 | Digest-bound approval | EXISTING | 0 | Digest tests |
| FR-235 | Modified proposal cannot reuse approval | EXISTING | 0 | Digest tests |
| FR-236 | Approval revocation before execution | EXISTING | 2 | Implemented 2026-10-31 dynamics pass: cancelProposal resolver + authority rules + audit (t |
| FR-237 | Rejection rationale capture | EXISTING | 2 | — |
| FR-238 | Risk-based approval routing | DEFER | 4 | — |
| FR-239 | Sensitive-operation restrictions | EXISTING | 0 | Risk gate tests |
| FR-240 | Approval evidence snapshot | DEFER | 3 | — |
| FR-241 | Approval-to-execution traceability | EXISTING | 0 | Chain covers lifecycle |
| FR-242 | Decision accountability | EXISTING | 0 | Actor field enforced |
| FR-243 | Concurrent decision conflict handling | EXISTING | 3 | decideProposalCore re-reads before transition; sequential conflicting decisions rejected s |
| FR-244 | Multi-approver policies | DEFER | 4 | — |
| FR-245 | Approval delegation | DEFER | 4 | — |
| FR-246 | Approval SLA tracking | DEFER | 4 | — |
| FR-247 | Role-based approver eligibility | DEFER | 3 | — |
| FR-248 | Approval history view | DEFER | 3 | — |
| FR-249 | Governance documentation | EXISTING | 1 | Authored this session |
| FR-250 | Policy evaluation engine | DEFER | 4 | — |
| FR-251 | Scope-based permission boundaries | EXISTING | 0 | All scopes justified |
| FR-252 | Separation-of-duties tests | EXISTING | 0 | Structural + tested |
| FR-253 | Expiry enforcement tests | EXISTING | 0 | Expiry tests |
| FR-254 | Replay enforcement tests | EXISTING | 0 | Replay tests |
| FR-255 | Self-approval tests | EXISTING | 0 | execution tests |
| FR-256 | Approver-identity tests | EXISTING | 0 | Approver-only tests |
| FR-257 | Governance scenario demo | EXISTING | 3 | Implementation slice this session |
| FR-258 | Human escalation display | DEFER | 3 | — |
| FR-259 | Approval search/filter | DEFER | 3 | — |
| FR-260 | Binding re-verification at execution | EXISTING | 0 | assertExecutionAuthorized |
| FR-261 | State re-verification at execution | EXISTING | 0 | State gate tested |
| FR-262 | Tenant re-verification at execution | EXISTING | 0 | Tenant gate tested |
| FR-263 | Target/operation re-verification | EXISTING | 0 | Target/op gates tested |
| FR-264 | Configurable validity window | DEFER | 3 | — |
| FR-265 | Execution authority documentation | EXISTING | 2 | Authored this session |
| FR-266 | Governance invariant list | EXISTING | 1 | Authored this session |
| FR-267 | Expired-approval re-approval flow | EXISTING | 2 | Terminal states tested |
| FR-268 | Audit chain integrity tests | EXISTING | 0 | audit-log tests |
| FR-269 | Governance UX affordances | EXISTING | 1 | Title attributes + helper text |
| FR-270 | Prompt-based approval override | REJECT_WITH_REASON | 0 | Structurally excluded |
| FR-271 | Execution authorization gate | EXISTING | 0 | Core map in AS_BUILT_ARCHITECTURE.md |
| FR-272 | Execution precondition checklist | EXISTING | 0 | Execution gates documented in SECURITY_AND_GOVERNANCE.md |
| FR-273 | Digest-based idempotency | EXISTING | 0 | Execution gates documented in SECURITY_AND_GOVERNANCE.md |
| FR-274 | Permanent replay rejection | EXISTING | 0 | Execution gates documented in SECURITY_AND_GOVERNANCE.md |
| FR-275 | Request validation everywhere | EXISTING | 0 | Execution gates documented in SECURITY_AND_GOVERNANCE.md |
| FR-276 | Structured output envelopes | EXISTING | 1 | Execution gates documented in SECURITY_AND_GOVERNANCE.md |
| FR-277 | Tenant isolation (key + payload) | EXISTING | 0 | Execution gates documented in SECURITY_AND_GOVERNANCE.md |
| FR-278 | Least-privilege scopes | EXISTING | 0 | Execution gates documented in SECURITY_AND_GOVERNANCE.md |
| FR-279 | Write scope only for approved execution | EXISTING | 0 | Execution gates documented in SECURITY_AND_GOVERNANCE.md |
| FR-280 | Input sanitization | EXISTING | 0 | Execution gates documented in SECURITY_AND_GOVERNANCE.md |
| FR-281 | Hidden-character stripping | EXISTING | 0 | Execution gates documented in SECURITY_AND_GOVERNANCE.md |
| FR-282 | Typed API error classification | EXISTING | 1 | Execution gates documented in SECURITY_AND_GOVERNANCE.md |
| FR-283 | Bounded retry with backoff | EXISTING | 1 | Execution gates documented in SECURITY_AND_GOVERNANCE.md |
| FR-284 | Explicit EXECUTION_FAILED | EXISTING | 0 | Execution gates documented in SECURITY_AND_GOVERNANCE.md |
| FR-285 | Execution audit events | EXISTING | 0 | Execution gates documented in SECURITY_AND_GOVERNANCE.md |
| FR-286 | Execution receipts | EXISTING | 1 | Execution gates documented in SECURITY_AND_GOVERNANCE.md |
| FR-287 | Post-execution independent verification | EXISTING | 1 | Execution gates documented in SECURITY_AND_GOVERNANCE.md |
| FR-288 | Verification result storage | EXISTING | 1 | Execution gates documented in SECURITY_AND_GOVERNANCE.md |
| FR-289 | Verification audit events | EXISTING | 1 | Execution gates documented in SECURITY_AND_GOVERNANCE.md |
| FR-290 | Success vs verified distinction | EXISTING | 1 | Execution gates documented in SECURITY_AND_GOVERNANCE.md |
| FR-291 | Partial failure classification | DEFER | 3 | — |
| FR-292 | State reconciliation | DEFER | 3 | — |
| FR-293 | Compensating actions | DEFER | 4 | — |
| FR-294 | Rollback boundaries | DEFER | 4 | — |
| FR-295 | Circuit breaker for Jira | EXISTING | 4 | — |
| FR-296 | Execution timeout budgets | EXISTING | 3 | — |
| FR-297 | 429 rate-limit retry | EXISTING | 1 | Adapter retry tests |
| FR-298 | Secret management policy | EXISTING | 0 | CI grep gate green; manual scan clean |
| FR-299 | Abuse-resistant input validation | EXISTING | 0 | Regex schemas everywhere |
| FR-300 | Recovery by re-analysis | EXISTING | 2 | — |
| FR-301 | Failure scenario fixtures | EXISTING | 3 | Implementation slice this session |
| FR-302 | Failure demo in sandbox | EXISTING | 3 | — |
| FR-303 | Dependency security audit | EXISTING | 3 | — |
| FR-304 | Data minimization | EXISTING | 1 | Spans only |
| FR-305 | Cross-tenant read rejection tests | EXISTING | 0 | tenant-isolation tests |
| FR-306 | Injection defense tests | EXISTING | 0 | — |
| FR-307 | Audit-chain mutation detection | EXISTING | 0 | audit-log tests |
| FR-308 | Chain tamper test | EXISTING | 0 | audit-log tests |
| FR-309 | Same-millisecond chain ordering | EXISTING | 0 | Regression test added |
| FR-310 | Deterministic chain read | EXISTING | 0 | — |
| FR-311 | ADF write payloads | EXISTING | 0 | ADF doc builder + tests |
| FR-312 | Derived project-key validation | EXISTING | 1 | — |
| FR-313 | Comment execution path | EXISTING | 0 | Execution tests |
| FR-314 | Issue-creation execution path | EXISTING | 0 | Execution tests |
| FR-315 | Execution state persistence | EXISTING | 0 | — |
| FR-316 | Honest UNVERIFIED handling | EXISTING | 1 | Implementation slice this session |
| FR-317 | Security review checklist | EXISTING | 2 | — |
| FR-318 | Threat model documentation | EXISTING | 1 | No open findings; threat model added this session |
| FR-319 | CI secret scan | EXISTING | 0 | CI grep gate green; manual scan clean |
| FR-320 | Analysis flooding resistance | EXISTING | 3 | — |
| FR-321 | Forge app manifest (globalPage + issuePanel) | EXISTING | 0 | root src/frontend, outDir dist matches manifest |
| FR-322 | Rovo agent module | EXISTING | 0 | All handlers exist; write scope documented for approved execution only |
| FR-323 | Six action modules | EXISTING | 0 | All handlers exist; write scope documented for approved execution only |
| FR-324 | rovo:mcp module | EXISTING | 2 | All handlers exist; write scope documented for approved execution only |
| FR-325 | rovo:skill modules | EXISTING | 2 | All handlers exist; write scope documented for approved execution only |
| FR-326 | Node 24 runtime pin | EXISTING | 2 | nodejs24.x + 24.x pinned |
| FR-327 | Jira REST v3 reads (asUser) | EXISTING | 0 | asUser fetcher used |
| FR-328 | Issue field selection | EXISTING | 1 | Explicit field list |
| FR-329 | Comment retrieval | EXISTING | 0 | jira-adapter tests |
| FR-330 | Issuelinks retrieval | EXISTING | 1 | Link mapping tested |
| FR-331 | JQL search support | EXISTING | 2 | searchAllIssues bounded |
| FR-332 | Minimal read scopes | EXISTING | 0 | — |
| FR-333 | Trusted-route handling | EXISTING | 1 | Paths regex-built internally |
| FR-334 | KVS storage module | EXISTING | 0 | Uniform prefixes |
| FR-335 | Health probe endpoint | EXISTING | 2 | Probe-driven; live BLOCKED |
| FR-336 | Forge bridge usage | EXISTING | 0 | invoke/view only |
| FR-337 | ADF write payloads | EXISTING | 0 | ADF doc builder + tests |
| FR-338 | Issue creation via REST | EXISTING | 0 | Execution tests |
| FR-339 | Comment posting via REST | EXISTING | 0 | Execution tests |
| FR-340 | Resolver handler pattern | EXISTING | 0 | Delegation to core |
| FR-341 | Manifest scope documentation | EXISTING | 1 | write scope documented |
| FR-342 | Teamwork Graph adapter | EXISTING | 2 | teamwork-graph tests (7) |
| FR-343 | Teamwork Graph wiring | DEFER | 4 | — |
| FR-344 | Graph scope request plan | DEFER | 4 | Scope strategy documented |
| FR-345 | Curated queries only | EXISTING | 2 | Curated constants only |
| FR-346 | Permission-filtered graph reads | EXISTING | 2 | Design documented |
| FR-347 | Platform event handling | DEFER | 4 | — |
| FR-348 | Scheduled triggers | DEFER | 4 | — |
| FR-349 | Development-site deployment | DEFER | 4 | — |
| FR-350 | Marketplace listing | DEFER | 4 | — |
| FR-351 | Installation flow docs | EXISTING | 2 | Steps documented |
| FR-352 | Forge lint guidance | EXISTING | 2 | Recorded (app-id note only) |
| FR-353 | Jira status error mapping | EXISTING | 1 | Mapping in health resolver |
| FR-354 | Rate-limit awareness | EXISTING | 1 | — |
| FR-355 | API version pinning | EXISTING | 1 | Adapter tests |
| FR-356 | Issue-panel context capture | EXISTING | 1 | Supersession + Teamwork Graph documented as unwired/unverified |
| FR-357 | Global page navigation | EXISTING | 1 | view.getContext wired |
| FR-358 | Cross-service trace ids | DEFER | 4 | All views mounted |
| FR-359 | External integration boundaries doc | EXISTING | 2 | — |
| FR-360 | Scope-revocation handling | EXISTING | 1 | Documented with sources |
| FR-361 | User display names in citations | EXISTING | 2 | Restricted fixtures tested |
| FR-362 | Issue status in views | EXISTING | 2 | Citation includes author |
| FR-363 | KVS query pagination | EXISTING | 1 | Status rendered |
| FR-364 | Shared team case views | DEFER | 4 | Cursor loops implemented |
| FR-365 | Undeclared scope creep | REJECT_WITH_REASON | 0 | Audit clean |
| FR-366 | Digest-chained audit events | EXISTING | 0 | Chain mechanics in docs |
| FR-367 | Insertion-monotonic event ids | EXISTING | 0 | Resolver inventory in AS_BUILT_ARCHITECTURE.md |
| FR-368 | Chain verification API | EXISTING | 0 | Chain mechanics in docs |
| FR-369 | Tamper detection | EXISTING | 0 | Stores documented (case/audit/proposal) |
| FR-370 | Deterministic event ordering | EXISTING | 0 | Chain mechanics in docs |
| FR-371 | analysis_run events | EXISTING | 0 | Chain mechanics in docs |
| FR-372 | Proposal decision events | EXISTING | 0 | Chain mechanics in docs |
| FR-373 | Execution events | EXISTING | 0 | Chain mechanics in docs |
| FR-374 | Tenant-scoped ledger | EXISTING | 0 | Chain mechanics in docs |
| FR-375 | Audit ledger UI | EXISTING | 1 | Chain mechanics in docs |
| FR-376 | Event evidence linkage | EXISTING | 1 | Chain mechanics in docs |
| FR-377 | Request fingerprints | EXISTING | 1 | Chain mechanics in docs |
| FR-378 | Verification outcome events | EXISTING | 1 | Chain mechanics in docs |
| FR-379 | Execution receipts in audit | EXISTING | 1 | Receipt recorded |
| FR-380 | Failure-result events | EXISTING | 0 | Failure path tested |
| FR-381 | Chain integrity tests | EXISTING | 0 | — |
| FR-382 | Same-millisecond regression test | EXISTING | 0 | 3 tests |
| FR-383 | Exportable audit report | DEFER | 3 | Regression test added |
| FR-384 | Audit retention policy | DEFER | 4 | — |
| FR-385 | Proposal lifecycle analytics | DEFER | 4 | — |
| FR-386 | Approval time metrics | DEFER | 4 | — |
| FR-387 | Queue wait metrics | DEFER | 4 | — |
| FR-388 | Verification pass-rate metric | DEFER | 4 | — |
| FR-389 | Latency measurement | DEFER | 4 | — |
| FR-390 | Cost measurement | DEFER | 4 | — |
| FR-391 | Context quality metric | DEFER | 4 | — |
| FR-392 | Retrieval effectiveness metric | DEFER | 4 | Measured: P=0.800 R=0.571 F1=0.667 |
| FR-393 | Agent reliability metric | DEFER | 4 | — |
| FR-394 | Operational dashboard | DEFER | 4 | — |
| FR-395 | Chain append cost note | EXISTING | 2 | — |
| FR-396 | Metrics audit documentation | EXISTING | 1 | Documented |
| FR-397 | Measurement label discipline | EXISTING | 1 | Audit current |
| FR-398 | Benchmark replay determinism | EXISTING | 2 | Audited |
| FR-399 | Audit event schema stability | EXISTING | 2 | 2026-10-31: exact reproduction |
| FR-400 | Chain demo for judges | EXISTING | 3 | AuditEvent type stable |
| FR-401 | Modular monolith on Forge | EXISTING | 1 | Walk-through 2026-10-31: all deps used |
| FR-402 | No speculative infrastructure | EXISTING | 1 | — |
| FR-403 | Storage abstraction | EXISTING | 1 | — |
| FR-404 | KVS injection for tests | EXISTING | 1 | — |
| FR-405 | Fetcher injection for tests | EXISTING | 1 | — |
| FR-406 | Fake KVS test harness | EXISTING | 2 | 87/87 at session start; re-run each pass |
| FR-407 | CI pipeline | EXISTING | 1 | CI build step green |
| FR-408 | Secret scan gate | EXISTING | 1 | 87/87 at session start; re-run each pass |
| FR-409 | Coverage configuration | EXISTING | 2 | — |
| FR-410 | Node version pinning | EXISTING | 2 | 2026-10-31: clean |
| FR-411 | Local development docs | EXISTING | 2 | — |
| FR-412 | One-command verification | EXISTING | 2 | — |
| FR-413 | Deterministic test fixtures | EXISTING | 2 | — |
| FR-414 | Register validation script | EXISTING | 2 | Validator run green this session |
| FR-415 | Register authoring scripts | EXISTING | 2 | 468 FR across 3 modules; 459 ET across 5 modules |
| FR-416 | Generated docs from data | EXISTING | 2 | Generated by author-registers.mjs |
| FR-417 | Environment example | EXISTING | 2 | Example matches code expectations |
| FR-418 | Configuration validation | EXISTING | 1 | — |
| FR-419 | Health check resolver | EXISTING | 2 | — |
| FR-420 | Resolver namespacing | EXISTING | 2 | — |
| FR-421 | Tenant boundary tests | EXISTING | 0 | — |
| FR-422 | Resource limits | EXISTING | 1 | — |
| FR-423 | Deployment readiness docs | EXISTING | 2 | — |
| FR-424 | Observability baseline | EXISTING | 1 | Documented |
| FR-425 | Recovery behavior | EXISTING | 2 | — |
| FR-426 | Contributor documentation | EXISTING | 3 | — |
| FR-427 | Architecture documentation set | EXISTING | 1 | Document authored this session |
| FR-428 | Durable handoff document | EXISTING | 2 | Document authored and maintained |
| FR-429 | Feature-to-task traceability docs | EXISTING | 2 | Generated by author-registers.mjs |
| FR-430 | Durable execution state | EXISTING | 1 | — |
| FR-431 | Transaction boundary notes | EXISTING | 2 | — |
| FR-432 | Background worker evaluation | EXISTING | 2 | — |
| FR-433 | Event-driven execution evaluation | DEFER | 4 | — |
| FR-434 | Forge-managed DR/multi-region | EXISTING | 2 | — |
| FR-435 | Kubernetes/Kafka/Redis cluster | REJECT_WITH_REASON | 4 | — |
| FR-436 | Problem statement documentation | EXISTING | 3 | — |
| FR-437 | Core identity statement | EXISTING | 3 | — |
| FR-438 | Scenario A: normal remediation | EXISTING | 3 | Full-loop test green |
| FR-439 | Scenario B: approval security | EXISTING | 3 | Implementation slice this session |
| FR-440 | Scenario C: evidence contradiction | EXISTING | 3 | Implementation slice this session |
| FR-441 | Scenario D: failed execution | EXISTING | 3 | Implementation slice this session |
| FR-442 | Scenario E: post-execution verification | EXISTING | 3 | Implementation slice this session |
| FR-443 | Scenario F: optimization and queue | EXISTING | 3 | Implementation slice this session |
| FR-444 | Demo script document | EXISTING | 3 | Authored this session |
| FR-445 | Deterministic demo fixtures | EXISTING | 3 | Implementation slice this session |
| FR-446 | Demo replay instructions | EXISTING | 3 | Included this session |
| FR-447 | Judging evidence pack | EXISTING | 3 | Updated this session |
| FR-448 | README as-built | EXISTING | 2 | Updated this session |
| FR-449 | Benchmark results presentation | EXISTING | 2 | Authored this session |
| FR-450 | Honest limitations section | EXISTING | 2 | Label discipline audited; labels used consistently |
| FR-451 | Reproducibility commands | EXISTING | 2 | 2026-10-31: HEAD d3acfca on main, tree clean, ahead 5 (unpushed by policy) |
| FR-452 | Before/after defect evidence | EXISTING | 3 | CC-001..CC-021 register maps defects to fixes |
| FR-453 | Architecture diagram | EXISTING | 2 | Document authored this session |
| FR-454 | Security demonstration | EXISTING | 3 | Inventory in VERIFICATION_MATRIX.md |
| FR-455 | Failure demonstration | EXISTING | 3 | Demo runner includes chain check this session |
| FR-456 | Video readiness outline | DEFER | 3 | — |
| FR-457 | Pitch narrative | EXISTING | 3 | Authored this session |
| FR-458 | Bonus prize mapping | EXISTING | 3 | Matrix maintained; statuses honest |
| FR-459 | Evaluation methodology doc | EXISTING | 2 | Authored this session |
| FR-460 | Measured vs simulated separation | EXISTING | 2 | Gate documented; existing evaluator only |
| FR-461 | Demo timing plan | EXISTING | 3 | Included in demo script |
| FR-462 | Live vs sandbox labeling | EXISTING | 3 | Sandbox paths fully separated |
| FR-463 | One-command demo runner | EXISTING | 3 | Implementation slice this session |
| FR-464 | Proof-of-work appendix | EXISTING | 3 | Updated this session |
| FR-465 | Differentiation vs generic AI dashboards | EXISTING | 3 | Included in differentiation doc |
| FR-466 | Submission checklist | EXISTING | 3 | Authored this session |
| FR-467 | External blockers disclosure | EXISTING | 3 | Forge deploy, graph scopes, marketplace documented as BLOCKED |
| FR-468 | Invented competitor comparisons | REJECT_WITH_REASON | 3 | — |

## Backlog (DEFER) — every entry has a recorded reason in docs/FEATURE_CATALOG.md
Total deferred: **108** (of 468).