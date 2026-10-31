# Product Taste Review — ContextCourt AI

Written 2026-10-31. Taste = knowing what not to build, and making what remains
obvious to the people who use it.

## Architecture taste — decisions kept deliberately

- **Deterministic engine, no LLM in the verify path.** The contradiction
  engine is pattern-based and testable; an LLM would make the core invariant
  (no evidence → no verified contradiction) unverifiable. Correct call.
- **No agent where a human belongs.** Agents investigate and draft; only
  humans approve and execute. This is enforced structurally (no approve/execute
  tool exists for agents), not by prompt etiquette.
- **No speculative optimizer/queue.** The review queue is newest-first because
  its bottleneck is a human decision, not throughput (OPTIMIZATION_MODEL.md).
- **No LLM metrics dashboards.** Token counts, cost, latency would be
  fabricated today; they are omitted rather than decorated.
- **Sandbox = real engine, honestly labeled.** The demo runs the production
  modules in-browser over deterministic fixtures; the banner says exactly
  what is and is not real.

## Interface review (post 2026-10-31 pass)

Every previously static surface is now driven by real data, and the UI states
the *reason* a control is unavailable:

| Surface | Before | After |
|---|---|---|
| Review queue | fixed placeholder text | live proposal list; Approve disabled *with explanation* when the viewer authored the proposal; Execute disabled *with explanation* when expired or not the approver; every action's outcome shown inline |
| Review badge | counted cases / hardcoded 1 in sandbox | real pending-proposal count |
| Open cases (Overview) | static sentence | real stored case table + sandbox engine counters |
| Audit ledger | empty in live mode (no events written) | chained events for every analysis/decision/execution |
| Case detail | misnamed `Static.tsx` | `CaseDetail.tsx`; findings with evidence ids; "Prepare remediation" gated to meaningful findings only |
| Sandbox | hardcoded 1970-dated mock objects | computed values from the real engine; scripted Jira writes are surfaced, not hidden |

## Deliberate non-features (rejected)

- Decision Simulator UI ("what-if" graphs) — the core function exists
  (`simulateHypotheticalChange`) but no workflow needs it yet; shipping it
  would add a screen nobody asked for.
- Multi-product dashboards (Confluence/Bitbucket panels) — data only reaches
  the app through granted scopes; panels without data sources would be
  decoration.
- Notification/streak/gamification surfaces — none serve the governance job.

## Remaining product risks (honest)

- First-run experience in live mode is empty until an analysis runs; the empty
  states explain why (intentional, but worth watching with real users).
- Execution of `create_remediation_issue` assumes a `Task` type in the
  derived project; failure is explicit and audited, but a project picker
  would be friendlier once live feedback exists.
- The workflow guide overlay only appears in sandbox; live-mode onboarding
  relies on the empty-state copy.
