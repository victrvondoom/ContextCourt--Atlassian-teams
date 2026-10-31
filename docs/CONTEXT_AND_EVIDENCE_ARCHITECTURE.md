# Context and Evidence Architecture — ContextCourt AI

## Lifecycle

```
SOURCE (Jira description/comment, ADF)          ← untrusted, asUser-scoped
  → sanitizeUntrusted (injection flags, hidden chars)     src/security/injection.ts
  → EvidenceRecord (digest, provenance, timestamps)       src/integrations/evidence.ts
  → Proposition (deterministic patterns, evidenceId)      src/core/normalizer.ts
  → Candidate contradictions (opposing predicates)       src/core/contradiction.ts
  → Verification pipeline (downgrade-only)               src/core/contradiction.ts
  → Finding (competing claims, cited evidence ids)       src/core/types.ts
  → Proposal (payload digest, severity/risk)             src/core/remediation.ts
  → Audit ledger (linked evidence ids)                  src/audit/auditLog.ts
```

## Context classes and where they live

| Class | Representation | Trust |
|---|---|---|
| Raw source | Jira ADF / comment text | untrusted — sanitized before anything else |
| Retrieved context | `EvidenceRecord.extractedText` | sanitized, digest-pinned |
| Validated context | proposition + verification pipeline result | downgrade-only |
| Historical context | persisted findings/cases per tenant | stored, re-verifiable on re-analysis |
| Runtime context | `accessContext` (tenant, user, via) on every record | trusted platform context |
| Task context | issue key, affectedWork links | Jira-sourced |
| User-provided context | not yet implemented (backlog FR-094) | n/a |
| Derived context | `inferred` flag on propositions | labeled, never merged with fact |

## Evidence record contract (`src/core/types.ts`)

`id · tenantId · sourceSystem · sourceObjectId · canonicalUrl · extractedText
· sourceVersion · observedAt · sourceUpdatedAt · contentDigest · accessContext
· extractionMethod · verification · staleness`

Design decisions:
- **Cited spans, not whole documents** (data minimization).
- **Two timestamps** — observation time ≠ source update time; age feeds severity.
- **Digest** — SHA-256 over canonical content; key order normalized so
  replays are identical (benchmark replay depends on this).
- **Provenance per proposition** — every normalized claim points at its
  evidence id; findings carry `supportingEvidenceIds` and `competingClaims`
  with both sides.
- **Missing evidence is a first-class result** — INSUFFICIENT_EVIDENCE,
  STALE_EVIDENCE, ACCESS_RESTRICTED are explicit statuses, never silently
  merged into "consistent".

## Verification pipeline (downgrade-only, order matters)

source availability → permission → temporal validity → supersession → claim
compatibility → evidence sufficiency. An explanation can never upgrade an
uncertain candidate; it can only confirm-with-evidence or downgrade.

## Honesty rules

- No evidence → no verified contradiction (tested invariant).
- Retrieval results are **not** treated as verified truth; they are
  propositions with provenance until the pipeline confirms them.
- Conflicting facts are surfaced as competing claims, never silently merged.
- Historical stored findings can be refreshed by re-running analysis; the
  stored record always shows the latest evaluation with its own timestamp.
- Injection-suspect content is flagged and, on the agent surface, returned
  with an explicit warning — never obeyed.
