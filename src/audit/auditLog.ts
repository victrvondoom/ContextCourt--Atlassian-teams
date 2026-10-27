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
  const existing = await sink.readAll(req.tenantId);
  const tail = existing[existing.length - 1];
  const precedingDigest = tail ? await sha256Hex(JSON.stringify(tail)) : null;
  const event: AuditEvent = {
    id: `audit_${req.tenantId}_${existing.length + 1}`,
    tenantId: req.tenantId,
    actor: req.actor,
    action: req.action,
    target: req.target,
    timestamp: now.toISOString(),
    requestFingerprint: req.requestFingerprint,
    result: req.result,
    linkedEvidenceIds: req.linkedEvidenceIds,
    precedingEventDigest: precedingDigest,
  };
  await sink.append(event);
  return event;
}

/** Verify the stored chain — returns false when history was modified. */
export async function verifyAuditChain(sink: AuditSink, tenantId: string): Promise<boolean> {
  const events = await sink.readAll(tenantId);
  for (let i = 1; i < events.length; i++) {
    const prev = events[i - 1]!;
    const digest = await sha256Hex(JSON.stringify(prev));
    if (events[i]!.precedingEventDigest !== digest) return false;
  }
  return true;
}
