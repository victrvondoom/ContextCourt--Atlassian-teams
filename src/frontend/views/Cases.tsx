import { useEffect, useState } from 'react';
import { invoke } from '@forge/bridge';
import { useSandbox } from '../sandbox/SandboxContext';
import { listSandboxCases } from '../sandbox/sandboxEngine';

interface CaseRecordView {
  caseId: string;
  title: string;
  status: string;
  severity: string;
  updatedAt: string;
}

export function Cases(props: { onCount?: (n: number) => void; onOpen?: (caseId: string) => void }) {
  const { sandbox } = useSandbox();
  const [cases, setCases] = useState<CaseRecordView[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sandbox) {
      // Real in-memory store written by the in-browser engine — not fixtures.
      const list = listSandboxCases();
      setCases(list);
      props.onCount?.(list.length);
      return;
    }
    invoke('listCases')
      .then((res) => {
        const list = (res as { cases: CaseRecordView[] }).cases;
        setCases(list);
        props.onCount?.(list.length);
      })
      .catch((e) => setError(String(e)));
  }, [sandbox]);

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
          <th>Title</th>
          <th>Status</th>
          <th>Severity</th>
          <th>Updated</th>
        </tr>
      </thead>
      <tbody>
        {cases.map((c) => (
          <tr
            key={c.caseId}
            className="row-clickable"
            onClick={() => props.onOpen?.(c.caseId)}
            tabIndex={0}
            role="button"
            onKeyDown={(e) => e.key === 'Enter' && props.onOpen?.(c.caseId)}
            aria-label={`Open case ${c.caseId}`}
          >
            <td className="mono">{c.caseId}</td>
            <td>{c.title}</td>
            <td>
              <span className={`pill status-${c.status.toLowerCase()}`}>{c.status}</span>
            </td>
            <td>
              <span className={`pill severity-${c.severity.toLowerCase()}`}>{c.severity}</span>
            </td>
            <td>{new Date(c.updatedAt).toLocaleString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
