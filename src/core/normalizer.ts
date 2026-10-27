/**
 * Layer B — claim normalization.
 *
 * Deterministic pattern extraction that turns extracted evidence text into
 * normalized propositions. Pattern extraction is an interpretation, not
 * verified truth: every proposition keeps `inferred` and a pointer to its
 * evidence record so downstream verification can re-check provenance.
 *
 * Never invents missing numeric values or conditions.
 */
import type { EvidenceRecord, Proposition } from './types';

let propositionCounter = 0;
function nextPropositionId(): string {
  propositionCounter += 1;
  return `prop_${propositionCounter.toString(36).padStart(8, '0')}`;
}

/** Reset the id sequence — used by tests to make assertions deterministic. */
export function resetPropositionIds(): void {
  propositionCounter = 0;
}

interface Pattern {
  predicate: string;
  polarity: string;
  /** Regex; capture group 1 is the subject phrase. */
  re: RegExp;
  condition?: string;
}

/**
 * Ordered pattern table. Each entry maps common policy/decision phrasings to a
 * normalized predicate + polarity. Only explicitly-stated patterns match —
 * there is no free-form "understanding" here.
 */
const PATTERNS: Pattern[] = [
  // Negations first — "does not require additional approval" must never be
  // captured by the affirmative "requires additional approval" pattern.
  {
    predicate: 'requiresAdditionalApproval',
    polarity: 'false',
    re: /\bdoes\s+not\s+(?:require|need)\s+(?:additional\s+)?approval\b/i,
  },
  {
    predicate: 'requiresAdditionalApproval',
    polarity: 'false',
    re: /\bno\s+(?:additional\s+)?approval\s+(?:is\s+)?required\b/i,
  },
  { predicate: 'approved', polarity: 'false', re: /\b(?:was|has\s+been|is)\s+not\s+approved\b/i },
  {
    predicate: 'forbidden',
    polarity: 'true',
    re: /\b(?:must\s+not|is\s+prohibited|are\s+prohibited|is\s+not\s+allowed|are\s+not\s+allowed)\b/i,
  },
  {
    predicate: 'releaseReady',
    polarity: 'false',
    re: /\b(?:not\s+ready\s+for\s+release|release\s+(?:is\s+)?(?:blocked|not\s+approved))\b/i,
  },
  {
    predicate: 'requiresAdditionalApproval',
    polarity: 'true',
    re: /\bmust\s+(?:be\s+)?(?:additionally\s+|further\s+)?approv(?:e|ed)\b/i,
  },
  {
    predicate: 'requiresAdditionalApproval',
    polarity: 'true',
    re: /\brequires?\s+(?:an?\s+)?(?:additional|secondary|second)\s+approval\b/i,
  },
  { predicate: 'requiresAdditionalApproval', polarity: 'true', re: /\brequires?\s+approval\s+from\b/i },
  { predicate: 'approved', polarity: 'true', re: /\b(?:was|has\s+been|is)\s+approved\b/i },
  { predicate: 'forbidden', polarity: 'false', re: /\bis\s+(?:permitted|allowed)\b/i },
  { predicate: 'supersededBy', polarity: 'true', re: /\bsupersed(?:es|ed\s+by)\b/i },
  {
    predicate: 'releaseReady',
    polarity: 'true',
    re: /\b(?:is\s+)?(?:ready\s+for\s+release|release\s+(?:is\s+)?(?:approved|ready))\b/i,
  },
  { predicate: 'blocksRelease', polarity: 'true', re: /\bblocks?\s+(?:the\s+)?release\b/i },
  { predicate: 'blockedBy', polarity: 'true', re: /\bblocked\s+by\b/i },
  { predicate: 'owner', polarity: 'stated', re: /\b(?:owned\s+by|responsible:\s*|owner:\s*)\s*(\S+)/i },
];

const SUBJECT_STOP = /(?:\.|,|;|—|!|\?|$)/;

/** Extract a short subject phrase preceding the matched operator text. */
function extractSubject(text: string, matchIndex: number): string {
  const before = text.slice(Math.max(0, matchIndex - 80), matchIndex).trim();
  const cleaned = before.replace(/^(?:the|a|an|this|that)\s+/i, '');
  const words = cleaned.split(/\s+/);
  const subject = words.slice(-6).join(' ');
  return subject || 'unspecified-subject';
}

/** Normalize a single evidence record's extracted text into propositions. */
export function normalizeEvidence(evidence: EvidenceRecord): Proposition[] {
  const text = evidence.extractedText;
  const propositions: Proposition[] = [];
  const sentences = text.split(/(?<=[.!?])\s+/);
  for (const sentence of sentences) {
    for (const p of PATTERNS) {
      const m = sentence.match(p.re);
      if (!m) continue;
      const subject = extractSubject(sentence, m.index ?? 0)
        .toLowerCase()
        .replace(SUBJECT_STOP, '');
      propositions.push({
        id: nextPropositionId(),
        subject: subject || 'unspecified-subject',
        predicate: p.predicate,
        object: p.polarity,
        originalText: sentence.trim(),
        condition: p.condition ?? null,
        evidenceId: evidence.id,
        sourceSystem: evidence.sourceSystem,
        sourceObjectId: evidence.sourceObjectId,
        inferred: false,
      });
      break; // one predicate per sentence — keep normalization conservative
    }
  }
  return propositions;
}

/** Normalize multiple records; preserves input order for stable ids. */
export function normalizeAll(evidence: EvidenceRecord[]): Proposition[] {
  return evidence.flatMap(normalizeEvidence);
}
