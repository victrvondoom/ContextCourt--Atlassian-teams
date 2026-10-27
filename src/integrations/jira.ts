/**
 * Jira integration adapter.
 *
 * In production, requests go through @forge/api asUser() so every call runs
 * with the current user's permissions. For contract tests, the fetcher is
 * injected — the adapter's logic (validation, pagination, error mapping) is
 * testable without network access, and a passing mocked test is NOT proof of
 * live integration (see docs/atlassian-compatibility.md).
 */
export interface JiraUser {
  accountId: string;
  displayName: string;
}

export interface JiraIssue {
  id: string;
  key: string;
  summary: string;
  description: string | null;
  status: string | null;
  updated: string | null;
  /** Label names used as lightweight decision/policy markers. */
  labels: string[];
  comments: Array<{ author: string; created: string; body: string }>;
}

export interface JiraSearchPage {
  issues: JiraIssue[];
  /** JQL for the next page, or null when exhausted (v3 search API). */
  nextPageToken: string | null;
}

/** The shape the adapter needs from @forge/api. Kept minimal for testing. */
export type JiraFetcher = (
  path: string,
  init?: { method?: string; body?: unknown },
) => Promise<{
  ok: boolean;
  status: number;
  json: unknown;
}>;

export class JiraApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly path: string,
    message: string,
  ) {
    super(message);
    this.name = 'JiraApiError';
  }
}

const MAX_RETRIES = 3;

export class JiraAdapter {
  constructor(
    private readonly fetcher: JiraFetcher,
    private readonly logger: (msg: string, meta?: unknown) => void = () => {},
  ) {}

  /** GET a single issue by key with selected fields. */
  async getIssue(key: string): Promise<JiraIssue> {
    validateIssueKey(key);
    const res = await this.requestWithRetry(
      `/rest/api/3/issue/${encodeURIComponent(key)}?fields=summary,description,status,updated,labels,comment`,
    );
    return mapIssue(res);
  }

  /** Search issues via JQL, returning one page. */
  async searchIssues(jql: string, nextPageToken?: string): Promise<JiraSearchPage> {
    const body = {
      jql,
      maxResults: 25,
      fields: ['summary', 'description', 'status', 'updated', 'labels', 'comment'],
      ...(nextPageToken ? { nextPageToken } : {}),
    };
    const res = await this.requestWithRetry('/rest/api/3/search/jql', { method: 'POST', body });
    const data = res as { issues?: unknown[]; nextPageToken?: string };
    const issues = Array.isArray(data.issues) ? data.issues.map(mapIssue) : [];
    return { issues, nextPageToken: data.nextPageToken ?? null };
  }

  /** Paginate all pages of a JQL search, bounded by maxPages for safety. */
  async searchAllIssues(jql: string, maxPages = 5): Promise<JiraIssue[]> {
    const all: JiraIssue[] = [];
    let token: string | undefined;
    for (let page = 0; page < maxPages; page++) {
      const res = await this.searchIssues(jql, token);
      all.push(...res.issues);
      if (!res.nextPageToken) break;
      token = res.nextPageToken;
    }
    return all;
  }

  private async requestWithRetry(path: string, init?: { method?: string; body?: unknown }): Promise<unknown> {
    let lastError: unknown;
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const res = await this.fetcher(path, init);
        if (res.ok) return res.json;
        // 4xx (other than 429) are non-transient — do not retry.
        if (res.status >= 400 && res.status < 500 && res.status !== 429) {
          throw new JiraApiError(res.status, path, `Jira API error ${res.status} on ${path}`);
        }
        lastError = new JiraApiError(res.status, path, `Jira API error ${res.status} on ${path}`);
      } catch (err) {
        if (err instanceof JiraApiError && err.status >= 400 && err.status < 500 && err.status !== 429) {
          throw err;
        }
        lastError = err;
      }
      if (attempt < MAX_RETRIES - 1) {
        await backoff(attempt);
      }
    }
    this.logger('jira request failed after retries', { path });
    if (lastError instanceof Error) throw lastError;
    throw new JiraApiError(0, path, `Jira request failed on ${path}`);
  }
}

/** Bounded exponential backoff: 200ms, 400ms, 800ms... capped at 2s. */
export async function backoff(attempt: number): Promise<void> {
  const delay = Math.min(200 * 2 ** attempt, 2000);
  await new Promise((r) => setTimeout(r, delay));
}

const ISSUE_KEY_RE = /^[A-Z][A-Z0-9]*-\d+$/;

export function validateIssueKey(key: string): void {
  if (!ISSUE_KEY_RE.test(key)) {
    throw new JiraApiError(400, '', `invalid issue key: ${JSON.stringify(key)}`);
  }
}

function mapIssue(raw: unknown): JiraIssue {
  const d = (raw ?? {}) as Record<string, any>;
  const fields = d.fields ?? {};
  return {
    id: String(d.id ?? ''),
    key: String(d.key ?? ''),
    summary: String(fields.summary ?? ''),
    description: typeof fields.description === 'string' ? fields.description : null,
    status: fields.status?.name ? String(fields.status.name) : null,
    updated: fields.updated ? String(fields.updated) : null,
    labels: Array.isArray(fields.labels) ? fields.labels.map(String) : [],
    comments: Array.isArray(fields.comment?.comments)
      ? fields.comment.comments.map((c: any) => ({
          author: String(c.author?.displayName ?? ''),
          created: String(c.created ?? ''),
          body: typeof c.body === 'string' ? c.body : '',
        }))
      : [],
  };
}
