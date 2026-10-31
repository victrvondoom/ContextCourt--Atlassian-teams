/**
 * Post-execution verification (Layer F, third act).
 *
 * An accepted API response is NOT proof that the intended state change
 * happened. After an approved execution, the resulting state is independently
 * re-read from Jira and compared with the proposal's expected change:
 *
 *   - comment operations → the target issue is fetched and its comments are
 *     searched for the proposal's unique trace marker;
 *   - create_remediation_issue → the created issue key is fetched directly.
 *
 * Outcomes:
 *   VERIFIED  — independent evidence confirms the write exists.
 *   MISMATCH  — the write is NOT confirmed in the source of truth.
 *   UNVERIFIED— the source of truth could not be read (never reported as
 *               success; the distinction from VERIFIED is preserved).
 *
 * Execution success and verification success are two separate facts with two
 * separate states (FR-290 / FR-316).
 */
import type { RemediationProposal } from './types';

export type VerificationOutcome = 'VERIFIED' | 'MISMATCH' | 'UNVERIFIED';

export interface VerificationResult {
  outcome: VerificationOutcome;
  /** What was checked and what was found — recorded in the audit ledger. */
  detail: string;
  /** Reference to the independently observed evidence (issue/comment id). */
  evidenceRef: string | null;
  verifiedAt: string;
}

/** Marker included in every approval-traced comment/issue ContextCourt writes. */
export function proposalTraceMarker(proposalId: string): string {
  return `[contextcourt:${proposalId}]`;
}

/** Comment bodies written by core/execution.ts embed this marker. */
export function commentIncludesMarker(body: unknown, marker: string): boolean {
  const text = extractText(body);
  return text.includes(marker);
}

/** ADF or plain-string body → text (read-only; tolerant of both shapes). */
function extractText(value: unknown): string {
  if (typeof value === 'string') return value;
  if (!value || typeof value !== 'object') return '';
  const parts: string[] = [];
  const walk = (node: unknown) => {
    if (!node || typeof node !== 'object') return;
    const n = node as { text?: unknown; content?: unknown };
    if (typeof n.text === 'string') parts.push(n.text);
    if (Array.isArray(n.content)) n.content.forEach(walk);
  };
  walk(value);
  return parts.join(' ');
}

/**
 * Independently verify the result of an executed proposal by re-reading
 * Jira. The fetcher is injected (production: asUser; tests: scripted).
 */
export async function verifyExecutionOutcome(args: {
  proposal: RemediationProposal;
  /** Jira reference returned by execution (created issue key or target key). */
  resultRef: string | null;
  fetcher: (
    path: string,
    init?: { method?: string; body?: unknown },
  ) => Promise<{
    ok: boolean;
    status: number;
    json: unknown;
  }>;
  now: Date;
}): Promise<VerificationResult> {
  const { proposal, fetcher, now } = args;
  const verifiedAt = now.toISOString();
  const marker = proposalTraceMarker(proposal.id);

  if (proposal.target === 'unspecified' || !args.resultRef) {
    return {
      outcome: 'UNVERIFIED',
      detail: 'no concrete result reference to verify against',
      evidenceRef: null,
      verifiedAt,
    };
  }

  try {
    if (proposal.operation === 'create_remediation_issue') {
      // Created issue: read it back directly.
      const res = await fetcher(`/rest/api/3/issue/${encodeURIComponent(args.resultRef)}?fields=summary`);
      if (!res.ok) {
        return {
          outcome: 'MISMATCH',
          detail: `created issue ${args.resultRef} could not be read back (status ${res.status})`,
          evidenceRef: null,
          verifiedAt,
        };
      }
      const summary = ((res.json as { fields?: { summary?: unknown } })?.fields?.summary ?? '') as string;
      return {
        outcome: 'VERIFIED',
        detail: `independently read back created issue ${args.resultRef} (summary: "${String(summary).slice(0, 80)}")`,
        evidenceRef: args.resultRef,
        verifiedAt,
      };
    }

    // Comment operations: read the target issue and search its comments for
    // this proposal's unique trace marker.
    const res = await fetcher(`/rest/api/3/issue/${encodeURIComponent(proposal.target)}?fields=comment`);
    if (!res.ok) {
      return {
        outcome: 'UNVERIFIED',
        detail: `target ${proposal.target} could not be read back for verification (status ${res.status})`,
        evidenceRef: null,
        verifiedAt,
      };
    }
    const comments = (res.json as { fields?: { comment?: { comments?: unknown[] } } })?.fields?.comment
      ?.comments;
    if (!Array.isArray(comments)) {
      return {
        outcome: 'UNVERIFIED',
        detail: `comment list unavailable on ${proposal.target}`,
        evidenceRef: null,
        verifiedAt,
      };
    }
    const found = comments.find((c) => commentIncludesMarker((c as { body?: unknown }).body, marker));
    if (!found) {
      return {
        outcome: 'MISMATCH',
        detail: `no comment carrying trace marker ${marker} found on ${proposal.target} (${comments.length} comment(s) read)`,
        evidenceRef: null,
        verifiedAt,
      };
    }
    return {
      outcome: 'VERIFIED',
      detail: `found the executed comment (trace marker ${marker}) on ${proposal.target}`,
      evidenceRef: `${proposal.target}#comment-${(found as { id?: unknown }).id ?? '?'}`,
      verifiedAt,
    };
  } catch (err) {
    return {
      outcome: 'UNVERIFIED',
      detail: `verification read failed: ${err instanceof Error ? err.message : 'unknown error'}`,
      evidenceRef: null,
      verifiedAt,
    };
  }
}
