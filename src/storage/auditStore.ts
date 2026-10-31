/**
 * KVS-backed audit event repository. Keys are tenant-prefixed so cross-tenant
 * reads are structurally impossible; the digest chain is verified on read.
 */
import type { AuditEvent } from '../core/types';
import { orderAuditEvents } from '../audit/auditLog';

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

/**
 * KVS-backed audit event repository. Keys are tenant-prefixed so cross-tenant
 * reads are structurally impossible; the digest chain is verified on read.
 *
 * Chain building lives in `audit/auditLog.recordAuditEvent`; `append` stores
 * the event exactly as given (single source of truth for chain digests).
 */
export class KvsAuditRepository {
  constructor(private readonly kvs: AuditSinkLike) {}

  async append(event: AuditEvent): Promise<void> {
    await this.kvs.set(`${PREFIX}${event.tenantId}:${event.id}`, event);
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
    // KVS query order is not guaranteed; chain logic needs a stable order.
    return orderAuditEvents(results);
  }
}

function validateTenant(tenantId: string): void {
  if (!tenantId || typeof tenantId !== 'string') {
    throw new Error('valid tenantId required');
  }
}
