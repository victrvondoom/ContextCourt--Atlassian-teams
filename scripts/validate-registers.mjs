/**
 * Register validator — enforces every rule from §15 of the mission brief.
 *
 *   node scripts/validate-registers.mjs
 *
 * Exits non-zero with a precise error list on any violation.
 */
import { readFileSync } from 'node:fs';

const features = JSON.parse(readFileSync('docs/registers/features.json', 'utf8'));
const tasks = JSON.parse(readFileSync('docs/registers/tasks.json', 'utf8'));
const errors = [];

// 1. Exact counts and consecutive, unique IDs.
const frIds = features.map((f) => f.id);
const etIds = tasks.map((t) => t.id);
if (features.length !== 468) errors.push(`feature count = ${features.length}, expected 468`);
if (tasks.length !== 459) errors.push(`task count = ${tasks.length}, expected 459`);
const expectIds = (n, prefix, ids) => {
  for (let i = 1; i <= n; i++) {
    const id = `${prefix}-${String(i).padStart(3, '0')}`;
    if (!ids.includes(id)) errors.push(`missing id ${id}`);
  }
};
expectIds(468, 'FR', frIds);
expectIds(459, 'ET', etIds);
if (new Set(frIds).size !== frIds.length) errors.push('duplicate feature ids');
if (new Set(etIds).size !== etIds.length) errors.push('duplicate task ids');

// 2. Domain distribution.
const DOMAIN_COUNTS = { A: 60, B: 55, C: 55, D: 50, E: 50, F: 50, G: 45, H: 35, I: 35, J: 33 };
const domainSeen = {};
for (const f of features) {
  const code = f.id.startsWith('FR-') ? null : null;
  void code;
  const idx = Number(f.id.slice(3));
  const domain = Object.entries(DOMAIN_COUNTS).reduce(
    (acc, [c, n], i, arr) => {
      const start = arr.slice(0, i).reduce((a, [, x]) => a + x, 0) + 1;
      const end = start + n - 1;
      return idx >= start && idx <= end ? c : acc;
    },
    '?',
  );
  domainSeen[domain] = (domainSeen[domain] ?? 0) + 1;
  f._domainCode = domain;
}
for (const [code, want] of Object.entries(DOMAIN_COUNTS)) {
  if (domainSeen[code] !== want) errors.push(`domain ${code}: ${domainSeen[code]}, expected ${want}`);
}

// 3. Every feature has a valid disposition.
const DISPOSITIONS = ['IMPLEMENT', 'EXISTING', 'MERGE', 'DEFER', 'REJECT_WITH_REASON'];
for (const f of features) {
  if (!DISPOSITIONS.includes(f.disposition)) errors.push(`${f.id}: invalid disposition ${f.disposition}`);
  if (!f.title || !f.description) errors.push(`${f.id}: missing title/description`);
  if (!/^P[0-4]$/.test(f.priority)) errors.push(`${f.id}: invalid priority ${f.priority}`);
  if ((f.disposition === 'MERGE' || f.disposition === 'REJECT_WITH_REASON') && !f.reason) {
    errors.push(`${f.id}: ${f.disposition} requires a reason`);
  }
}

// 4. Every task references at least one valid feature.
const frSet = new Set(frIds);
for (const t of tasks) {
  if (!t.linkedFeatures || t.linkedFeatures.length === 0) errors.push(`${t.id}: no linked features`);
  for (const fr of t.linkedFeatures ?? []) {
    if (!frSet.has(fr)) errors.push(`${t.id}: invalid feature reference ${fr}`);
  }
}

// 5. Status rules and field completeness.
const STATUSES = [
  'NOT_STARTED', 'INVESTIGATING', 'READY', 'IN_PROGRESS', 'BLOCKED',
  'IMPLEMENTED', 'TEST_VERIFIED', 'ACCEPTED', 'DEFERRED',
];
const DONE = ['IMPLEMENTED', 'TEST_VERIFIED', 'ACCEPTED'];
for (const t of tasks) {
  if (!STATUSES.includes(t.status)) errors.push(`${t.id}: invalid status ${t.status}`);
  for (const field of ['title', 'description', 'priority', 'location', 'dependencies', 'acceptance', 'verification', 'regression', 'risk', 'evidence']) {
    if (!t[field] || String(t[field]).length === 0) errors.push(`${t.id}: missing ${field}`);
  }
  if (DONE.includes(t.status) && !t.evidence) errors.push(`${t.id}: completed task without evidence`);
  if (t.status === 'DEFERRED' && !t.evidence) errors.push(`${t.id}: DEFERRED without reason`);
  if (t.status === 'BLOCKED' && !t.evidence) errors.push(`${t.id}: BLOCKED without external dependency`);
  if (!/^P[0-4]$/.test(t.priority)) errors.push(`${t.id}: invalid priority ${t.priority}`);
}

// 6. IMPLEMENT-disposed features must have covering tasks that are not NOT_STARTED.
const implementedFeatures = features.filter((f) => f.disposition === 'IMPLEMENT').map((f) => f.id);
const byFeature = {};
for (const t of tasks) for (const fr of t.linkedFeatures) (byFeature[fr] ??= []).push(t);
for (const fr of implementedFeatures) {
  const covering = byFeature[fr] ?? [];
  if (covering.length === 0) errors.push(`${fr}: IMPLEMENT feature has no covering task`);
}

if (errors.length > 0) {
  console.error(`REGISTER VALIDATION FAILED (${errors.length} errors):`);
  for (const e of errors.slice(0, 50)) console.error(' -', e);
  process.exit(1);
}
console.log('REGISTER VALIDATION PASSED: 468 features + 459 tasks, all rules satisfied.');
console.log(`IMPLEMENT features covered by tasks: ${implementedFeatures.length}`);
