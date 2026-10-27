import { detectSupersessionConflicts } from '../../src/core/supersession';
import { analyzeImpact, simulateHypotheticalChange, type DependencyEdge } from '../../src/core/impact';
import { draftProposal } from '../../src/core/remediation';
import type { DecisionRecord, EvidenceRecord, Finding } from '../../src/core/types';

const NOW = new Date('2026-10-28T00:00:00Z');

function ref(
  id: string,
  text: string,
  verification: EvidenceRecord['verification'] = 'unverified',
): EvidenceRecord {
  return {
    id,
    tenantId: 't1',
    sourceSystem: 'jira',
    sourceObjectId: id,
    canonicalUrl: null,
    extractedText: text,
    sourceVersion: 'v1',
    observedAt: NOW.toISOString(),
    sourceUpdatedAt: NOW.toISOString(),
    contentDigest: `d-${id}`,
    accessContext: { userId: 'u1', retrievedVia: 'jira' },
    extractionMethod: 'text_pattern',
    verification,
    staleness: 'current',
  };
}

function decision(partial: Partial<DecisionRecord>): DecisionRecord {
  return {
    id: 'dec-1',
    tenantId: 't1',
    subject: 'high value transfer approval',
    decisionText: 'Transfers must be additionally approved',
    decisionOwner: 'u2',
    approvalState: 'superseded',
    effectiveDate: '2026-01-01',
    supersededDate: '2026-05-01',
    evidenceIds: ['ev-dec-1'],
    extractedConstraints: [],
    sourceReferences: [],
    ...partial,
  };
}

describe('supersession detection', () => {
  it('INVARIANT: superseded decision alone (one-sided) → no verified finding', () => {
    const findings = detectSupersessionConflicts({
      tenantId: 't1',
      decisions: [decision({ evidenceIds: [] })],
      references: [ref('r1', 'implements the high value transfer approval policy')],
      affectedWork: [],
      now: NOW,
    });
    expect(findings).toHaveLength(0);
  });

  it('detects conflict when both superseding decision and referencing work have evidence', () => {
    const findings = detectSupersessionConflicts({
      tenantId: 't1',
      decisions: [decision({})],
      references: [ref('r1', 'implements the high value transfer approval policy', 'verified')],
      affectedWork: [{ type: 'jira_issue', key: 'PAY-1' }],
      now: NOW,
    });
    expect(findings).toHaveLength(1);
    expect(findings[0]!.status).toBe('VERIFIED_CONTRADICTION');
    expect(findings[0]!.supportingEvidenceIds.length).toBeGreaterThanOrEqual(2);
  });

  it('unverified reference yields POTENTIAL, never VERIFIED', () => {
    const findings = detectSupersessionConflicts({
      tenantId: 't1',
      decisions: [decision({})],
      references: [ref('r1', 'follows the high value transfer approval policy')],
      affectedWork: [],
      now: NOW,
    });
    expect(findings[0]!.status).toBe('POTENTIAL_CONTRADICTION');
  });
});

describe('impact analysis', () => {
  const edges: DependencyEdge[] = [
    { fromKey: 'PAY-1', toKey: 'PAY-2', kind: 'blocks', verified: true, provenance: 'jira-link' },
    { fromKey: 'PAY-2', toKey: 'PAY-3', kind: 'dependsOn', verified: true, provenance: 'teamwork-graph' },
    { fromKey: 'PAY-1', toKey: 'PAY-9', kind: 'blocks', verified: false, provenance: 'heuristic' },
  ];

  it('verified edges produce affected work; inferred edges stay separately labeled', () => {
    const result = analyzeImpact('PAY-1', edges);
    expect(result.affected.map((a) => a.key)).toEqual(['PAY-2', 'PAY-3']);
    expect(result.affected.every((a) => a.verifiedPath)).toBe(true);
    expect(result.inferredOnly).toEqual([{ key: 'PAY-9', via: ['PAY-1'] }]);
    expect(result.hypothetical).toBe(false);
  });

  it('INVARIANT: unsupported graph relationship never reported as verified', () => {
    const result = analyzeImpact('PAY-1', [
      { fromKey: 'PAY-1', toKey: 'PAY-7', kind: 'dependsOn', verified: false, provenance: 'guess' },
    ]);
    expect(result.affected).toHaveLength(0);
    expect(result.inferredOnly.map((i) => i.key)).toEqual(['PAY-7']);
  });

  it('hypothetical simulation is flagged hypothetical and recomputes dependencies', () => {
    const sim = simulateHypotheticalChange('PAY-1', edges, {
      remove: [{ fromKey: 'PAY-2', toKey: 'PAY-3' }],
    });
    expect(sim.hypothetical).toBe(true);
    expect(sim.affectedNow).toEqual(['PAY-2']);
    expect(sim.removedEdges).toHaveLength(1);
  });
});

describe('remediation proposals', () => {
  const finding: Finding = {
    findingId: 'f1',
    tenantId: 't1',
    type: 'missing_required_approval',
    status: 'VERIFIED_CONTRADICTION',
    explanation: 'x',
    supportingEvidenceIds: ['e1', 'e2'],
    competingClaims: [],
    confidence: 1,
    severity: 'HIGH',
    detectedAt: NOW.toISOString(),
    affectedWork: [{ type: 'jira_issue', key: 'PAY-142' }],
    provenance: [],
  };

  it('drafts a proposal with a stable payload digest', async () => {
    const draft = await draftProposal({
      tenantId: 't1',
      caseId: 'case-1',
      finding,
      operation: 'create_remediation_issue',
      expectedChange: 'Creates PAY follow-up issue',
      actor: 'human-1',
      now: NOW,
    });
    expect(draft.proposal.payloadDigest).toMatch(/^[0-9a-f]{64}$/);
    expect(draft.proposal.target).toBe('PAY-142');
  });

  it('rejects remediation from consistent findings (no evidence of conflict)', async () => {
    await expect(
      draftProposal({
        tenantId: 't1',
        caseId: 'case-1',
        finding: { ...finding, status: 'CONSISTENT' },
        operation: 'create_remediation_issue',
        expectedChange: 'x',
        actor: 'human-1',
        now: NOW,
      }),
    ).rejects.toThrow(/cannot generate remediation/);
  });

  it('rejects high-risk operations on low-severity findings', async () => {
    await expect(
      draftProposal({
        tenantId: 't1',
        caseId: 'case-1',
        finding: { ...finding, severity: 'LOW' },
        operation: 'request_missing_approval',
        expectedChange: 'x',
        actor: 'human-1',
        now: NOW,
      }),
    ).rejects.toThrow(/requires at least HIGH severity/);
  });
});
