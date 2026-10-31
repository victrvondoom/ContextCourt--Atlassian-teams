/**
 * Jira integration adapter.
 *
 * In production, requests go through @forge/api asUser() so every call runs
 * with the current user's permissions. For contract tests, the fetcher is
 * injected — the adapter's logic (validation, pagination, error mapping) is
 * testable without network access, and a passing mocked test is NOT proof of
 * live integration (see docs/atlassian-compatibility.md).
 */
import { adfToText } from './adf';

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
  /** Verified Jira issue links, used as impact-graph edges with Jira provenance. */
  issuelinks: Array<{ key: string; summary: string | null; direction: 'blocks' | 'dependsOn' | 'related' }>;
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

/** True for requests whose retry cannot duplicate an external side effect. */
function isRetryable(path: string, init?: { method?: string; body?: unknown }): boolean {
  const method = (init?.method ?? 'GET').toUpperCase();
  if (method === 'GET' || method === 'HEAD') return true;
  // JQL search is a POST with read-only semantics (documented Jira v3 search API).
  return method === 'POST' && path === '/rest/api/3/search/jql';
}

export class JiraAdapter {
  constructor(
    private readonly fetcher: JiraFetcher,
    private readonly logger: (msg: string, meta?: unknown) => void = () => {},
  ) {}

  /** GET a single issue by key with selected fields. */
  async getIssue(key: string): Promise<JiraIssue> {
    validateIssueKey(key);
    const res = await this.requestWithRetry(
      `/rest/api/3/issue/${encodeURIComponent(key)}?fields=summary,description,status,updated,labels,comment,issuelinks`,
    );
    return mapIssue(res);
  }

  /** Search issues via JQL, returning one page. */
  async searchIssues(jql: string, nextPageToken?: string): Promise<JiraSearchPage> {
    const body = {
      jql,
      maxResults: 25,
      fields: ['summary', 'description', 'status', 'updated', 'labels', 'comment', 'issuelinks'],
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

  /**
   * Single transport entry point with bounded retry. Public so the retry
   * idempotency guard is directly testable; callers must respect that only
   * idempotent requests are retried (enforced below).
   */
  async requestWithRetry(path: string, init?: { method?: string; body?: unknown }): Promise<unknown> {
    // Retrying a request whose side effects may already have been applied can
    // duplicate non-idempotent external effects (a comment posted twice, an
    // issue created twice). Only idempotent reads are retryable: GETs and the
    // JQL search endpoint (a POST with read-only semantics). Every write path
    // is single-attempt by design.
    if (!isRetryable(path, init)) {
      const res = await this.fetcher(path, init);
      if (res.ok) return res.json;
      throw new JiraApiError(res.status, path, `Jira API error ${res.status} on ${path}`);
    }
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

/**
 * Jira REST v3 returns description and comment bodies as ADF documents.
 * Plain strings are tolerated for older deployment shapes and fixtures.
 */
function extractTextField(value: unknown): string {
  if (typeof value === 'string') return value;
  return adfToText(value);
}

function mapIssue(raw: unknown): JiraIssue {
  const d = (raw ?? {}) as Record<string, any>;
  const fields = d.fields ?? {};
  const description = extractTextField(fields.description);
  return {
    id: String(d.id ?? ''),
    key: String(d.key ?? ''),
    summary: String(fields.summary ?? ''),
    // Jira REST v3 returns the description as an ADF document, not a string.
    // Without ADF extraction every real issue would yield empty evidence and
    // the engine would always report INSUFFICIENT_EVIDENCE (defect CC-001).
    description: description.length > 0 ? description : null,
    status: fields.status?.name ? String(fields.status.name) : null,
    updated: fields.updated ? String(fields.updated) : null,
    labels: Array.isArray(fields.labels) ? fields.labels.map(String) : [],
    comments: Array.isArray(fields.comment?.comments)
      ? fields.comment.comments.map((c: any) => ({
          author: String(c.author?.displayName ?? ''),
          created: String(c.created ?? ''),
          body: extractTextField(c.body),
        }))
      : [],
    /*
     * Jira issuelinks are user-maintained but persisted by Jira, so they are
     * treated as Jira-sourced (persisted) edges — not invented. Direction is
     * taken from inward/outward position; the link type name is preserved and
     * only "Blocks" links assert blocking semantics. Everything else is
     * 'related' — we never invent 'dependsOn' for unknown link types (CC-006).
     */
    issuelinks: Array.isArray(fields.issuelinks)
      ? fields.issuelinks.flatMap((link: any) => {
          const isBlocks = link?.type?.name === 'Blocks';
          const direction: JiraIssue['issuelinks'][number]['direction'] = isBlocks ? 'blocks' : 'related';
          type LinkEdge = JiraIssue['issuelinks'][number];
          const outward: LinkEdge | null = link?.outwardIssue
            ? {
                key: String(link.outwardIssue.key),
                summary: link.outwardIssue.fields?.summary ?? null,
                direction,
              }
            : null;
          const inward: LinkEdge | null = link?.inwardIssue
            ? {
                key: String(link.inwardIssue.key),
                summary: link.inwardIssue.fields?.summary ?? null,
                direction,
              }
            : null;
          return [outward, inward].filter((e): e is LinkEdge => e !== null);
        })
      : [],
  };
}
