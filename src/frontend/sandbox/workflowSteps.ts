/** Guided workflow steps for the sandbox overlay (copy only — no data claims). */
export const WORKFLOW_STEPS = [
  {
    id: 'overview',
    title: 'Run analysis',
    body: 'Enter a Jira issue key on the Overview screen. The engine gathers evidence from accessible sources — decisions, requirements, and implementation activity — and never reports a verified contradiction without it.',
  },
  {
    id: 'cases',
    title: 'Inspect cases',
    body: 'Detected contradictions become cases. Each case links back to the evidence records that support it, so every claim is traceable to a source object.',
  },
  {
    id: 'review',
    title: 'Review the queue',
    body: 'Remediation proposals wait here for a human decision. Nothing executes without an explicit approval bound to user, tenant, target, and payload digest.',
  },
  {
    id: 'audit',
    title: 'Follow the audit ledger',
    body: 'Every analysis, approval, and execution is recorded in a digest-chained ledger for tamper evidence.',
  },
] as const;
