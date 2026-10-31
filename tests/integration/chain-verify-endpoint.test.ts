/**
 * Interactive audit-chain verification tests (verifyAuditChainCore).
 *
 * The Audit ledger UI exposes tamper-evidence as a button; these tests prove
 * the endpoint behind it: an intact chain verifies, a mutated stored event is
 * detected, and an empty ledger is honestly reported as empty-and-valid.
 */
import { describe, expect, it } from 'vitest';
import { verifyAuditChainCore } from '../../src/resolvers';
import { recordAuditEvent } from '../../src/audit/auditLog';
import { FakeKvs } from '../helpers/fakeKvs';
import type { AuditEvent } from '../../src/core/types';

function req(action: string) {
  return {
    tenantId: 'tenant-a',
    actor: 'user-1',
    action,
    target: 'PAY-142',
    result: 'success' as const,
    linkedEvidenceIds: ['ev-1'],
    requestFingerprint: `fp-${action}`,
  };
}

describe('verifyAuditChainCore', () => {
  it('an intact ledger verifies with the event count', async () => {
    const kvs = new FakeKvs();
    const sink = {
      async append(e: AuditEvent) {
        await kvs.set(`audit:${e.tenantId}:${e.id}`, e);
      },
      async readAll() {
        return Array.from(kvs.data.values()) as AuditEvent[];
      },
    };
    await recordAuditEvent(sink as never, req('analysis_run'), new Date('2026-10-31T12:00:00Z'));
    await recordAuditEvent(sink as never, req('prepare_remediation'), new Date('2026-10-31T12:01:00Z'));
    await recordAuditEvent(sink as never, req('proposal_approved'), new Date('2026-10-31T12:02:00Z'));

    const res = await verifyAuditChainCore('tenant-a', kvs as never);
    expect(res.status).toBe('OK');
    expect(res.valid).toBe(true);
    expect(res.eventCount).toBe(3);
    expect(res.firstEventAt).toBe(new Date('2026-10-31T12:00:00Z').toISOString());
  });

  it('a mutated stored event is detected as a broken chain', async () => {
    const kvs = new FakeKvs();
    const sink = {
      async append(e: AuditEvent) {
        await kvs.set(`audit:${e.tenantId}:${e.id}`, e);
      },
      async readAll() {
        return Array.from(kvs.data.values()) as AuditEvent[];
      },
    };
    await recordAuditEvent(sink as never, req('analysis_run'), new Date('2026-10-31T12:00:00Z'));
    await recordAuditEvent(sink as never, req('proposal_approved'), new Date('2026-10-31T12:01:00Z'));

    // Tamper: rewrite history by editing a stored event in place.
    const keys = Array.from(kvs.data.keys());
    const tampered = { ...(kvs.data.get(keys[0]!) as AuditEvent), result: 'failure' as const };
    kvs.data.set(keys[0]!, tampered);

    const res = await verifyAuditChainCore('tenant-a', kvs as never);
    expect(res.valid).toBe(false);
    expect(res.eventCount).toBe(2);
  });

  it('an empty ledger is honestly empty-and-valid', async () => {
    const kvs = new FakeKvs();
    const res = await verifyAuditChainCore('tenant-empty', kvs as never);
    expect(res.status).toBe('OK');
    expect(res.valid).toBe(true);
    expect(res.eventCount).toBe(0);
    expect(res.firstEventAt).toBeNull();
  });
});
