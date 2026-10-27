import { recordAuditEvent, verifyAuditChain, type AuditSink } from '../../src/audit/auditLog';
import type { AuditEvent } from '../../src/core/types';

function memorySink(): AuditSink & { events: AuditEvent[] } {
  const events: AuditEvent[] = [];
  return {
    events,
    async append(e) {
      events.push(e);
    },
    async readAll(tenantId) {
      return events.filter((e) => e.tenantId === tenantId);
    },
  };
}

const REQ = {
  tenantId: 't1',
  actor: 'human-1',
  action: 'approve_remediation',
  target: 'prop_case-1',
  result: 'success' as const,
  linkedEvidenceIds: ['e1'],
  requestFingerprint: 'fp-1',
};

describe('audit ledger', () => {
  it('chains events via preceding digest', async () => {
    const sink = memorySink();
    const first = await recordAuditEvent(sink, REQ, new Date('2026-10-28T10:00:00Z'));
    const second = await recordAuditEvent(
      sink,
      { ...REQ, actor: 'agent-ai', action: 'prepare_remediation' },
      new Date('2026-10-28T10:01:00Z'),
    );
    expect(first.precedingEventDigest).toBeNull();
    expect(second.precedingEventDigest).toBeTruthy();
    expect(await verifyAuditChain(sink, 't1')).toBe(true);
  });

  it('INVARIANT: tampering with stored history is detectable', async () => {
    const sink = memorySink();
    await recordAuditEvent(sink, REQ, new Date('2026-10-28T10:00:00Z'));
    await recordAuditEvent(sink, { ...REQ, action: 'execute_remediation' }, new Date('2026-10-28T10:01:00Z'));
    // Attacker alters the first event's actor after the fact.
    sink.events[0]!.actor = 'attacker';
    expect(await verifyAuditChain(sink, 't1')).toBe(false);
  });

  it('keeps tenants in separate chains', async () => {
    const sink = memorySink();
    await recordAuditEvent(sink, REQ, new Date('2026-10-28T10:00:00Z'));
    const other = await recordAuditEvent(sink, { ...REQ, tenantId: 't2' }, new Date('2026-10-28T10:01:00Z'));
    expect(other.precedingEventDigest).toBeNull();
  });
});
