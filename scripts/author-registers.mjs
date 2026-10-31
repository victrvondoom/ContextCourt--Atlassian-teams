/**
 * Register emitter — assembles the authored data into JSON + markdown docs.
 *
 *   node scripts/author-registers.mjs
 *
 * Sources: scripts/register-data/*.mjs (hand-authored, single source of truth)
 * Outputs: docs/registers/features.json, docs/registers/tasks.json,
 *          docs/FEATURE_CATALOG.md, docs/ENGINEERING_TASK_REGISTER.md,
 *          docs/FEATURE_TO_TASK_TRACEABILITY.md
 * Then run scripts/validate-registers.mjs to enforce all §15 rules.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { FEATURES_1 } from './register-data/features-1.mjs';
import { FEATURES_2 } from './register-data/features-2.mjs';
import { FEATURES_3 } from './register-data/features-3.mjs';
import { TASKS_1 } from './register-data/tasks-1.mjs';
import { TASKS_2 } from './register-data/tasks-2.mjs';
import { TASKS_3 } from './register-data/tasks-3.mjs';
import { TASKS_4 } from './register-data/tasks-4.mjs';
import { TASKS_5 } from './register-data/tasks-6.mjs';
import { TASKS_7 } from './register-data/tasks-7.mjs';

const DOMAINS = [
  ['A', 'Product experience and workflows', 60],
  ['B', 'Context engineering and evidence provenance', 55],
  ['C', 'Agentic intelligence and reasoning', 55],
  ['D', 'Remediation intelligence and optimization', 50],
  ['E', 'Governance, approval and human control', 50],
  ['F', 'Execution, security and reliability', 50],
  ['G', 'Atlassian and collaboration integration', 45],
  ['H', 'Audit, observability and analytics', 35],
  ['I', 'Cloud-native platform and developer experience', 35],
  ['J', 'Hackathon demonstration, evaluation and differentiation', 33],
];

const WORKSTREAMS = [
  ['1', 'Repository audit and architectural foundation', 45],
  ['2', 'Product workflows and frontend', 55],
  ['3', 'Context and evidence engineering', 50],
  ['4', 'Agent architecture and reasoning', 45],
  ['5', 'Optimization and review queue', 45],
  ['6', 'Security and governance', 50],
  ['7', 'Atlassian integration', 50],
  ['8', 'Audit, observability and analytics', 40],
  ['9', 'Testing, evaluation and benchmarks', 45],
  ['10', 'Hackathon demonstration and delivery', 34],
];

// ---- Features -------------------------------------------------------------
const featureRows = [...FEATURES_1, ...FEATURES_2, ...FEATURES_3];
const features = [];
let fi = 0;
for (const [code, name, count] of DOMAINS) {
  for (let k = 0; k < count; k++) {
    const r = featureRows[fi];
    if (!r) throw new Error(`feature underflow at FR-${String(fi + 1).padStart(3, '0')} (domain ${code})`);
    features.push({
      id: `FR-${String(fi + 1).padStart(3, '0')}`,
      domain: `${code}. ${name}`,
      title: r[0],
      description: r[1],
      disposition: r[2],
      priority: `P${r[3]}`,
      ...(r[4] ? { reason: r[4] } : {}),
    });
    fi++;
  }
}

// ---- Tasks ----------------------------------------------------------------
const taskRows = [...TASKS_1, ...TASKS_2, ...TASKS_3, ...TASKS_4, ...TASKS_5, ...TASKS_7];
const tasks = [];
let ti = 0;
for (const [code, name, count] of WORKSTREAMS) {
  for (let k = 0; k < count; k++) {
    const r = taskRows[ti];
    if (!r) throw new Error(`task underflow at ET-${String(ti + 1).padStart(3, '0')} (workstream ${code})`);
    const fr = String(r[2]);
    tasks.push({
      id: `ET-${String(ti + 1).padStart(3, '0')}`,
      workstream: `${code}. ${name}`,
      title: r[0],
      description: r[1],
      linkedFeatures: fr.includes('..') ? expandRange(fr) : fr.split(',').map((s) => s.trim()).filter(Boolean),
      priority: `P${r[3]}`,
      location: r[4],
      dependencies: r[5],
      acceptance: r[6],
      verification: r[7],
      regression: r[8],
      risk: r[9],
      status: r[10],
      evidence: r[11],
    });
    ti++;
  }
}

function expandRange(spec) {
  // e.g. 'FR-116..FR-127' → every id in range
  const parts = spec.split(',').map((s) => s.trim());
  const out = [];
  for (const p of parts) {
    const m = p.match(/^FR-(\d+)\.\.FR-(\d+)$/);
    if (m) {
      for (let n = Number(m[1]); n <= Number(m[2]); n++) out.push(`FR-${String(n).padStart(3, '0')}`);
    } else if (p) out.push(p);
  }
  return out;
}

if (featureRows.length !== 468) throw new Error(`feature rows = ${featureRows.length}, expected 468`);
if (taskRows.length !== 459) throw new Error(`task rows = ${taskRows.length}, expected 459`);

// ---- Emit JSON ------------------------------------------------------------
mkdirSync('docs/registers', { recursive: true });
writeFileSync('docs/registers/features.json', JSON.stringify(features, null, 2) + '\n');
writeFileSync('docs/registers/tasks.json', JSON.stringify(tasks, null, 2) + '\n');

// ---- Emit markdown --------------------------------------------------------
const esc = (s) => String(s).replace(/\|/g, '\\|');

const cat = ['# Feature Catalogue — ContextCourt AI', '', 'Generated from `scripts/register-data/` (single source of truth). Validated by `scripts/validate-registers.mjs`.', '', `**468 capabilities** across 10 domains. Dispositions: IMPLEMENT (this mission slice), EXISTING (already implemented and verified), MERGE (merged duplicate with reason), DEFER (prioritized backlog), REJECT_WITH_REASON (explicitly rejected as anti-product).`, ''];
const dispCounts = {};
for (const f of features) dispCounts[f.disposition] = (dispCounts[f.disposition] ?? 0) + 1;
cat.push('| Disposition | Count |', '|---|---|');
for (const [d, c] of Object.entries(dispCounts)) cat.push(`| ${d} | ${c} |`);
cat.push('', '---', '');
let lastDomain = '';
for (const f of features) {
  if (f.domain !== lastDomain) {
    cat.push(`## Domain ${f.domain}`, '');
    lastDomain = f.domain;
  }
  cat.push(`### ${f.id} — ${esc(f.title)}`, '', `- **Description:** ${esc(f.description)}`, `- **Disposition:** ${f.disposition}${f.reason ? ` — ${esc(f.reason)}` : ''}`, `- **Priority:** ${f.priority}`, '');
}
writeFileSync('docs/FEATURE_CATALOG.md', cat.join('\n'));

const reg = ['# Engineering Task Register — ContextCourt AI', '', 'Generated from `scripts/register-data/` (single source of truth). Validated by `scripts/validate-registers.mjs`.', '', `**459 tasks** across 10 workstreams. Statuses are honest: a task is complete only when its acceptance criteria are satisfied AND its evidence is recorded.`, ''];
const stCounts = {};
for (const t of tasks) stCounts[t.status] = (stCounts[t.status] ?? 0) + 1;
reg.push('| Status | Count |', '|---|---|');
for (const [s, c] of Object.entries(stCounts)) reg.push(`| ${s} | ${c} |`);
reg.push('', '---', '');
let lastWs = '';
for (const t of tasks) {
  if (t.workstream !== lastWs) {
    reg.push(`## Workstream ${t.workstream}`, '');
    lastWs = t.workstream;
  }
  reg.push(`### ${t.id} — ${esc(t.title)}`, '', `- **Description:** ${esc(t.description)}`, `- **Linked features:** ${t.linkedFeatures.join(', ')}`, `- **Priority:** ${t.priority} · **Status:** ${t.status}`, `- **Location:** ${esc(t.location)} · **Deps:** ${esc(t.dependencies)}`, `- **Acceptance:** ${esc(t.acceptance)}`, `- **Verification:** ${esc(t.verification)} · **Regression:** ${esc(t.regression)}`, `- **Risk:** ${esc(t.risk)}`, `- **Evidence:** ${esc(t.evidence)}`, '');
}
writeFileSync('docs/ENGINEERING_TASK_REGISTER.md', reg.join('\n'));

const trace = ['# Feature → Task Traceability — ContextCourt AI', '', 'Generated from the registers. Every engineering task references at least one feature; features reference their covering tasks (a feature with no task is either EXISTING-with-evidence or explicitly deferred/rejected).', ''];
const byFeature = {};
for (const t of tasks) for (const fr of t.linkedFeatures) (byFeature[fr] ??= []).push(t.id);
const covered = new Set(Object.keys(byFeature));
trace.push(`- Tasks referencing features: **${tasks.length}**`, `- Features covered by ≥1 task: **${covered.size} / ${features.length}**`, '');
trace.push('| Feature | Title | Disposition | Covering tasks |', '|---|---|---|---|');
for (const f of features) {
  trace.push(`| ${f.id} | ${esc(f.title)} | ${f.disposition} | ${(byFeature[f.id] ?? []).join(', ') || '—'} |`);
}
writeFileSync('docs/FEATURE_TO_TASK_TRACEABILITY.md', trace.join('\n'));

console.log(`features: ${features.length} (rows ${featureRows.length})`);
console.log(`tasks: ${tasks.length} (rows ${taskRows.length})`);
console.log('wrote docs/registers/*.json + 3 markdown docs');
