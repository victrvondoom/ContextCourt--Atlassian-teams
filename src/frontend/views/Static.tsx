import type { HealthStatus } from '../types';

/**
 * M0 placeholder views. Each states honestly that data comes from live
 * analysis only — no synthetic filler. They are replaced by full
 * implementations in later milestones.
 */
export function Cases() {
  return (
    <div className="view">
      <header className="view-header">
        <h1>Cases</h1>
        <p className="muted">Contradiction cases created by live analysis appear here.</p>
      </header>
      <section className="card">
        <p className="muted">No cases yet. Run an analysis from Overview to create the first case.</p>
      </section>
    </div>
  );
}

export function CaseDetail() {
  return (
    <div className="view">
      <header className="view-header">
        <h1>Case detail</h1>
      </header>
      <section className="card">
        <p className="muted">Select a case from the Cases list to see its evidence.</p>
      </section>
    </div>
  );
}

export function ReviewQueue() {
  return (
    <div className="view">
      <header className="view-header">
        <h1>Review queue</h1>
        <p className="muted">
          Remediation proposals awaiting human approval. Nothing executes without explicit, recorded approval.
        </p>
      </header>
      <section className="card">
        <p className="muted">No proposals pending.</p>
      </section>
    </div>
  );
}

export function AuditLedger() {
  return (
    <div className="view">
      <header className="view-header">
        <h1>Audit ledger</h1>
        <p className="muted">
          Tamper-evident history of analysis, approvals and executions (digest-chained; stored in Forge-hosted
          storage, disclosed per our security model).
        </p>
      </header>
      <section className="card">
        <p className="muted">No audit events recorded yet.</p>
      </section>
    </div>
  );
}

export function Integrations({ health }: { health: HealthStatus | null }) {
  return (
    <div className="view">
      <header className="view-header">
        <h1>Integrations</h1>
        <p className="muted">Live status of every integration ContextCourt relies on.</p>
      </header>
      <section className="card">
        {health ? (
          <ul className="health-list">
            <li>Jira REST API: {health.integrations.jira}</li>
            <li>Teamwork Graph: {health.integrations.teamworkGraph}</li>
            <li>Rovo agent: {health.integrations.rovoAgent}</li>
            <li>MCP tools: {health.integrations.mcp}</li>
          </ul>
        ) : (
          <p className="muted">Checking…</p>
        )}
      </section>
    </div>
  );
}
