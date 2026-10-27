/**
 * Teamwork Graph Consumption API adapter.
 *
 * Uses documented curated queries (fields on the root Query type) executed
 * through the documented endpoint POST /gateway/api/graphql/twg, called in a
 * Forge app with api.asUser().requestTeamworkGraph(...). Every row returned is
 * permission-filtered for the authenticated user. This adapter never
 * fabricates edges: unavailable relationship types surface as
 * ACCESS_RESTRICTED / UNAVAILABLE states, never as empty verified data.
 *
 * Docs (verified 2026-10-28):
 * - https://developer.atlassian.com/platform/teamwork-graph/curated-queries/
 * - https://developer.atlassian.com/platform/teamwork-graph/scopes/
 */
import type { SourceSystem } from '../core/types';

/** Transport boundary — in Forge runtime this wraps api.asUser().requestTeamworkGraph. */
export type GraphFetcher = (
  query: string,
  variables: Record<string, unknown>,
) => Promise<{
  ok: boolean;
  status: number;
  json: unknown;
}>;

export type GraphOutcome<T> =
  | { state: 'OK'; data: T }
  | { state: 'ACCESS_RESTRICTED'; detail: string }
  | { state: 'UNAVAILABLE'; detail: string }
  | { state: 'INVALID_RESPONSE'; detail: string };

export interface GraphPage<TNode> {
  nodes: TNode[];
  hasNextPage: boolean;
  endCursor: string | null;
}

export interface WorkItemNode {
  id: string;
  /** Normalized Jira issue key when derivable from the graph id/url. */
  key: string | null;
  title: string | null;
  status: string | null;
  url: string | null;
}

export interface Relationship {
  /** Verified: returned by the Teamwork Graph. Never inferred. */
  source: 'teamwork-graph';
  type: string;
  fromId: string;
  toId: string;
  toTitle: string | null;
  toUrl: string | null;
}

// ---------------------------------------------------------------------------
// Curated query documents (field names verified against the curated-queries page)
// ---------------------------------------------------------------------------

const WORK_ITEM_FRAGMENT = `
  node {
    ... on JiraWorkItem {
      id
      __typename
    }
  }
`;

/**
 * Work items assigned to a user.
 * Curated field: atlassianUserAssignedJiraWorkItems(userId: ID!, first, after)
 */
export const ASSIGNED_WORK_ITEMS_QUERY = `
query AssignedWorkItems($userId: ID!, $first: Int!, $after: String) {
  atlassianUserAssignedJiraWorkItems(userId: $userId, first: $first, after: $after) {
    edges {
      node {
        ... on JiraWorkItem {
          id
          __typename
        }
      }
      cursor
    }
    pageInfo { hasNextPage endCursor }
  }
}`;

/**
 * Goals associated with a work item.
 * Curated field: jiraWorkItemGoals
 */
export const WORK_ITEM_GOALS_QUERY = `
query WorkItemGoals($workItemAri: ID!, $first: Int!, $after: String) {
  jiraWorkItemGoals(workItemAri: $workItemAri, first: $first, after: $after) {
    edges {
      ${WORK_ITEM_FRAGMENT}
      cursor
    }
    pageInfo { hasNextPage endCursor }
  }
}`;

/**
 * External pull requests linked to a work item.
 * Curated field: jiraWorkItemLinkedExternalPullRequests
 */
export const WORK_ITEM_PRS_QUERY = `
query WorkItemPullRequests($workItemAri: ID!, $first: Int!, $after: String) {
  jiraWorkItemLinkedExternalPullRequests(workItemAri: $workItemAri, first: $first, after: $after) {
    edges {
      node {
        ... on ExternalPullRequest {
          id
          title
          url
        }
      }
      cursor
    }
    pageInfo { hasNextPage endCursor }
  }
}`;

/**
 * External deployments linked to a work item.
 * Curated field: jiraWorkItemLinkedExternalDeployments
 */
export const WORK_ITEM_DEPLOYMENTS_QUERY = `
query WorkItemDeployments($workItemAri: ID!, $first: Int!, $after: String) {
  jiraWorkItemLinkedExternalDeployments(workItemAri: $workItemAri, first: $first, after: $after) {
    edges {
      node {
        ... on ExternalDeployment {
          id
          __typename
        }
      }
      cursor
    }
    pageInfo { hasNextPage endCursor }
  }
}`;

/** Documented page-size limit for Teamwork Graph traversals. */
export const MAX_PAGE_SIZE = 25;

export class TeamworkGraphAdapter {
  constructor(
    private readonly fetcher: GraphFetcher,
    private readonly logger: (msg: string, meta?: unknown) => void = () => {},
  ) {}

