/**
 * Reliability primitives tests (core/reliability.ts, TRACEN topics 10–13):
 * timeouts with honest "uncertain" classification, circuit breaker
 * closed→open→half-open→closed transitions, and jittered backoff bounds.
 * All clocks and randomness are injected — deterministic.
 */
import { describe, expect, it } from 'vitest';
import {
  CircuitOpenError,
  TimeoutError,
  backoffDelay,
  createCircuitBreaker,
  resilientJiraFetcher,
  withTimeout,
} from '../../src/core/reliability';

const res = (ok: boolean, status: number) => ({ ok, status, json: {} });

describe('withTimeout', () => {
  it('passes through when the call finishes within the budget', async () => {
    const fetcher = async () => res(true, 200);
    const out = await withTimeout(fetcher, 1000)('/x');
    expect(out.ok).toBe(true);
  });

  it('rejects with a TimeoutError that honestly says the result is UNCERTAIN', async () => {
    const slow = () => new Promise<never>(() => {}); // never resolves
    await expect(withTimeout(slow as never, 20)('/x')).rejects.toThrow(TimeoutError);
    await expect(withTimeout(slow as never, 20)('/x')).rejects.toThrow(/UNCERTAIN/);
  });
});

describe('createCircuitBreaker', () => {
  it('stays closed under the failure threshold', () => {
    let now = 1_000;
    const b = createCircuitBreaker({ failureThreshold: 3, cooldownMs: 500, now: () => now });
    b.onFailure(now);
    b.onFailure(now);
    expect(b.state().mode).toBe('closed');
    expect(b.beforeCall(now)).toBe('ALLOW');
  });

  it('opens at the threshold and fails fast during cooldown', () => {
    let now = 1_000;
    const b = createCircuitBreaker({ failureThreshold: 3, cooldownMs: 500, now: () => now });
    b.onFailure(now);
    b.onFailure(now);
    b.onFailure(now);
    expect(b.state().mode).toBe('open');
    expect(b.beforeCall(now + 100)).toBe('REJECT');
    // After cooldown: exactly one probe is allowed (half-open).
    expect(b.beforeCall(now + 501)).toBe('ALLOW');
    expect(b.beforeCall(now + 501)).toBe('REJECT');
  });

  it('a successful probe closes the circuit', () => {
    let now = 1_000;
    const b = createCircuitBreaker({ failureThreshold: 2, cooldownMs: 500, now: () => now });
    b.onFailure(now);
    b.onFailure(now);
    expect(b.state().mode).toBe('open');
    now += 501;
    expect(b.beforeCall(now)).toBe('ALLOW');
    b.onSuccess();
    expect(b.state().mode).toBe('closed');
    expect(b.state().failures).toBe(0);
  });

  it('a failed probe re-opens the circuit for another cooldown', () => {
    let now = 1_000;
    const b = createCircuitBreaker({ failureThreshold: 2, cooldownMs: 500, now: () => now });
    b.onFailure(now);
    b.onFailure(now);
    now += 501;
    expect(b.beforeCall(now)).toBe('ALLOW');
    b.onFailure(now);
    expect(b.state().mode).toBe('open');
    expect(b.beforeCall(now + 1)).toBe('REJECT');
  });
});

describe('resilientJiraFetcher', () => {
  it('fails fast with CircuitOpenError while the provider is down — no silent success', async () => {
    let now = 1_000;
    const breaker = createCircuitBreaker({ failureThreshold: 2, cooldownMs: 60_000, now: () => now });
    let calls = 0;
    const failing = async () => {
      calls += 1;
      return res(false, 503);
    };
    const fetcher = resilientJiraFetcher(failing as never, breaker);
    await fetcher('/a');
    await fetcher('/a');
    expect(calls).toBe(2);
    // Circuit is now open: the next call never reaches the provider.
    await expect(fetcher('/a')).rejects.toThrow(CircuitOpenError);
    expect(calls).toBe(2);
  });

  it('5xx/429 count as failures; 2xx/4xx do not open the circuit', async () => {
    let now = 1_000;
    const breaker = createCircuitBreaker({ failureThreshold: 2, cooldownMs: 1000, now: () => now });
    let status = 200;
    const fetcher = resilientJiraFetcher(async () => res(status < 400, status), breaker);
    status = 503;
    await fetcher('/a');
    status = 429;
    await fetcher('/a');
    expect(breaker.state().mode).toBe('open');
    // Fresh breaker: 4xx is not a provider failure.
    const breaker2 = createCircuitBreaker({ failureThreshold: 2, cooldownMs: 1000, now: () => now });
    const fetcher2 = resilientJiraFetcher(async () => res(false, 404), breaker2);
    await fetcher2('/a');
    await fetcher2('/a');
    expect(breaker2.state().mode).toBe('closed');
  });
});

describe('backoffDelay (jitter)', () => {
  it('stays within [exponential/2, exponential] and respects the cap', () => {
    const bounds = [
      { attempt: 0, base: 200, cap: 2000 },
      { attempt: 1, base: 200, cap: 2000 },
      { attempt: 3, base: 200, cap: 2000 },
      { attempt: 10, base: 200, cap: 2000 },
    ];
    for (const { attempt, base, cap } of bounds) {
      const exponential = Math.min(base * 2 ** attempt, cap);
      for (let i = 0; i < 50; i++) {
        const d = backoffDelay(attempt, () => i / 49);
        expect(d).toBeGreaterThanOrEqual(Math.floor(exponential / 2));
        expect(d).toBeLessThanOrEqual(Math.ceil(exponential));
      }
    }
    // Cap: attempt 10 would be 204800ms uncapped → capped at 2000.
    expect(backoffDelay(10, () => 0)).toBe(1000);
    expect(backoffDelay(10, () => 1)).toBe(2000);
  });
});
