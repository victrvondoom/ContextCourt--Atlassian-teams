/**
 * Reliability primitives for external calls (TRACEN topics 10–13).
 *
 * Implements, as small composable wrappers with injectable clocks/randomness
 * (so behavior is deterministically testable):
 *
 *  - withTimeout: every external operation gets a bounded wall-clock budget.
 *    A timeout is classified accurately — the external action may have
 *    SUCCEEDED while the response was lost, so the caller must treat it as
 *    "uncertain", never as a confirmed failure to retry blindly.
 *  - withCircuitBreaker: after N consecutive failures the circuit opens for
 *    a cooldown; while open, calls fail fast without hitting the provider
 *    (cascading-failure protection). Half-open lets one probe through to
 *    test recovery. Never silently returns success when the provider is down.
 *  - backoffDelay: capped exponential backoff with jitter so thousands of
 *    clients cannot retry on the same millisecond (retry-storm prevention).
 */
import type { JiraFetcher } from '../integrations/jira';

// ---------------------------------------------------------------------------
// Timeout
// ---------------------------------------------------------------------------

export class TimeoutError extends Error {
  constructor(
    public readonly operation: string,
    public readonly budgetMs: number,
  ) {
    super(`${operation} timed out after ${budgetMs}ms (result is UNCERTAIN — the write may have applied)`);
    this.name = 'TimeoutError';
  }
}

export interface TimedFetcher {
  (
    path: string,
    init?: { method?: string; body?: unknown },
  ): Promise<{
    ok: boolean;
    status: number;
    json: unknown;
  }>;
}

/** Wrap a fetcher with a bounded wall-clock budget. */
export function withTimeout(
  fetcher: TimedFetcher,
  budgetMs: number,
  operation = 'jira request',
): TimedFetcher {
  return async (path, init) => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      return await Promise.race([
        fetcher(path, init),
        new Promise<never>((_, reject) => {
          timer = setTimeout(() => reject(new TimeoutError(operation, budgetMs)), budgetMs);
        }),
      ]);
    } finally {
      if (timer) clearTimeout(timer);
    }
  };
}

// ---------------------------------------------------------------------------
// Circuit breaker
// ---------------------------------------------------------------------------

export interface CircuitBreakerState {
  failures: number;
  /** Timestamp (ms) until which the circuit stays open; 0 = closed/half-open. */
  openUntilMs: number;
  /** True while a single recovery probe is in flight (half-open). */
  probing: boolean;
}

export type BreakerVerdict = 'ALLOW' | 'REJECT';

export interface CircuitBreaker {
  /** Decide whether a call may proceed; transitions to half-open when cooldown ends. */
  beforeCall(nowMs: number): BreakerVerdict;
  /** Record a successful call (closes the circuit). */
  onSuccess(): void;
  /** Record a failed call; opens the circuit once the threshold is reached. */
  onFailure(nowMs: number): void;
  /** Inspectable state for observability. */
  state(): CircuitBreakerState & { mode: 'closed' | 'open' | 'half-open' };
}

export function createCircuitBreaker(opts: {
  failureThreshold: number;
  cooldownMs: number;
  now: () => number;
}): CircuitBreaker {
  const s: CircuitBreakerState = { failures: 0, openUntilMs: 0, probing: false };
  const mode = (): 'closed' | 'open' | 'half-open' =>
    s.openUntilMs === 0 && s.failures === 0
      ? 'closed'
      : s.openUntilMs > opts.now()
        ? 'open'
        : s.openUntilMs > 0
          ? 'half-open'
          : 'closed';
  return {
    beforeCall(nowMs) {
      if (s.openUntilMs > nowMs) return 'REJECT';
      // Cooldown elapsed → half-open: allow exactly one probe.
      if (s.openUntilMs > 0) {
        if (s.probing) return 'REJECT';
        s.probing = true;
      }
      return 'ALLOW';
    },
    onSuccess() {
      s.failures = 0;
      s.openUntilMs = 0;
      s.probing = false;
    },
    onFailure(nowMs) {
      s.failures += 1;
      s.probing = false;
      if (s.failures >= opts.failureThreshold) {
        s.openUntilMs = nowMs + opts.cooldownMs;
      }
    },
    state() {
      return { ...s, mode: mode() };
    },
  };
}

export class CircuitOpenError extends Error {
  constructor(public readonly retryInMs: number) {
    super(`circuit open — failing fast instead of calling the provider (retry in ${retryInMs}ms)`);
    this.name = 'CircuitOpenError';
  }
}

/** Wrap a fetcher with a circuit breaker (fail fast while the provider is down). */
export function withCircuitBreaker(fetcher: TimedFetcher, breaker: CircuitBreaker): TimedFetcher {
  return async (path, init) => {
    const nowMs = Date.now();
    if (breaker.beforeCall(nowMs) === 'REJECT') {
      const st = breaker.state();
      const retryInMs = Math.max(0, st.openUntilMs - nowMs);
      throw new CircuitOpenError(retryInMs);
    }
    try {
      const res = await fetcher(path, init);
      if (res.status >= 500 || res.status === 429) breaker.onFailure(Date.now());
      else breaker.onSuccess();
      return res;
    } catch (err) {
      breaker.onFailure(Date.now());
      throw err;
    }
  };
}

// ---------------------------------------------------------------------------
// Backoff with jitter
// ---------------------------------------------------------------------------

export function backoffDelay(
  attempt: number,
  rng: () => number = Math.random,
  baseMs = 200,
  capMs = 2000,
): number {
  const exponential = Math.min(baseMs * 2 ** attempt, capMs);
  // Full jitter: uniform in [exponential/2, exponential] — bounded, never zero.
  const jittered = exponential / 2 + rng() * (exponential / 2);
  return Math.round(jittered);
}

/** Production Jira fetcher wrapped with timeout + circuit breaker. */
export function resilientJiraFetcher(
  base: JiraFetcher,
  breaker: CircuitBreaker,
  timeoutMs = 10_000,
): TimedFetcher {
  return withCircuitBreaker(withTimeout(base as TimedFetcher, timeoutMs), breaker);
}
