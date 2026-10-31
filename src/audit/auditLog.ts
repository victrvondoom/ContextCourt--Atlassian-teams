/**
 * Digest-chained audit events.
 *
 * Each event records the digest of its predecessor, making history tamper-
 * EVIDENT: any modification to a stored event breaks the chain. Storage is
 * Forge-hosted KVS; this is not a write-once immutable ledger and is never
 * claimed to be one.
 */
import { sha256Hex } from '../core/digest';
import type { AuditEvent } from '../core/types';

export interface AuditSink {
  append(event: AuditEvent): Promise<void>;
  /** In-order read of the tenant's chain. */
  readAll(tenantId: string): Promise<AuditEvent[]>;
}

export interface AuditWriteRequest {
  tenantId: string;
  actor: string;
  action: string;
  target: string;
  result: AuditEvent['result'];
  linkedEvidenceIds: string[];
  requestFingerprint: string;
}

/** Build and append the next event, chaining to the current tail digest. */
export async function recordAuditEvent(
  sink: AuditSink,
  req: AuditWriteRequest,
  now: Date,
): Promise<AuditEvent> {
  const existing = orderAuditEvents(await sink.readAll(req.tenantId));
  const tail = existing[existing.length - 1];
  const precedingDigest = tail ? await sha256Hex(JSON.stringify(tail)) : null;
  // Monotonic ledger clock (CC-029): the chain is built in insertion order and
  // read in (timestamp, id) order, so an event whose wall clock reads EARLIER
  // than the tail (clock skew, or a caller mixing clock sources) would break
  // chain verification. The ledger timestamp is therefore advanced to the
  // tail's timestamp when the wall clock would move it backwards — a logical
  // clock, standard for append-only ledgers.
  const tailMs = tail ? new Date(tail.timestamp).getTime() : Number.NEGATIVE_INFINITY;
  const effectiveMs = Math.max(now.getTime(), tailMs);
  const effective = new Date(effectiveMs);
  // Collision-free AND insertion-monotonic id. The sequence number makes the
  // (timestamp, id) sort order match insertion order even when several events
  // land in the same millisecond — otherwise the chain would be built in one
  // order and verified in another (CC-003 regression class).
  const id = `audit_${req.tenantId}_${effective.getTime()}_${String(existing.length).padStart(6, '0')}_${crypto.randomUUID().slice(0, 8)}`;
  const event: AuditEvent = {
    id,
    tenantId: req.tenantId,
    actor: req.actor,
    action: req.action,
    target: req.target,
    timestamp: effective.toISOString(),
    requestFingerprint: req.requestFingerprint,
    result: req.result,
    linkedEvidenceIds: req.linkedEvidenceIds,
    precedingEventDigest: precedingDigest,
  };
  await sink.append(event);
  return event;
}

/** Deterministic storage order: by timestamp, then id as tiebreaker. */
export function orderAuditEvents(events: AuditEvent[]): AuditEvent[] {
  return [...events].sort((a, b) =>
    a.timestamp === b.timestamp ? a.id.localeCompare(b.id) : a.timestamp.localeCompare(b.timestamp),
  );
}

/** Verify the stored chain — returns false when history was modified. */
export async function verifyAuditChain(sink: AuditSink, tenantId: string): Promise<boolean> {
  const events = orderAuditEvents(await sink.readAll(tenantId));
  for (let i = 1; i < events.length; i++) {
    const prev = events[i - 1]!;
    const digest = await sha256Hex(JSON.stringify(prev));
    if (events[i]!.precedingEventDigest !== digest) return false;
  }
  return true;
}
