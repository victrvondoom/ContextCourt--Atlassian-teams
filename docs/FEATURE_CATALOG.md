# Feature Catalogue — ContextCourt AI

Generated from `scripts/register-data/` (single source of truth). Validated by `scripts/validate-registers.mjs`.

**468 capabilities** across 10 domains. Dispositions: IMPLEMENT (this mission slice), EXISTING (already implemented and verified), MERGE (merged duplicate with reason), DEFER (prioritized backlog), REJECT_WITH_REASON (explicitly rejected as anti-product).

| Disposition | Count |
|---|---|
| EXISTING | 347 |
| DEFER | 110 |
| REJECT_WITH_REASON | 11 |

---

## Domain A. Product experience and workflows

### FR-001 — Case list with status and severity pills

- **Description:** Cases view renders stored case records with status/severity pills.
- **Disposition:** EXISTING
- **Priority:** P1

### FR-002 — Case detail with findings and evidence ids

- **Description:** Detail view lists each finding with cited evidence ids and affected work.
- **Disposition:** EXISTING
- **Priority:** P1

### FR-003 — Run analysis by issue key

- **Description:** Overview accepts a Jira issue key and returns the engine verdict.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-004 — Issue-panel auto-fill of current issue key

- **Description:** The panel context supplies the current issue key to the input.
- **Disposition:** EXISTING
- **Priority:** P2

### FR-005 — Review queue listing

- **Description:** Queue lists tenant proposals with state, risk and provenance.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-006 — Approve/reject from the UI

- **Description:** Humans decide pending proposals through resolvers that enforce governance.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-007 — Execute from the UI (approver only)

- **Description:** Execution button is enabled only for the recorded approver before expiry.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-008 — Prepare remediation from case detail

- **Description:** Verified/potential findings expose a one-click proposal preparation.
- **Disposition:** EXISTING
- **Priority:** P1

### FR-009 — Pending-proposals badge

- **Description:** Sidebar badge shows the real PENDING_APPROVAL count.
- **Disposition:** EXISTING
- **Priority:** P2

### FR-010 — Dynamic open-cases overview card

- **Description:** Overview shows the latest stored cases and sandbox engine counters.
- **Disposition:** EXISTING
- **Priority:** P2

### FR-011 — Sandbox demo running the real engine

- **Description:** Sandbox mode computes results in-browser with the production core.
- **Disposition:** EXISTING
- **Priority:** P3

### FR-012 — Sandbox workflow guide overlay

- **Description:** Step-by-step guided workflow for the demo.
- **Disposition:** EXISTING
- **Priority:** P3

### FR-013 — Integration health panel

- **Description:** Health card shows probed Jira state and honest configuration facts.
- **Disposition:** EXISTING
- **Priority:** P2

### FR-014 — Audit ledger view

- **Description:** Chained audit events rendered with actor, action, target, result.
- **Disposition:** EXISTING
- **Priority:** P1

### FR-015 — Loading states for async views

- **Description:** Every async view distinguishes loading from empty from error.
- **Disposition:** EXISTING
- **Priority:** P3

### FR-016 — Actionable error states

- **Description:** Errors carry context and next step, not raw stack dumps.
- **Disposition:** EXISTING
- **Priority:** P3

### FR-017 — Explaining empty states

- **Description:** Empty states state why they are empty and what produces data.
- **Disposition:** EXISTING
- **Priority:** P3

### FR-018 — Disabled-control explanations

- **Description:** Disabled governance controls state the rule that disables them.
- **Disposition:** EXISTING
- **Priority:** P1

### FR-019 — Keyboard-accessible case rows

- **Description:** Rows are focusable and activatable by keyboard.
- **Disposition:** EXISTING
- **Priority:** P3

### FR-020 — ARIA roles and labels

- **Description:** Interactive elements expose accessible names and states.
- **Disposition:** EXISTING
- **Priority:** P3

### FR-021 — Design token system

- **Description:** Spacing, radius, color and type scale defined as CSS variables.
- **Disposition:** EXISTING
- **Priority:** P3

### FR-022 — Responsive app shell

- **Description:** Shell adapts to panel and full-page widths.
- **Disposition:** EXISTING
- **Priority:** P3

### FR-023 — Post-execution verification display

- **Description:** Executed proposals show VERIFIED / UNVERIFIED / MISMATCH state.
- **Disposition:** EXISTING
- **Priority:** P1

### FR-024 — Queue priority explanation

- **Description:** Each proposal shows why it ranks where it does.
- **Disposition:** EXISTING
- **Priority:** P2

### FR-025 — Execution outcome detail display

- **Description:** Result reference and detail from execution are visible.
- **Disposition:** EXISTING
- **Priority:** P2

### FR-026 — Proposal risk badge

- **Description:** Risk level is visible on every proposal card.
- **Disposition:** EXISTING
- **Priority:** P1

### FR-027 — Approver identity display

- **Description:** Cards show who approved and when it expires.
- **Disposition:** EXISTING
- **Priority:** P1

### FR-028 — Approval expiry countdown

- **Description:** Time remaining is rendered live on approved proposals.
- **Disposition:** DEFER
- **Priority:** P3

### FR-029 — Case search by issue key

- **Description:** Filter the case list by key fragment.
- **Disposition:** DEFER
- **Priority:** P3

### FR-030 — Saved views and filters

- **Description:** Named filters over cases and proposals (one filter model).
- **Disposition:** DEFER — MERGE of saved views + case/proposal filtering: one capability, one model.
- **Priority:** P3

### FR-031 — Sortable case table

- **Description:** Column sorting for the case list.
- **Disposition:** DEFER
- **Priority:** P3

### FR-032 — Case list pagination

- **Description:** Bounded pages for large case stores.
- **Disposition:** DEFER
- **Priority:** P3

### FR-033 — Bulk decisions

- **Description:** Approve/reject several proposals under one review session.
- **Disposition:** DEFER
- **Priority:** P3

### FR-034 — Case owner display

- **Description:** Owner is stored and rendered on case records.
- **Disposition:** EXISTING
- **Priority:** P2

### FR-035 — Rejection rationale capture

- **Description:** Reviewer enters a reason stored with the rejection.
- **Disposition:** DEFER
- **Priority:** P2

### FR-036 — Proposal notifications

- **Description:** In-app or email notification on new proposals.
- **Disposition:** DEFER
- **Priority:** P4

### FR-037 — Live-mode onboarding tour

- **Description:** First-run guidance in live mode (sandbox already has one).
- **Disposition:** DEFER
- **Priority:** P3

### FR-038 — Demo fixtures for scenarios A–F

- **Description:** Deterministic fixtures covering all six judge scenarios.
- **Disposition:** EXISTING
- **Priority:** P3

### FR-039 — Deterministic demo replay

- **Description:** Same demo inputs produce identical outputs on every run.
- **Disposition:** EXISTING
- **Priority:** P3

### FR-040 — Copyable evidence citations

- **Description:** One-click copy of an evidence citation.
- **Disposition:** DEFER
- **Priority:** P3

### FR-041 — Deep links to Jira issues

- **Description:** Open the target issue from a case or proposal.
- **Disposition:** DEFER
- **Priority:** P3

### FR-042 — Dark theme

- **Description:** Theme variant using the same tokens.
- **Disposition:** DEFER
- **Priority:** P4

### FR-043 — Localization

- **Description:** UI string externalization for i18n.
- **Disposition:** DEFER
- **Priority:** P4

### FR-044 — Case summary export

- **Description:** Print/export a case with findings and evidence.
- **Disposition:** DEFER
- **Priority:** P4

### FR-045 — Proposal diff view

- **Description:** Expected change rendered against current state.
- **Disposition:** DEFER
- **Priority:** P4

### FR-046 — User activity feed

- **Description:** Per-user activity across cases and decisions.
- **Disposition:** DEFER
- **Priority:** P4

### FR-047 — Onboarding checklist widget

- **Description:** Guided setup state for new tenants.
- **Disposition:** DEFER
- **Priority:** P4

### FR-048 — Help/FAQ panel

- **Description:** In-product explanations of governance rules.
- **Disposition:** DEFER
- **Priority:** P4

