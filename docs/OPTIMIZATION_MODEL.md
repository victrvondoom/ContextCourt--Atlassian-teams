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

## The remediation queue is NOT a priority queue — by design

Proposals are ordered **newest-first** in `KvsProposalRepository.list()`.
This is deliberate, not an unfinished optimizer:

1. The queue's purpose is *human governance*, not throughput. The bottleneck
   is a human decision; "optimal" batching would not change how fast a
   reviewer can approve, and a score would obscure the governance semantics.
2. The state machine enforces the actual invariants that matter: only
   PENDING_APPROVAL can be decided, only the binding's approver can execute,
   expiry and replay are hard failures.
3. Small tenant-scale volumes (a team's contradictions, not a firehose)
   make starvation mathematically irrelevant; premature fairness machinery
   would be speculative complexity.

If volume ever grows to the point where reviewers report overload, the right
move is a human-workload ranking (severity × age × affected-work), derived
from the same severity inputs — a small, testable addition. Until that
evidence exists, adding an "optimization engine" would violate the project's
own taste rule: no impressive machinery without a problem it solves.

## What would change this conclusion

- Introduction of scheduled/bulk analysis (Forge scheduled triggers scanning
  many issues) — that creates a real scheduling problem (which issues first
  under a time budget) and justifies a documented objective function.
- Teamwork Graph wiring at scale — impact breadth becomes a real cost
  signal for prioritization.

Neither exists today; both are listed in `IMPLEMENTATION_ROADMAP.md` behind
live verification.
