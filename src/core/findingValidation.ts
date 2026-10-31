/**
 * Finding record validation on read (storage-corruption defense).
 *
 * Findings are written by the analysis pipeline, but KVS is not a typed
 * store: a malformed or tampered record must never flow into proposal
 * drafting, execution authorization, or the UI as if it were a real finding.
 * This module is the single validation gate used by every read path
 * (getCase, prepareProposal resolver, rovo prepare-remediation).
 */
import type { Finding, Severity } from './types';

const SEVERITIES: Severity[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

const MEANINGFUL_STATUSES = new Set([
  'VERIFIED_CONTRADICTION',
  'POTENTIAL_CONTRADICTION',
  'CONSISTENT',
  'INSUFFICIENT_EVIDENCE',
  'STALE_EVIDENCE',
  'ACCESS_RESTRICTED',
  'ANALYSIS_FAILED',
]);

/** True when the record has the complete, well-typed Finding shape. */
export function isValidFinding(value: unknown): value is Finding {
  if (!value || typeof value !== 'object') return false;
  const f = value as Partial<Finding>;
  return (
    typeof f.findingId === 'string' &&
    f.findingId.length > 0 &&
    typeof f.tenantId === 'string' &&
    f.tenantId.length > 0 &&
    typeof f.type === 'string' &&
    typeof f.status === 'string' &&
    MEANINGFUL_STATUSES.has(f.status) &&
    typeof f.explanation === 'string' &&
    f.explanation.length > 0 &&
    Array.isArray(f.supportingEvidenceIds) &&
    f.supportingEvidenceIds.every((id) => typeof id === 'string') &&
    typeof f.severity === 'string' &&
    SEVERITIES.includes(f.severity as Severity) &&
    typeof f.confidence === 'number' &&
    Number.isFinite(f.confidence) &&
    f.confidence >= 0 &&
    f.confidence <= 1 &&
    typeof f.detectedAt === 'string' &&
    Array.isArray(f.affectedWork) &&
    f.affectedWork.every(
      (w) => !!w && typeof w === 'object' && typeof (w as { key?: unknown }).key === 'string',
    ) &&
    Array.isArray(f.competingClaims) &&
    f.competingClaims.every(
      (c) => !!c && typeof c === 'object' && typeof (c as { statement?: unknown }).statement === 'string',
    )
  );
}