### FR-049 — Trust indicators on findings

- **Description:** Verified/potential/insufficient states are visually distinct.
- **Disposition:** EXISTING
- **Priority:** P1

### FR-050 — Command palette

- **Description:** Keyboard-driven navigation.
- **Disposition:** DEFER
- **Priority:** P4

### FR-051 — Keyboard shortcuts

- **Description:** Shortcuts for frequent actions.
- **Disposition:** DEFER
- **Priority:** P4

### FR-052 — Focus-visible styling

- **Description:** Clear focus rings on all controls.
- **Disposition:** EXISTING
- **Priority:** P3

### FR-053 — Contrast-checked tokens

- **Description:** Color tokens chosen for accessible contrast.
- **Disposition:** EXISTING
- **Priority:** P3

### FR-054 — Inline action feedback

- **Description:** Approve/reject/execute outcomes surfaced inline.
- **Disposition:** EXISTING
- **Priority:** P2

### FR-055 — Execution confirmation dialog

- **Description:** Explicit confirmation step before execution.
- **Disposition:** DEFER
- **Priority:** P2

### FR-056 — Post-approval cancel flow

- **Description:** Allow the approver to cancel before execution.
- **Disposition:** DEFER
- **Priority:** P2

### FR-057 — Case lifecycle timeline

- **Description:** Analysis→proposal→decision→execution→verification timeline per case.
- **Disposition:** EXISTING
- **Priority:** P2

### FR-058 — Judge summary panel

- **Description:** One-glance panel with counts and states for demos.
- **Disposition:** EXISTING
- **Priority:** P3

### FR-059 — Fake live indicators

- **Description:** Pulsing "live" dots or fake real-time streams.
- **Disposition:** REJECT_WITH_REASON — Rejected: fabricated liveness violates the honesty invariant.
- **Priority:** P4

### FR-060 — Decorative metric graphs

- **Description:** Charts without an operational meaning.
- **Disposition:** REJECT_WITH_REASON — Rejected: only measured values are ever shown.
- **Priority:** P4

## Domain B. Context engineering and evidence provenance

### FR-061 — Evidence record contract

- **Description:** Typed evidence with provenance, digests and access context.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-062 — Source system and object id on evidence

- **Description:** Every evidence item names its system and object.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-063 — SHA-256 content digest

- **Description:** Evidence content is digested for tamper detection.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-064 — Observed vs updated timestamps

- **Description:** Observation time is separate from source update time.
- **Disposition:** EXISTING
- **Priority:** P1

### FR-065 — Untrusted content sanitization

- **Description:** Source text is sanitized before becoming evidence.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-066 — Injection pattern flagging

- **Description:** Known injection patterns are flagged, not obeyed.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-067 — Single shared evidence builder

- **Description:** Resolver and agent use one sanitized construction path.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-068 — ADF to text extraction

- **Description:** Jira ADF documents are extracted to readable text.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-069 — Description evidence extraction

- **Description:** Issue descriptions become evidence records.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-070 — Comment evidence extraction

- **Description:** Comments become evidence records with authors.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-071 — Permission-aware retrieval

- **Description:** All retrieval runs asUser with the caller rights.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-072 — Tenant-scoped evidence storage

- **Description:** Evidence keys and payloads are tenant-checked.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-073 — Evidence sufficiency gate

- **Description:** Both sides of a contradiction need evidence.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-074 — Missing evidence classification

- **Description:** INSUFFICIENT_EVIDENCE instead of guesses.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-075 — Staleness classification

- **Description:** Stale evidence downgrades findings explicitly.
- **Disposition:** EXISTING
- **Priority:** P1

### FR-076 — Access-restricted classification

- **Description:** Revoked or unreadable sources are explicit states.
- **Disposition:** EXISTING
- **Priority:** P1

### FR-077 — Downgrade-only verification

- **Description:** Verification can never upgrade an uncertain result.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-078 — Provenance per proposition

- **Description:** Every normalized claim points to its evidence id.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-079 — Inferred vs explicit marking

- **Description:** Propositions record whether they were inferred.
- **Disposition:** EXISTING
- **Priority:** P1

### FR-080 — Findings cite evidence ids

- **Description:** Findings list the evidence supporting each side.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-081 — Evidence age feeds severity

- **Description:** Older evidence lowers recency weight honestly.
- **Disposition:** EXISTING
- **Priority:** P1

### FR-082 — Duplicate evidence detection

- **Description:** Same-digest evidence is deduplicated.
- **Disposition:** DEFER
- **Priority:** P2

### FR-083 — Evidence versioning across reads

- **Description:** Detect changed source text between analyses.
- **Disposition:** DEFER
- **Priority:** P2

### FR-084 — Freshness recalculation on re-analysis

- **Description:** Re-running analysis refreshes stored recency.
- **Disposition:** EXISTING
- **Priority:** P1

### FR-085 — Historical evidence snapshots

- **Description:** Per-case evidence history over time.
- **Disposition:** DEFER
- **Priority:** P4

### FR-086 — Context budget

- **Description:** Bounded evidence volume per analysis.
- **Disposition:** DEFER
- **Priority:** P2

### FR-087 — Context assembly report

- **Description:** What context was assembled and why per analysis.
- **Disposition:** DEFER
- **Priority:** P3

### FR-088 — Calibrated confidence display

- **Description:** Confidence values backed by calibration data.
- **Disposition:** DEFER
- **Priority:** P4

### FR-089 — Source reliability scoring

- **Description:** Reliability weights per source type.
- **Disposition:** DEFER
- **Priority:** P4

### FR-090 — Evidence diffing between analyses

- **Description:** Show what changed between two runs.
- **Disposition:** DEFER
- **Priority:** P4

### FR-091 — Teamwork Graph evidence ingestion

- **Description:** Graph relationships as evidence.
- **Disposition:** DEFER
- **Priority:** P4

### FR-092 — Confluence evidence ingestion

- **Description:** Page content as evidence.
- **Disposition:** DEFER
- **Priority:** P4

### FR-093 — Bitbucket/PR evidence ingestion

- **Description:** Pull-request content as evidence.
- **Disposition:** DEFER
- **Priority:** P4

### FR-094 — User-provided evidence entry

- **Description:** Manual evidence with provenance.
- **Disposition:** DEFER
- **Priority:** P3

### FR-095 — Evidence expiry policy

- **Description:** Evidence older than a policy is marked stale.
- **Disposition:** DEFER
- **Priority:** P3

### FR-096 — Context replay from stored evidence

- **Description:** Re-run an analysis from its stored evidence.
- **Disposition:** DEFER
- **Priority:** P3

### FR-097 — Untrusted-content quarantine view

- **Description:** Inspect flagged injection content safely.
- **Disposition:** DEFER
- **Priority:** P3

### FR-098 — Evidence lineage graph

- **Description:** Visual lineage from source to conclusion.
- **Disposition:** DEFER
- **Priority:** P4

### FR-099 — Competing claims on findings

- **Description:** Findings carry both sides with evidence ids.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-100 — Contradiction explanations

- **Description:** Human-readable explanations cite both sides.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-101 — Documented normalizer patterns

- **Description:** Deterministic pattern table, ordered, documented.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-102 — Negation-first pattern ordering

- **Description:** Negations are matched before affirmatives.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-103 — Conservative one-predicate extraction

- **Description:** One predicate per sentence, no over-reading.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-104 — Deterministic proposition ids

- **Description:** Resettable counters make replays identical.
- **Disposition:** EXISTING
- **Priority:** P2

### FR-105 — Evidence count transparency

- **Description:** Analyses report how many evidence items were used.
- **Disposition:** EXISTING
- **Priority:** P1

### FR-106 — Agent injection warnings

- **Description:** get-evidence flags suspected injection to the agent.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-107 — Canonical digest stability

- **Description:** Payload digests normalize key order.
- **Disposition:** EXISTING
- **Priority:** P1

### FR-108 — Retrieve-vs-digest cross-check

- **Description:** Re-read and compare digests to detect edits.
- **Disposition:** DEFER
- **Priority:** P2

