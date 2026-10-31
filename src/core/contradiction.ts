/**
 * Layers C+D — contradiction detection and verification.
 *
 * Candidates are generated from normalized propositions, then every candidate
 * passes the verification pipeline. Verification can only *downgrade* or
 * confirm with evidence — an explanation (AI or otherwise) can never upgrade
 * an uncertain result into a verified one.
 */
import type {
  ContradictionStatus,
  DetectionType,
  EvidenceRecord,
  Finding,
  Proposition,
  SeverityAssessment,
} from './types';
import { assessSeverity } from './severity';

export interface AnalysisFailure {
  reason: string;
  integration: string;
}

export interface AnalysisResult {
  status: ContradictionStatus;
  findings: Finding[];
  /** Present when the analysis itself failed (e.g. an integration was unavailable). */
  failure: AnalysisFailure | null;
  evaluatedAt: string;
}

export interface AnalysisInput {
  tenantId: string;
  /** Evidence the analysis is permitted to use (already permission-filtered upstream). */
  evidence: EvidenceRecord[];
  propositions: Proposition[];
  /** Jira keys already linked as affected work, for impact sizing. */
  affectedWork: Array<{ type: 'jira_issue'; key: string }>;
  now?: Date;
}

let findingCounter = 0;
function nextFindingId(): string {
  findingCounter += 1;
  return `finding_${findingCounter.toString(36).padStart(8, '0')}`;
}
export function resetFindingIds(): void {
  findingCounter = 0;
}

// ---------------------------------------------------------------------------
// Verification pipeline (Layer D)
// ---------------------------------------------------------------------------

export interface VerificationStep {
  step: string;
  passed: boolean;
  detail: string;
}

/** Run the full verification pipeline for a candidate pair of propositions. */
export function verifyCandidate(
  a: Proposition,
  b: Proposition,
  evidenceById: Map<string, EvidenceRecord>,
): { status: ContradictionStatus; steps: VerificationStep[] } {
  const steps: VerificationStep[] = [];
  const evA = evidenceById.get(a.evidenceId);
  const evB = evidenceById.get(b.evidenceId);

  if (!evA || !evB) {
    steps.push({
      step: 'source_availability',
      passed: false,
      detail: 'one or both evidence records unavailable',
    });
    return { status: 'INSUFFICIENT_EVIDENCE', steps };
  }
  steps.push({ step: 'source_availability', passed: true, detail: 'both evidence records available' });

  if (evA.verification === 'access-restricted' || evB.verification === 'access-restricted') {
    steps.push({ step: 'permission_check', passed: false, detail: 'evidence marked access-restricted' });
    return { status: 'ACCESS_RESTRICTED', steps };
  }
  steps.push({ step: 'permission_check', passed: true, detail: 'evidence within caller permissions' });

  if (evA.staleness === 'stale' || evB.staleness === 'stale') {
    steps.push({ step: 'temporal_validity', passed: false, detail: 'stale evidence requires re-evaluation' });
    return { status: 'STALE_EVIDENCE', steps };
  }
  steps.push({ step: 'temporal_validity', passed: true, detail: 'evidence is current' });

  // Supersession: a proposition citing a superseded decision cannot verify a
  // contradiction against the superseding decision — the conflict may just be
  // an out-of-date reference. Re-check via explicit supersededBy markers.
  if (hasSupersessionMarker(evA) || hasSupersessionMarker(evB)) {
    steps.push({
      step: 'supersession_check',
      passed: false,
      detail: 'decision superseded; conflict may be temporal',
    });
    return { status: 'POTENTIAL_CONTRADICTION', steps };
  }
  steps.push({ step: 'supersession_check', passed: true, detail: 'no supersession markers' });

  // Claim compatibility: both propositions must make genuinely opposing
  // claims about the same subject. If either is inferred or low-context we
  // can only report a potential contradiction.
  const bothExplicit = !a.inferred && !b.inferred;
  if (!bothExplicit) {
    steps.push({
      step: 'claim_compatibility',
      passed: false,
      detail: 'at least one side inferred, not explicit',
    });
    return { status: 'POTENTIAL_CONTRADICTION', steps };
  }
  steps.push({ step: 'claim_compatibility', passed: true, detail: 'both claims explicit' });

  // Evidence sufficiency: contradiction needs evidence on BOTH sides.
  if (a.evidenceId === b.evidenceId) {
    steps.push({ step: 'evidence_sufficiency', passed: false, detail: 'single-sided evidence' });
    return { status: 'INSUFFICIENT_EVIDENCE', steps };
  }
  steps.push({ step: 'evidence_sufficiency', passed: true, detail: 'evidence present on both sides' });

  steps.push({
    step: 'classification',
    passed: true,
    detail: 'opposing explicit claims from distinct sources',
  });
  return { status: 'VERIFIED_CONTRADICTION', steps };
}

