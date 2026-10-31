/**
 * Post-execution verification tests (core/verification.ts).
 *
 * Proves the Scenario E invariant: execution success and verification
 * success are separate facts. An accepted write is only "done" when an
 * independent read-back confirms the resulting state.
 */
import { describe, expect, it } from 'vitest';
import {
  commentIncludesMarker,
  proposalTraceMarker,
  verifyExecutionOutcome,
} from '../../src/core/verification';
import type { RemediationProposal } from '../../src/core/types';

const NOW = new Date('2026-10-31T12:00:00Z');

function proposal(overrides: Partial<RemediationProposal> = {}): RemediationProposal {
  return {
    id: 'prop_case-pay-142_add_decision_reference',
    tenantId: 'tenant-a',
    caseId: 'case-pay-142',
    targetSystem: 'jira',
    target: 'PAY-142',
    operation: 'add_decision_reference',
    expectedChange: 'Reference DEC-88 in acceptance criteria',
    payload: {},
    payloadDigest: 'digest-1',
    supportingFindingIds: ['finding_1'],
    risk: 'low',
    state: 'EXECUTED',
    actor: 'user-1',
    createdAt: NOW.toISOString(),
    binding: null,
    verificationRequirements: [],
    ...overrides,
  };
}

const adfComment = (text: string) => ({
  type: 'doc',
  version: 1,
  content: [{ type: 'paragraph', content: [{ type: 'text', text }] }],
});

describe('proposalTraceMarker / commentIncludesMarker', () => {
  it('marker is unique per proposal and found inside ADF bodies', () => {
    const marker = proposalTraceMarker('prop_x');
    expect(marker).toBe('[contextcourt:prop_x]');
    expect(commentIncludesMarker(adfComment(`done ${marker}`), marker)).toBe(true);
    expect(commentIncludesMarker(adfComment('unrelated comment'), marker)).toBe(false);
    expect(commentIncludesMarker('plain string body with ' + marker, marker)).toBe(true);
  });
});

describe('verifyExecutionOutcome — comment operations', () => {
  it('VERIFIED when the executed comment is read back with its trace marker', async () => {
    const marker = proposalTraceMarker('prop_case-pay-142_add_decision_reference');
    const fetcher = async (path: string) => {
      expect(path).toBe('/rest/api/3/issue/PAY-142?fields=comment');
      return {
        ok: true,
        status: 200,
        json: {
          fields: {
            comment: {
              comments: [
                { id: '101', body: adfComment('older comment') },
                { id: '102', body: adfComment(`ContextCourt remediation executed. ${marker}`) },
              ],
            },
          },
        },
      };
    };
    const res = await verifyExecutionOutcome({
      proposal: proposal(),
      resultRef: 'PAY-142',
      fetcher,
      now: NOW,
    });
    expect(res.outcome).toBe('VERIFIED');
    expect(res.evidenceRef).toContain('PAY-142#comment-102');
    expect(res.detail).toContain('trace marker');
  });

  it('MISMATCH when no comment carries the trace marker (write not confirmed)', async () => {
    const fetcher = async () => ({
      ok: true,
      status: 200,
      json: { fields: { comment: { comments: [{ id: '101', body: adfComment('unrelated') }] } } },
    });
    const res = await verifyExecutionOutcome({
      proposal: proposal(),
      resultRef: 'PAY-142',
      fetcher,
      now: NOW,
    });
    expect(res.outcome).toBe('MISMATCH');
    expect(res.detail).toMatch(/no comment carrying trace marker/);
  });

  it('UNVERIFIED when the target cannot be read back (never reported as success)', async () => {
    const fetcher = async () => ({ ok: false, status: 403, json: {} });
    const res = await verifyExecutionOutcome({
      proposal: proposal(),
      resultRef: 'PAY-142',
      fetcher,
      now: NOW,
    });
    expect(res.outcome).toBe('UNVERIFIED');
    expect(res.detail).toMatch(/could not be read back/);
  });

  it('UNVERIFIED (not crash) when the read-back throws', async () => {
    const fetcher = async () => {
      throw new Error('network down');
    };
    const res = await verifyExecutionOutcome({
      proposal: proposal(),
      resultRef: 'PAY-142',
      fetcher,
      now: NOW,
    });
    expect(res.outcome).toBe('UNVERIFIED');
    expect(res.detail).toMatch(/network down/);
  });
});

describe('verifyExecutionOutcome — created issues', () => {
  it('VERIFIED when the created issue is read back by key', async () => {
    const fetcher = async (path: string) => {
      expect(path).toBe('/rest/api/3/issue/PAY-200?fields=summary');
      return { ok: true, status: 200, json: { fields: { summary: 'ContextCourt remediation: fix' } } };
    };
    const res = await verifyExecutionOutcome({
      proposal: proposal({ operation: 'create_remediation_issue' }),
      resultRef: 'PAY-200',
      fetcher,
      now: NOW,
    });
    expect(res.outcome).toBe('VERIFIED');
    expect(res.evidenceRef).toBe('PAY-200');
  });

  it('MISMATCH when the created issue key cannot be read back', async () => {
    const fetcher = async () => ({ ok: false, status: 404, json: {} });
    const res = await verifyExecutionOutcome({
      proposal: proposal({ operation: 'create_remediation_issue' }),
      resultRef: 'PAY-404',
      fetcher,
      now: NOW,
    });
    expect(res.outcome).toBe('MISMATCH');
  });

  it('UNVERIFIED when there is no result reference at all', async () => {
    const res = await verifyExecutionOutcome({
      proposal: proposal(),
      resultRef: null,
      fetcher: async () => ({ ok: true, status: 200, json: {} }),
      now: NOW,
    });
    expect(res.outcome).toBe('UNVERIFIED');
  });
});

describe('execution vs verification are separate facts', () => {
  it('a proposal can be EXECUTED yet UNVERIFIED — the states coexist honestly', async () => {
    const fetcher = async () => ({ ok: false, status: 500, json: {} });
    const res = await verifyExecutionOutcome({
      proposal: proposal({ state: 'EXECUTED' }),
      resultRef: 'PAY-142',
      fetcher,
      now: NOW,
    });
    // Execution "succeeded" (state EXECUTED) but verification could not confirm.
    expect(res.outcome).not.toBe('VERIFIED');
  });
});
