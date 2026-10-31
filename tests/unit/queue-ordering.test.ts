/**
 * Review-queue ordering tests (core/queue.ts).
 *
 * Proves the Scenario F invariants documented in docs/QUEUE_DESIGN.md:
 *  1. Determinism — identical inputs produce identical order.
 *  2. Severity dominance — severity outranks risk and age.
 *  3. Age monotonicity — older proposals rank higher within a class.
 *  4. Age bound — waiting can never cross a severity class boundary.
 *  5. Pending-first — decided/executed items never outrank reviewable work.
 */
import { describe, expect, it } from 'vitest';
import { orderReviewQueue, reviewUtility, priorityExplanationFor } from '../../src/core/queue';
import type { RemediationProposal } from '../../src/core/types';

const NOW = new Date('2026-10-31T12:00:00Z');

function p(overrides: Partial<RemediationProposal> = {}): RemediationProposal {
  return {
    id: 'prop_x',
    tenantId: 't',
    caseId: 'case-x',
    targetSystem: 'jira',
    target: 'PAY-1',
    operation: 'add_decision_reference',
    expectedChange: 'x',
    payload: {},
    payloadDigest: 'd',
    supportingFindingIds: ['f1'],
    risk: 'low',
    state: 'PENDING_APPROVAL',
    actor: 'a1',
    createdAt: NOW.toISOString(),
    binding: null,
    verificationRequirements: [],
    severity: 'MEDIUM',
    ...overrides,
  };
}

const hoursAgo = (h: number) => new Date(NOW.getTime() - h * 3600 * 1000);

describe('review utility', () => {
  it('severity dominates risk and age', () => {
    const criticalOld = reviewUtility(p({ severity: 'CRITICAL', createdAt: hoursAgo(0).toISOString() }), NOW);
    const highRiskyNew = reviewUtility(
      p({ severity: 'HIGH', risk: 'high', createdAt: NOW.toISOString() }),
      NOW,
    );
    expect(criticalOld).toBeGreaterThan(highRiskyNew);
  });

  it('age is bounded below one severity class step', () => {
    const veryOld = reviewUtility(p({ severity: 'LOW', createdAt: hoursAgo(10000).toISOString() }), NOW);
    const freshMedium = reviewUtility(p({ severity: 'MEDIUM', createdAt: NOW.toISOString() }), NOW);
    // LOW base 100 + max 90 age = 190 < MEDIUM base 200: bound holds.
    expect(veryOld).toBeLessThan(freshMedium);
    expect(veryOld).toBe(190);
  });

  it('risk boosts within a severity class', () => {
    const high = reviewUtility(p({ risk: 'high' }), NOW);
    const low = reviewUtility(p({ risk: 'low' }), NOW);
    expect(high - low).toBe(40);
  });

  it('older proposals accrue priority within the same class', () => {
    const older = reviewUtility(p({ createdAt: hoursAgo(10).toISOString() }), NOW);
    const newer = reviewUtility(p({ createdAt: hoursAgo(1).toISOString() }), NOW);
    expect(older).toBeGreaterThan(newer);
  });

  it('missing severity degrades honestly to LOW (never invented)', () => {
    const legacy = p({ severity: undefined });
    expect(reviewUtility(legacy, NOW)).toBe(100);
    expect(priorityExplanationFor(legacy, NOW)).toContain('LOW severity');
  });
});

describe('orderReviewQueue', () => {
  const fixtures = [
    p({ id: 'prop-a', severity: 'HIGH', createdAt: hoursAgo(2).toISOString() }),
    p({ id: 'prop-b', severity: 'CRITICAL', risk: 'high', createdAt: hoursAgo(1).toISOString() }),
    p({ id: 'prop-c', severity: 'LOW', createdAt: hoursAgo(48).toISOString() }),
    p({ id: 'prop-d', severity: 'MEDIUM', createdAt: hoursAgo(30).toISOString() }),
    p({ id: 'prop-e', severity: 'CRITICAL', state: 'EXECUTED' }),
  ];

  it('orders by documented utility with a deterministic result', () => {
    const run1 = orderReviewQueue(fixtures, NOW).map((r) => r.proposal.id);
    const run2 = orderReviewQueue([...fixtures].reverse(), NOW).map((r) => r.proposal.id);
    expect(run1).toEqual(run2); // determinism independent of input order
    // CRITICAL pending (prop-b) first, then HIGH, then MEDIUM vs LOW by utility.
    expect(run1[0]).toBe('prop-b');
    expect(run1).toEqual(['prop-b', 'prop-a', 'prop-d', 'prop-c', 'prop-e']);
  });

  it('pending proposals always rank before decided/executed ones', () => {
    const ranked = orderReviewQueue(fixtures, NOW);
    const firstDecided = ranked.findIndex((r) => r.proposal.state !== 'PENDING_APPROVAL');
    for (let i = 0; i < firstDecided; i++) {
      expect(ranked[i]!.proposal.state).toBe('PENDING_APPROVAL');
    }
    expect(ranked[ranked.length - 1]!.proposal.id).toBe('prop-e');
  });

  it('every ranked item carries a human-readable priority explanation', () => {
    for (const r of orderReviewQueue(fixtures, NOW)) {
      expect(r.priorityExplanation).toMatch(/severity \(/);
      expect(r.priorityExplanation).toMatch(/risk \(\+/);
      expect(r.priorityExplanation).toMatch(/h waiting/);
    }
  });

  it('property: for random-ish permutations, order is stable', () => {
    // Deterministic pseudo-permutation sweep.
    for (let seed = 0; seed < 20; seed++) {
      const shuffled = [...fixtures];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = (seed * (i + 3)) % (i + 1);
        [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
      }
      expect(orderReviewQueue(shuffled, NOW).map((r) => r.proposal.id)).toEqual([
        'prop-b',
        'prop-a',
        'prop-d',
        'prop-c',
        'prop-e',
      ]);
    }
  });
});
