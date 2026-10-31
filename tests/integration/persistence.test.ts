/**
 * Contract test for the analysis → persistence → remediation path.
 *
 * CC-002 regression: findings and cases must be persisted by the analysis
 * pipeline so `prepareRemediation` (and the case views) operate on real
 * stored state instead of always returning NOT_FOUND.
 */
import { describe, expect, it } from 'vitest';
import { persistAnalysisResult } from '../../src/resolvers';
import { analyze, resetFindingIds } from '../../src/core/contradiction';
import { normalizeAll, resetPropositionIds } from '../../src/core/normalizer';
import { KvsCaseRepository, type KvsLike } from '../../src/storage/caseStore';
import type { EvidenceRecord, Finding } from '../../src/core/types';

function fakeKvs(): KvsLike & { data: Map<string, unknown> } {
  const data = new Map<string, unknown>();
  return {
    data,
    async set(key: string, value: unknown) {
      data.set(key, value);
    },
    async get(key: string) {
      return data.get(key);
    },
    async delete(key: string) {
      data.delete(key);
    },
    query() {
      const all = Array.from(data.entries()).map(([key, value]) => ({ key, value }));
      const q = {
        where: () => q,
        cursor: () => q,
        limit: () => q,
        getMany: async () => ({ results: all }),
      };
      return q as never;
    },
  } as never;
}

function evidence(id: string, text: string, sourceUpdatedAt: string): EvidenceRecord {
  return {
    id,
    tenantId: 'tenant-a',
    sourceSystem: 'jira',
    sourceObjectId: id,
    canonicalUrl: null,
    extractedText: text,
    sourceVersion: 'v1',
    observedAt: '2026-10-28T00:00:00Z',
    sourceUpdatedAt,
    contentDigest: `d-${id}`,
    accessContext: { userId: 'user-1', retrievedVia: 'jira' },
    extractionMethod: 'api_field',
    verification: 'unverified',
    staleness: 'current',
  };
}

describe('analysis persistence (CC-002 regression)', () => {
  it('persists findings and a case for a verified contradiction', async () => {
    resetFindingIds();
    resetPropositionIds();
    const kvs = fakeKvs();
    const ev = [
      evidence('ev-1', 'high-value transfers require approval from the controller.', '2026-10-01T00:00:00Z'),
      evidence(
        'ev-2',
        'this high-value transfer does not require additional approval.',
        '2026-10-02T00:00:00Z',
      ),
    ];
    const result = analyze({
      tenantId: 'tenant-a',
      evidence: ev,
      propositions: normalizeAll(ev),
      affectedWork: [{ type: 'jira_issue', key: 'PAY-142' }],
    });
    expect(result.status).toBe('VERIFIED_CONTRADICTION');

    const stored = await persistAnalysisResult('tenant-a', 'user-1', 'PAY-142', result, kvs);
    expect(stored).not.toBeNull();

    // Findings are stored under the exact keys prepareRemediation reads.
    for (const f of result.findings) {
      const rec = kvs.data.get(`finding:tenant-a:${f.findingId}`) as Finding | undefined;
      expect(rec?.findingId).toBe(f.findingId);
      expect(rec?.tenantId).toBe('tenant-a');
      expect(rec?.supportingEvidenceIds.length).toBeGreaterThan(0);
    }

    const repo = new KvsCaseRepository(kvs);
    const record = await repo.get('tenant-a', 'case-pay-142');
    expect(record?.status).toBe('VERIFIED_CONTRADICTION');
    expect(record?.findingIds).toEqual(result.findings.map((f) => f.findingId));
    expect(record?.owner).toBe('user-1');
  });

  it('does not persist a case for consistent / insufficient-evidence results', async () => {
    const kvs = fakeKvs();
    const ev = [evidence('ev-1', 'release is ready for the milestone.', '2026-10-01T00:00:00Z')];
    const result = analyze({
      tenantId: 'tenant-a',
      evidence: ev,
      propositions: normalizeAll(ev),
      affectedWork: [{ type: 'jira_issue', key: 'PAY-1' }],
    });
    expect(result.status).toBe('INSUFFICIENT_EVIDENCE');
    expect(await persistAnalysisResult('tenant-a', 'user-1', 'PAY-1', result, kvs)).toBeNull();
    expect(kvs.data.size).toBe(0);
  });

  it('upsert: re-running analysis keeps one case and merges finding ids', async () => {
    resetFindingIds();
    resetPropositionIds();
    const kvs = fakeKvs();
    const ev = [
      evidence('ev-1', 'high-value transfers require approval from the controller.', '2026-10-01T00:00:00Z'),
      evidence(
        'ev-2',
        'this high-value transfer does not require additional approval.',
        '2026-10-02T00:00:00Z',
      ),
    ];
    const result = analyze({
      tenantId: 'tenant-a',
      evidence: ev,
      propositions: normalizeAll(ev),
      affectedWork: [{ type: 'jira_issue', key: 'PAY-142' }],
    });
    await persistAnalysisResult('tenant-a', 'user-1', 'PAY-142', result, kvs);
    resetFindingIds();
    await persistAnalysisResult('tenant-a', 'user-2', 'PAY-142', result, kvs);

    const repo = new KvsCaseRepository(kvs);
    const record = await repo.get('tenant-a', 'case-pay-142');
    expect(record?.findingIds).toEqual(result.findings.map((f) => f.findingId));
    expect(record?.owner).toBe('user-2');
  });
});

describe('severity recency uses real evidence age (CC-005 regression)', () => {
  it('a 60-day-old evidence pair ranks lower than a fresh pair', async () => {
    resetFindingIds();
    resetPropositionIds();
    const now = new Date('2026-10-28T00:00:00Z');
    const fresh = [
      evidence('ev-1', 'high-value transfers require approval from the controller.', '2026-10-27T00:00:00Z'),
      evidence(
        'ev-2',
        'this high-value transfer does not require additional approval.',
        '2026-10-27T00:00:00Z',
      ),
    ];
    const old = [
      evidence('ev-1', 'high-value transfers require approval from the controller.', '2026-08-01T00:00:00Z'),
      evidence(
        'ev-2',
        'this high-value transfer does not require additional approval.',
        '2026-08-01T00:00:00Z',
      ),
    ];
    const freshResult = analyze(
      { tenantId: 't', evidence: fresh, propositions: normalizeAll(fresh), affectedWork: [], now },
      null,
    );
    resetFindingIds();
    resetPropositionIds();
    const oldResult = analyze(
      { tenantId: 't', evidence: old, propositions: normalizeAll(old), affectedWork: [], now },
      null,
    );
    const freshFinding = freshResult.findings[0]!;
    const oldFinding = oldResult.findings[0]!;
    expect(freshFinding.severity).toBe('HIGH');
    expect(oldFinding.severity).toBe('MEDIUM');
  });
});