### FR-109 — Runtime context in access metadata

- **Description:** Tenant and user recorded on every retrieval.
- **Disposition:** EXISTING
- **Priority:** P1

### FR-110 — Derived-context marking

- **Description:** Engine-derived context is labeled as derived.
- **Disposition:** DEFER
- **Priority:** P3

### FR-111 — Context snapshot export

- **Description:** Export the exact analysis context as JSON.
- **Disposition:** DEFER
- **Priority:** P3

### FR-112 — Evidence retention policy

- **Description:** Retention and cleanup rules for stored evidence.
- **Disposition:** DEFER
- **Priority:** P4

### FR-113 — Retrieval provenance in audit

- **Description:** Analysis audit events link the evidence ids used.
- **Disposition:** EXISTING
- **Priority:** P1

### FR-114 — Vector database for evidence search

- **Description:** Embedding store over evidence text.
- **Disposition:** REJECT_WITH_REASON — Rejected: volumes do not justify an external vector DB; deterministic ids suffice.
- **Priority:** P4

### FR-115 — Whole-document evidence storage

- **Description:** Store entire documents as evidence.
- **Disposition:** REJECT_WITH_REASON — Rejected: data minimization keeps only cited spans.
- **Priority:** P4

## Domain C. Agentic intelligence and reasoning

### FR-116 — Rovo investigator agent

- **Description:** Manifest-defined agent with evidence-citing prompt.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-117 — Six agent actions with schemas

- **Description:** Each action declares typed inputs and verbs.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-118 — Absolute-rule agent prompt

- **Description:** No fabrication, cite evidence, flag injections.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-119 — Prompt injection defense rules

- **Description:** Source content is data, never instructions.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-120 — No-evidence rule in prompt

- **Description:** Agent must say INSUFFICIENT_EVIDENCE rather than guess.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-121 — Agents cannot approve or execute

- **Description:** Structural separation: no approve/execute tool exists.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-122 — investigate-issue tool

- **Description:** Agent-triggered analysis on an issue.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-123 — get-case tool

- **Description:** Authorized case retrieval for the agent.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-124 — get-evidence tool

- **Description:** Sanitized evidence with citations for the agent.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-125 — get-impact tool

- **Description:** Verified dependency impact for the agent.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-126 — prepare-remediation tool

- **Description:** Proposal drafting (never execution) for the agent.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-127 — get-approval-status tool

- **Description:** Read-only proposal state without approver identity.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-128 — MCP tool surface

- **Description:** rovo:mcp module exposing the six tools.
- **Disposition:** EXISTING
- **Priority:** P2

### FR-129 — Two reusable skills

- **Description:** SKILL.md files for investigation and remediation flows.
- **Disposition:** EXISTING
- **Priority:** P2

### FR-130 — zod validation on every action

- **Description:** All action inputs are schema-validated.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-131 — Tenant context required

- **Description:** Actions refuse to run without tenant identity.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-132 — Structured error envelopes

- **Description:** Status/error codes, never thrown raw errors.
- **Disposition:** EXISTING
- **Priority:** P1

### FR-133 — Bounded retries with backoff

- **Description:** Adapter retries transient failures with capped backoff.
- **Disposition:** EXISTING
- **Priority:** P1

### FR-134 — Non-transient error short-circuit

- **Description:** 4xx (except 429) never retried.
- **Disposition:** EXISTING
- **Priority:** P1

### FR-135 — Deterministic fallback over LLM

- **Description:** No model call in the verified path.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-136 — Conversation starters

- **Description:** Curated starters guide the demo conversation.
- **Disposition:** EXISTING
- **Priority:** P3

### FR-137 — No invented evidence (contract)

- **Description:** Engine and prompt both forbid fabricated citations.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-138 — Human escalation to review queue

- **Description:** Agent proposals land in the human queue.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-139 — Approver identity hidden from agent

- **Description:** Agent sees binding presence, not who approved.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-140 — Structured root-cause hypotheses

- **Description:** Typed hypotheses derived from findings.
- **Disposition:** DEFER
- **Priority:** P2

### FR-141 — Multi-step case planning

- **Description:** Agent plans investigations across linked issues.
- **Disposition:** DEFER
- **Priority:** P4

### FR-142 — Agent execution traces

- **Description:** Per-tool-call trace records.
- **Disposition:** DEFER
- **Priority:** P3

### FR-143 — Agent performance measurement

- **Description:** Reliability metrics per tool.
- **Disposition:** DEFER
- **Priority:** P4

### FR-144 — Model provider abstraction

- **Description:** Swappable model backend.
- **Disposition:** DEFER
- **Priority:** P4

### FR-145 — LLM-assisted extraction layer

- **Description:** Optional LLM normalization on top of patterns.
- **Disposition:** DEFER
- **Priority:** P4

### FR-146 — Metamorphic agent testing

- **Description:** Invariant checks under transformations.
- **Disposition:** DEFER
- **Priority:** P4

### FR-147 — Differential testing vs rule baseline

- **Description:** Compare model output against the deterministic engine.
- **Disposition:** DEFER
- **Priority:** P4

### FR-148 — Tool-call post-state verification

- **Description:** Verify the world state after tool writes.
- **Disposition:** EXISTING
- **Priority:** P1

### FR-149 — Idempotent agent operations

- **Description:** Re-running investigation upserts rather than duplicates.
- **Disposition:** EXISTING
- **Priority:** P1

### FR-150 — Agent/UI shared core

- **Description:** Agent and UI invoke the same pipeline.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-151 — Severity reasons as explanations

- **Description:** Severity decisions list their reasons.
- **Disposition:** EXISTING
- **Priority:** P2

### FR-152 — Confidence separated from severity

- **Description:** Uncertainty is explicit and separate.
- **Disposition:** EXISTING
- **Priority:** P1

### FR-153 — Both-sides contradiction reply

- **Description:** Agent presents conflicting evidence fairly.
- **Disposition:** EXISTING
- **Priority:** P1

### FR-154 — Agent rate limits

- **Description:** Per-user throttling of agent actions.
- **Disposition:** EXISTING
- **Priority:** P4

### FR-155 — Failure recovery guidance

- **Description:** Agent explains failures and next steps.
- **Disposition:** DEFER
- **Priority:** P3

### FR-156 — Shadow execution mode

- **Description:** Dry-run agent proposals for evaluation.
- **Disposition:** DEFER
- **Priority:** P4

### FR-157 — Agent human-review rubric

- **Description:** Structured rubric for live agent evaluation.
- **Disposition:** DEFER
- **Priority:** P4

### FR-158 — Structured investigation output

- **Description:** Typed analysis result shape everywhere.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-159 — Stored finding schema validation

- **Description:** Validate findings on read.
- **Disposition:** EXISTING
- **Priority:** P3

### FR-160 — Agent/UI proposal parity

- **Description:** Both producers yield identical proposal contracts.
- **Disposition:** EXISTING
- **Priority:** P1

### FR-161 — Per-action audit events

- **Description:** Agent mutations are audited like human ones.
- **Disposition:** EXISTING
- **Priority:** P1

### FR-162 — Severity-gated agent proposals

- **Description:** Operations require minimum finding severity.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-163 — Proposal risk classification

- **Description:** Risk level attached at draft time.
- **Disposition:** EXISTING
- **Priority:** P1

### FR-164 — Documented operation catalog

- **Description:** Six operations with target/risk/min severity.
- **Disposition:** EXISTING
- **Priority:** P1

### FR-165 — Escalation path documentation

- **Description:** Docs explain the human handoff.
- **Disposition:** EXISTING
- **Priority:** P2

### FR-166 — Agent contract registry

- **Description:** AGENT_CONTRACTS.md defining every agent task.
- **Disposition:** EXISTING
- **Priority:** P1

### FR-167 — Agent verification matrix

- **Description:** Per-action verification strategies.
- **Disposition:** EXISTING
- **Priority:** P1

### FR-168 — Prompt version tracking

- **Description:** Versioned prompt history.
- **Disposition:** DEFER
- **Priority:** P4

### FR-169 — Autonomous approval agent

