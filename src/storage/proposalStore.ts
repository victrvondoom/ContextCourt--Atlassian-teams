/**
 * KVS-backed remediation proposal repository.
 *
 * Keys are tenant-prefixed (`proposal:{tenant}:{id}`) so cross-tenant reads
 * are structurally impossible; the payload tenant is re-checked on every read
 * as defense in depth. Also stores the per-proposal registry of executed
 * payload digests used for replay rejection (core/approval.ts).
 */
import type { RemediationProposal } from '../core/types';

export interface KvsLike {
  set(key: string, value: unknown): Promise<unknown>;
  get(key: string): Promise<unknown>;
  delete(key: string): Promise<unknown>;
  query(): KvsQueryLike;
}

interface KvsQueryLike {
  where(property: 'key', condition: { beginsWith?: string }): KvsQueryLike;
  cursor(cursor?: string): KvsQueryLike;
  limit(limit?: number): KvsQueryLike;
  getMany<T>(): Promise<{ results: Array<{ key: string; value: T }>; nextCursor?: string }>;
}

const PREFIX = 'proposal:';
export const EXECUTED_DIGEST_PREFIX = 'executed-digests:';

export class KvsProposalRepository {
  constructor(private readonly kvs: KvsLike) {}

  async put(proposal: RemediationProposal): Promise<void> {
    validateTenant(proposal.tenantId);
    await this.kvs.set(tenantKey(proposal.tenantId, proposal.id), proposal);
  }

  async get(tenantId: string, proposalId: string): Promise<RemediationProposal | null> {
    validateTenant(tenantId);
    const value = (await this.kvs.get(tenantKey(tenantId, proposalId))) as RemediationProposal | undefined;
    if (!value) return null;
    // Defense in depth: reject reads whose payload tenant differs from the key tenant.
    if (value.tenantId !== tenantId) return null;
    return value;
  }

  async list(tenantId: string): Promise<RemediationProposal[]> {
    validateTenant(tenantId);
    const results: RemediationProposal[] = [];
    let cursor: string | undefined;
    do {
      const page = await this.kvs
        .query()
        .where('key', { beginsWith: PREFIX })
        .cursor(cursor)
        .limit(50)
        .getMany<RemediationProposal>();
      for (const item of page.results) {
        if (!item.key.startsWith(`${PREFIX}${tenantId}:`)) continue;
        const v = item.value as RemediationProposal;
        if (v?.tenantId === tenantId) results.push(v);
      }
      cursor = page.nextCursor;
    } while (cursor);
    // Newest first — the review queue cares about recent activity.
    return results.sort((a, b) =>
      a.createdAt === b.createdAt ? a.id.localeCompare(b.id) : b.createdAt.localeCompare(a.createdAt),
    );
  }

  /** Append an executed payload digest to the proposal's replay registry. */
  async recordExecutedDigest(tenantId: string, proposalId: string, digest: string): Promise<void> {
    validateTenant(tenantId);
    const key = `${EXECUTED_DIGEST_PREFIX}${tenantId}:${proposalId}`;
    const existing = (await this.kvs.get(key)) as string[] | undefined;
    const digests = existing ?? [];
    if (!digests.includes(digest)) digests.push(digest);
    await this.kvs.set(key, digests);
  }

  /** Digests already executed for this proposal — replayed approvals must be rejected. */
  async executedDigests(tenantId: string, proposalId: string): Promise<string[]> {
    validateTenant(tenantId);
    const value = (await this.kvs.get(`${EXECUTED_DIGEST_PREFIX}${tenantId}:${proposalId}`)) as
      string[] | undefined;
    return Array.isArray(value) ? value : [];
  }
}

function tenantKey(tenantId: string, proposalId: string): string {
  return `${PREFIX}${tenantId}:${proposalId}`;
}

function validateTenant(tenantId: string): void {
  if (!tenantId || typeof tenantId !== 'string') {
    throw new Error('valid tenantId required');
  }
}
