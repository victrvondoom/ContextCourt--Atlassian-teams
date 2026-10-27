import { useEffect, useState } from 'react';
import { invoke } from '@forge/bridge';

interface AuditEventView {
  id: string;
  actor: string;
  action: string;
  target: string;
  timestamp: string;
  result: string;
}

export function AuditLedger() {
  const [events, setEvents] = useState<AuditEventView[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    invoke('listAuditEvents')
      .then((res) => setEvents((res as { events: AuditEventView[] }).events))
      .catch((e) => setError(String(e)));
  }, []);

  if (error) {
    return (
      <div className="alert error" role="alert">
        Could not load the audit ledger: {error}
      </div>
    );
  }
  if (events === null) {
    return <p className="muted">Loading audit ledger…</p>;
  }
  if (events.length === 0) {
    return (
      <p className="muted">
        No audit events yet. Every analysis, approval and execution is recorded here with a digest chain for
        tamper evidence.
      </p>
    );
  }
  return (
    <table>
      <thead>
        <tr>
          <th>When</th>
          <th>Actor</th>
          <th>Action</th>
          <th>Target</th>
          <th>Result</th>
        </tr>
      </thead>
      <tbody>
        {events.map((e) => (
          <tr key={e.id}>
            <td>{new Date(e.timestamp).toLocaleString()}</td>
            <td>{e.actor}</td>
            <td>{e.action}</td>
            <td>{e.target}</td>
            <td>{e.result}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
