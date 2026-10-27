import type { HealthStatus } from '../types';

const STATES: Record<string, string> = {
  available: 'Available',
  degraded: 'Degraded',
  'not-wired': 'Not wired yet',
  unavailable: 'Unavailable',
};

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
            <li>Jira REST API: {STATES[health.integrations.jira] ?? health.integrations.jira}</li>
            <li>
              Teamwork Graph: {STATES[health.integrations.teamworkGraph] ?? health.integrations.teamworkGraph}
            </li>
            <li>Rovo agent: {STATES[health.integrations.rovoAgent] ?? health.integrations.rovoAgent}</li>
            <li>MCP tools: {STATES[health.integrations.mcp] ?? health.integrations.mcp}</li>
          </ul>
        ) : (
          <p className="muted">Checking…</p>
        )}
      </section>
    </div>
  );
}