function hasSupersessionMarker(ev: EvidenceRecord): boolean {
  return /supersed/i.test(ev.extractedText);
}

/** Age in days of the newest evidence record backing a candidate pair. */
function newestEvidenceAgeDays(
  props: Proposition[],
  evidenceById: Map<string, EvidenceRecord>,
  now: Date,
): number {
  let newest = Number.POSITIVE_INFINITY;
  for (const p of props) {
    const ev = evidenceById.get(p.evidenceId);
    if (!ev) continue;
    const t = Date.parse(ev.sourceUpdatedAt || ev.observedAt);
    if (!Number.isNaN(t)) newest = Math.min(newest, t);
  }
  if (!Number.isFinite(newest)) return 0;
  return Math.max(0, (now.getTime() - newest) / 86_400_000);
}

// ---------------------------------------------------------------------------
// Candidate generation (Layer C)
// ---------------------------------------------------------------------------

interface Candidate {
  type: DetectionType;
  a: Proposition;
  b: Proposition;
}

/** Predicate polarities that directly oppose each other. */
const OPPOSING: Record<string, Record<string, string>> = {
  requiresAdditionalApproval: { true: 'false', false: 'true' },
  approved: { true: 'false', false: 'true' },
  forbidden: { true: 'false', false: 'true' },
  releaseReady: { true: 'false', false: 'true' },
};

/** Content tokens of a subject, singularized and stopword-free. */
const STOPWORDS = new Set(['the', 'a', 'an', 'this', 'that', 'these', 'those', 'is', 'are', 'was', 'were']);
const WILDCARD = 'unspecified-subject';

function subjectTokens(subject: string): Set<string> {
  return new Set(
    subject
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((w) => w.length > 2 && !STOPWORDS.has(w))
      .map((w) => (w.length > 3 && w.endsWith('s') ? w.slice(0, -1) : w)),
  );
}

function subjectsCompatible(a: string, b: string): boolean {
  if (a === WILDCARD || b === WILDCARD) return true;
  const ta = subjectTokens(a);
  const tb = subjectTokens(b);
  for (const t of ta) {
    if (tb.has(t)) return true;
  }
  return false;
}

export function generateCandidates(propositions: Proposition[]): Candidate[] {
  const candidates: Candidate[] = [];
  for (let i = 0; i < propositions.length; i++) {
    for (let j = i + 1; j < propositions.length; j++) {
      const a = propositions[i]!;
      const b = propositions[j]!;
      if (!subjectsCompatible(a.subject, b.subject)) continue;
      if (a.predicate === b.predicate && OPPOSING[a.predicate]?.[a.object] === b.object) {
        candidates.push({ type: 'direct_semantic_contradiction', a, b });
      }
    }
  }
  return candidates;
}

// ---------------------------------------------------------------------------
// Full analysis pipeline
// ---------------------------------------------------------------------------

/**
 * Analyze an evidence set. If the caller reports an integration failure,
 * analysis reports ANALYSIS_FAILED rather than silently returning empty
 * (which would falsely imply "consistent").
 */
