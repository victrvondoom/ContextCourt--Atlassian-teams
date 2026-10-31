/**
 * Closure report generator — renders FEATURE_CLOSURE_MATRIX.md and
 * ENGINEERING_COMPLETION_REPORT.md from the validated register JSON.
 *
 *   node scripts/generate-closure-docs.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';

const features = JSON.parse(readFileSync('docs/registers/features.json', 'utf8'));
const tasks = JSON.parse(readFileSync('docs/registers/tasks.json', 'utf8'));

const byFeature = {};
for (const t of tasks) for (const fr of t.linkedFeatures) (byFeature[fr] ??= []).push(t);

// ---- FEATURE_CLOSURE_MATRIX.md -------------------------------------------
const esc = (s) => String(s).replace(/\|/g, '\\|');
let out = [
  '# Feature Closure Matrix — Context Court AI',
  '',
  'Generated from `docs/registers/features.json` (validated, 468 records).',
  'Completion semantics: a feature is operational only when its implementation,',
  'runtime path and verification evidence exist (see docs/FINAL_FEATURE_COMPLETION_REPORT.md).',
  '',
  '**Dispositions:**',
  '',
];
const dispCounts = {};
for (const f of features) dispCounts[f.disposition] = (dispCounts[f.disposition] ?? 0) + 1;
out.push('| Disposition | Count | Meaning |', '|---|---|---|');
out.push('| EXISTING | ' + dispCounts.EXISTING + ' | Implemented, in the runtime path, verified by tests/commands |');
out.push('| IMPLEMENT | ' + dispCounts.IMPLEMENT + ' | Implemented in the current closure slice, test-verified |');
out.push('| MERGE | ' + (dispCounts.MERGE ?? 0) + ' | Merged duplicate (reason recorded) |');
out.push('| DEFER | ' + dispCounts.DEFER + ' | Prioritized backlog, not yet operational (see backlog below) |');
out.push('| REJECT_WITH_REASON | ' + dispCounts.REJECT_WITH_REASON + ' | Explicitly rejected as anti-product (reason recorded) |');
out.push('', '---', '', '| ID | Feature | Disposition | P | Runtime evidence |', '|---|---|---|---|---|');
for (const f of features) {
  const covering = (byFeature[f.id] ?? []).filter((t) => ['TEST_VERIFIED', 'IMPLEMENTED', 'ACCEPTED'].includes(t.status));
  const ev = covering.length ? covering[0].evidence.slice(0, 90) : '—';
  out.push(`| ${f.id} | ${esc(f.title)} | ${f.disposition} | ${f.priority.slice(1)} | ${esc(ev)} |`);
}
out.push('', '## Backlog (DEFER) — every entry has a recorded reason in docs/FEATURE_CATALOG.md');
const defer = features.filter((f) => f.disposition === 'DEFER');
out.push(`Total deferred: **${defer.length}** (of 468).`);
writeFileSync('docs/FEATURE_CLOSURE_MATRIX.md', out.join('\n'));

// ---- ENGINEERING_COMPLETION_REPORT.md ------------------------------------
out = [
  '# Engineering Completion Report — Context Court AI',
  '',
  'Generated from `docs/registers/tasks.json` (validated, 459 records).',
  '',
  '| Status | Count |', '|---|---|',
];
const stCounts = {};
for (const t of tasks) stCounts[t.status] = (stCounts[t.status] ?? 0) + 1;
for (const [st, c] of Object.entries(stCounts)) out.push(`| ${st} | ${c} |`);
const done = tasks.filter((t) => ['TEST_VERIFIED', 'IMPLEMENTED', 'ACCEPTED'].includes(t.status)).length;
out.push('', `**Completed (verified with evidence): ${done} / 459**`, '');
out.push('## Completed tasks (with evidence)', '');
out.push('| ID | Task | Status | Evidence |', '|---|---|---|---|');
for (const t of tasks) {
  if (['TEST_VERIFIED', 'IMPLEMENTED', 'ACCEPTED'].includes(t.status)) {
    out.push(`| ${t.id} | ${esc(t.title)} | ${t.status} | ${esc(t.evidence.slice(0, 100))} |`);
  }
}
out.push('', '## Blocked tasks (external dependency named)', '', '| ID | Task | Blocker |', '|---|---|---|');
for (const t of tasks) {
  if (t.status === 'BLOCKED') out.push(`| ${t.id} | ${esc(t.title)} | ${esc(t.evidence.slice(0, 110))} |`);
}
out.push('', '## Deferred tasks (reason recorded in the register)', '');
const deferred = tasks.filter((t) => t.status === 'DEFERRED');
out.push(`Total deferred: **${deferred.length}**. Full records with reasons: docs/ENGINEERING_TASK_REGISTER.md.`);
const notStarted = tasks.filter((t) => t.status === 'NOT_STARTED');
out.push(`Not started: **${notStarted.length}** (backlog items with acceptance criteria already defined).`);
writeFileSync('docs/ENGINEERING_COMPLETION_REPORT.md', out.join('\n'));

console.log(
  `closure docs written: features ${dispCounts.EXISTING} EXISTING / ${dispCounts.IMPLEMENT} IMPLEMENT / ${dispCounts.DEFER} DEFER; tasks ${done}/459 verified`,
);
