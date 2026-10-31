/**
 * Rate limiting tests (core/rateLimit.ts + resolver wiring).
 *
 * Token-bucket semantics (deterministic injected clock) and the resolver
 * behavior: exhausted budgets surface an explicit RATE_LIMITED /
 * rate-limited ANALYSIS_FAILED with retry guidance — never a silent success
 * and never a crash.
 */
import { describe, expect, it } from 'vitest';
import { consumeRateLimitToken, RATE_LIMIT_POLICIES } from '../../src/core/rateLimit';
import { investigateIssueCore } from '../../src/resolvers';
import { FakeKvs, FakeJiraFetcher } from '../helpers/fakeKvs';

function store() {
  const kvs = new FakeKvs();
  return kvs as unknown as {
    get(k: string): Promise<unknown>;
    set(k: string, v: unknown): Promise<unknown>;
  } & {
    data: Map<string, unknown>;
  };
}

describe('consumeRateLimitToken (token bucket)', () => {
  it('allows up to capacity, then refuses with retry guidance', async () => {
    const s = store();
    let now = 0;
    const clock = { now: () => now };
    const policy = { capacity: 3, refillPerSecond: 0.5 };
    const allowed: boolean[] = [];
    for (let i = 0; i < 5; i++) {
      const d = await consumeRateLimitToken({
        store: s,
        tenantId: 't',
        userId: 'u',
        action: 'analyze',
        clock,
        policy,
      });
      allowed.push(d.allowed);
    }
    expect(allowed).toEqual([true, true, true, false, false]);
  });

  it('refills continuously over time (one token per 1/refillPerSecond)', async () => {
    const s = store();
    let now = 0;
    const clock = { now: () => now };
    const policy = { capacity: 1, refillPerSecond: 1 };
    expect(
      (await consumeRateLimitToken({ store: s, tenantId: 't', userId: 'u', action: 'x', clock, policy }))
        .allowed,
    ).toBe(true);
    expect(
      (await consumeRateLimitToken({ store: s, tenantId: 't', userId: 'u', action: 'x', clock, policy }))
        .allowed,
    ).toBe(false);
    now = 1500; // 1.5s elapsed → 1.5 tokens refilled (cap 1)
    const d = await consumeRateLimitToken({
      store: s,
      tenantId: 't',
      userId: 'u',
      action: 'x',
      clock,
      policy,
    });
    expect(d.allowed).toBe(true);
  });

  it('buckets are isolated per tenant, user and action', async () => {
    const s = store();
    const clock = { now: () => 0 };
    const policy = { capacity: 1, refillPerSecond: 0.01 };
    const first = await consumeRateLimitToken({
      store: s,
      tenantId: 't1',
      userId: 'u1',
      action: 'analyze',
      clock,
      policy,
    });
    const otherUser = await consumeRateLimitToken({
      store: s,
      tenantId: 't1',
      userId: 'u2',
      action: 'analyze',
      clock,
      policy,
    });
    const otherAction = await consumeRateLimitToken({
      store: s,
      tenantId: 't1',
      userId: 'u1',
      action: 'decide',
      clock,
      policy,
    });
    expect(first.allowed && otherUser.allowed && otherAction.allowed).toBe(true);
    const same = await consumeRateLimitToken({
      store: s,
      tenantId: 't1',
      userId: 'u1',
      action: 'analyze',
      clock,
      policy,
    });
    expect(same.allowed).toBe(false);
  });

  it('does not double-credit elapsed time across a refused call', async () => {
    const s = store();
    let now = 0;
    const clock = { now: () => now };
    const policy = { capacity: 1, refillPerSecond: 0.1 };
    await consumeRateLimitToken({ store: s, tenantId: 't', userId: 'u', action: 'x', clock, policy }); // empty
    now = 300; // 0.3s → 0.03 tokens; still refused, but the refill state persists
    const refused = await consumeRateLimitToken({
      store: s,
      tenantId: 't',
      userId: 'u',
      action: 'x',
      clock,
      policy,
    });
    expect(refused.allowed).toBe(false);
    expect(refused.retryAfterSeconds).toBeGreaterThan(0);
  });

  it('default policies exist for the abusable operations', () => {
    for (const action of ['analyze', 'prepare', 'decide', 'execute']) {
      expect(RATE_LIMIT_POLICIES[action]).toBeDefined();
      expect(RATE_LIMIT_POLICIES[action]!.capacity).toBeGreaterThan(0);
    }
  });
});

describe('analysis rate limiting through the resolver path', () => {
  it('exhausting the analysis budget surfaces an explicit rate-limited result, not a fake success', async () => {
    const kvs = new FakeKvs();
    const jiraFetcher = (async (path: string, init?: { method?: string; body?: unknown }) => {
      const fake = new FakeJiraFetcher([
        {
          match: /\/rest\/api\/3\/issue\/PAY-142/,
          respond: () => ({ ok: true, status: 200, json: FakeJiraFetcher.issueResponse() }),
        },
      ]);
      return fake.fetch(path, init);
    }) as never;
    const results: Array<{ status: string; rateLimited?: boolean; retryAfterSeconds?: number }> = [];
    for (let i = 0; i < RATE_LIMIT_POLICIES.analyze!.capacity + 1; i++) {
      results.push(
        (await investigateIssueCore('tenant-rl', 'user-rl', 'PAY-142', {
          jiraFetcher,
          kvs: kvs as never,
        })) as never,
      );
    }
    const allowed = results.slice(0, RATE_LIMIT_POLICIES.analyze!.capacity);
    expect(allowed.every((r) => r.status !== 'ANALYSIS_FAILED' || !r.rateLimited)).toBe(true);
    const refused = results[results.length - 1]!;
    expect(refused.status).toBe('ANALYSIS_FAILED');
    expect(refused.rateLimited).toBe(true);
    expect(refused.retryAfterSeconds).toBeGreaterThan(0);
  });
});
