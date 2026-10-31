/**
 * Audit chain determinism and collision regressions (CC-003).
 */
import { describe, expect, it } from 'vitest';
import {
  orderAuditEvents,
  recordAuditEvent,
  verifyAuditChain,
  type AuditSink,
} from '../../src/audit/auditLog';
import { KvsAuditRepository } from '../../src/storage/auditStore';
import type { AuditEvent } from '../../src/core/types';

function shuffledSink(): AuditSink & { events: AuditEvent[] } {
  const events: AuditEvent[] = [];
  return {
    events,
    async append(e) {
      events.push(e);
    },
    // Storage order is NOT guaranteed (e.g. KVS query order) — return shuffled.
    async readAll(tenantId) {
      return events
        .filter((e) => e.tenantId === tenantId)
        .slice()
        .reverse();
    },
  };
}

const REQ = {
  tenantId: 't1',
  actor: 'human-1',
  action: 'prepare_remediation',
  target: 'prop_x',
  result: 'success' as const,
  linkedEvidenceIds: ['e1'],
  requestFingerprint: 'fp-1',
};

describe('audit chain determinism (CC-003 regression)', () => {
  it('produces collision-free unique event ids', async () => {
    const sink = shuffledSink();
    const now = new Date('2026-10-28T10:00:00Z');
    const a = await recordAuditEvent(sink, REQ, now);
    const b = await recordAuditEvent(sink, REQ, now);
    expect(a.id).not.toBe(b.id);
  });

  it('verifies the chain even when storage returns events out of order', async () => {
    const sink = shuffledSink();
    await recordAuditEvent(sink, REQ, new Date('2026-10-28T10:00:00Z'));
    await recordAuditEvent(sink, { ...REQ, actor: 'human-2' }, new Date('2026-10-28T10:01:00Z'));
    await recordAuditEvent(sink, { ...REQ, actor: 'human-3' }, new Date('2026-10-28T10:02:00Z'));
    expect(await verifyAuditChain(sink, 't1')).toBe(true);
  });

  it('orderAuditEvents is a stable sort by timestamp then id', () => {
    const e = (id: string, ts: string): AuditEvent => ({
      id,
      tenantId: 't',
      actor: 'a',
      action: 'x',
      target: 'y',
      timestamp: ts,
      requestFingerprint: 'fp',
      result: 'success',
      linkedEvidenceIds: [],
      precedingEventDigest: null,
    });
    const ordered = orderAuditEvents([
      e('b', '2026-01-01T00:00:00Z'),
      e('a', '2026-01-01T00:00:00Z'),
      e('c', '2025-01-01T00:00:00Z'),
    ]);
    expect(ordered.map((x) => x.id)).toEqual(['c', 'a', 'b']);
  });
});

describe('KvsAuditRepository readAll determinism (CC-012)', () => {
  it('returns events in chain order regardless of map iteration order', async () => {
    const events = new Map<string, AuditEvent>();
    const mk = (id: string, ts: string): AuditEvent => ({
      id,
      tenantId: 't1',
      actor: 'a',
      action: 'x',
      target: 'y',
      timestamp: ts,
      requestFingerprint: 'fp',
      result: 'success',
      linkedEvidenceIds: [],
      precedingEventDigest: null,
    });
    // Insert out of order.
    events.set('audit:t1:c', mk('c', '2026-01-03T00:00:00Z'));
    events.set('audit:t1:a', mk('a', '2026-01-01T00:00:00Z'));
    events.set('audit:t1:b', mk('b', '2026-01-02T00:00:00Z'));
    const repo = new KvsAuditRepository({
      async set() {},
      async get(key: string) {
        return events.get(key);
      },
      query() {
        const all = Array.from(events.entries())
          .map(([key, value]: [string, unknown]) => ({
            key,
            value,
          }))
          .reverse();
        const q = {
          where: () => q,
          cursor: () => q,
          limit: async () => ({ results: all, nextCursor: undefined }),
        };
        return q as never;
      },
    } as never);
    const list = await repo.readAll('t1');
    expect(list.map((e) => e.id)).toEqual(['a', 'b', 'c']);
  });
});

describe('same-millisecond chaining (2026-10-31 regression)', () => {
  it('events appended within the same millisecond chain in insertion order and verify', async () => {
    const sink = shuffledSink();
    const sameMs = new Date('2026-10-31T12:00:00.000Z');
    // Sequence the awaited appends with the same timestamp to force id tiebreaks.
    await recordAuditEvent(sink, mkReq('t1', 'a'), sameMs);
    await recordAuditEvent(sink, mkReq('t1', 'b'), sameMs);
    await recordAuditEvent(sink, mkReq('t1', 'c'), sameMs);
    const events = orderAuditEvents(await sink.readAll('t1'));
    expect(events).toHaveLength(3);
    // Sorted order must match insertion order (a, b, c) — not a random tiebreak.
    expect(events.map((e) => e.action)).toEqual(['a', 'b', 'c']);
    expect(await verifyAuditChain(sink, 't1')).toBe(true);
  });
});

function mkReq(tenantId: string, action: string) {
  return {
    tenantId,
    actor: 'user-1',
    action,
    target: 'x',
    result: 'success' as const,
    linkedEvidenceIds: [],
    requestFingerprint: `fp-${action}`,
  };
}
