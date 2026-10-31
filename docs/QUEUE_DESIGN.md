# Queue Design — Review-Queue Ordering

Implemented in `src/core/queue.ts`, tested in `tests/unit/queue-ordering.test.ts`.

## Objective

The review queue allocates a scarce resource: **human review attention**. The
ordering answers "which pending proposal should a reviewer look at first?"
under the governance rule that every proposal must eventually be reviewed.

## Utility function (the actual code, no magic numbers)

```
utility(p) = severityRank(p) × 100 + riskBoost(p) + ageHours(p)
severityRank: CRITICAL 400 · HIGH 300 · MEDIUM 200 · LOW 100
riskBoost:    high +40 · medium +20 · low +0
ageHours:     hours since createdAt, capped at +90
```

Hard constraints (applied before ranking):
1. Only `PENDING_APPROVAL` items occupy the reviewable front of the queue —
   decided/executed items follow as history.
2. Ordering is a total order: deterministic tiebreak by proposal id.

Soft-ordered factors and why they have the weights they have:
- **Severity dominates** (×100 classes): a verified CRITICAL contradiction
  deserves eyes before any LOW one regardless of age. This is a review-value
  judgement, documented and tested, not a hidden score.
- **Risk boosts** (+40/+20): higher-risk operations have asymmetric cost of
  review delay.
- **Age accrues** (capped at 90 < 100): waiting is a mild fairness signal; the
  cap guarantees age can never outrank a whole severity class (starvation of
  low-severity work is bounded by the cap, not unbounded).

## Invariants (all tested)

1. **Determinism** — identical inputs produce identical order, independent of
   input permutation (20-permutation property sweep in the test).
2. **Severity dominance** — CRITICAL+0h > HIGH-risk+0.5h.
3. **Age monotonicity** — within a class, older ranks higher.
4. **Age bound** — LOW at any age (max 190) never passes MEDIUM at 0h (200).
5. **Pending-first** — non-pending items never outrank reviewable work.
6. **Missing severity degrades to LOW** — never invented.

## Why not a scheduler/optimizer engine

There is one reviewer bottleneck, no execution dependencies between
proposals, and no resource pool: a constrained optimizer would be speculative
machinery (see `docs/OPTIMIZATION_MODEL.md` for the full argument and the
triggers — scheduled bulk analysis, dependency data — that would justify
upgrading). The queue computes the documented utility at list time, so new
evidence re-ranks automatically on the next read (dynamic reprioritization
without a background job).

## Explanations

Every queue item carries `priorityExplanation`, e.g.
`CRITICAL severity (base 400) + high risk (+40) + 1.0h waiting (+1)`.
The UI renders it on every pending card — ordering is never unexplained.
