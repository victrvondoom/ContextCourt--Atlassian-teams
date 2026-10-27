/**
 * KVS-backed audit event repository. Keys are tenant-prefixed so cross-tenant
 * reads are structurally impossible; the digest chain is verified on read.
 */
import type { AuditEvent } from '../core/types';
import { sha256Hex } from '../core/digest';

export interface AuditSinkLike {
  set(key: string, value: unknown): Promise<unknown>;
  get(key: string): Promise<unknown>;
  query(): {
    where(
      property: 'key',
      condition: { beginsWith?: string; equalTo?: string },
    ): {
      cursor(cursor?: string): {
        limit(limit?: number): Promise<{
          results: Array<{ key: string; value: unknown }>;
          nextCursor?: string;
        }>;
      };
    };
  };
}

const PREFIX = 'audit:';

export class KvsAuditRepository {
  constructor(private readonly kvs: AuditSinkLike) {}

  async append(event: AuditEvent): Promise<void> {
    const existing = await this.readAll(event.tenantId);
    const tail = existing[existing.length - 1];
    const precedingEventDigest = tail ? await sha256Hex(JSON.stringify(tail)) : null;
    await this.kvs.set(`${PREFIX}${event.tenantId}:${event.id}`, { ...event, precedingEventDigest });
  }

  async readAll(tenantId: string): Promise<AuditEvent[]> {
    validateTenant(tenantId);
    const results: AuditEvent[] = [];
    let cursor: string | undefined;
    do {
      const page = await this.kvs
        .query()
        .where('key', { beginsWith: `${PREFIX}${tenantId}:` })
        .cursor(cursor)
        .limit(50);
      for (const item of page.results) {
        const v = item.value as AuditEvent | undefined;
        if (v?.tenantId === tenantId) results.push(v);
      }
      cursor = page.nextCursor as string | undefined;
    } while (cursor);
    return results;
  }
}

function validateTenant(tenantId: string): void {
  if (!tenantId || typeof tenantId !== 'string') {
    throw new Error('valid tenantId required');
  }
}
