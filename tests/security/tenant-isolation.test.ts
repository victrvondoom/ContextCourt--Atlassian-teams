import { KvsCaseRepository, type KvsLike } from '../../src/storage/caseStore';
import type { CaseRecord } from '../../src/storage/caseStore';

function fakeKvs(): KvsLike & { data: Map<string, CaseRecord> } {
  const data = new Map<string, CaseRecord>();
  return {
    data,
    async set(key: string, value: unknown) {
      data.set(key, value as CaseRecord);
    },
    async get(key: string) {
      return data.get(key);
    },
    async delete(key: string) {
      data.delete(key);
    },
    query() {
      const all = Array.from(data.entries()).map(([key, value]) => ({ key, value }));
      const q = {
        where: () => q,
        cursor: () => q,
        limit: () => q,
        getMany: async () => ({ results: all }),
      };
      return q as never;
    },
  } as never;
}

function record(caseId: string, tenantId: string): CaseRecord {
  return {
    caseId,
    tenantId,
    title: `Case ${caseId}`,
    status: 'POTENTIAL_CONTRADICTION',
    severity: 'HIGH',
    findingIds: ['f1'],
    createdAt: '2026-10-28T00:00:00Z',
    updatedAt: '2026-10-28T00:00:00Z',
    owner: null,
  };
}

describe('tenant isolation (security tests)', () => {
  it('INVARIANT: tenant A cannot read tenant B case', async () => {
    const kvs = fakeKvs();
    const repo = new KvsCaseRepository(kvs);
    await repo.put(record('case-1', 'tenant-a'));
    // tenant-b reads case-1 → isolated by key prefix
    expect(await repo.get('tenant-b', 'case-1')).toBeNull();
    expect(await repo.get('tenant-a', 'case-1')).not.toBeNull();
  });

  it('rejects reads whose stored payload tenant differs from the key tenant', async () => {
    const kvs = fakeKvs();
    const repo = new KvsCaseRepository(kvs);
    // Simulate a corrupted/poisoned record: payload claims tenant-b, stored under tenant-a key.
    const poisoned = record('case-1', 'tenant-b');
    kvs.data.set('case:tenant-a:case-1', poisoned);
    expect(await repo.get('tenant-a', 'case-1')).toBeNull();
  });

  it('list only returns the caller tenant records', async () => {
    const kvs = fakeKvs();
    const repo = new KvsCaseRepository(kvs);
    await repo.put(record('c1', 'tenant-a'));
    await repo.put(record('c2', 'tenant-b'));
    const list = await repo.list('tenant-a');
    expect(list.map((r) => r.caseId)).toEqual(['c1']);
  });

  it('rejects invalid tenant ids on write', async () => {
    const repo = new KvsCaseRepository(fakeKvs());
    await expect(repo.put(record('c1', ''))).rejects.toThrow(/tenantId/);
  });
});
