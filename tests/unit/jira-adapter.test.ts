import { JiraAdapter, JiraApiError, validateIssueKey, type JiraFetcher } from '../../src/integrations/jira';

function fetcherFrom(
  pages: Record<string, unknown>,
  failPaths: string[] = [],
): { fetcher: JiraFetcher; calls: string[] } {
  const calls: string[] = [];
  const fetcher: JiraFetcher = async (path) => {
    calls.push(path);
    if (failPaths.some((p) => path.startsWith(p)))
      return { ok: false, status: 403, json: { errors: ['forbidden'] } };
    const key = Object.keys(pages).find((k) => path.includes(k));
    if (!key) return { ok: false, status: 404, json: {} };
    return { ok: true, status: 200, json: pages[key] };
  };
  return { fetcher, calls };
}

describe('Jira adapter', () => {
  it('validates issue keys before any request', () => {
    expect(() => validateIssueKey('../etc/passwd')).toThrow(JiraApiError);
    expect(() => validateIssueKey('PAY-142')).not.toThrow();
    expect(() => validateIssueKey('lower-1')).toThrow(JiraApiError);
  });

  it('rejects manipulated issue identifiers without a network call', async () => {
    const { fetcher, calls } = fetcherFrom({});
    const adapter = new JiraAdapter(fetcher);
    await expect(adapter.getIssue('PROJ-1 ORMalicious')).rejects.toThrow(JiraApiError);
    expect(calls).toHaveLength(0);
  });

  it('maps a valid issue response', async () => {
    const { fetcher } = fetcherFrom({
      '/rest/api/3/issue/PAY-142': {
        id: '10001',
        key: 'PAY-142',
        fields: {
          summary: 'Wire transfer automation',
          description: 'Transfers must be additionally approved.',
          status: { name: 'In Progress' },
          updated: '2026-10-20T00:00:00Z',
          labels: ['payments'],
          comment: {
            comments: [
              {
                author: { displayName: 'Ada' },
                created: '2026-10-21T00:00:00Z',
                body: 'No additional approval required.',
              },
            ],
          },
        },
      },
    });
    const adapter = new JiraAdapter(fetcher);
    const issue = await adapter.getIssue('PAY-142');
    expect(issue.key).toBe('PAY-142');
    expect(issue.status).toBe('In Progress');
    expect(issue.comments).toHaveLength(1);
    expect(issue.labels).toEqual(['payments']);
  });

  it('CC-001 regression: extracts ADF description and comment bodies instead of dropping them', async () => {
    const { fetcher } = fetcherFrom({
      '/rest/api/3/issue/PAY-142': {
        id: '10001',
        key: 'PAY-142',
        fields: {
          summary: 'Wire transfer automation',
          // Realistic Jira REST v3 ADF description document.
          description: {
            type: 'doc',
            version: 1,
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: 'Transfers must be additionally approved.' }],
              },
              {
                type: 'bulletList',
                content: [
                  {
                    type: 'listItem',
                    content: [{ type: 'paragraph', content: [{ type: 'text', text: 'over 10k' }] }],
                  },
                ],
              },
            ],
          },
          status: { name: 'In Progress' },
          updated: '2026-10-20T00:00:00Z',
          labels: [],
          comment: {
            comments: [
              {
                author: { displayName: 'Ada' },
                created: '2026-10-21T00:00:00Z',
                body: {
                  type: 'doc',
                  version: 1,
                  content: [
                    {
                      type: 'paragraph',
                      content: [{ type: 'text', text: 'No additional approval required.' }],
                    },
                  ],
                },
              },
            ],
          },
        },
      },
    });
    const adapter = new JiraAdapter(fetcher);
    const issue = await adapter.getIssue('PAY-142');
    expect(issue.description).toBe('Transfers must be additionally approved.\nover 10k');
    expect(issue.comments[0]!.body).toBe('No additional approval required.');
  });

  it('CC-006 regression: only Blocks links assert blocking; other types are related', async () => {
    const { fetcher } = fetcherFrom({
      '/rest/api/3/issue/PAY-142': {
        id: '1',
        key: 'PAY-142',
        fields: {
          summary: 's',
          issuelinks: [
            {
              type: { name: 'Blocks' },
              outwardIssue: { key: 'PAY-150', fields: { summary: 'out' } },
            },
            {
              type: { name: 'Relates' },
              inwardIssue: { key: 'PAY-151', fields: { summary: 'in' } },
            },
          ],
        },
      },
    });
    const adapter = new JiraAdapter(fetcher);
    const issue = await adapter.getIssue('PAY-142');
    expect(issue.issuelinks).toEqual([
      { key: 'PAY-150', summary: 'out', direction: 'blocks' },
      { key: 'PAY-151', summary: 'in', direction: 'related' },
    ]);
  });

  it('does not retry non-transient 403 errors', async () => {
    const { fetcher, calls } = fetcherFrom({}, ['/rest/api/3/issue/PAY-142']);
    const adapter = new JiraAdapter(fetcher);
    await expect(adapter.getIssue('PAY-142')).rejects.toThrow(/403/);
    expect(calls).toHaveLength(1);
  });

  it('paginates search results with nextPageToken', async () => {
    let page = 0;
    const calls: string[] = [];
    const fetcher: JiraFetcher = async (path, init) => {
      calls.push(path);
      const body = (init?.body ?? {}) as { nextPageToken?: string };
      if (page === 0) {
        page = 1;
        return {
          ok: true,
          status: 200,
          json: { issues: [{ id: '1', key: 'A-1', fields: { summary: 'x' } }], nextPageToken: 'tok2' },
        };
      }
      if (body.nextPageToken === 'tok2') {
        return {
          ok: true,
          status: 200,
          json: { issues: [{ id: '2', key: 'A-2', fields: { summary: 'y' } }] },
        };
      }
      return { ok: false, status: 400, json: {} };
    };
    const adapter = new JiraAdapter(fetcher);
    const issues = await adapter.searchAllIssues('project = A');
    expect(issues.map((i) => i.key)).toEqual(['A-1', 'A-2']);
    expect(calls.length).toBe(2);
  });

  it('treats empty search results as empty, not an error', async () => {
    const { fetcher } = fetcherFrom({ '/rest/api/3/search/jql': { issues: [] } });
    const adapter = new JiraAdapter(fetcher);
    const res = await adapter.searchIssues('project = EMPTY');
    expect(res.issues).toEqual([]);
    expect(res.nextPageToken).toBeNull();
  });
});
