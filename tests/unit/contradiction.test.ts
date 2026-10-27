import { analyze } from '../../src/core/contradiction';
import { normalizeAll, resetPropositionIds } from '../../src/core/normalizer';
import type { EvidenceRecord } from '../../src/core/types';

function evidence(partial: Partial<EvidenceRecord> & { id: string; extractedText: string }): EvidenceRecord {
  return {
    tenantId: 'tenant-a',
    sourceSystem: 'confluence',
    sourceObjectId: partial.id,
    canonicalUrl: null,
    sourceVersion: 'v1',
    observedAt: '2026-10-01T00:00:00Z',
    sourceUpdatedAt: '2026-10-01T00:00:00Z',
    contentDigest: `digest-${partial.id}`,
    accessContext: { userId: 'user-1', retrievedVia: 'confluence' },
    extractionMethod: 'text_pattern',
    verification: 'unverified',
    staleness: 'current',
    ...partial,
  };
}

describe('contradiction engine invariants', () => {
  beforeEach(() => {
    resetPropositionIds();
  });

  it('INVARIANT: no evidence → no verified contradiction', () => {
    const result = analyze({ tenantId: 'tenant-a', evidence: [], propositions: [], affectedWork: [] });
    expect(result.status).toBe('INSUFFICIENT_EVIDENCE');
    expect(result.findings).toHaveLength(0);
  });

  it('INVARIANT: one-sided evidence → insufficient evidence, not verified', () => {
    // Only the policy side exists; no approval-side evidence at all.
    const ev = [
      evidence({
        id: 'e1',
        extractedText: 'High-value transfers must be additionally approved by the finance controller.',
      }),
    ];
    const props = normalizeAll(ev);
    const result = analyze({ tenantId: 'tenant-a', evidence: ev, propositions: props, affectedWork: [] });
    expect(result.status).toBe('INSUFFICIENT_EVIDENCE');
    expect(result.findings).toHaveLength(0);
  });

  it('detects a verified contradiction from two opposing explicit sources', () => {
    const ev = [
      evidence({
        id: 'e1',
        extractedText: 'High-value transfers must be additionally approved by the finance controller.',
      }),
      evidence({
        id: 'e2',
        sourceSystem: 'jira',
        extractedText: 'This transfer does not require additional approval and was approved yesterday.',
      }),
    ];
    const result = analyze({
      tenantId: 'tenant-a',
      evidence: ev,
      propositions: normalizeAll(ev),
      affectedWork: [{ type: 'jira_issue', key: 'PAY-142' }],
    });
    expect(result.status).toBe('VERIFIED_CONTRADICTION');
    expect(result.findings.length).toBeGreaterThan(0);
    // every finding cites evidence on both sides
    for (const f of result.findings) {
      expect(f.supportingEvidenceIds.length).toBeGreaterThanOrEqual(2);
      expect(new Set(f.supportingEvidenceIds).size).toBeGreaterThanOrEqual(2);
    }
  });

  it('downgrades to POTENTIAL when one side is inferred or unavailable', () => {
    const ev = [
      evidence({ id: 'e1', extractedText: 'High-value transfers must be additionally approved.' }),
      evidence({
        id: 'e2',
        sourceSystem: 'jira',
        extractedText: 'No additional approval required for this transfer.',
        verification: 'access-restricted',
      }),
    ];
    const result = analyze({
      tenantId: 'tenant-a',
      evidence: ev,
      propositions: normalizeAll(ev),
      affectedWork: [],
    });
    expect(result.findings.every((f) => f.status !== 'VERIFIED_CONTRADICTION')).toBe(true);
  });

  it('reports STALE_EVIDENCE when evidence is marked stale', () => {
    const ev = [
      evidence({ id: 'e1', extractedText: 'Transfers must be additionally approved.' }),
      evidence({
        id: 'e2',
        sourceSystem: 'jira',
        extractedText: 'No additional approval required.',
        staleness: 'stale',
      }),
    ];
    const result = analyze({
      tenantId: 'tenant-a',
      evidence: ev,
      propositions: normalizeAll(ev),
      affectedWork: [],
    });
    expect(result.status).toBe('STALE_EVIDENCE');
  });

  it('reports ACCESS_RESTRICTED when evidence is restricted', () => {
    const ev = [
      evidence({ id: 'e1', extractedText: 'Transfers must be additionally approved.' }),
      evidence({
        id: 'e2',
        sourceSystem: 'jira',
        extractedText: 'No additional approval required.',
        verification: 'access-restricted',
      }),
    ];
    const result = analyze({
      tenantId: 'tenant-a',
      evidence: ev,
      propositions: normalizeAll(ev),
      affectedWork: [],
    });
    expect(result.findings.length).toBe(0);
  });

  it('INVARIANT: unavailable integration → ANALYSIS_FAILED, never silent success', () => {
    const ev = [evidence({ id: 'e1', extractedText: 'policy text' })];
    const result = analyze(
      { tenantId: 'tenant-a', evidence: ev, propositions: normalizeAll(ev), affectedWork: [] },
      { reason: 'teamwork graph unreachable', integration: 'teamwork-graph' },
    );
    expect(result.status).toBe('ANALYSIS_FAILED');
    expect(result.failure).toEqual({ reason: 'teamwork graph unreachable', integration: 'teamwork-graph' });
  });

  it('deduplicates findings from the same evidence pair', () => {
    const ev = [
      evidence({
        id: 'e1',
        extractedText:
          'Transfers must be additionally approved. Approval is prohibited without controller sign-off.',
      }),
      evidence({ id: 'e2', sourceSystem: 'jira', extractedText: 'No additional approval required.' }),
    ];
    const result = analyze({
      tenantId: 'tenant-a',
      evidence: ev,
      propositions: normalizeAll(ev),
      affectedWork: [],
    });
    const pairs = result.findings.map((f) => [...f.supportingEvidenceIds].sort().join('|'));
    expect(new Set(pairs).size).toBe(pairs.length);
  });

  it('consistent claims → CONSISTENT with no findings', () => {
    const ev = [
      evidence({ id: 'e1', extractedText: 'Transfers must be additionally approved.' }),
      evidence({
        id: 'e2',
        sourceSystem: 'jira',
        extractedText: 'This transfer was approved by the controller.',
      }),
    ];
    const result = analyze({
      tenantId: 'tenant-a',
      evidence: ev,
      propositions: normalizeAll(ev),
      affectedWork: [],
    });
    expect(result.status).toBe('CONSISTENT');
    expect(result.findings).toHaveLength(0);
  });
});

describe('fake implementation claims', () => {
  it('INVARIANT: a PR title cannot substitute for an actual diff', () => {
    // A PR title claims compliance, but we have no diff evidence — the engine
    // must never verify an implementation_requirement_mismatch from a title.
    const ev = [
      evidence({
        id: 'e1',
        sourceSystem: 'bitbucket',
        extractedText: 'PR title: adds required approval flow',
      }),
    ];
    const props = normalizeAll(ev);
    const result = analyze({ tenantId: 'tenant-a', evidence: ev, propositions: props, affectedWork: [] });
    // With only a title and no implementation evidence, no verified finding.
    expect(result.findings.every((f) => f.status !== 'VERIFIED_CONTRADICTION')).toBe(true);
    expect(result.findings.every((f) => f.type !== 'implementation_requirement_mismatch')).toBe(true);
  });
});
