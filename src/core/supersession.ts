/**
 * Decision supersession analysis (Layer C/D).
 *
 * A superseded decision referenced by active work produces a
 * DECISION_SUPERSESSION_CONFLICT candidate only when BOTH sides have
 * evidence: the superseding decision record and the referencing artifact.
 * A superseded decision alone is never a verified conflict.
 */
import type { DecisionRecord, EvidenceRecord, Finding } from './types';
import { assessSeverity } from './severity';

export interface SupersessionInput {
  tenantId: string;
  decisions: DecisionRecord[];
  /** Evidence records that may still reference superseded decisions. */
  references: EvidenceRecord[];
  affectedWork: Array<{ type: 'jira_issue'; key: string }>;
  now: Date;
}

let supersessionCounter = 0;

/** Find active-work references to superseded decisions. */
export function detectSupersessionConflicts(input: SupersessionInput): Finding[] {
  const superseded = input.decisions.filter((d) => d.approvalState === 'superseded');
  const findings: Finding[] = [];

  for (const ref of input.references) {
    for (const decision of superseded) {
      // The reference must actually mention this decision's subject.
      if (!referencesSubject(ref.extractedText, decision.subject)) continue;

      // Evidence on both sides required: the superseding decision record plus
      // the referencing artifact. One-sided → not reported as verified.
      const supersedingEvidence = decision.evidenceIds.length > 0;
      if (!supersedingEvidence) continue;

      supersessionCounter += 1;
      const assessment = assessSeverity(
        {
          detectionType: 'decision_supersession_conflict',
          evidenceStrength: ref.verification === 'verified' ? 1 : 0.5,
          affectedWorkCount: input.affectedWork.length,
          newestEvidenceAgeDays: daysBetween(decision.supersededDate ?? decision.effectiveDate, input.now),
          hasVerifiedDependency: false,
        },
        input.now,
      );
      findings.push({
        findingId: `finding_ss_${supersessionCounter}`,
        tenantId: input.tenantId,
        type: 'decision_supersession_conflict',
        status: ref.verification === 'verified' ? 'VERIFIED_CONTRADICTION' : 'POTENTIAL_CONTRADICTION',
        explanation:
          `Work references decision "${decision.subject}" which was superseded` +
          (decision.supersededDate ? ` on ${decision.supersededDate}` : '') +
          `. Evidence: ${[decision.evidenceIds[0], ref.id].filter(Boolean).join(', ')}`,
        supportingEvidenceIds: [decision.evidenceIds[0], ref.id].filter(
          (id): id is string => Boolean(id),
        ),
        competingClaims: [
          { statement: `Decision "${decision.subject}" superseded`, evidenceId: decision.evidenceIds[0] ?? ref.id },
          { statement: ref.extractedText, evidenceId: ref.id },
        ],
        confidence: assessment.confidence,
        severity: assessment.severity,
        detectedAt: input.now.toISOString(),
        affectedWork: input.affectedWork,
        provenance: [
          {
            evidenceId: ref.id,
            sourceSystem: ref.sourceSystem,
            sourceObjectId: ref.sourceObjectId,
          },
        ],
      });
    }
  }
  return findings;
}

function referencesSubject(text: string, subject: string): boolean {
  const words = subject.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
  if (words.length === 0) return false;
  const lower = text.toLowerCase();
  return words.some((w) => lower.includes(w));
}

function daysBetween(from: string | null, now: Date): number {
  if (!from) return 0;
  const t = Date.parse(from);
  if (Number.isNaN(t)) return 0;
  return Math.max(0, (now.getTime() - t) / 86_400_000);
}
