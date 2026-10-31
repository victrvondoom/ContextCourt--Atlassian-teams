# Architecture Decision Records — ContextCourt AI

Indexed decisions. Each entry records context, choice, rejected alternatives,
trade-offs and reversal conditions. Accepted decisions are not reconsidered
without new evidence (see docs/MISTRAL_VIBE_HANDOFF.md).

| ID | Decision | Status |
|---|---|---|
| ADR-001 | Deterministic engine; no LLM in the verification path | Accepted |
| ADR-002 | Agents investigate/draft only; approve/execute are human-only resolver surfaces (structural, not prompt-based) | Accepted |
| ADR-003 | Forge modular monolith; no self-managed infra (K8s/Kafka/Redis rejected) | Accepted |
| ADR-004 | KVS with tenant-prefixed keys + payload tenant re-checks; no external database | Accepted |
| ADR-005 | Digest-chained audit ledger with insertion-monotonic ids | Accepted |
| ADR-006 | Review queue ordered by a documented review-utility function (severity-dominant, risk-boosted, age-capped, pending-first), not an optimizer | Accepted |
| ADR-007 | Concurrent decisions: re-read-then-transition; last-writer-wins accepted (no KVS CAS) | Accepted |
| ADR-008 | Execution writes are single-attempt; retries restricted to idempotent reads | Accepted |
| ADR-009 | Sandbox = the real core in-browser over deterministic fixtures with a scripted transport, labeled as such | Accepted |
| ADR-010 | Registers generated from data modules and machine-validated; generated docs are never hand-edited | Accepted |

## ADR-007 — Concurrent decision handling (2026-10-31)

- **Context:** two humans may decide the same proposal concurrently. Forge KVS
  offers single-key reads/writes with no compare-and-swap or transactions.
- **Chosen:** `decideProposalCore` re-reads the proposal from the store
  immediately before the state transition and rejects any non-PENDING state.
  Sequential conflicts therefore fail safely (tested in
  `tests/integration/decision-conflicts.test.ts`). For truly interleaved
  concurrent reads, the design accepts last-writer-wins on the state field;
  both attempts write their own audit events, so no decision is silent.
- **Rejected:** distributed locks (no lock primitive on KVS), an external
  coordination service (violates ADR-003), optimistic version counters
  (detect but do not prevent the race without CAS).
- **Reversal condition:** Forge introduces conditional writes/transactions,
  or volume evidence shows conflicting decisions occur in practice.

## ADR-008 — Retry idempotency (2026-10-31)

- **Context:** bounded retry with backoff existed as a general adapter method;
  a hypothetical write routed through it could duplicate a non-idempotent
  external effect (comment posted twice) when a 5xx/429 followed a successful
  server-side write.
- **Chosen:** `requestWithRetry` retries only idempotent requests (GET/HEAD
  and the read-only JQL search POST); every other method is single-attempt.
  The execution path (`executeProposal`) never retries at all (invariant
  tested). Tests: `tests/unit/jira-adapter.test.ts` (retry guard),
  `tests/unit/execution.test.ts` (single-attempt).
- **Rejected:** retrying writes with dedup keys (Jira has no idempotency key
  support for comment/issue creation), blind backoff on all verbs.
- **Reversal condition:** Jira introduces idempotency keys for write APIs.

## Dependency posture (2026-10-31 audit)

`npm audit`: 0 critical, 0 high, 17 moderate (transitive dev-tooling).
Production dependencies upgraded to clear advisories: `zod` 3→4.6.7 (high
advisory, memory exhaustion on oversized constrained collections), all
`@forge/*` to latest, `@forge/bridge` pinned to 5.5.0 (the npm-clean line;
newer versions pull an advisories-affected @atlaskit chain). Dev toolchain
upgraded: vite 5→8, vitest 2→5 (critical tinypool/vitest advisories), with
`vite-node` added as an explicit devDependency to keep `npm run demo`
working. CI now gates on `npm audit --audit-level=high`.
Licenses (direct deps): MIT, Apache-2.0, Atlassian Forge SDK license —
compatible with the MIT-licensed app.
