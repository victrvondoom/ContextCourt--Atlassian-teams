/**
 * Shared evidence construction from Jira content.
 *
 * Single source of truth for the Custom UI resolver (`analyzeIssue`) and the
 * Rovo `get-evidence` action: untrusted description/comment text is always
 * sanitized, digested, and stamped with provenance before it becomes
 * evidence. Previously the Rovo path returned raw text — inconsistent with
 * the analysis path (defect: divergent evidence builders).
 */
import type { EvidenceRecord } from '../core/types';
import { sha256Hex } from '../core/digest';
import { sanitizeUntrusted } from '../security/injection';
import type { JiraIssue } from './jira';

export interface BuiltEvidence {
  evidence: EvidenceRecord;
  /** Human-readable source reference for citation in agent output. */
  citation: string;
  /** Prompt-injection flags detected while sanitizing the source text. */
  injectionFlags: string[];
}

/** Sanitize + digest one untrusted text span into an evidence record. */
export async function buildEvidenceRecord(args: {
  tenantId: string;
  userId: string;
  source: 'jira';
  objectId: string;
  text: string;
  sourceUpdatedAt: string;
  /** Short key used in the evidence id (e.g. "PAY-142" or "PAY-142-c0"). */
  key: string;
  citation: string;
}): Promise<BuiltEvidence> {
  const contentDigest = await sha256Hex(`${args.objectId}:${args.text}`);
  // Untrusted source content is sanitized before it ever becomes evidence.
  const { safeText, flags } = sanitizeUntrusted(args.text, `jira ${args.objectId}`);
  const evidence: EvidenceRecord = {
    id: `ev_${args.key.replace(/[^a-zA-Z0-9]/g, '-')}`,
    tenantId: args.tenantId,
    sourceSystem: args.source,
    sourceObjectId: args.objectId,
    canonicalUrl: null,
    extractedText: safeText,
    sourceVersion: args.sourceUpdatedAt,
    observedAt: new Date().toISOString(),
    sourceUpdatedAt: args.sourceUpdatedAt,
    contentDigest,
    accessContext: { userId: args.userId, retrievedVia: args.source },
    extractionMethod: 'api_field',
    verification: 'unverified',
    staleness: 'current',
  };
  return { evidence, citation: args.citation, injectionFlags: flags };
}

/** Build the full evidence set for one issue: description + all comments. */
export async function buildIssueEvidence(
  tenantId: string,
  userId: string,
  issue: JiraIssue,
): Promise<BuiltEvidence[]> {
  const out: BuiltEvidence[] = [];
  if (issue.description) {
    out.push(
      await buildEvidenceRecord({
        tenantId,
        userId,
        source: 'jira',
        objectId: issue.key,
        text: issue.description,
        sourceUpdatedAt: issue.updated ?? '',
        key: issue.key,
        citation: `Jira issue ${issue.key} (description), updated ${issue.updated ?? 'unknown'}`,
      }),
    );
  }
  for (let i = 0; i < issue.comments.length; i++) {
    const comment = issue.comments[i]!;
    out.push(
      await buildEvidenceRecord({
        tenantId,
        userId,
        source: 'jira',
        objectId: `${issue.key}:comment:${i}`,
        text: comment.body,
        sourceUpdatedAt: comment.created,
        key: `${issue.key}-c${i}`,
        citation: `Jira issue ${issue.key}, comment #${i} by ${comment.author} at ${comment.created}`,
      }),
    );
  }
  return out;
}
