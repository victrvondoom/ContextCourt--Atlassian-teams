/**
 * KVS-backed token-bucket rate limiting (TRACEN topic 1) for abusable,
 * expensive operations: analysis runs, proposal preparation, decisions and
 * execution. Enforcement sits at the application boundary (Forge has no
 * customer-facing edge configuration we control), persisted in KVS so the
 * budget survives across invocations and instances.
 *
 * Deterministically testable: the clock is injected.
 */
export interface RateLimitClock {
  now(): number;
}

export interface RateLimitStore {
  get(key: string): Promise<unknown>;
  set(key: string, value: unknown): Promise<unknown>;
}

export interface RateLimitPolicy {
  /** Bucket capacity (burst size). */
  capacity: number;
  /** Tokens refilled per second. */
  refillPerSecond: number;
}

export interface RateLimitDecision {
  allowed: boolean;
  /** Seconds until enough tokens exist for one more call (0 = retry immediately). */
  retryAfterSeconds: number;
  remaining: number;
}

export const RATE_LIMIT_POLICIES: Record<string, RateLimitPolicy> = {
  analyze: { capacity: 10, refillPerSecond: 0.1 }, // burst 10, one every 10s
  prepare: { capacity: 20, refillPerSecond: 0.2 },
  decide: { capacity: 30, refillPerSecond: 0.5 },
  execute: { capacity: 10, refillPerSecond: 0.05 },
};

/**
 * Consume one token for (tenant, user, action). Returns the decision; the
 * caller MUST honor `allowed === false` by refusing the operation and
 * surfacing `retryAfterSeconds`.
 */
export async function consumeRateLimitToken(args: {
  store: RateLimitStore;
  tenantId: string;
  userId: string;
  action: keyof typeof RATE_LIMIT_POLICIES | string;
  clock: RateLimitClock;
  policy?: RateLimitPolicy;
}): Promise<RateLimitDecision> {
  const policy = args.policy ?? RATE_LIMIT_POLICIES[args.action] ?? { capacity: 30, refillPerSecond: 1 };
  const key = `ratelimit:${args.tenantId}:${args.userId}:${args.action}`;
  const nowMs = args.clock.now();
  const raw = (await args.store.get(key)) as { tokens: number; lastRefillMs: number } | undefined;

  let tokens = raw?.tokens ?? policy.capacity;
  const lastRefillMs = raw?.lastRefillMs ?? nowMs;
  // Refill continuously since the last consumption.
  const elapsedSec = Math.max(0, (nowMs - lastRefillMs) / 1000);
  tokens = Math.min(policy.capacity, tokens + elapsedSec * policy.refillPerSecond);

  if (tokens < 1) {
    const secondsPerToken = 1 / policy.refillPerSecond;
    // Persist the refilled-but-uncharged state so time is not re-credited.
    await args.store.set(key, { tokens, lastRefillMs: nowMs });
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil(secondsPerToken * (1 - tokens))),
      remaining: Math.floor(tokens),
    };
  }

  tokens -= 1;
  await args.store.set(key, { tokens, lastRefillMs: nowMs });
  return { allowed: true, retryAfterSeconds: 0, remaining: Math.floor(tokens) };
}
