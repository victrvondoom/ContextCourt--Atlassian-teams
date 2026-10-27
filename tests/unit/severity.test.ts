import { normalizeAll, resetPropositionIds } from '../../src/core/normalizer';
import { assessSeverity } from '../../src/core/severity';
import type { EvidenceRecord } from '../../src/core/types';

function ev(id: string, text: string, source: EvidenceRecord['sourceSystem'] = 'confluence'): EvidenceRecord {
  return {
    id,
    tenantId: 't1',
    sourceSystem: source,
    sourceObjectId: id,
    canonicalUrl: null,
    extractedText: text,
    sourceVersion: 'v1',
    observedAt: '2026-10-01T00:00:00Z',
    sourceUpdatedAt: '2026-10-01T00:00:00Z',
    contentDigest: `d-${id}`,
    accessContext: { userId: 'u1', retrievedVia: source },
    extractionMethod: 'text_pattern',
    verification: 'unverified',
    staleness: 'current',
  };
}

describe('normalizer', () => {
  beforeEach(() => resetPropositionIds());

  it('normalizes explicit approval requirements', () => {
    const props = normalizeAll([
      ev('e1', 'High-value transfers must be additionally approved by the finance controller.'),
    ]);
    expect(props).toHaveLength(1);
    expect(props[0]!.predicate).toBe('requiresAdditionalApproval');
    expect(props[0]!.object).toBe('true');
    expect(props[0]!.originalText).toContain('finance controller');
  });

  it('normalizes negations', () => {
    const props = normalizeAll([ev('e1', 'This transfer does not require additional approval.')]);
    expect(props[0]!.predicate).toBe('requiresAdditionalApproval');
    expect(props[0]!.object).toBe('false');
  });

  it('never invents numeric conditions', () => {
    const props = normalizeAll([ev('e1', 'Transfers must be approved.')]);
    expect(props.every((p) => p.condition === null || !/\d/.test(p.condition))).toBe(true);
  });

  it('keeps original wording for provenance', () => {
    const original = 'Releases are prohibited while critical vulnerabilities remain open.';
    const props = normalizeAll([ev('e1', original)]);
    expect(props[0]!.originalText).toBe(original);
    expect(props[0]!.evidenceId).toBe('e1');
  });
});

describe('severity assessment', () => {
  const NOW = new Date('2026-10-28T00:00:00Z');

  it('separates confidence from severity', () => {
    const a = assessSeverity(
      {
        detectionType: 'policy_violation',
        evidenceStrength: 1,
        affectedWorkCount: 0,
        newestEvidenceAgeDays: 0,
        hasVerifiedDependency: false,
      },
      NOW,
    );
    const b = assessSeverity(
      {
        detectionType: 'policy_violation',
        evidenceStrength: 0.5,
        affectedWorkCount: 0,
        newestEvidenceAgeDays: 0,
        hasVerifiedDependency: false,
      },
      NOW,
    );
    // Same type, different evidence strength → different confidence, possibly same severity band.
    expect(a.confidence).toBe(1);
    expect(b.confidence).toBe(0.5);
    expect(a.severity).toBeTruthy();
  });

  it('flags stale evidence for re-evaluation', () => {
    const a = assessSeverity(
      {
        detectionType: 'direct_semantic_contradiction',
        evidenceStrength: 1,
        affectedWorkCount: 5,
        newestEvidenceAgeDays: 120,
        hasVerifiedDependency: true,
      },
      NOW,
    );
    expect(a.reasons.some((r) => r.includes('re-evaluation advised'))).toBe(true);
  });

  it('orders severity by evidence strength and impact', () => {
    const low = assessSeverity(
      {
        detectionType: 'ownership_inconsistency',
        evidenceStrength: 0.2,
        affectedWorkCount: 0,
        newestEvidenceAgeDays: 80,
        hasVerifiedDependency: false,
      },
      NOW,
    );
    const high = assessSeverity(
      {
        detectionType: 'policy_violation',
        evidenceStrength: 1,
        affectedWorkCount: 10,
        newestEvidenceAgeDays: 1,
        hasVerifiedDependency: true,
      },
      NOW,
    );
    const order = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
    expect(order.indexOf(high.severity)).toBeGreaterThan(order.indexOf(low.severity));
  });
});
