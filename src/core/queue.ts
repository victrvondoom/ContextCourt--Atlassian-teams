/**
 * Review-queue ordering (Layer D / optimization surface).
 *
 * The queue order is NOT an arbitrary score. It is the review-utility
 * function documented in docs/QUEUE_DESIGN.md:
 *
 *   utility(p) = severityRank(p) * 100 + riskBoost(p) + ageHours(p)
 *
 * with hard constraints applied before ranking (PENDING_APPROVAL first —
 * decided and executed proposals leave the review workload), and a stable
 * tiebreak by proposal id so the order is fully deterministic:
 * same inputs → same order, every time.
 *
 * Factor rationale (each is a review-effort allocation judgement):
 *  - severity dominates: a CRITICAL contradiction deserves eyes before any
 *    LOW one regardless of age (FR-202);
 *  - risk boosts: higher-risk operations deserve faster review because the
 *    cost of delay is asymmetric (FR-200);
 *  - age accrues: every hour a proposal waits adds review priority, bounded
 *    so age can never outrank a whole severity class (FR-201).
 *
 * Invariants (tested in tests/unit/queue-ordering.test.ts):
 *  1. Determinism: identical inputs produce identical order.
 *  2. Severity dominance: CRITICAL+LOW-age always outranks HIGH-risk MEDIUM.
 *  3. Age monotonicity: within the same severity+risk, older ranks higher.
 *  4. Bound: age contribution can never cross a severity class boundary.
 */
import type { RemediationProposal, Severity } from './types';

export interface RankedProposal {
  proposal: RemediationProposal;
  /** Computed review utility — the number the order derives from. */
  utility: number;
  /** Human-readable explanation of why this proposal ranks here. */
  priorityExplanation: string;
}

const SEVERITY_WEIGHT: Record<Severity, number> = {
  CRITICAL: 400,
  HIGH: 300,
  MEDIUM: 200,
  LOW: 100,
};

const RISK_BOOST = { high: 40, medium: 20, low: 0 } as const;

/** Age contribution is linear in hours, bounded to stay below one class step. */
const MAX_AGE_BOOST = 90;

export function proposalSeverity(proposal: RemediationProposal): Severity {
  // Severity is carried from the supporting finding at draft time. Older
  // proposals (pre-severity field) degrade honestly to LOW — never invented.
  return severityOf(proposal) ?? 'LOW';
}

function severityOf(p: RemediationProposal): Severity | null {
  const s = (p as RemediationProposal & { severity?: Severity }).severity;
  return s === 'CRITICAL' || s === 'HIGH' || s === 'MEDIUM' || s === 'LOW' ? s : null;
}

export function reviewUtility(proposal: RemediationProposal, now: Date): number {
  const ageHours = Math.max(0, (now.getTime() - new Date(proposal.createdAt).getTime()) / (1000 * 60 * 60));
  const ageBoost = Math.min(ageHours, MAX_AGE_BOOST);
  return SEVERITY_WEIGHT[proposalSeverity(proposal)] + RISK_BOOST[proposal.risk] + ageBoost;
}

export function priorityExplanationFor(proposal: RemediationProposal, now: Date): string {
  const ageHours = Math.max(
    0,
    (now.getTime() - new Date(proposal.createdAt).getTime()) / (1000 * 60 * 60),
  ).toFixed(1);
  return `${proposalSeverity(proposal)} severity (base ${SEVERITY_WEIGHT[proposalSeverity(proposal)]}) + ${proposal.risk} risk (+${RISK_BOOST[proposal.risk]}) + ${ageHours}h waiting (+${Math.min(Number(ageHours), MAX_AGE_BOOST)})`;
}

/**
 * Rank the review queue: PENDING_APPROVAL first (newest-utility first),
 * then already-decided/executed items for history, each group in utility
 * order with a deterministic id tiebreak.
 */
export function orderReviewQueue(proposals: RemediationProposal[], now: Date = new Date()): RankedProposal[] {
  const withUtility = proposals.map((p) => {
    const utility = reviewUtility(p, now);
    return {
      proposal: p,
      utility,
      priorityExplanation: priorityExplanationFor(p, now),
      pending: p.state === 'PENDING_APPROVAL',
    };
  });
  const byUtilityThenId = (a: (typeof withUtility)[number], b: (typeof withUtility)[number]) =>
    b.utility - a.utility || a.proposal.id.localeCompare(b.proposal.id);
  const pending = withUtility.filter((x) => x.pending).sort(byUtilityThenId);
  const rest = withUtility.filter((x) => !x.pending).sort(byUtilityThenId);
  return [...pending, ...rest].map(({ proposal, utility, priorityExplanation }) => ({
    proposal,
    utility,
    priorityExplanation,
  }));
}
