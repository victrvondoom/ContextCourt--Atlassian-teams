/**
 * Layer E — priority and impact.
 *
 * Confidence (how likely a contradiction is real) is kept strictly separate
 * from severity (how much it matters). Weighting is explicit and documented
 * so users can see why something is ranked the way it is.
 */
import type { DetectionType, Severity, SeverityAssessment, SeverityInputs } from './types';

/** Per-detection-type base severity weights. Tunable via configuration. */
export const DEFAULT_TYPE_WEIGHTS: Record<DetectionType, number> = {
  policy_violation: 0.9,
  direct_semantic_contradiction: 0.85,
  missing_required_approval: 0.8,
  release_readiness_discrepancy: 0.8,
  decision_supersession_conflict: 0.7,
  implementation_requirement_mismatch: 0.7,
  incompatible_requirements: 0.65,
  unresolved_dependency_conflict: 0.6,
  ownership_inconsistency: 0.4,
};

export interface SeverityWeights {
  type: number; // weight of detection type
  evidence: number;
  impact: number;
  recency: number;
  dependency: number;
}

export const DEFAULT_WEIGHTS: SeverityWeights = {
  type: 0.35,
  evidence: 0.3,
  impact: 0.15,
  recency: 0.1,
  dependency: 0.1,
};

export function assessSeverity(
  inputs: SeverityInputs,
  _now: Date,
  weights: SeverityWeights = DEFAULT_WEIGHTS,
): SeverityAssessment {
  const reasons: string[] = [];
  const typeScore = DEFAULT_TYPE_WEIGHTS[inputs.detectionType];
  reasons.push(`detection type ${inputs.detectionType} base weight ${typeScore.toFixed(2)}`);

  const evidenceScore = clamp01(inputs.evidenceStrength);
  reasons.push(`evidence strength ${evidenceScore.toFixed(2)}`);

  const impactScore = clamp01(Math.log2(1 + inputs.affectedWorkCount) / 3);
  reasons.push(`${inputs.affectedWorkCount} affected work item(s)`);

  // Recency: evidence older than 90 days scores 0; fresh evidence scores 1.
  const recencyScore = clamp01(1 - inputs.newestEvidenceAgeDays / 90);
  if (inputs.newestEvidenceAgeDays > 90) {
    reasons.push(`newest evidence is ${inputs.newestEvidenceAgeDays} days old — re-evaluation advised`);
  }

  const dependencyScore = inputs.hasVerifiedDependency ? 1 : 0;
  if (inputs.hasVerifiedDependency) {
    reasons.push('verified dependency relationship exists');
  }

  const score =
    weights.type * typeScore +
    weights.evidence * evidenceScore +
    weights.impact * impactScore +
    weights.recency * recencyScore +
    weights.dependency * dependencyScore;

  const severity: Severity =
    score >= 0.8 ? 'CRITICAL' : score >= 0.6 ? 'HIGH' : score >= 0.4 ? 'MEDIUM' : 'LOW';

  // Confidence mirrors evidence strength only — never severity.
  const confidence = evidenceScore;

  return { severity, confidence, reasons };
}

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n));
}
