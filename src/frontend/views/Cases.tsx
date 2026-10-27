import { useEffect, useState } from 'react';
import { invoke } from '@forge/bridge';

interface CaseRecordView {
  caseId: string;
  title: string;
  status: string;
  severity: string;
  updatedAt: string;
}

export function Cases() {
  const [cases, setCases] = useState<CaseRecordView[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    invoke('listCases')
      .then((res) => setCases((res as { cases: CaseRecordView[] }).cases))
      .catch((e) => setError(String(e)));
  }, []);

  if (error) {
    return (
      <div className="alert error" role="alert">
        Could not load cases: {error}
      </div>
    );
  }
  if (cases === null) {
    return <p className="muted">Loading cases…</p>;
  }
  if (cases.length === 0) {
    return (
      <p className="muted">
        No contradiction cases yet. Cases are created by live analysis — run an analysis from Overview.
      </p>
    );
  }
  return (
    <table>
      <thead>
        <tr>
          <th>Case</th>
          <th>Status</th>
          <th>Severity</th>
          <th>Updated</th>
        </tr>
      </thead>
      <tbody>
        {cases.map((c) => (
          <tr key={c.caseId}>
            <td>{c.caseId}</td>
            <td>{c.status}</td>
            <td>{c.severity}</td>
            <td>{new Date(c.updatedAt).toLocaleString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