- **Description:** An agent that approves proposals.
- **Disposition:** REJECT_WITH_REASON — Rejected: violates the human-governance invariant.
- **Priority:** P0

### FR-170 — Multi-agent debate display

- **Description:** Simulated multi-agent panel UI.
- **Disposition:** REJECT_WITH_REASON — Rejected: theater without capability.
- **Priority:** P4

## Domain D. Remediation intelligence and optimization

### FR-171 — Remediation candidate generation

- **Description:** Findings produce typed remediation proposals.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-172 — Operation catalog

- **Description:** Six operations with declared risk and severity gates.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-173 — Severity gating per operation

- **Description:** Operations require a minimum finding severity.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-174 — Risk classification per operation

- **Description:** low/medium/high risk attached at draft time.
- **Disposition:** EXISTING
- **Priority:** P1

### FR-175 — Evidence requirement for proposals

- **Description:** No proposal without cited evidence.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-176 — Proposal payload digest

- **Description:** Canonical payload digested for replay safety.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-177 — Tenant-scoped proposal persistence

- **Description:** Proposals stored with tenant isolation.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-178 — Impact analysis over verified edges

- **Description:** BFS over verified Jira links only.
- **Disposition:** EXISTING
- **Priority:** P1

### FR-179 — Bounded traversal depth

- **Description:** Impact traversal depth capped (1..10).
- **Disposition:** EXISTING
- **Priority:** P1

### FR-180 — Inferred-edge separation

- **Description:** Inferred edges never merge into verified results.
- **Disposition:** EXISTING
- **Priority:** P1

### FR-181 — Hypothetical change simulation

- **Description:** What-if edge changes under an explicit hypothetical flag.
- **Disposition:** EXISTING
- **Priority:** P2

### FR-182 — Expected-change text

- **Description:** Proposals state what will change.
- **Disposition:** EXISTING
- **Priority:** P1

### FR-183 — Supporting finding links

- **Description:** Proposals reference their findings.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-184 — Duplicate proposal convergence

- **Description:** Same case+operation converges on one proposal id.
- **Disposition:** EXISTING
- **Priority:** P2

### FR-185 — Conflicting remediation detection

- **Description:** Detect proposals that undo each other.
- **Disposition:** DEFER
- **Priority:** P2

### FR-186 — Documented utility queue ordering

- **Description:** Queue order follows a documented utility function.
- **Disposition:** EXISTING
- **Priority:** P2

### FR-187 — Priority explanation strings

- **Description:** Each proposal explains its rank inputs.
- **Disposition:** EXISTING
- **Priority:** P2

### FR-188 — Dependency-aware queue constraints

- **Description:** Order respects declared dependencies.
- **Disposition:** DEFER
- **Priority:** P4

### FR-189 — Deadline awareness

- **Description:** Due dates influence ordering.
- **Disposition:** DEFER
- **Priority:** P4

### FR-190 — Resource-constrained scheduling

- **Description:** Capacity-aware planning.
- **Disposition:** DEFER
- **Priority:** P4

### FR-191 — Fairness / starvation prevention

- **Description:** Long-waiting items eventually surface.
- **Disposition:** DEFER
- **Priority:** P4

### FR-192 — Dynamic replanning on new evidence

- **Description:** New analyses refresh queue priorities.
- **Disposition:** DEFER
- **Priority:** P3

### FR-193 — Deterministic priority recalculation

- **Description:** Same inputs produce the same order.
- **Disposition:** EXISTING
- **Priority:** P2

### FR-194 — Cost estimation per proposal

- **Description:** Effort estimate attached to proposals.
- **Disposition:** DEFER
- **Priority:** P4

### FR-195 — Expected-benefit quantification

- **Description:** Benefit estimate with stated assumptions.
- **Disposition:** DEFER
- **Priority:** P4

### FR-196 — Reversibility classification

- **Description:** Mark whether an operation can be undone.
- **Disposition:** DEFER
- **Priority:** P3

### FR-197 — Rollback eligibility

- **Description:** Eligible proposals expose a rollback plan.
- **Disposition:** DEFER
- **Priority:** P4

### FR-198 — Execution prerequisites check

- **Description:** State/binding/tenant/digest/expiry verified before writes.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-199 — Candidate state validation

- **Description:** Only legal state transitions are accepted.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-200 — Risk-adjusted ordering factor

- **Description:** Higher-risk proposals surface for faster review.
- **Disposition:** EXISTING
- **Priority:** P2

### FR-201 — Age-decay ordering factor

- **Description:** Waiting time increases review priority.
- **Disposition:** EXISTING
- **Priority:** P2

### FR-202 — Severity-dominant ordering

- **Description:** Severity outranks risk and age.
- **Disposition:** EXISTING
- **Priority:** P2

### FR-203 — Queue pending counts

- **Description:** Pending metrics surfaced (badge, queue).
- **Disposition:** EXISTING
- **Priority:** P2

### FR-204 — Optimization objective documentation

- **Description:** Objective function and constraints documented.
- **Disposition:** EXISTING
- **Priority:** P2

### FR-205 — Queue design documentation

- **Description:** QUEUE_DESIGN.md with invariants and rationale.
- **Disposition:** EXISTING
- **Priority:** P2

### FR-206 — Proposal comparison view

- **Description:** Side-by-side proposal comparison.
- **Disposition:** DEFER
- **Priority:** P4

### FR-207 — Remediation playbooks

- **Description:** Reusable per-domain remediation templates.
- **Disposition:** DEFER
- **Priority:** P4

### FR-208 — Multi-proposal bundling

- **Description:** Bundle related proposals into one review.
- **Disposition:** DEFER
- **Priority:** P4

### FR-209 — Auto-suggest remediation on new cases

- **Description:** Suggest operations when cases are created.
- **Disposition:** DEFER
- **Priority:** P3

### FR-210 — Proposal approval expiry

- **Description:** Approvals expire after a validity window.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-211 — Proposal cancellation

- **Description:** Pending proposals can be cancelled by state machine.
- **Disposition:** EXISTING
- **Priority:** P1

### FR-212 — Rejected-proposal rationale storage

- **Description:** Store the rejection reason.
- **Disposition:** DEFER
- **Priority:** P2

### FR-213 — Reopen proposals

- **Description:** Reopen rejected proposals with new evidence.
- **Disposition:** DEFER
- **Priority:** P4

### FR-214 — Proposal history per case

- **Description:** Chronological proposals per case.
- **Disposition:** DEFER
- **Priority:** P3

### FR-215 — Cross-case remediation dedup

- **Description:** Deduplicate equivalent proposals across cases.
- **Disposition:** DEFER
- **Priority:** P4

### FR-216 — Ordering sensitivity property test

- **Description:** Ordering responds predictably to input changes.
- **Disposition:** EXISTING
- **Priority:** P2

### FR-217 — Ordering regression suite

- **Description:** Snapshot tests guard the documented order.
- **Disposition:** EXISTING
- **Priority:** P2

### FR-218 — Documented queue constraints

- **Description:** Hard constraints (state, expiry) stated with the model.
- **Disposition:** EXISTING
- **Priority:** P2

### FR-219 — Background scheduler hooks

- **Description:** Hooks for future scheduled re-prioritization.
- **Disposition:** DEFER
- **Priority:** P4

### FR-220 — Arbitrary numeric priority score

- **Description:** Unexplained magic-number ranking.
- **Disposition:** REJECT_WITH_REASON — Rejected: unexplained scores; ordering must derive from the documented utility.
- **Priority:** P2

## Domain E. Governance, approval and human control

### FR-221 — Approval state machine

- **Description:** DRAFT→PENDING→APPROVED→EXECUTED with terminal alternatives.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-222 — Valid-transition enforcement

- **Description:** Illegal transitions throw typed errors.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-223 — Approval binding contract

- **Description:** Approver, tenant, target, operation, digest, expiry.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-224 — Self-approval prevention

- **Description:** The proposal actor cannot approve.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-225 — Approval expiry window

- **Description:** Default 1h validity.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-226 — Replay protection registry

- **Description:** Executed digests are permanently rejected.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-227 — Approver-only execution

