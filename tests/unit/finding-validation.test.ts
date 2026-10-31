/**
 * Finding-record validation tests (storage-corruption defense).
 * A malformed KVS record must be rejected on read — never rendered, drafted
 * against, or executed — and a well-formed record must pass unchanged.
 */
import { describe, expect, it } from 'vitest';
import { isValidFinding } from '../../src/core/findingValidation';
import type { Finding } from '../../src/core/types';

function validFinding(): Finding {
  return {
    findingId: 'finding_1',
    tenantId: 'tenant-a',
    type: 'policy_violation',
    status: 'VERIFIED_CONTRADICTION',
    explanation: 'evidence on both sides',
    supportingEvidenceIds: ['ev-1', 'ev-2'],
    competingClaims: [
      { statement: 'a', evidenceId: 'ev-1' },
      { statement: 'b', evidenceId: 'ev-2' },
    ],
    confidence: 0.9,
    severity: 'HIGH',
    detectedAt: '2026-10-31T00:00:00Z',
    affectedWork: [{ type: 'jira_issue', key: 'PAY-142' }],
    provenance: [{ evidenceId: 'ev-1', sourceSystem: 'jira', sourceObjectId: 'PAY-142' }],
  };
}

describe('isValidFinding', () => {
  it('accepts a complete, well-typed finding', () => {
    expect(isValidFinding(validFinding())).toBe(true);
  });

  it('rejects non-objects and null', () => {
    expect(isValidFinding(null)).toBe(false);
    expect(isValidFinding('finding')).toBe(false);
    expect(isValidFinding(42)).toBe(false);
  });

  const corrupt = (mutate: (f: Finding) => void) => {
    const f = validFinding();
    mutate(f);
    return f;
  };

  it('rejects a missing finding id or tenant', () => {
    expect(isValidFinding(corrupt((f) => delete (f as Partial<Finding>).findingId))).toBe(false);
    expect(isValidFinding(corrupt((f) => (f.tenantId = '')))).toBe(false);
  });

  it('rejects unknown status or severity values', () => {
    expect(isValidFinding(corrupt((f) => (f.status = 'DEFINITELY_FINE' as never)))).toBe(false);
    expect(isValidFinding(corrupt((f) => (f.severity = 'EXTREME' as never)))).toBe(false);
  });

  it('rejects out-of-range or non-finite confidence', () => {
    expect(isValidFinding(corrupt((f) => (f.confidence = 1.5)))).toBe(false);
    expect(isValidFinding(corrupt((f) => (f.confidence = Number.NaN)))).toBe(false);
  });

  it('rejects malformed evidence references', () => {
    expect(isValidFinding(corrupt((f) => (f.supportingEvidenceIds = 'ev-1' as never)))).toBe(false);
    expect(isValidFinding(corrupt((f) => (f.supportingEvidenceIds = [1, 2] as never)))).toBe(false);
  });

  it('rejects malformed affected work and competing claims', () => {
    expect(
      isValidFinding(corrupt((f) => (f.affectedWork = [{ type: 'jira_issue', key: null as never }]))),
    ).toBe(false);
    expect(isValidFinding(corrupt((f) => (f.competingClaims = [{ evidenceId: 'x' } as never])))).toBe(false);
  });

  it('rejects a record missing the explanation or detection time', () => {
    expect(isValidFinding(corrupt((f) => (f.explanation = '')))).toBe(false);
    expect(isValidFinding(corrupt((f) => delete (f as Partial<Finding>).detectedAt))).toBe(false);
  });
});
