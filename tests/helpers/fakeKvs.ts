/**
 * Shared in-memory KVS fake for integration tests.
 *
 * Implements the query surface used by the repositories (where/cursor/
 * limit/getMany with beginsWith) so list paths are exercised for real —
 * including tenant-prefix filtering.
 */
export class FakeKvs {
  data = new Map<string, unknown>();

  async set(key: string, value: unknown): Promise<unknown> {
    this.data.set(key, value);
    return value;
  }

  async get(key: string): Promise<unknown> {
    return this.data.get(key);
  }

  async delete(key: string): Promise<unknown> {
    return this.data.delete(key);
  }

  query() {
    const snapshot = () => Array.from(this.data.entries()).map(([key, value]) => ({ key, value }));
    // The chain is BOTH chainable (where/cursor/limit) and awaitable, like the
    // real Forge KVS query object.
    const q = {
      _cond: undefined as { beginsWith?: string } | undefined,
      where(_p: 'key', c: { beginsWith?: string }) {
        q._cond = c;
        return q;
      },
      cursor(_c?: string) {
        return q;
      },
      limit(_n?: number) {
        return q;
      },
      getMany() {
        return Promise.resolve(q.results());
      },
      results() {
        let all = snapshot();
        if (q._cond?.beginsWith) {
          all = all.filter((e) => e.key.startsWith(q._cond!.beginsWith!));
        }
        return { results: all, nextCursor: undefined };
      },
      then(onFulfilled: never, onRejected?: never) {
        return Promise.resolve(q.results()).then(onFulfilled, onRejected);
      },
    };
    return q;
  }
}

/** Fake Jira REST transport with scripted responses per path prefix. */
export class FakeJiraFetcher {
  calls: Array<{ path: string; init?: { method?: string; body?: unknown } }> = [];
  private handlers: Array<{
    match: RegExp;
    respond: (path: string, body: unknown) => { ok: boolean; status: number; json: unknown };
  }>;

  constructor(
    handlers: Array<{
      match: RegExp;
      respond: (path: string, body: unknown) => { ok: boolean; status: number; json: unknown };
    }>,
  ) {
    this.handlers = handlers;
  }

  async fetch(path: string, init?: { method?: string; body?: unknown }) {
    this.calls.push({ path, init });
    const h = this.handlers.find((x) => x.match.test(path));
    if (!h) return { ok: false, status: 404, json: { errorMessages: ['not scripted'] } };
    return h.respond(path, init?.body);
  }

  /** Standard GET /issue/PAY-142 response with contradictory content. */
  static issueResponse(key = 'PAY-142') {
    return {
      id: '10001',
      key,
      fields: {
        summary: 'Reduce refund window from 30 to 14 days',
        description: {
          type: 'doc',
          version: 1,
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'high-value transfers require approval from the controller.' }],
            },
          ],
        },
        status: { name: 'In Progress' },
        updated: '2026-10-20T00:00:00.000Z',
        labels: [],
        comment: {
          comments: [
            {
              author: { displayName: 'Dana Dev' },
              created: '2026-10-21T00:00:00.000Z',
              body: {
                type: 'doc',
                version: 1,
                content: [
                  {
                    type: 'paragraph',
                    content: [
                      {
                        type: 'text',
                        text: 'this high-value transfer does not require additional approval.',
                      },
                    ],
                  },
                ],
              },
            },
          ],
        },
        issuelinks: [],
      },
    };
  }
}
