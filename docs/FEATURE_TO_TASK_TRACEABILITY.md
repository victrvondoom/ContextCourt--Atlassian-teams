# Feature → Task Traceability — ContextCourt AI

Generated from the registers. Every engineering task references at least one feature; features reference their covering tasks (a feature with no task is either EXISTING-with-evidence or explicitly deferred/rejected).

- Tasks referencing features: **459**
- Features covered by ≥1 task: **404 / 468**

| Feature | Title | Disposition | Covering tasks |
|---|---|---|---|
| FR-001 | Case list with status and severity pills | EXISTING | ET-046 |
| FR-002 | Case detail with findings and evidence ids | EXISTING | ET-047 |
| FR-003 | Run analysis by issue key | EXISTING | ET-048, ET-098 |
| FR-004 | Issue-panel auto-fill of current issue key | EXISTING | ET-049 |
| FR-005 | Review queue listing | EXISTING | ET-050, ET-097 |
| FR-006 | Approve/reject from the UI | EXISTING | ET-051, ET-097 |
| FR-007 | Execute from the UI (approver only) | EXISTING | ET-052, ET-097 |
| FR-008 | Prepare remediation from case detail | EXISTING | ET-053 |
| FR-009 | Pending-proposals badge | EXISTING | ET-054 |
| FR-010 | Dynamic open-cases overview card | EXISTING | ET-055 |
| FR-011 | Sandbox demo running the real engine | EXISTING | ET-020, ET-056, ET-096, ET-426, ET-455 |
| FR-012 | Sandbox workflow guide overlay | EXISTING | ET-057 |
| FR-013 | Integration health panel | EXISTING | ET-058 |
| FR-014 | Audit ledger view | EXISTING | ET-014, ET-059 |
| FR-015 | Loading states for async views | EXISTING | ET-060 |
| FR-016 | Actionable error states | EXISTING | ET-060, ET-100 |
| FR-017 | Explaining empty states | EXISTING | ET-060 |
| FR-018 | Disabled-control explanations | EXISTING | — |
| FR-019 | Keyboard-accessible case rows | EXISTING | ET-061 |
| FR-020 | ARIA roles and labels | EXISTING | ET-061 |
| FR-021 | Design token system | EXISTING | ET-062 |
| FR-022 | Responsive app shell | EXISTING | ET-093 |
| FR-023 | Post-execution verification display | EXISTING | ET-023, ET-063 |
| FR-024 | Queue priority explanation | EXISTING | ET-064, ET-208 |
| FR-025 | Execution outcome detail display | EXISTING | ET-065, ET-376 |
| FR-026 | Proposal risk badge | EXISTING | ET-014 |
| FR-027 | Approver identity display | EXISTING | — |
| FR-028 | Approval expiry countdown | DEFER | ET-068 |
| FR-029 | Case search by issue key | DEFER | ET-069 |
| FR-030 | Saved views and filters | EXISTING | ET-070 |
| FR-031 | Sortable case table | DEFER | ET-071 |
| FR-032 | Case list pagination | DEFER | ET-072 |
| FR-033 | Bulk decisions | DEFER | ET-073 |
| FR-034 | Case owner display | EXISTING | — |
| FR-035 | Rejection rationale capture | DEFER | ET-074 |
| FR-036 | Proposal notifications | DEFER | ET-075 |
| FR-037 | Live-mode onboarding tour | DEFER | ET-076 |
| FR-038 | Demo fixtures for scenarios A–F | EXISTING | ET-020, ET-067 |
| FR-039 | Deterministic demo replay | EXISTING | — |
| FR-040 | Copyable evidence citations | EXISTING | ET-077 |
| FR-041 | Deep links to Jira issues | DEFER | ET-078 |
| FR-042 | Dark theme | DEFER | ET-079 |
| FR-043 | Localization | DEFER | ET-080 |
| FR-044 | Case summary export | DEFER | ET-081 |
| FR-045 | Proposal diff view | DEFER | ET-082 |
| FR-046 | User activity feed | DEFER | ET-083 |
| FR-047 | Onboarding checklist widget | DEFER | ET-084 |
| FR-048 | Help/FAQ panel | DEFER | ET-085 |
| FR-049 | Trust indicators on findings | EXISTING | ET-086, ET-098, ET-099 |
| FR-050 | Command palette | DEFER | ET-087 |
| FR-051 | Keyboard shortcuts | DEFER | — |
| FR-052 | Focus-visible styling | EXISTING | ET-061 |
| FR-053 | Contrast-checked tokens | EXISTING | ET-061 |
| FR-054 | Inline action feedback | EXISTING | ET-092 |
| FR-055 | Execution confirmation dialog | DEFER | ET-088 |
| FR-056 | Post-approval cancel flow | DEFER | ET-089 |
| FR-057 | Case lifecycle timeline | EXISTING | ET-066 |
| FR-058 | Judge summary panel | EXISTING | ET-090 |
| FR-059 | Fake live indicators | REJECT_WITH_REASON | — |
| FR-060 | Decorative metric graphs | REJECT_WITH_REASON | ET-091 |
| FR-061 | Evidence record contract | EXISTING | ET-016, ET-101 |
| FR-062 | Source system and object id on evidence | EXISTING | ET-102 |
| FR-063 | SHA-256 content digest | EXISTING | ET-103 |
| FR-064 | Observed vs updated timestamps | EXISTING | ET-104 |
| FR-065 | Untrusted content sanitization | EXISTING | ET-105 |
| FR-066 | Injection pattern flagging | EXISTING | ET-106 |
| FR-067 | Single shared evidence builder | EXISTING | ET-107 |
| FR-068 | ADF to text extraction | EXISTING | ET-108 |
| FR-069 | Description evidence extraction | EXISTING | ET-109 |
| FR-070 | Comment evidence extraction | EXISTING | ET-110 |
| FR-071 | Permission-aware retrieval | EXISTING | ET-111 |
| FR-072 | Tenant-scoped evidence storage | EXISTING | ET-017, ET-112 |
| FR-073 | Evidence sufficiency gate | EXISTING | ET-113, ET-401 |
| FR-074 | Missing evidence classification | EXISTING | ET-114, ET-401, ET-404 |
| FR-075 | Staleness classification | EXISTING | ET-115, ET-406 |
| FR-076 | Access-restricted classification | EXISTING | ET-116, ET-391 |
| FR-077 | Downgrade-only verification | EXISTING | ET-117 |
| FR-078 | Provenance per proposition | EXISTING | ET-118 |
| FR-079 | Inferred vs explicit marking | EXISTING | ET-119 |
| FR-080 | Findings cite evidence ids | EXISTING | ET-120, ET-390 |
| FR-081 | Evidence age feeds severity | EXISTING | ET-121 |
| FR-082 | Duplicate evidence detection | DEFER | ET-122 |
| FR-083 | Evidence versioning across reads | DEFER | ET-123 |
| FR-084 | Freshness recalculation on re-analysis | EXISTING | ET-124 |
| FR-085 | Historical evidence snapshots | DEFER | ET-125 |
| FR-086 | Context budget | DEFER | ET-126 |
| FR-087 | Context assembly report | DEFER | ET-127 |
| FR-088 | Calibrated confidence display | DEFER | ET-128 |
| FR-089 | Source reliability scoring | DEFER | ET-129 |
| FR-090 | Evidence diffing between analyses | DEFER | ET-130 |
| FR-091 | Teamwork Graph evidence ingestion | DEFER | ET-131 |
| FR-092 | Confluence evidence ingestion | DEFER | ET-132 |
| FR-093 | Bitbucket/PR evidence ingestion | DEFER | ET-133 |
| FR-094 | User-provided evidence entry | DEFER | ET-134 |
| FR-095 | Evidence expiry policy | DEFER | ET-135 |
| FR-096 | Context replay from stored evidence | DEFER | ET-136 |
| FR-097 | Untrusted-content quarantine view | DEFER | ET-137 |
| FR-098 | Evidence lineage graph | DEFER | — |
| FR-099 | Competing claims on findings | EXISTING | ET-138, ET-405, ET-428 |
| FR-100 | Contradiction explanations | EXISTING | ET-139 |
| FR-101 | Documented normalizer patterns | EXISTING | ET-140 |
| FR-102 | Negation-first pattern ordering | EXISTING | ET-141 |
| FR-103 | Conservative one-predicate extraction | EXISTING | ET-142 |
| FR-104 | Deterministic proposition ids | EXISTING | ET-143 |
| FR-105 | Evidence count transparency | EXISTING | ET-144 |
| FR-106 | Agent injection warnings | EXISTING | ET-145 |
| FR-107 | Canonical digest stability | EXISTING | ET-146 |
| FR-108 | Retrieve-vs-digest cross-check | DEFER | ET-147 |
| FR-109 | Runtime context in access metadata | EXISTING | ET-148 |
| FR-110 | Derived-context marking | DEFER | ET-149 |
| FR-111 | Context snapshot export | DEFER | — |
| FR-112 | Evidence retention policy | DEFER | — |
| FR-113 | Retrieval provenance in audit | EXISTING | ET-150 |
| FR-114 | Vector database for evidence search | REJECT_WITH_REASON | — |
| FR-115 | Whole-document evidence storage | REJECT_WITH_REASON | — |
| FR-116 | Rovo investigator agent | EXISTING | ET-015, ET-151, ET-340 |
| FR-117 | Six agent actions with schemas | EXISTING | ET-015, ET-152 |
| FR-118 | Absolute-rule agent prompt | EXISTING | ET-015, ET-153 |
| FR-119 | Prompt injection defense rules | EXISTING | ET-015, ET-153 |
| FR-120 | No-evidence rule in prompt | EXISTING | ET-015, ET-153 |
| FR-121 | Agents cannot approve or execute | EXISTING | ET-015, ET-154, ET-384 |
| FR-122 | investigate-issue tool | EXISTING | ET-015 |
| FR-123 | get-case tool | EXISTING | ET-015, ET-152, ET-155, ET-340 |
| FR-124 | get-evidence tool | EXISTING | ET-015, ET-152, ET-156 |
| FR-125 | get-impact tool | EXISTING | ET-015, ET-152, ET-157 |
| FR-126 | prepare-remediation tool | EXISTING | ET-015, ET-152, ET-158 |
| FR-127 | get-approval-status tool | EXISTING | ET-015, ET-152, ET-159 |
| FR-128 | MCP tool surface | EXISTING | ET-152, ET-160 |
| FR-129 | Two reusable skills | EXISTING | ET-161 |
| FR-130 | zod validation on every action | EXISTING | ET-162 |
| FR-131 | Tenant context required | EXISTING | ET-163 |
| FR-132 | Structured error envelopes | EXISTING | ET-164 |
| FR-133 | Bounded retries with backoff | EXISTING | ET-165, ET-409 |
| FR-134 | Non-transient error short-circuit | EXISTING | ET-166 |
| FR-135 | Deterministic fallback over LLM | EXISTING | — |
| FR-136 | Conversation starters | EXISTING | — |
| FR-137 | No invented evidence (contract) | EXISTING | — |
| FR-138 | Human escalation to review queue | EXISTING | ET-167 |
| FR-139 | Approver identity hidden from agent | EXISTING | ET-168 |
| FR-140 | Structured root-cause hypotheses | DEFER | — |
| FR-141 | Multi-step case planning | DEFER | ET-169 |
| FR-142 | Agent execution traces | DEFER | ET-170 |
| FR-143 | Agent performance measurement | DEFER | — |
| FR-144 | Model provider abstraction | DEFER | — |
| FR-145 | LLM-assisted extraction layer | DEFER | ET-171 |
| FR-146 | Metamorphic agent testing | DEFER | ET-172 |
| FR-147 | Differential testing vs rule baseline | DEFER | ET-173 |
| FR-148 | Tool-call post-state verification | EXISTING | ET-174 |
| FR-149 | Idempotent agent operations | EXISTING | ET-175 |
| FR-150 | Agent/UI shared core | EXISTING | ET-176 |
| FR-151 | Severity reasons as explanations | EXISTING | ET-177 |
| FR-152 | Confidence separated from severity | EXISTING | ET-178, ET-395 |
| FR-153 | Both-sides contradiction reply | EXISTING | ET-179 |
| FR-154 | Agent rate limits | EXISTING | ET-180 |
| FR-155 | Failure recovery guidance | DEFER | ET-181 |
| FR-156 | Shadow execution mode | DEFER | ET-182, ET-405 |
| FR-157 | Agent human-review rubric | DEFER | ET-183, ET-408 |
| FR-158 | Structured investigation output | EXISTING | — |
| FR-159 | Stored finding schema validation | EXISTING | ET-184 |
| FR-160 | Agent/UI proposal parity | EXISTING | ET-185 |
| FR-161 | Per-action audit events | EXISTING | ET-186 |
| FR-162 | Severity-gated agent proposals | EXISTING | ET-187 |
| FR-163 | Proposal risk classification | EXISTING | ET-188 |
| FR-164 | Documented operation catalog | EXISTING | ET-189 |
| FR-165 | Escalation path documentation | EXISTING | ET-190 |
| FR-166 | Agent contract registry | EXISTING | ET-191, ET-194 |
| FR-167 | Agent verification matrix | EXISTING | ET-192, ET-195 |
| FR-168 | Prompt version tracking | DEFER | ET-193 |
| FR-169 | Autonomous approval agent | REJECT_WITH_REASON | — |
| FR-170 | Multi-agent debate display | REJECT_WITH_REASON | — |
| FR-171 | Remediation candidate generation | EXISTING | ET-016, ET-196 |
| FR-172 | Operation catalog | EXISTING | ET-197 |
| FR-173 | Severity gating per operation | EXISTING | ET-197 |
| FR-174 | Risk classification per operation | EXISTING | ET-197 |
| FR-175 | Evidence requirement for proposals | EXISTING | ET-198 |
| FR-176 | Proposal payload digest | EXISTING | ET-199 |
| FR-177 | Tenant-scoped proposal persistence | EXISTING | ET-017, ET-200 |
| FR-178 | Impact analysis over verified edges | EXISTING | ET-201 |
| FR-179 | Bounded traversal depth | EXISTING | ET-201 |
| FR-180 | Inferred-edge separation | EXISTING | ET-201 |
| FR-181 | Hypothetical change simulation | EXISTING | ET-202 |
| FR-182 | Expected-change text | EXISTING | ET-203 |
| FR-183 | Supporting finding links | EXISTING | ET-204 |
| FR-184 | Duplicate proposal convergence | EXISTING | ET-205, ET-395 |
| FR-185 | Conflicting remediation detection | DEFER | ET-206 |
| FR-186 | Documented utility queue ordering | EXISTING | ET-207, ET-431 |
| FR-187 | Priority explanation strings | EXISTING | ET-208 |
| FR-188 | Dependency-aware queue constraints | DEFER | ET-209 |
| FR-189 | Deadline awareness | DEFER | ET-210 |
| FR-190 | Resource-constrained scheduling | DEFER | ET-211 |
| FR-191 | Fairness / starvation prevention | DEFER | ET-212 |
| FR-192 | Dynamic replanning on new evidence | DEFER | ET-213 |
| FR-193 | Deterministic priority recalculation | EXISTING | ET-214 |
| FR-194 | Cost estimation per proposal | DEFER | — |
| FR-195 | Expected-benefit quantification | DEFER | ET-215 |
| FR-196 | Reversibility classification | DEFER | ET-216 |
| FR-197 | Rollback eligibility | DEFER | ET-217 |
| FR-198 | Execution prerequisites check | EXISTING | ET-218 |
| FR-199 | Candidate state validation | EXISTING | ET-219 |
| FR-200 | Risk-adjusted ordering factor | EXISTING | ET-220 |
| FR-201 | Age-decay ordering factor | EXISTING | ET-221 |
| FR-202 | Severity-dominant ordering | EXISTING | ET-222 |
| FR-203 | Queue pending counts | EXISTING | ET-223, ET-377 |
| FR-204 | Optimization objective documentation | EXISTING | ET-224, ET-419 |
| FR-205 | Queue design documentation | EXISTING | ET-225 |
| FR-206 | Proposal comparison view | DEFER | ET-226 |
| FR-207 | Remediation playbooks | DEFER | ET-227 |
| FR-208 | Multi-proposal bundling | DEFER | ET-228 |
| FR-209 | Auto-suggest remediation on new cases | DEFER | ET-229 |
| FR-210 | Proposal approval expiry | EXISTING | ET-230 |
| FR-211 | Proposal cancellation | EXISTING | ET-231 |
| FR-212 | Rejected-proposal rationale storage | DEFER | ET-232 |
| FR-213 | Reopen proposals | DEFER | ET-233 |
| FR-214 | Proposal history per case | DEFER | ET-234 |
| FR-215 | Cross-case remediation dedup | DEFER | ET-235, ET-236, ET-403 |
| FR-216 | Ordering sensitivity property test | EXISTING | ET-237, ET-403 |
| FR-217 | Ordering regression suite | EXISTING | ET-238 |
| FR-218 | Documented queue constraints | EXISTING | — |
| FR-219 | Background scheduler hooks | DEFER | ET-239 |
| FR-220 | Arbitrary numeric priority score | REJECT_WITH_REASON | ET-240 |
| FR-221 | Approval state machine | EXISTING | ET-016, ET-241 |
| FR-222 | Valid-transition enforcement | EXISTING | ET-241 |
| FR-223 | Approval binding contract | EXISTING | ET-242 |
| FR-224 | Self-approval prevention | EXISTING | ET-243 |
| FR-225 | Approval expiry window | EXISTING | ET-244, ET-386 |
| FR-226 | Replay protection registry | EXISTING | ET-245, ET-387 |
| FR-227 | Approver-only execution | EXISTING | ET-246, ET-385 |
| FR-228 | Separation of duties (agent/human) | EXISTING | ET-247, ET-384 |
| FR-229 | Decision audit events | EXISTING | ET-248 |
| FR-230 | Rejection flow | EXISTING | ET-249 |
| FR-231 | Approval identity display | EXISTING | ET-250 |
| FR-232 | No agent execute/approve tool | EXISTING | ET-154, ET-169 |
| FR-233 | Binding creation path (UI resolver) | EXISTING | ET-251 |
| FR-234 | Digest-bound approval | EXISTING | ET-252 |
| FR-235 | Modified proposal cannot reuse approval | EXISTING | ET-252, ET-388 |
| FR-236 | Approval revocation before execution | EXISTING | ET-253 |
| FR-237 | Rejection rationale capture | EXISTING | ET-254 |
| FR-238 | Risk-based approval routing | DEFER | ET-255 |
| FR-239 | Sensitive-operation restrictions | EXISTING | ET-256 |
| FR-240 | Approval evidence snapshot | DEFER | ET-257 |
| FR-241 | Approval-to-execution traceability | EXISTING | ET-258 |
| FR-242 | Decision accountability | EXISTING | ET-259 |
| FR-243 | Concurrent decision conflict handling | EXISTING | ET-260, ET-398 |
| FR-244 | Multi-approver policies | DEFER | ET-261 |
| FR-245 | Approval delegation | DEFER | ET-262 |
| FR-246 | Approval SLA tracking | DEFER | ET-263 |
| FR-247 | Role-based approver eligibility | DEFER | ET-264 |
| FR-248 | Approval history view | DEFER | ET-265 |
| FR-249 | Governance documentation | EXISTING | ET-266 |
| FR-250 | Policy evaluation engine | DEFER | ET-267 |
| FR-251 | Scope-based permission boundaries | EXISTING | ET-268 |
| FR-252 | Separation-of-duties tests | EXISTING | ET-247, ET-423 |
| FR-253 | Expiry enforcement tests | EXISTING | ET-244, ET-386, ET-423 |
| FR-254 | Replay enforcement tests | EXISTING | ET-245, ET-387, ET-423 |
| FR-255 | Self-approval tests | EXISTING | ET-243, ET-423 |
| FR-256 | Approver-identity tests | EXISTING | ET-246, ET-385, ET-423 |
| FR-257 | Governance scenario demo | EXISTING | ET-269, ET-427 |
| FR-258 | Human escalation display | DEFER | ET-270 |
| FR-259 | Approval search/filter | DEFER | — |
| FR-260 | Binding re-verification at execution | EXISTING | ET-271 |
| FR-261 | State re-verification at execution | EXISTING | ET-272, ET-383 |
| FR-262 | Tenant re-verification at execution | EXISTING | ET-273 |
| FR-263 | Target/operation re-verification | EXISTING | ET-274 |
| FR-264 | Configurable validity window | DEFER | ET-275 |
| FR-265 | Execution authority documentation | EXISTING | ET-276 |
| FR-266 | Governance invariant list | EXISTING | ET-277 |
| FR-267 | Expired-approval re-approval flow | EXISTING | ET-278 |
| FR-268 | Audit chain integrity tests | EXISTING | ET-279, ET-389 |
| FR-269 | Governance UX affordances | EXISTING | ET-280 |
| FR-270 | Prompt-based approval override | REJECT_WITH_REASON | ET-281 |
| FR-271 | Execution authorization gate | EXISTING | ET-016, ET-018, ET-282, ET-383, ET-421 |
| FR-272 | Execution precondition checklist | EXISTING | ET-018, ET-282 |
| FR-273 | Digest-based idempotency | EXISTING | ET-018, ET-283 |
| FR-274 | Permanent replay rejection | EXISTING | ET-018, ET-283 |
| FR-275 | Request validation everywhere | EXISTING | ET-018, ET-284, ET-407 |
| FR-276 | Structured output envelopes | EXISTING | ET-018, ET-285 |
| FR-277 | Tenant isolation (key + payload) | EXISTING | ET-018, ET-286, ET-400 |
| FR-278 | Least-privilege scopes | EXISTING | ET-018, ET-287 |
| FR-279 | Write scope only for approved execution | EXISTING | ET-018, ET-287 |
| FR-280 | Input sanitization | EXISTING | ET-018, ET-288 |
| FR-281 | Hidden-character stripping | EXISTING | ET-018, ET-288 |
| FR-282 | Typed API error classification | EXISTING | ET-018, ET-337, ET-409 |
| FR-283 | Bounded retry with backoff | EXISTING | ET-018, ET-397 |
| FR-284 | Explicit EXECUTION_FAILED | EXISTING | ET-018, ET-353, ET-393 |
| FR-285 | Execution audit events | EXISTING | ET-018 |
| FR-286 | Execution receipts | EXISTING | ET-018 |
| FR-287 | Post-execution independent verification | EXISTING | ET-018, ET-177, ET-330, ET-430 |
| FR-288 | Verification result storage | EXISTING | ET-018, ET-331 |
| FR-289 | Verification audit events | EXISTING | ET-018, ET-332 |
| FR-290 | Success vs verified distinction | EXISTING | ET-018, ET-333, ET-392 |
| FR-291 | Partial failure classification | DEFER | ET-396 |
| FR-292 | State reconciliation | DEFER | — |
| FR-293 | Compensating actions | DEFER | — |
| FR-294 | Rollback boundaries | DEFER | — |
| FR-295 | Circuit breaker for Jira | EXISTING | — |
| FR-296 | Execution timeout budgets | EXISTING | — |
| FR-297 | 429 rate-limit retry | EXISTING | ET-335 |
| FR-298 | Secret management policy | EXISTING | ET-041, ET-290 |
| FR-299 | Abuse-resistant input validation | EXISTING | ET-289, ET-407, ET-421 |
| FR-300 | Recovery by re-analysis | EXISTING | — |
| FR-301 | Failure scenario fixtures | EXISTING | ET-334, ET-429 |
| FR-302 | Failure demo in sandbox | EXISTING | — |
| FR-303 | Dependency security audit | EXISTING | — |
| FR-304 | Data minimization | EXISTING | ET-336 |
| FR-305 | Cross-tenant read rejection tests | EXISTING | ET-286, ET-400 |
| FR-306 | Injection defense tests | EXISTING | — |
| FR-307 | Audit-chain mutation detection | EXISTING | ET-279, ET-389 |
| FR-308 | Chain tamper test | EXISTING | ET-279, ET-343 |
| FR-309 | Same-millisecond chain ordering | EXISTING | ET-355 |
| FR-310 | Deterministic chain read | EXISTING | — |
| FR-311 | ADF write payloads | EXISTING | ET-302 |
| FR-312 | Derived project-key validation | EXISTING | — |
| FR-313 | Comment execution path | EXISTING | ET-304 |
| FR-314 | Issue-creation execution path | EXISTING | ET-303 |
| FR-315 | Execution state persistence | EXISTING | — |
| FR-316 | Honest UNVERIFIED handling | EXISTING | ET-333, ET-392, ET-402, ET-422 |
| FR-317 | Security review checklist | EXISTING | — |
| FR-318 | Threat model documentation | EXISTING | ET-024 |
| FR-319 | CI secret scan | EXISTING | ET-041, ET-290 |
| FR-320 | Analysis flooding resistance | EXISTING | — |
| FR-321 | Forge app manifest (globalPage + issuePanel) | EXISTING | ET-012, ET-013, ET-291 |
| FR-322 | Rovo agent module | EXISTING | ET-013, ET-291 |
| FR-323 | Six action modules | EXISTING | ET-013, ET-291 |
| FR-324 | rovo:mcp module | EXISTING | ET-013, ET-291 |
| FR-325 | rovo:skill modules | EXISTING | ET-013, ET-291 |
| FR-326 | Node 24 runtime pin | EXISTING | ET-292 |
| FR-327 | Jira REST v3 reads (asUser) | EXISTING | ET-293 |
| FR-328 | Issue field selection | EXISTING | ET-294 |
| FR-329 | Comment retrieval | EXISTING | ET-295 |
| FR-330 | Issuelinks retrieval | EXISTING | ET-296 |
| FR-331 | JQL search support | EXISTING | ET-297 |
| FR-332 | Minimal read scopes | EXISTING | — |
| FR-333 | Trusted-route handling | EXISTING | ET-298 |
| FR-334 | KVS storage module | EXISTING | ET-299 |
| FR-335 | Health probe endpoint | EXISTING | ET-300, ET-338 |
| FR-336 | Forge bridge usage | EXISTING | ET-301 |
| FR-337 | ADF write payloads | EXISTING | ET-302, ET-339 |
| FR-338 | Issue creation via REST | EXISTING | ET-304, ET-330, ET-339 |
| FR-339 | Comment posting via REST | EXISTING | ET-303, ET-330, ET-339 |
| FR-340 | Resolver handler pattern | EXISTING | ET-305 |
| FR-341 | Manifest scope documentation | EXISTING | ET-306 |
| FR-342 | Teamwork Graph adapter | EXISTING | ET-307 |
| FR-343 | Teamwork Graph wiring | DEFER | ET-308 |
| FR-344 | Graph scope request plan | DEFER | ET-309 |
| FR-345 | Curated queries only | EXISTING | ET-310 |
| FR-346 | Permission-filtered graph reads | EXISTING | ET-311 |
| FR-347 | Platform event handling | DEFER | ET-312 |
| FR-348 | Scheduled triggers | DEFER | ET-313 |
| FR-349 | Development-site deployment | DEFER | ET-314 |
| FR-350 | Marketplace listing | DEFER | ET-315 |
| FR-351 | Installation flow docs | EXISTING | ET-316 |
| FR-352 | Forge lint guidance | EXISTING | ET-317 |
| FR-353 | Jira status error mapping | EXISTING | ET-318 |
| FR-354 | Rate-limit awareness | EXISTING | — |
| FR-355 | API version pinning | EXISTING | ET-319 |
| FR-356 | Issue-panel context capture | EXISTING | ET-023, ET-320 |
| FR-357 | Global page navigation | EXISTING | ET-321 |
| FR-358 | Cross-service trace ids | DEFER | ET-322 |
| FR-359 | External integration boundaries doc | EXISTING | ET-323 |
| FR-360 | Scope-revocation handling | EXISTING | ET-324 |
| FR-361 | User display names in citations | EXISTING | ET-325, ET-391 |
| FR-362 | Issue status in views | EXISTING | ET-326 |
| FR-363 | KVS query pagination | EXISTING | ET-327 |
| FR-364 | Shared team case views | DEFER | ET-328 |
| FR-365 | Undeclared scope creep | REJECT_WITH_REASON | ET-329 |
| FR-366 | Digest-chained audit events | EXISTING | ET-019, ET-341 |
| FR-367 | Insertion-monotonic event ids | EXISTING | ET-014, ET-019, ET-341 |
| FR-368 | Chain verification API | EXISTING | ET-019, ET-342 |
| FR-369 | Tamper detection | EXISTING | ET-017, ET-019, ET-343 |
| FR-370 | Deterministic event ordering | EXISTING | ET-019, ET-342 |
| FR-371 | analysis_run events | EXISTING | ET-019, ET-344 |
| FR-372 | Proposal decision events | EXISTING | ET-019, ET-345 |
| FR-373 | Execution events | EXISTING | ET-019, ET-346 |
| FR-374 | Tenant-scoped ledger | EXISTING | ET-019, ET-347 |
| FR-375 | Audit ledger UI | EXISTING | ET-019, ET-348, ET-375 |
| FR-376 | Event evidence linkage | EXISTING | ET-019, ET-349 |
| FR-377 | Request fingerprints | EXISTING | ET-019, ET-350 |
| FR-378 | Verification outcome events | EXISTING | ET-019, ET-332, ET-351 |
| FR-379 | Execution receipts in audit | EXISTING | ET-352, ET-376 |
| FR-380 | Failure-result events | EXISTING | ET-353, ET-380, ET-393 |
| FR-381 | Chain integrity tests | EXISTING | — |
| FR-382 | Same-millisecond regression test | EXISTING | ET-354 |
| FR-383 | Exportable audit report | DEFER | ET-355 |
| FR-384 | Audit retention policy | DEFER | ET-356 |
| FR-385 | Proposal lifecycle analytics | DEFER | ET-357 |
| FR-386 | Approval time metrics | DEFER | ET-358 |
| FR-387 | Queue wait metrics | DEFER | ET-359 |
| FR-388 | Verification pass-rate metric | DEFER | ET-360, ET-399, ET-418, ET-420 |
| FR-389 | Latency measurement | DEFER | ET-361 |
| FR-390 | Cost measurement | DEFER | ET-362, ET-425 |
| FR-391 | Context quality metric | DEFER | ET-363 |
| FR-392 | Retrieval effectiveness metric | DEFER | ET-364, ET-415, ET-416 |
| FR-393 | Agent reliability metric | DEFER | ET-365, ET-414 |
| FR-394 | Operational dashboard | DEFER | ET-366 |
| FR-395 | Chain append cost note | EXISTING | ET-367 |
| FR-396 | Metrics audit documentation | EXISTING | ET-368 |
| FR-397 | Measurement label discipline | EXISTING | ET-369, ET-379, ET-412 |
| FR-398 | Benchmark replay determinism | EXISTING | ET-370, ET-417 |
| FR-399 | Audit event schema stability | EXISTING | ET-007, ET-371 |
| FR-400 | Chain demo for judges | EXISTING | ET-372 |
| FR-401 | Modular monolith on Forge | EXISTING | ET-009, ET-043, ET-373, ET-378 |
| FR-402 | No speculative infrastructure | EXISTING | — |
| FR-403 | Storage abstraction | EXISTING | — |
| FR-404 | KVS injection for tests | EXISTING | — |
| FR-405 | Fetcher injection for tests | EXISTING | — |
| FR-406 | Fake KVS test harness | EXISTING | ET-381 |
| FR-407 | CI pipeline | EXISTING | ET-094 |
| FR-408 | Secret scan gate | EXISTING | ET-381 |
| FR-409 | Coverage configuration | EXISTING | ET-044 |
| FR-410 | Node version pinning | EXISTING | ET-002, ET-003, ET-004, ET-005, ET-006, ET-010, ET-011, ET-022, ET-095 |
| FR-411 | Local development docs | EXISTING | — |
| FR-412 | One-command verification | EXISTING | — |
| FR-413 | Deterministic test fixtures | EXISTING | — |
| FR-414 | Register validation script | EXISTING | ET-033 |
| FR-415 | Register authoring scripts | EXISTING | ET-032 |
| FR-416 | Generated docs from data | EXISTING | ET-034, ET-035, ET-036 |
| FR-417 | Environment example | EXISTING | ET-042 |
| FR-418 | Configuration validation | EXISTING | — |
| FR-419 | Health check resolver | EXISTING | — |
| FR-420 | Resolver namespacing | EXISTING | — |
| FR-421 | Tenant boundary tests | EXISTING | — |
| FR-422 | Resource limits | EXISTING | — |
| FR-423 | Deployment readiness docs | EXISTING | — |
| FR-424 | Observability baseline | EXISTING | ET-374 |
| FR-425 | Recovery behavior | EXISTING | — |
| FR-426 | Contributor documentation | EXISTING | — |
| FR-427 | Architecture documentation set | EXISTING | ET-027, ET-028, ET-038, ET-039, ET-040, ET-045 |
| FR-428 | Durable handoff document | EXISTING | ET-037 |
| FR-429 | Feature-to-task traceability docs | EXISTING | ET-036 |
| FR-430 | Durable execution state | EXISTING | — |
| FR-431 | Transaction boundary notes | EXISTING | — |
| FR-432 | Background worker evaluation | EXISTING | — |
| FR-433 | Event-driven execution evaluation | DEFER | — |
| FR-434 | Forge-managed DR/multi-region | EXISTING | — |
| FR-435 | Kubernetes/Kafka/Redis cluster | REJECT_WITH_REASON | — |
| FR-436 | Problem statement documentation | EXISTING | — |
| FR-437 | Core identity statement | EXISTING | — |
| FR-438 | Scenario A: normal remediation | EXISTING | ET-424, ET-426 |
| FR-439 | Scenario B: approval security | EXISTING | ET-269, ET-427 |
| FR-440 | Scenario C: evidence contradiction | EXISTING | ET-428 |
| FR-441 | Scenario D: failed execution | EXISTING | ET-334, ET-429 |
| FR-442 | Scenario E: post-execution verification | EXISTING | ET-430 |
| FR-443 | Scenario F: optimization and queue | EXISTING | ET-431 |
| FR-444 | Demo script document | EXISTING | ET-433 |
| FR-445 | Deterministic demo fixtures | EXISTING | ET-067 |
| FR-446 | Demo replay instructions | EXISTING | ET-435, ET-456 |
| FR-447 | Judging evidence pack | EXISTING | ET-436 |
| FR-448 | README as-built | EXISTING | ET-441 |
| FR-449 | Benchmark results presentation | EXISTING | ET-411, ET-453 |
| FR-450 | Honest limitations section | EXISTING | ET-025, ET-394, ET-445 |
| FR-451 | Reproducibility commands | EXISTING | ET-001, ET-031, ET-446, ET-458, ET-459 |
| FR-452 | Before/after defect evidence | EXISTING | ET-008, ET-029, ET-030, ET-447 |
| FR-453 | Architecture diagram | EXISTING | ET-027, ET-448 |
| FR-454 | Security demonstration | EXISTING | ET-021, ET-382, ET-449 |
| FR-455 | Failure demonstration | EXISTING | ET-373 |
| FR-456 | Video readiness outline | DEFER | ET-444 |
| FR-457 | Pitch narrative | EXISTING | ET-438 |
| FR-458 | Bonus prize mapping | EXISTING | ET-443 |
| FR-459 | Evaluation methodology doc | EXISTING | ET-410, ET-454 |
| FR-460 | Measured vs simulated separation | EXISTING | ET-413, ET-452 |
| FR-461 | Demo timing plan | EXISTING | ET-434 |
| FR-462 | Live vs sandbox labeling | EXISTING | ET-096, ET-450, ET-455 |
| FR-463 | One-command demo runner | EXISTING | ET-432, ET-457 |
| FR-464 | Proof-of-work appendix | EXISTING | ET-437, ET-442 |
| FR-465 | Differentiation vs generic AI dashboards | EXISTING | ET-439 |
| FR-466 | Submission checklist | EXISTING | ET-440 |
| FR-467 | External blockers disclosure | EXISTING | ET-026, ET-451 |
| FR-468 | Invented competitor comparisons | REJECT_WITH_REASON | — |