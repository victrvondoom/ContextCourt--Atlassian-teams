import {
  TeamworkGraphAdapter,
  ASSIGNED_WORK_ITEMS_QUERY,
  WORK_ITEM_GOALS_QUERY,
  type GraphFetcher,
} from '../../src/integrations/teamworkGraph';

function okJson(data: unknown, status = 200) {
  return async () => ({ ok: true, status, json: data });
}

describe('Teamwork Graph adapter', () => {
  it('sends curated query documents with pagination variables', async () => {
    const queries: string[] = [];
    const fetcher: GraphFetcher = async (query, variables) => {
      queries.push(query);
      expect(variables.first).toBe(25);
      return {
        ok: true,
        status: 200,
        json: {
          data: {
            atlassianUserAssignedJiraWorkItems: {
              edges: [{ node: { id: 'ari:cloud:jira::issue/1', __typename: 'JiraWorkItem' } }],
              pageInfo: { hasNextPage: false, endCursor: null },
            },
          },
        },
      };
    };
    const adapter = new TeamworkGraphAdapter(fetcher);
    const res = await adapter.getAssignedWorkItems('ari:cloud:identity::user/1');
    expect(res.state).toBe('OK');
    if (res.state === 'OK') {
      expect(res.data).toHaveLength(1);
      expect(res.data[0]!.id).toContain('issue/1');
    }
    expect(queries[0]).toContain('atlassianUserAssignedJiraWorkItems');
    expect(ASSIGNED_WORK_ITEMS_QUERY).toContain('atlassianUserAssignedJiraWorkItems');
  });

  it('paginates using endCursor until hasNextPage is false', async () => {
    let page = 0;
    const cursorsSeen: Array<string | undefined> = [];
    const fetcher: GraphFetcher = async (_query, variables) => {
      cursorsSeen.push((variables as { after?: string }).after);
      page += 1;
      const hasNext = page < 2;
      return {
        ok: true,
        status: 200,
        json: {
          data: {
            atlassianUserAssignedJiraWorkItems: {
              edges: [{ node: { id: `issue-${page}` } }],
              pageInfo: { hasNextPage: hasNext, endCursor: hasNext ? 'cursor-2' : null },
            },
          },
        },
      };
    };
    const adapter = new TeamworkGraphAdapter(fetcher);
    const res = await adapter.getAssignedWorkItems('u1');
    expect(res.state).toBe('OK');
    if (res.state === 'OK') expect(res.data.map((n) => n.id)).toEqual(['issue-1', 'issue-2']);
    expect(cursorsSeen[0]).toBeUndefined();
    expect(cursorsSeen[1]).toBe('cursor-2');
  });

  it('maps HTTP 403 to ACCESS_RESTRICTED, never to empty success', async () => {
    const fetcher: GraphFetcher = async () => ({ ok: false, status: 403, json: {} });
    const adapter = new TeamworkGraphAdapter(fetcher);
    const res = await adapter.getWorkItemGoals('ari:issue/1');
    expect(res.state).toBe('ACCESS_RESTRICTED');
  });

  it('maps transport failure to UNAVAILABLE, never to empty success', async () => {
    const fetcher: GraphFetcher = async () => {
      throw new Error('ECONNRESET');
    };
    const adapter = new TeamworkGraphAdapter(fetcher);
    const res = await adapter.getAssignedWorkItems('u1');
    expect(res.state).toBe('UNAVAILABLE');
    if (res.state === 'UNAVAILABLE') expect(res.detail).toContain('transport failure');
  });

  it('maps GraphQL permission errors to ACCESS_RESTRICTED', async () => {
    const fetcher: GraphFetcher = async () => ({
      ok: true,
      status: 200,
      json: { errors: [{ message: 'not authorized to view field jiraWorkItemGoals' }] },
    });
    const adapter = new TeamworkGraphAdapter(fetcher);
    const res = await adapter.getWorkItemGoals('ari:issue/1');
    expect(res.state).toBe('ACCESS_RESTRICTED');
  });

  it('flags invalid responses missing the requested field', async () => {
    const fetcher: GraphFetcher = async () => ({ ok: true, status: 200, json: { data: {} } });
    const adapter = new TeamworkGraphAdapter(fetcher);
    const res = await adapter.getWorkItemGoals('ari:issue/1');
    expect(res.state).toBe('INVALID_RESPONSE');
  });

  it('normalizes relationships with verified provenance markers', async () => {
    const fetcher: GraphFetcher = okJson({
      data: {
        jiraWorkItemLinkedExternalPullRequests: {
          edges: [{ node: { id: 'pr-9', title: 'Fix approval flow', url: 'https://bb.example/pr/9' } }],
          pageInfo: { hasNextPage: false, endCursor: null },
        },
      },
    });
    const adapter = new TeamworkGraphAdapter(fetcher);
    const res = await adapter.getWorkItemPullRequests('ari:issue/1');
    expect(res.state).toBe('OK');
    if (res.state === 'OK') {
      expect(res.data[0]).toMatchObject({
        source: 'teamwork-graph',
        type: 'linkedPullRequest',
        toId: 'pr-9',
        toTitle: 'Fix approval flow',
      });
    }
    expect(WORK_ITEM_GOALS_QUERY).toContain('jiraWorkItemGoals');
  });
});
