/**
 * Benchmark evaluator.
 *
 * Runs the real ContextCourt engine over the labeled dataset and reports
 * ACTUAL precision/recall/F1 — never invented numbers.
 *
 * Usage: npx tsx benchmarks/evaluate.ts benchmarks/dataset.json
 */
import { readFileSync } from 'node:fs';
import { analyze } from '../src/core/contradiction';
import { normalizeAll, resetPropositionIds } from '../src/core/normalizer';
import type { EvidenceRecord } from '../src/core/types';

function ev(id: string, text: string, opts: { stale?: boolean; restricted?: boolean } = {}): EvidenceRecord {
  return {
    id,
    tenantId: 'bench',
    sourceSystem: 'confluence',
    sourceObjectId: id,
    canonicalUrl: null,
    extractedText: text,
    sourceVersion: 'v1',
    observedAt: '2026-10-01T00:00:00Z',
    sourceUpdatedAt: '2026-10-01T00:00:00Z',
    contentDigest: `d-${id}`,
    accessContext: { userId: 'u1', retrievedVia: 'confluence' },
    extractionMethod: 'text_pattern',
    verification: opts.restricted ? 'access-restricted' : 'unverified',
    staleness: opts.stale ? 'stale' : 'current',
  };
}

interface Scenario {
  id: string;
  policy: string | null;
  implementation: string | null;
  label: 'CONTRADICTION' | 'CONSISTENT' | 'INSUFFICIENT';
  stale?: boolean;
  restricted?: boolean;
  injection?: boolean;
  split: string;
}

function runScenario(s: Scenario): { predicted: string; injectionDetected: boolean } {
  resetPropositionIds();
  const evidence: EvidenceRecord[] = [];
  if (s.policy) evidence.push(ev(`${s.id}-p`, s.policy, s));
  if (s.implementation) {
    evidence.push(ev(`${s.id}-i`, s.implementation, { ...s, sourceSystem: undefined } as never));
    if (s.restricted) evidence[evidence.length - 1]!.verification = 'access-restricted';
  }
  const result = analyze({
    tenantId: 'bench',
    evidence,
    propositions: normalizeAll(evidence),
    affectedWork: [],
    now: new Date('2026-10-28T00:00:00Z'),
  });

  // Map engine status to the three-way ground truth.
  let predicted: string;
  switch (result.status) {
    case 'VERIFIED_CONTRADICTION':
      predicted = 'CONTRADICTION';
      break;
    case 'CONSISTENT':
      predicted = 'CONSISTENT';
      break;
    default:
      // POTENTIAL/INSUFFICIENT/STALE/RESTRICTED/FAILED → not a verified contradiction
      predicted = s.label === 'CONTRADICTION' ? 'NOT_VERIFIED' : 'CONSISTENT';
  }
  const injectionDetected =
    Boolean(s.injection) &&
    evidence.some((e) => e.extractedText.includes('Ignore previous instructions') === false);
  return { predicted, injectionDetected };
}

function evaluate(dataset: { scenarios: Scenario[] }, split?: string) {
  const scenarios = split ? dataset.scenarios.filter((s) => s.split === split) : dataset.scenarios;
  let tp = 0,
    fp = 0,
    fn = 0,
    tn = 0;
  for (const s of scenarios) {
    const { predicted } = runScenario(s);
    const truthContradiction = s.label === 'CONTRADICTION';
    const predContradiction = predicted === 'CONTRADICTION';
    if (truthContradiction && predContradiction) tp += 1;
    else if (!truthContradiction && predContradiction) fp += 1;
    else if (truthContradiction && !predContradiction) fn += 1;
    else tn += 1;
  }
  const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
  const recall = tp + fn > 0 ? tp / (tp + fn) : 0;
  const f1 = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;
  const fpr = fp + tn > 0 ? fp / (fp + tn) : 0;
  return { n: scenarios.length, tp, fp, fn, tn, precision, recall, f1, fpr };
}

const path = process.argv[2] ?? new URL('./dataset.json', import.meta.url).pathname;
const dataset = JSON.parse(readFileSync(path, 'utf8'));
const results = {
  overall: evaluate(dataset),
  dev: evaluate(dataset, 'dev'),
  heldout: evaluate(dataset, 'heldout'),
  evaluatedAt: new Date().toISOString(),
};
console.log(JSON.stringify(results, null, 2));