- **Description:** Only the recorded approver may execute.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-228 — Separation of duties (agent/human)

- **Description:** Agents draft; humans approve and execute.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-229 — Decision audit events

- **Description:** Approvals and rejections are chained into the ledger.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-230 — Rejection flow

- **Description:** Rejections are first-class transitions.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-231 — Approval identity display

- **Description:** UI shows the recorded approver.
- **Disposition:** EXISTING
- **Priority:** P1

### FR-232 — No agent execute/approve tool

- **Description:** The tool surface structurally excludes them.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-233 — Binding creation path (UI resolver)

- **Description:** decideProposal creates bindings server-side.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-234 — Digest-bound approval

- **Description:** Approvals bind the exact payload digest.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-235 — Modified proposal cannot reuse approval

- **Description:** Digest mismatch fails execution.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-236 — Approval revocation before execution

- **Description:** Cancel an approval pre-execution.
- **Disposition:** EXISTING
- **Priority:** P2

### FR-237 — Rejection rationale capture

- **Description:** Reason stored with the rejection.
- **Disposition:** EXISTING
- **Priority:** P2

### FR-238 — Risk-based approval routing

- **Description:** Higher risk requires stricter approver rules.
- **Disposition:** DEFER
- **Priority:** P4

### FR-239 — Sensitive-operation restrictions

- **Description:** High-risk operations need HIGH+ severity.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-240 — Approval evidence snapshot

- **Description:** Snapshot the evidence at approval time.
- **Disposition:** DEFER
- **Priority:** P3

### FR-241 — Approval-to-execution traceability

- **Description:** Chained events connect approval to execution.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-242 — Decision accountability

- **Description:** Every decision records its actor.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-243 — Concurrent decision conflict handling

- **Description:** Two reviewers deciding simultaneously.
- **Disposition:** EXISTING
- **Priority:** P3

### FR-244 — Multi-approver policies

- **Description:** N-of-M approvals for sensitive operations.
- **Disposition:** DEFER
- **Priority:** P4

### FR-245 — Approval delegation

- **Description:** Delegate approval authority temporarily.
- **Disposition:** DEFER
- **Priority:** P4

### FR-246 — Approval SLA tracking

- **Description:** Time-to-decision metrics.
- **Disposition:** DEFER
- **Priority:** P4

### FR-247 — Role-based approver eligibility

- **Description:** Only eligible roles may approve.
- **Disposition:** DEFER
- **Priority:** P3

### FR-248 — Approval history view

- **Description:** Filterable decision history.
- **Disposition:** DEFER
- **Priority:** P3

### FR-249 — Governance documentation

- **Description:** SECURITY_AND_GOVERNANCE.md with invariants and threat model.
- **Disposition:** EXISTING
- **Priority:** P1

### FR-250 — Policy evaluation engine

- **Description:** Declarative policy checks before decisions.
- **Disposition:** DEFER
- **Priority:** P4

### FR-251 — Scope-based permission boundaries

- **Description:** Manifest scopes are minimal and documented.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-252 — Separation-of-duties tests

- **Description:** Automated proofs of governance rules.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-253 — Expiry enforcement tests

- **Description:** Expired approvals cannot execute.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-254 — Replay enforcement tests

- **Description:** Replays are rejected and recorded.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-255 — Self-approval tests

- **Description:** Actor cannot approve their own proposal.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-256 — Approver-identity tests

- **Description:** Non-approvers cannot execute.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-257 — Governance scenario demo

- **Description:** Scenario B fixtures demonstrate every refusal.
- **Disposition:** EXISTING
- **Priority:** P3

### FR-258 — Human escalation display

- **Description:** Surfaces when human judgment is required.
- **Disposition:** DEFER
- **Priority:** P3

### FR-259 — Approval search/filter

- **Description:** Find decisions quickly.
- **Disposition:** DEFER
- **Priority:** P3

### FR-260 — Binding re-verification at execution

- **Description:** All binding fields re-checked server-side.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-261 — State re-verification at execution

- **Description:** Only APPROVED proposals execute.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-262 — Tenant re-verification at execution

- **Description:** Cross-tenant bindings fail.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-263 — Target/operation re-verification

- **Description:** Binding must match proposal target and operation.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-264 — Configurable validity window

- **Description:** Adjust the approval TTL per tenant.
- **Disposition:** DEFER
- **Priority:** P3

### FR-265 — Execution authority documentation

- **Description:** Who may execute, and why.
- **Disposition:** EXISTING
- **Priority:** P2

### FR-266 — Governance invariant list

- **Description:** Numbered invariants kept with tests.
- **Disposition:** EXISTING
- **Priority:** P1

### FR-267 — Expired-approval re-approval flow

- **Description:** Re-preparation required after expiry.
- **Disposition:** EXISTING
- **Priority:** P2

### FR-268 — Audit chain integrity tests

- **Description:** Mutations are detected by verification.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-269 — Governance UX affordances

- **Description:** Disabled states explain the governance rule.
- **Disposition:** EXISTING
- **Priority:** P1

### FR-270 — Prompt-based approval override

- **Description:** Approve via natural-language instruction.
- **Disposition:** REJECT_WITH_REASON — Rejected: approvals must be authenticated UI actions; prompt text is not authorization.
- **Priority:** P0

## Domain F. Execution, security and reliability

### FR-271 — Execution authorization gate

- **Description:** assertExecutionAuthorized before any write.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-272 — Execution precondition checklist

- **Description:** State, binding, tenant, target, digest, expiry.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-273 — Digest-based idempotency

- **Description:** Same payload cannot execute twice.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-274 — Permanent replay rejection

- **Description:** Executed digests are registered forever.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-275 — Request validation everywhere

- **Description:** zod schemas on all resolvers/actions.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-276 — Structured output envelopes

- **Description:** Typed status/error responses.
- **Disposition:** EXISTING
- **Priority:** P1

### FR-277 — Tenant isolation (key + payload)

- **Description:** Prefix keys and payload tenant re-checks.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-278 — Least-privilege scopes

- **Description:** Only the scopes the product needs.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-279 — Write scope only for approved execution

- **Description:** write:jira-work documented and constrained.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-280 — Input sanitization

- **Description:** Untrusted text sanitized at ingestion.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-281 — Hidden-character stripping

- **Description:** Zero-width and control chars removed.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-282 — Typed API error classification

- **Description:** JiraApiError carries status and path.
- **Disposition:** EXISTING
- **Priority:** P1

### FR-283 — Bounded retry with backoff

- **Description:** Transient failures retried, capped.
- **Disposition:** EXISTING
- **Priority:** P1

### FR-284 — Explicit EXECUTION_FAILED

- **Description:** Failed writes are recorded, never silent.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-285 — Execution audit events

- **Description:** Every execution attempt is chained.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-286 — Execution receipts

- **Description:** resultRef recorded for successful writes.
- **Disposition:** EXISTING
- **Priority:** P1

### FR-287 — Post-execution independent verification

- **Description:** Re-read the resulting state after execution.
- **Disposition:** EXISTING
- **Priority:** P1

### FR-288 — Verification result storage

- **Description:** Verification outcome persisted on the proposal.
- **Disposition:** EXISTING
- **Priority:** P1

### FR-289 — Verification audit events

- **Description:** proposal_verified chained with outcome.
- **Disposition:** EXISTING
- **Priority:** P1

### FR-290 — Success vs verified distinction

- **Description:** API 200 is not verified success.
- **Disposition:** EXISTING
- **Priority:** P1

### FR-291 — Partial failure classification

- **Description:** Multi-step failures classified honestly.
- **Disposition:** DEFER
- **Priority:** P3

### FR-292 — State reconciliation

- **Description:** Reconcile expected vs actual state.
- **Disposition:** DEFER
- **Priority:** P3

### FR-293 — Compensating actions

- **Description:** Undo path for executed writes.
- **Disposition:** DEFER
- **Priority:** P4

### FR-294 — Rollback boundaries

- **Description:** Which operations can and cannot roll back.
- **Disposition:** DEFER
- **Priority:** P4

### FR-295 — Circuit breaker for Jira

