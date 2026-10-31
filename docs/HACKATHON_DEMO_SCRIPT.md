# Hackathon Demo Script — ContextCourt AI

Total runtime: ~6 minutes live + optional re-run proof. Every command below is
copy-pasteable and deterministic; identical output on every run.

## 0. Setup (before the demo)

```bash
npm ci
npm run typecheck && npm run lint && npm test && npm run build
```

Expected: typecheck clean · lint clean · **105/105 tests (16 files)** · build ok.

## 1. The one-command proof (2 min) — `npm run demo`

Runs the REAL production core (analysis → evidence → proposal → approval →
execution → **independent verification** → audit chain) over deterministic
fixtures with a scripted Jira transport (writes recorded, never sent).
Narrate while it runs:

- **Scenario A — normal remediation.** "Watch the lifecycle in the audit
  ledger: `analysis_run → prepare_remediation → proposal_approved →
  proposal_executed → proposal_verified`. The proposal cites its evidence
  ids; the approver is a different human; the chain verifies intact."
- **Scenario B — approval security.** "Every refusal you'd want: self-approval
  throws; the agent tool surface structurally contains no approve/execute;
  expired, non-approver, unapproved and replayed executions all fail — these
  are the actual test results, not an animation."
- **Scenario C — evidence contradiction.** "Both sides are cited with evidence
  ids; confidence is separate from severity; an issue with no evidence yields
  INSUFFICIENT_EVIDENCE — never a guess."
- **Scenario D — failed execution.** "Jira rejects the write (403); the state
  is EXECUTION_FAILED with the reason; no fabricated success."
- **Scenario E — verification.** "An accepted write whose comment is missing
  from the source of truth reports MISMATCH. API 200 is not a verified
  outcome — they are two separate, audited facts."
- **Scenario F — the queue.** "Ordering follows a documented utility:
  severity×100 + risk + age, pending first — with the explanation printed for
  every proposal. No magic numbers."

Expected end state: **6/6 scenarios passed**. Offer to re-run it — identical
output. (`npx vite-node scripts/demo-scenarios.ts` is the equivalent.)

## 2. The in-product demo (2 min) — sandbox mode

Open the Forge app (or describe it while showing the code): toggle **Sandbox
demo**. Stress that sandbox is *the same production engine* running
in-browser over deterministic fixtures — the only scripted part is the Jira
transport, and the UI says so.

1. Overview → enter `PAY-142` → **Analyze issue** → contradiction found;
   point at evidence citations and the dynamic open-cases card.
2. Cases → open the case → **Prepare remediation proposal**.
3. Review queue → the proposal card shows its **queue priority explanation**
   and risk. Click **Approve** as the sandbox reviewer (a different actor than
   the analyst — the product blocks self-approval).
4. **Execute** → the card now shows the execution outcome **and the
   independent verification pill (Verified state)** with its evidence ref.
5. Audit ledger → the same chained lifecycle as Scenario A, ending in
   `proposal_verified`.

## 3. The code story (1 min)

- `src/core/verification.ts` — execution success ≠ verified state.
- `src/core/queue.ts` + `docs/QUEUE_DESIGN.md` — the documented utility.
- `src/core/approval.ts` + `src/core/execution.ts` — bindings, expiry, replay.
- `docs/registers/*.json` — 468 capabilities + 459 tasks, validated:
  `npm run validate:registers`.

## 4. Honesty block (30 s) — say it before the judges ask

"Everything you saw runs the real engine locally with a scripted Jira
transport. Live Forge deployment, Teamwork Graph wiring, and Marketplace
listing are BLOCKED on external credentials — the docs say exactly that, and
no number in this project is presented as live when it isn't."

## Judge quickstart (5 minutes, fresh clone)

```bash
npm ci && npm test && npm run demo && npm run validate:registers
```

105/105 tests · 6/6 demo scenarios · registers valid. That is the whole proof.
