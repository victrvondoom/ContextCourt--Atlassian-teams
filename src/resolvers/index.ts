/**
 * Forge backend resolvers for the Custom UI.
 *
 * Thin layer: validate input (zod), enforce tenant context, delegate to core
 * modules and the Jira adapter. In the Forge runtime the Jira fetcher uses
 * api.asUser().requestJira, so calls run with the invoking user's permissions.
 */
import Resolver from '@forge/resolver';
import { assumeTrustedRoute, requestJira } from '@forge/api';
import { z } from 'zod';
import { JiraAdapter } from '../integrations/jira';
import { normalizeAll } from '../core/normalizer';
import { analyze } from '../core/contradiction';
import { sha256Hex } from '../core/digest';
import type { EvidenceRecord, SourceSystem } from '../core/types';
import type { JiraFetcher } from '../integrations/jira';

// ---------------------------------------------------------------------------
// Production fetcher — user-scoped Jira REST access.
// ---------------------------------------------------------------------------

export const productionJiraFetcher: JiraFetcher = async (path, init) => {
  // Paths are constructed internally from regex-validated issue keys only, so
  // they qualify as trusted routes. Never pass raw user input here.
  const res = await requestJira(assumeTrustedRoute(path), {
    method: init?.method ?? 'GET',
    headers: { 'content-type': 'application/json', accept: 'application/json' },
    ...(init?.body ? { body: JSON.stringify(init.body) } : {}),
  });
  let json: unknown = null;
  try {
    json = await res.json();
  } catch {
    json = null;
  }
  return { ok: res.ok, status: res.status, json };
};

// ---------------------------------------------------------------------------
// Validation schemas
// ---------------------------------------------------------------------------

const issueKeySchema = z.string().regex(/^[A-Z][A-Z0-9]*-\d+$/, 'valid Jira issue key required');

// ---------------------------------------------------------------------------
// Resolver handlers
// ---------------------------------------------------------------------------

const resolver = new Resolver();

resolver.define('health', async () => {
  return {
    app: 'contextcourt-ai',
    version: '0.1.0',
    integrations: {
      jira: 'available',
      teamworkGraph: 'not-wired',
      rovoAgent: 'not-wired',
      mcp: 'not-wired',
    },
    checkedAt: new Date().toISOString(),
  };
});

resolver.define('analyzeIssue', async (ctx: unknown) => {
  const c = ctx as { payload?: unknown; context?: { cloudId?: string; accountId?: string } };
  const payload = issueKeySchema.safeParse((c.payload as { issueKey?: unknown })?.issueKey);
  if (!payload.success) {
    return { status: 'ANALYSIS_FAILED', error: 'invalid input', detail: payload.error.issues };
  }
  const cloudId = c.context?.cloudId;
  const userId = c.context?.accountId;
  if (!cloudId || !userId) {
    return { status: 'ANALYSIS_FAILED', error: 'unauthenticated context' };
  }

  const adapter = new JiraAdapter(productionJiraFetcher);
  try {
    const issue = await adapter.getIssue(payload.data);

    // Build evidence from authorized Jira content (description + comments).
    const evidence: EvidenceRecord[] = [];
    if (issue.description) {
      evidence.push(
        await buildEvidence(
          cloudId,
          userId,
          'jira',
          issue.key,
          issue.description,
          issue.updated ?? '',
          issue.key,
        ),
      );
    }
    for (let i = 0; i < issue.comments.length; i++) {
      const comment = issue.comments[i]!;
      evidence.push(
        await buildEvidence(
          cloudId,
          userId,
          'jira',
          `${issue.key}:comment:${i}`,
          comment.body,
          comment.created,
          `${issue.key}-c${i}`,
        ),
      );
    }

    const propositions = normalizeAll(evidence);
    const result = analyze({
      tenantId: cloudId,
      evidence,
      propositions,
      affectedWork: [{ type: 'jira_issue', key: issue.key }],
    });

    return {
      status: result.status,
      issue: { key: issue.key, summary: issue.summary, status: issue.status },
      findings: result.findings,
      evidenceCount: evidence.length,
      evaluatedAt: result.evaluatedAt,
    };
  } catch (err) {
    return {
      status: 'ANALYSIS_FAILED',
      error: err instanceof Error ? err.message : 'jira request failed',
    };
  }
});

async function buildEvidence(
  tenantId: string,
  userId: string,
  source: SourceSystem,
  objectId: string,
  text: string,
  updatedAt: string,
  key: string,
): Promise<EvidenceRecord> {
  const contentDigest = await sha256Hex(`${objectId}:${text}`);
  return {
    id: `ev_${key.replace(/[^a-zA-Z0-9]/g, '-')}`,
    tenantId,
    sourceSystem: source,
    sourceObjectId: objectId,
    canonicalUrl: null,
    extractedText: text,
    sourceVersion: updatedAt,
    observedAt: new Date().toISOString(),
    sourceUpdatedAt: updatedAt,
    contentDigest,
    accessContext: { userId, retrievedVia: source },
    extractionMethod: 'api_field',
    verification: 'unverified',
    staleness: 'current',
  };
}

export const handler = resolver.getDefinitions();