export function analyze(input: AnalysisInput, failure: AnalysisFailure | null = null): AnalysisResult {
  const now = input.now ?? new Date();

  if (failure) {
    return {
      status: 'ANALYSIS_FAILED',
      findings: [],
      failure,
      evaluatedAt: now.toISOString(),
    };
  }

  if (input.evidence.length === 0 || input.propositions.length === 0) {
    // Fundamental invariant: no evidence → no verified contradiction.
    return {
      status: 'INSUFFICIENT_EVIDENCE',
      findings: [],
      failure: null,
      evaluatedAt: now.toISOString(),
    };
  }

  const evidenceById = new Map(input.evidence.map((e) => [e.id, e]));
  const candidates = generateCandidates(input.propositions);

  // A contradiction claim requires evidence on both sides; with fewer than two
  // records there is nothing to oppose and nothing is verifiable.
  if (input.evidence.length < 2 || candidates.length === 0) {
    return {
      status: input.evidence.length < 2 ? 'INSUFFICIENT_EVIDENCE' : 'CONSISTENT',
      findings: [],
      failure: null,
      evaluatedAt: now.toISOString(),
    };
  }

  const findings: Finding[] = [];
  const seen = new Set<string>();
  const statuses = new Set<ContradictionStatus>();

  for (const c of candidates) {
    const { status, steps } = verifyCandidate(c.a, c.b, evidenceById);
    statuses.add(status);
    if (status === 'VERIFIED_CONTRADICTION' || status === 'POTENTIAL_CONTRADICTION') {
      // Duplicate detection: same two evidence ids → one finding.
      const dedupeKey = [c.a.evidenceId, c.b.evidenceId].sort().join('|');
      if (seen.has(dedupeKey)) continue;
      seen.add(dedupeKey);

      const failedStep = steps.find((s) => !s.passed);
      const assessment: SeverityAssessment = assessSeverity(
        {
          detectionType: c.type,
          evidenceStrength: status === 'VERIFIED_CONTRADICTION' ? 1 : 0.5,
          affectedWorkCount: input.affectedWork.length,
          // Real age of the pair's evidence — a hardcoded 0 would make the
          // recency term always maximal and inflate severity (defect CC-005).
          newestEvidenceAgeDays: newestEvidenceAgeDays([c.a, c.b], evidenceById, now),
          hasVerifiedDependency: false,
        },
        now,
      );

      const failing = status === 'POTENTIAL_CONTRADICTION' && failedStep;
      findings.push({
        findingId: nextFindingId(),
        tenantId: input.tenantId,
        type: c.type,
        status,
        explanation: failing
          ? `${c.type.replace(/_/g, ' ')} candidate downgraded to ${status}: ${failedStep.detail}. Evidence: ${[c.a.evidenceId, c.b.evidenceId].join(', ')}`
          : `${c.type.replace(/_/g, ' ')} verified between "${c.a.originalText}" and "${c.b.originalText}". Evidence: ${[c.a.evidenceId, c.b.evidenceId].join(', ')}`,
        supportingEvidenceIds: [c.a.evidenceId, c.b.evidenceId],
        competingClaims: [
          { statement: c.a.originalText, evidenceId: c.a.evidenceId },
          { statement: c.b.originalText, evidenceId: c.b.evidenceId },
        ],
        confidence: assessment.confidence,
        severity: assessment.severity,
        detectedAt: now.toISOString(),
        affectedWork: input.affectedWork,
        provenance: [c.a, c.b].map((p) => ({
          evidenceId: p.evidenceId,
          sourceSystem: p.sourceSystem,
          sourceObjectId: p.sourceObjectId,
        })),
      });
    }
  }

  const hasVerified = statuses.has('VERIFIED_CONTRADICTION');
  const hasPotential = statuses.has('POTENTIAL_CONTRADICTION');
  const overall: ContradictionStatus = hasVerified
    ? 'VERIFIED_CONTRADICTION'
    : hasPotential
      ? 'POTENTIAL_CONTRADICTION'
      : statuses.has('STALE_EVIDENCE')
        ? 'STALE_EVIDENCE'
        : statuses.has('ACCESS_RESTRICTED')
          ? 'ACCESS_RESTRICTED'
          : 'CONSISTENT';

  return { status: overall, findings, failure: null, evaluatedAt: now.toISOString() };
}