- **Description:** Trip on repeated downstream failures.
- **Disposition:** EXISTING
- **Priority:** P4

### FR-296 — Execution timeout budgets

- **Description:** Bounded execution wall-clock.
- **Disposition:** EXISTING
- **Priority:** P3

### FR-297 — 429 rate-limit retry

- **Description:** Rate-limited calls retried with backoff.
- **Disposition:** EXISTING
- **Priority:** P1

### FR-298 — Secret management policy

- **Description:** No secrets committed; documented env vars.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-299 — Abuse-resistant input validation

- **Description:** Issue keys and ids are regex-validated.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-300 — Recovery by re-analysis

- **Description:** Failures are recoverable by re-running analysis.
- **Disposition:** EXISTING
- **Priority:** P2

### FR-301 — Failure scenario fixtures

- **Description:** Deterministic failure fixtures (Scenario D).
- **Disposition:** EXISTING
- **Priority:** P3

### FR-302 — Failure demo in sandbox

- **Description:** Sandbox shows EXECUTION_FAILED honestly.
- **Disposition:** EXISTING
- **Priority:** P3

### FR-303 — Dependency security audit

- **Description:** npm audit gate in CI.
- **Disposition:** EXISTING
- **Priority:** P3

### FR-304 — Data minimization

- **Description:** Evidence stores cited spans, not whole documents.
- **Disposition:** EXISTING
- **Priority:** P1

### FR-305 — Cross-tenant read rejection tests

- **Description:** Foreign-tenant reads return nothing.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-306 — Injection defense tests

- **Description:** Sanitizer and engine tests over injection fixtures.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-307 — Audit-chain mutation detection

- **Description:** verifyAuditChain detects tampering.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-308 — Chain tamper test

- **Description:** Mutating an event breaks verification.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-309 — Same-millisecond chain ordering

- **Description:** Insertion-monotonic ids keep chain order stable.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-310 — Deterministic chain read

- **Description:** Ordering is stable across reads.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-311 — ADF write payloads

- **Description:** Comments/issues built as ADF documents.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-312 — Derived project-key validation

- **Description:** Project keys validated before issue creation.
- **Disposition:** EXISTING
- **Priority:** P1

### FR-313 — Comment execution path

- **Description:** Non-issue operations post approval-traced comments.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-314 — Issue-creation execution path

- **Description:** create_remediation_issue creates a Task.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-315 — Execution state persistence

- **Description:** EXECUTED/EXECUTION_FAILED stored on the proposal.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-316 — Honest UNVERIFIED handling

- **Description:** Unverifiable states stay UNVERIFIED, not success.
- **Disposition:** EXISTING
- **Priority:** P1

### FR-317 — Security review checklist

- **Description:** Documented review steps with owners.
- **Disposition:** EXISTING
- **Priority:** P2

### FR-318 — Threat model documentation

- **Description:** Assets, actors, threats and mitigations.
- **Disposition:** EXISTING
- **Priority:** P1

### FR-319 — CI secret scan

- **Description:** Grep gate for credential patterns.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-320 — Analysis flooding resistance

- **Description:** Bound analysis frequency per tenant.
- **Disposition:** EXISTING
- **Priority:** P3

## Domain G. Atlassian and collaboration integration

### FR-321 — Forge app manifest (globalPage + issuePanel)

- **Description:** Two UI surfaces registered with one resource.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-322 — Rovo agent module

- **Description:** rovo:agent registration with prompt and actions.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-323 — Six action modules

- **Description:** One Forge function per action.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-324 — rovo:mcp module

- **Description:** MCP tool surface referencing real actions.
- **Disposition:** EXISTING
- **Priority:** P2

### FR-325 — rovo:skill modules

- **Description:** Two skills with SKILL.md frontmatter.
- **Disposition:** EXISTING
- **Priority:** P2

### FR-326 — Node 24 runtime pin

- **Description:** runtime and .nvmrc aligned.
- **Disposition:** EXISTING
- **Priority:** P2

### FR-327 — Jira REST v3 reads (asUser)

- **Description:** All Jira reads run with caller permissions.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-328 — Issue field selection

- **Description:** Only needed fields are requested.
- **Disposition:** EXISTING
- **Priority:** P1

### FR-329 — Comment retrieval

- **Description:** Comments fetched and mapped with authors.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-330 — Issuelinks retrieval

- **Description:** Links fetched for impact analysis.
- **Disposition:** EXISTING
- **Priority:** P1

### FR-331 — JQL search support

- **Description:** Adapter supports paged JQL search.
- **Disposition:** EXISTING
- **Priority:** P2

### FR-332 — Minimal read scopes

- **Description:** read:jira-work, read:jira-user only.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-333 — Trusted-route handling

- **Description:** assumeTrustedRoute used for internally-built paths.
- **Disposition:** EXISTING
- **Priority:** P1

### FR-334 — KVS storage module

- **Description:** storage:app KVS with tenant-prefixed keys.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-335 — Health probe endpoint

- **Description:** GET /myself probe powers health state.
- **Disposition:** EXISTING
- **Priority:** P2

### FR-336 — Forge bridge usage

- **Description:** invoke/view from @forge/bridge in the UI.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-337 — ADF write payloads

- **Description:** Writes serialized as ADF documents.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-338 — Issue creation via REST

- **Description:** Approved proposals can create issues.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-339 — Comment posting via REST

- **Description:** Approved proposals can comment.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-340 — Resolver handler pattern

- **Description:** Thin zod-validated resolver layer.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-341 — Manifest scope documentation

- **Description:** Every scope justified in the manifest.
- **Disposition:** EXISTING
- **Priority:** P1

### FR-342 — Teamwork Graph adapter

- **Description:** Curated-query adapter, contract-tested.
- **Disposition:** EXISTING
- **Priority:** P2

### FR-343 — Teamwork Graph wiring

- **Description:** Resolver/action enrichment via the graph.
- **Disposition:** DEFER
- **Priority:** P4

### FR-344 — Graph scope request plan

- **Description:** Granular graph scopes documented for deployment.
- **Disposition:** DEFER
- **Priority:** P4

### FR-345 — Curated queries only

- **Description:** No ad-hoc runtime Cypher.
- **Disposition:** EXISTING
- **Priority:** P2

### FR-346 — Permission-filtered graph reads

- **Description:** Graph rows are user-scoped by design.
- **Disposition:** EXISTING
- **Priority:** P2

### FR-347 — Platform event handling

- **Description:** Forge event/webhook triggers.
- **Disposition:** DEFER
- **Priority:** P4

### FR-348 — Scheduled triggers

- **Description:** Bulk scheduled analysis.
- **Disposition:** DEFER
- **Priority:** P4

### FR-349 — Development-site deployment

- **Description:** forge deploy + install on a dev site.
- **Disposition:** DEFER
- **Priority:** P4

### FR-350 — Marketplace listing

- **Description:** Listing assets and publication.
- **Disposition:** DEFER
- **Priority:** P4

### FR-351 — Installation flow docs

- **Description:** README documents register/deploy/install.
- **Disposition:** EXISTING
- **Priority:** P2

### FR-352 — Forge lint guidance

- **Description:** Manifest lint findings documented.
- **Disposition:** EXISTING
- **Priority:** P2

### FR-353 — Jira status error mapping

- **Description:** Statuses mapped to available/degraded/unavailable.
- **Disposition:** EXISTING
- **Priority:** P1

### FR-354 — Rate-limit awareness

- **Description:** 429 retried; other 4xx surfaced.
- **Disposition:** EXISTING
- **Priority:** P1

### FR-355 — API version pinning

- **Description:** REST v3 paths pinned explicitly.
- **Disposition:** EXISTING
- **Priority:** P1

### FR-356 — Issue-panel context capture

- **Description:** Panel supplies the current issue key.
- **Disposition:** EXISTING
- **Priority:** P1

### FR-357 — Global page navigation

- **Description:** Sidebar navigation across views.
- **Disposition:** EXISTING
- **Priority:** P1

### FR-358 — Cross-service trace ids

- **Description:** Correlation ids across Forge products.
- **Disposition:** DEFER
- **Priority:** P4