  /** Generic curated-query runner with pagination, scoped to maxPages. */
  async runCurated<T>(
    field: string,
    query: string,
    variables: Record<string, unknown>,
    mapNode: (node: Record<string, unknown>) => T,
    maxPages = 5,
  ): Promise<GraphOutcome<T[]>> {
    let cursor: string | null = null;
    const collected: T[] = [];

    for (let page = 0; page < maxPages; page++) {
      const vars = { ...variables, first: MAX_PAGE_SIZE, ...(cursor ? { after: cursor } : {}) };
      let res;
      try {
        res = await this.fetcher(query, vars);
      } catch (err) {
        this.logger('teamwork graph transport failure', { field, error: String(err) });
        return { state: 'UNAVAILABLE', detail: `transport failure on ${field}` };
      }

      if (res.status === 401 || res.status === 403) {
        return { state: 'ACCESS_RESTRICTED', detail: `graph scope denied for ${field} (HTTP ${res.status})` };
      }
      if (!res.ok) {
        return { state: 'UNAVAILABLE', detail: `graph API error ${res.status} on ${field}` };
      }

      const parsed = parseGraphResponse(res.json, field);
      if (parsed.state !== 'OK') return parsed as GraphOutcome<never> as GraphOutcome<T[]>;

      const { edges, pageInfo } = parsed.data;
      for (const edge of edges) {
        if (edge && typeof edge === 'object' && 'node' in edge && edge.node) {
          collected.push(mapNode(edge.node as Record<string, unknown>));
        }
      }
      if (!pageInfo.hasNextPage || !pageInfo.endCursor) break;
      cursor = pageInfo.endCursor;
    }
    return { state: 'OK', data: collected };
  }

  async getAssignedWorkItems(userId: string, maxPages = 5): Promise<GraphOutcome<WorkItemNode[]>> {
    return this.runCurated(
      'atlassianUserAssignedJiraWorkItems',
      ASSIGNED_WORK_ITEMS_QUERY,
      { userId },
      mapWorkItemNode,
      maxPages,
    );
  }

  async getWorkItemGoals(workItemAri: string, maxPages = 2): Promise<GraphOutcome<Relationship[]>> {
    const res = await this.runCurated(
      'jiraWorkItemGoals',
      WORK_ITEM_GOALS_QUERY,
      { workItemAri },
      (n) => n,
      maxPages,
    );
    return mapRelationships(res, workItemAri, 'hasGoal');
  }

  async getWorkItemPullRequests(workItemAri: string, maxPages = 2): Promise<GraphOutcome<Relationship[]>> {
    const res = await this.runCurated(
      'jiraWorkItemLinkedExternalPullRequests',
      WORK_ITEM_PRS_QUERY,
      { workItemAri },
      (n) => n,
      maxPages,
    );
    return mapRelationships(res, workItemAri, 'linkedPullRequest');
  }

  async getWorkItemDeployments(workItemAri: string, maxPages = 2): Promise<GraphOutcome<Relationship[]>> {
    const res = await this.runCurated(
      'jiraWorkItemLinkedExternalDeployments',
      WORK_ITEM_DEPLOYMENTS_QUERY,
      { workItemAri },
      (n) => n,
      maxPages,
    );
    return mapRelationships(res, workItemAri, 'linkedDeployment');
  }
}

// ---------------------------------------------------------------------------
// Response parsing
// ---------------------------------------------------------------------------

function parseGraphResponse(
  json: unknown,
  field: string,
): GraphOutcome<{ edges: unknown[]; pageInfo: { hasNextPage: boolean; endCursor: string | null } }> {
  if (!json || typeof json !== 'object') {
    return { state: 'INVALID_RESPONSE', detail: 'non-object response body' };
  }
  const body = json as Record<string, unknown>;
  if (Array.isArray(body.errors) && body.errors.length > 0 && body.data === undefined) {
    const first = body.errors[0] as Record<string, unknown>;
    const msg = typeof first?.message === 'string' ? first.message : 'unknown graph error';
    // Permission-type graph errors surface explicitly — never as empty data.
    if (/permission|authorized|forbidden|scope/i.test(msg)) {
      return { state: 'ACCESS_RESTRICTED', detail: msg };
    }
    return { state: 'INVALID_RESPONSE', detail: `GraphQL errors on ${field}: ${msg}` };
  }
  const data = body.data as Record<string, unknown> | undefined;
  const fieldData = data?.[field] as Record<string, unknown> | undefined;
  if (!fieldData) {
    return { state: 'INVALID_RESPONSE', detail: `missing field ${field} in graph response` };
  }
  const edges = Array.isArray(fieldData.edges) ? fieldData.edges : [];
  const pageInfoRaw = (fieldData.pageInfo ?? {}) as Record<string, unknown>;
  const pageInfo = {
    hasNextPage: pageInfoRaw.hasNextPage === true,
    endCursor: typeof pageInfoRaw.endCursor === 'string' ? pageInfoRaw.endCursor : null,
  };
  return { state: 'OK', data: { edges, pageInfo } };
}

function mapRelationships(
  outcome: GraphOutcome<Record<string, unknown>[]>,
  fromAri: string,
  type: string,
): GraphOutcome<Relationship[]> {
  if (outcome.state !== 'OK') return outcome as GraphOutcome<Relationship[]>;
  return {
    state: 'OK',
    data: outcome.data.map((n) => ({
      source: 'teamwork-graph' as const,
      type,
      fromId: fromAri,
      toId: String(n.id ?? ''),
      toTitle: typeof n.title === 'string' ? n.title : null,
      toUrl: typeof n.url === 'string' ? n.url : null,
    })),
  };
}

function mapWorkItemNode(node: Record<string, unknown>): WorkItemNode {
  const id = String(node.id ?? '');
  return {
    id,
    // Graph ids are ARIs; a Jira issue key is not always derivable — do not invent one.
    key: null,
    title: typeof node.title === 'string' ? node.title : null,
    status: typeof node.status === 'string' ? node.status : null,
    url: typeof node.url === 'string' ? node.url : null,
  };
}

/** provenance helper used by the UI to distinguish graph-verified vs inferred edges. */
export function graphProvenance(): { source: SourceSystem; verified: boolean } {
  return { source: 'teamwork-graph', verified: true };
}
