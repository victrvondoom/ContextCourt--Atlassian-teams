/**
 * Tenant-isolated Forge KVS-backed case store.
 *
 * Every key is prefixed with the tenant (CloudId) so cross-tenant reads are
 * structurally impossible. The repository interface is injectable so unit and
 * contract tests can run without Forge storage.
 */

import type { ContradictionStatus } from '../core/types';
export interface CaseRecord {
  caseId: string;
  tenantId: string;
  title: string;
  status: ContradictionStatus;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  findingIds: string[];
  createdAt: string;
  updatedAt: string;
  owner: string | null;
}

export interface CaseRepository {
  put(record: CaseRecord): Promise<void>;
  get(tenantId: string, caseId: string): Promise<CaseRecord | null>;
  list(tenantId: string): Promise<CaseRecord[]>;
}

const PREFIX = 'case:';

function tenantKey(tenantId: string, caseId: string): string {
  return `${PREFIX}${tenantId}:${caseId}`;
}

export interface KvsLike {
  set(key: string, value: unknown): Promise<unknown>;
  get(key: string): Promise<unknown>;
  delete(key: string): Promise<unknown>;
  query(): {
    where<T>(clause: T): KvsQueryLike;
  };
}

interface KvsQueryLike {
  cursor(cursor?: string): KvsQueryLike;
  limit(n?: number): KvsQueryLike;
  fetch(): Promise<{ results: Array<{ key: string; value: unknown }>; nextCursor?: string }>;
}

export class KvsCaseRepository implements CaseRepository {
  constructor(private readonly kvs: KvsLike) {}

  async put(record: CaseRecord): Promise<void> {
    validateTenant(record.tenantId);
    await this.kvs.set(tenantKey(record.tenantId, record.caseId), record);
  }

  async get(tenantId: string, caseId: string): Promise<CaseRecord | null> {
    validateTenant(tenantId);
    const value = (await this.kvs.get(tenantKey(tenantId, caseId))) as CaseRecord | undefined;
    if (!value) return null;
    // Defense in depth: reject reads whose payload tenant differs from the key tenant.
    if (value.tenantId !== tenantId) return null;
    return value;
  }

  async list(tenantId: string): Promise<CaseRecord[]> {
    validateTenant(tenantId);
    const results: CaseRecord[] = [];
    let cursor: string | undefined;
    do {
      const page = await this.kvs.query().where(PREFIX).cursor(cursor).limit(50).fetch();
      for (const item of page.results) {
        if (!item.key.startsWith(`${PREFIX}${tenantId}:`)) continue;
        const v = item.value as CaseRecord;
        if (v?.tenantId === tenantId) results.push(v);
      }
      cursor = page.nextCursor;
    } while (cursor);
    return results;
  }
}

function validateTenant(tenantId: string): void {
  if (!tenantId || typeof tenantId !== 'string') {
    throw new Error('valid tenantId required');
  }
}