### FR-359 — External integration boundaries doc

- **Description:** atlassian-compatibility.md records decisions.
- **Disposition:** EXISTING
- **Priority:** P2

### FR-360 — Scope-revocation handling

- **Description:** Revoked scopes surface as ACCESS_RESTRICTED.
- **Disposition:** EXISTING
- **Priority:** P1

### FR-361 — User display names in citations

- **Description:** Comment authors appear in citations.
- **Disposition:** EXISTING
- **Priority:** P2

### FR-362 — Issue status in views

- **Description:** Analysis results show issue status.
- **Disposition:** EXISTING
- **Priority:** P2

### FR-363 — KVS query pagination

- **Description:** Repositories page through KVS queries.
- **Disposition:** EXISTING
- **Priority:** P1

### FR-364 — Shared team case views

- **Description:** Team-level collaboration surfaces on cases.
- **Disposition:** DEFER
- **Priority:** P4

### FR-365 — Undeclared scope creep

- **Description:** Request scopes without product need.
- **Disposition:** REJECT_WITH_REASON — Rejected: scopes must map to implemented, documented capabilities only.
- **Priority:** P0

## Domain H. Audit, observability and analytics

### FR-366 — Digest-chained audit events

- **Description:** Each event digests its predecessor.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-367 — Insertion-monotonic event ids

- **Description:** Ids encode sequence so order is stable.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-368 — Chain verification API

- **Description:** verifyAuditChain returns tamper status.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-369 — Tamper detection

- **Description:** Any edit breaks the chain.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-370 — Deterministic event ordering

- **Description:** Timestamp then id; stable across reads.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-371 — analysis_run events

- **Description:** Every analysis run is audited.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-372 — Proposal decision events

- **Description:** prepare/approve/reject audited.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-373 — Execution events

- **Description:** proposal_executed audited with outcome.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-374 — Tenant-scoped ledger

- **Description:** Ledger keys are tenant-prefixed.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-375 — Audit ledger UI

- **Description:** Chained events rendered in the app.
- **Disposition:** EXISTING
- **Priority:** P1

### FR-376 — Event evidence linkage

- **Description:** Events link the evidence ids they used.
- **Disposition:** EXISTING
- **Priority:** P1

### FR-377 — Request fingerprints

- **Description:** Each event digests its triggering request.
- **Disposition:** EXISTING
- **Priority:** P1

### FR-378 — Verification outcome events

- **Description:** proposal_verified chained after execution checks.
- **Disposition:** EXISTING
- **Priority:** P1

### FR-379 — Execution receipts in audit

- **Description:** resultRef recorded in the chain.
- **Disposition:** EXISTING
- **Priority:** P1

### FR-380 — Failure-result events

- **Description:** Failures are audited as failures.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-381 — Chain integrity tests

- **Description:** Automated chain verification tests.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-382 — Same-millisecond regression test

- **Description:** Insertion order preserved under same-ms appends.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-383 — Exportable audit report

- **Description:** Download the ledger with chain proof.
- **Disposition:** DEFER
- **Priority:** P3

### FR-384 — Audit retention policy

- **Description:** Retention windows for events.
- **Disposition:** DEFER
- **Priority:** P4

### FR-385 — Proposal lifecycle analytics

- **Description:** Funnel from prepared to executed.
- **Disposition:** DEFER
- **Priority:** P4

### FR-386 — Approval time metrics

- **Description:** Time-to-decision measurement.
- **Disposition:** DEFER
- **Priority:** P4

### FR-387 — Queue wait metrics

- **Description:** Time-in-queue measurement.
- **Disposition:** DEFER
- **Priority:** P4

### FR-388 — Verification pass-rate metric

- **Description:** Verified / executed ratio (needs live volume).
- **Disposition:** DEFER
- **Priority:** P4

### FR-389 — Latency measurement

- **Description:** Per-action latency percentiles.
- **Disposition:** DEFER
- **Priority:** P4

### FR-390 — Cost measurement

- **Description:** Cost per task (no model usage today).
- **Disposition:** DEFER
- **Priority:** P4

### FR-391 — Context quality metric

- **Description:** Evidence sufficiency trends.
- **Disposition:** DEFER
- **Priority:** P4

### FR-392 — Retrieval effectiveness metric

- **Description:** Retrieval relevance measurement.
- **Disposition:** DEFER
- **Priority:** P4

### FR-393 — Agent reliability metric

- **Description:** Tool success rates.
- **Disposition:** DEFER
- **Priority:** P4

### FR-394 — Operational dashboard

- **Description:** Live ops metrics view.
- **Disposition:** DEFER
- **Priority:** P4

### FR-395 — Chain append cost note

- **Description:** O(n) append documented as accepted at scale.
- **Disposition:** EXISTING
- **Priority:** P2

### FR-396 — Metrics audit documentation

- **Description:** Every displayed number has a formula and label.
- **Disposition:** EXISTING
- **Priority:** P1

### FR-397 — Measurement label discipline

- **Description:** MEASURED/TEST-VERIFIED/etc. used consistently.
- **Disposition:** EXISTING
- **Priority:** P1

### FR-398 — Benchmark replay determinism

- **Description:** Evaluator reproduces metrics exactly.
- **Disposition:** EXISTING
- **Priority:** P2

### FR-399 — Audit event schema stability

- **Description:** Event shape versioned and tested.
- **Disposition:** EXISTING
- **Priority:** P2

### FR-400 — Chain demo for judges

- **Description:** Demo step shows chain verification live.
- **Disposition:** EXISTING
- **Priority:** P3

## Domain I. Cloud-native platform and developer experience

### FR-401 — Modular monolith on Forge

- **Description:** Deployment shape chosen and documented.
- **Disposition:** EXISTING
- **Priority:** P1

### FR-402 — No speculative infrastructure

- **Description:** Every infra component justified.
- **Disposition:** EXISTING
- **Priority:** P1

### FR-403 — Storage abstraction

- **Description:** Repository interfaces over KVS.
- **Disposition:** EXISTING
- **Priority:** P1

### FR-404 — KVS injection for tests

- **Description:** Fake KVS drives real repository code.
- **Disposition:** EXISTING
- **Priority:** P1

### FR-405 — Fetcher injection for tests

- **Description:** Fake Jira transport drives real adapter code.
- **Disposition:** EXISTING
- **Priority:** P1

### FR-406 — Fake KVS test harness

- **Description:** Shared awaitable query fake.
- **Disposition:** EXISTING
- **Priority:** P2

### FR-407 — CI pipeline

- **Description:** Typecheck, lint, format, tests, build.
- **Disposition:** EXISTING
- **Priority:** P1

### FR-408 — Secret scan gate

- **Description:** CI rejects credential patterns.
- **Disposition:** EXISTING
- **Priority:** P1

### FR-409 — Coverage configuration

- **Description:** Coverage focused on core and security.
- **Disposition:** EXISTING
- **Priority:** P2

### FR-410 — Node version pinning

- **Description:** .nvmrc and engines aligned.
- **Disposition:** EXISTING
- **Priority:** P2

### FR-411 — Local development docs

- **Description:** README dev loop.
- **Disposition:** EXISTING
- **Priority:** P2

### FR-412 — One-command verification

- **Description:** npm scripts cover all gates.
- **Disposition:** EXISTING
- **Priority:** P2

### FR-413 — Deterministic test fixtures

- **Description:** Tests use fixed fixtures and ids.
- **Disposition:** EXISTING
- **Priority:** P2

### FR-414 — Register validation script

- **Description:** Automated 927-record validation.
- **Disposition:** EXISTING
- **Priority:** P2

### FR-415 — Register authoring scripts

- **Description:** Single-source-of-truth data modules.
- **Disposition:** EXISTING
- **Priority:** P2

### FR-416 — Generated docs from data

- **Description:** Catalog/traceability docs generated, not hand-copied.
- **Disposition:** EXISTING
- **Priority:** P2

### FR-417 — Environment example

- **Description:** .env.example documents expected variables.
- **Disposition:** EXISTING
- **Priority:** P2

### FR-418 — Configuration validation

