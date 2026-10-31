# Optimization Model — ContextCourt AI

Written 2026-10-31. This document answers the required question: *what does
the system optimize, is the "priority" computation aligned with that objective,
and is a dedicated optimizer justified?*

## What the system actually schedules today

ContextCourt is a **request-scoped Forge app**: every user action (analyze,
decide, execute) runs synchronously inside one function invocation bounded by
the Forge runtime. There is **no background worker, no async job, no queue
infrastructure** — by platform design, not omission.

The only ranked surface is **finding severity** (`src/core/severity.ts`),
which orders *human attention*, not task execution:

- Objective: rank which detected contradiction deserves review first.
- Decision variables: detection type, evidence strength (number of supporting
  evidence records on both sides), affected-work count, evidence age, verified
  dependency flag. All documented in code; no hidden weights.
- Constraints: severity can never exceed what evidence supports; the
  verification pipeline (`src/core/contradiction.ts`) can only *downgrade* a
  candidate, never upgrade. Rank follows verified state, not confidence alone.
- Determinism: same inputs → same severity (tested in
  `tests/unit/severity.test.ts`, `tests/unit/contradiction.test.ts`).

## The remediation queue — implemented review utility (2026-10-31)

As of the hackathon mission the queue is ordered by a **documented review-utility
function** (`src/core/queue.ts`, full design in `docs/QUEUE_DESIGN.md`):

`utility(p) = severityRank×100 + riskBoost + ageHours (capped at 90)`,
pending-first, deterministic id tiebreak. Every queue item carries a
human-readable `priorityExplanation`; nine property/invariant tests pin the
order (determinism, severity dominance, age monotonicity, age bound,
pending-first). The previous newest-first listing is superseded.

The reasoning below still governs why it is a *review-attention* ordering and
not a throughput scheduler:

1. The queue's purpose is *human governance*, not throughput. The bottleneck
   is a human decision; "optimal" batching would not change how fast a
   reviewer can approve, and a score would obscure the governance semantics.
2. The state machine enforces the actual invariants that matter: only
   PENDING_APPROVAL can be decided, only the binding's approver can execute,
   expiry and replay are hard failures.
3. Small tenant-scale volumes (a team's contradictions, not a firehose)
   make starvation mathematically irrelevant; premature fairness machinery
   would be speculative complexity.

The severity × risk × age ranking above IS that human-workload ranking,
derived from severity inputs and kept small and testable. A constrained
optimizer/scheduler remains rejected until its triggers appear.

## What would change this conclusion

- Introduction of scheduled/bulk analysis (Forge scheduled triggers scanning
  many issues) — that creates a real scheduling problem (which issues first
  under a time budget) and justifies a documented objective function.
- Teamwork Graph wiring at scale — impact breadth becomes a real cost
  signal for prioritization.

Neither exists today; both are listed in `IMPLEMENTATION_ROADMAP.md` behind
live verification.