- **Description:** zod at every boundary.
- **Disposition:** EXISTING
- **Priority:** P1

### FR-419 — Health check resolver

- **Description:** Probed health endpoint.
- **Disposition:** EXISTING
- **Priority:** P2

### FR-420 — Resolver namespacing

- **Description:** Stable resolver API names.
- **Disposition:** EXISTING
- **Priority:** P2

### FR-421 — Tenant boundary tests

- **Description:** Isolation proven by tests.
- **Disposition:** EXISTING
- **Priority:** P0

### FR-422 — Resource limits

- **Description:** Pagination caps, depth caps, bounded retries.
- **Disposition:** EXISTING
- **Priority:** P1

### FR-423 — Deployment readiness docs

- **Description:** BLOCKED externally; steps documented.
- **Disposition:** EXISTING
- **Priority:** P2

### FR-424 — Observability baseline

- **Description:** Audit ledger as the ops record.
- **Disposition:** EXISTING
- **Priority:** P1

### FR-425 — Recovery behavior

- **Description:** Re-analysis and re-preparation after failures.
- **Disposition:** EXISTING
- **Priority:** P2

### FR-426 — Contributor documentation

- **Description:** CONTRIBUTING.md.
- **Disposition:** EXISTING
- **Priority:** P3

### FR-427 — Architecture documentation set

- **Description:** As-built architecture docs.
- **Disposition:** EXISTING
- **Priority:** P1

### FR-428 — Durable handoff document

- **Description:** MISTRAL_VIBE_HANDOFF.md for long-run continuity.
- **Disposition:** EXISTING
- **Priority:** P2

### FR-429 — Feature-to-task traceability docs

- **Description:** Generated mapping FR↔ET.
- **Disposition:** EXISTING
- **Priority:** P2

### FR-430 — Durable execution state

- **Description:** Proposals and digests persist in KVS.
- **Disposition:** EXISTING
- **Priority:** P1

### FR-431 — Transaction boundary notes

- **Description:** Single-key writes; accepted consistency model.
- **Disposition:** EXISTING
- **Priority:** P2

### FR-432 — Background worker evaluation

- **Description:** Rejected for now, documented rationale.
- **Disposition:** EXISTING
- **Priority:** P2

### FR-433 — Event-driven execution evaluation

- **Description:** Assess Forge events when triggers exist.
- **Disposition:** DEFER
- **Priority:** P4

### FR-434 — Forge-managed DR/multi-region

- **Description:** Handled by the platform; documented.
- **Disposition:** EXISTING
- **Priority:** P2

### FR-435 — Kubernetes/Kafka/Redis cluster

- **Description:** Self-managed heavy infrastructure.
- **Disposition:** REJECT_WITH_REASON — Rejected: adds operational cost with zero product value on Forge; revisit only if a measured need appears.
- **Priority:** P4

## Domain J. Hackathon demonstration, evaluation and differentiation

### FR-436 — Problem statement documentation

- **Description:** The problem, crisply stated with evidence.
- **Disposition:** EXISTING
- **Priority:** P3

### FR-437 — Core identity statement

- **Description:** Evidence→Reasoning→Proposal→Human→Execution→Verification.
- **Disposition:** EXISTING
- **Priority:** P3

### FR-438 — Scenario A: normal remediation

- **Description:** Deterministic fixture: analyze→propose→approve→execute→verify.
- **Disposition:** EXISTING
- **Priority:** P3

### FR-439 — Scenario B: approval security

- **Description:** Every governance refusal demonstrated from tests.
- **Disposition:** EXISTING
- **Priority:** P3

### FR-440 — Scenario C: evidence contradiction

- **Description:** Contradiction fixture surfaces uncertainty honestly.
- **Disposition:** EXISTING
- **Priority:** P3

### FR-441 — Scenario D: failed execution

- **Description:** Controlled failure: classification, audit, no fake success.
- **Disposition:** EXISTING
- **Priority:** P3

### FR-442 — Scenario E: post-execution verification

- **Description:** Execution success distinguished from verified state.
- **Disposition:** EXISTING
- **Priority:** P3

### FR-443 — Scenario F: optimization and queue

- **Description:** Multiple proposals ordered by documented utility.
- **Disposition:** EXISTING
- **Priority:** P3

### FR-444 — Demo script document

- **Description:** HACKATHON_DEMO_SCRIPT.md with exact steps and commands.
- **Disposition:** EXISTING
- **Priority:** P3

### FR-445 — Deterministic demo fixtures

- **Description:** Scenario fixtures checked in and stable.
- **Disposition:** EXISTING
- **Priority:** P3

### FR-446 — Demo replay instructions

- **Description:** One command re-runs the full demo.
- **Disposition:** EXISTING
- **Priority:** P3

### FR-447 — Judging evidence pack

- **Description:** Test output and command transcripts included.
- **Disposition:** EXISTING
- **Priority:** P3

### FR-448 — README as-built

- **Description:** README matches the implemented product.
- **Disposition:** EXISTING
- **Priority:** P2

### FR-449 — Benchmark results presentation

- **Description:** Measured results with definitions.
- **Disposition:** EXISTING
- **Priority:** P2

### FR-450 — Honest limitations section

- **Description:** External blockers stated plainly.
- **Disposition:** EXISTING
- **Priority:** P2

### FR-451 — Reproducibility commands

- **Description:** Every claim runnable by a judge.
- **Disposition:** EXISTING
- **Priority:** P2

### FR-452 — Before/after defect evidence

- **Description:** Defect register shows fixed vs remaining.
- **Disposition:** EXISTING
- **Priority:** P3

### FR-453 — Architecture diagram

- **Description:** As-built dataflow diagram in docs.
- **Disposition:** EXISTING
- **Priority:** P2

### FR-454 — Security demonstration

- **Description:** Invariant tests shown as governance proof.
- **Disposition:** EXISTING
- **Priority:** P3

### FR-455 — Failure demonstration

- **Description:** Scenario D shown with real output.
- **Disposition:** EXISTING
- **Priority:** P3

### FR-456 — Video readiness outline

- **Description:** Script outline for a demo video.
- **Disposition:** DEFER
- **Priority:** P3

### FR-457 — Pitch narrative

- **Description:** HACKATHON_DIFFERENTIATION.md.
- **Disposition:** EXISTING
- **Priority:** P3

### FR-458 — Bonus prize mapping

- **Description:** bonus-evidence-matrix.md.
- **Disposition:** EXISTING
- **Priority:** P3

### FR-459 — Evaluation methodology doc

- **Description:** BENCHMARK_METHODOLOGY.md.
- **Disposition:** EXISTING
- **Priority:** P2

### FR-460 — Measured vs simulated separation

- **Description:** Labels enforced across docs.
- **Disposition:** EXISTING
- **Priority:** P2

### FR-461 — Demo timing plan

- **Description:** Minute-by-minute demo schedule.
- **Disposition:** EXISTING
- **Priority:** P3

### FR-462 — Live vs sandbox labeling

- **Description:** Modes labeled honestly in-product.
- **Disposition:** EXISTING
- **Priority:** P3

### FR-463 — One-command demo runner

- **Description:** scripts/demo-scenarios.ts runs all scenarios.
- **Disposition:** EXISTING
- **Priority:** P3

### FR-464 — Proof-of-work appendix

- **Description:** Commands and outputs recorded in final report.
- **Disposition:** EXISTING
- **Priority:** P3

### FR-465 — Differentiation vs generic AI dashboards

- **Description:** Explicit contrast in differentiation doc.
- **Disposition:** EXISTING
- **Priority:** P3

### FR-466 — Submission checklist

- **Description:** Exact list of what is submitted and its status.
- **Disposition:** EXISTING
- **Priority:** P3

### FR-467 — External blockers disclosure

- **Description:** Deploy/graph/marketplace blockers stated.
- **Disposition:** EXISTING
- **Priority:** P3

### FR-468 — Invented competitor comparisons

- **Description:** Fabricated benchmark comparisons vs other products.
- **Disposition:** REJECT_WITH_REASON — Rejected: no external system has been measured; fabricating comparisons would violate honesty rules.
- **Priority:** P3
