import { useEffect, useMemo, useState } from 'react';
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

type SortKey = 'updatedAt' | 'severity' | 'status';
const SEVERITY_ORDER: Record<string, number> = { CRITICAL: 3, HIGH: 2, MEDIUM: 1, LOW: 0 };
const PAGE_SIZE = 10;

export function Cases(props: { onCount?: (n: number) => void; onOpen?: (caseId: string) => void }) {
  const { sandbox } = useSandbox();
  const [cases, setCases] = useState<CaseRecordView[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('updatedAt');
  const [sortAsc, setSortAsc] = useState(false);
  const [page, setPage] = useState(0);

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

  const filtered = useMemo(() => {
    if (!cases) return null;
    const q = query.trim().toLowerCase();
    const rows = q
      ? cases.filter(
          (c) =>
            c.caseId.toLowerCase().includes(q) ||
            c.title.toLowerCase().includes(q) ||
            c.status.toLowerCase().includes(q),
        )
      : [...cases];
    rows.sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'updatedAt') cmp = a.updatedAt.localeCompare(b.updatedAt);
      else if (sortKey === 'severity')
        cmp = (SEVERITY_ORDER[a.severity] ?? 0) - (SEVERITY_ORDER[b.severity] ?? 0);
      else cmp = a.status.localeCompare(b.status);
      if (cmp === 0) cmp = a.caseId.localeCompare(b.caseId);
      return sortAsc ? cmp : -cmp;
    });
    return rows;
  }, [cases, query, sortKey, sortAsc]);

  const pageCount = filtered ? Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)) : 1;
  const safePage = Math.min(page, pageCount - 1);
  const rows = filtered ? filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE) : null;

  const sortButton = (key: SortKey, label: string) => (
    <button
      className="link-button"
      onClick={() => {
        if (sortKey === key) setSortAsc(!sortAsc);
        else {
          setSortKey(key);
          setSortAsc(key === 'status');
        }
      }}
      aria-label={`Sort by ${label}`}
    >
      {label}
      {sortKey === key ? (sortAsc ? ' ↑' : ' ↓') : ''}
    </button>
  );

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
  return (
    <div className="view">
      <header className="view-header">
        <h1>Cases</h1>
        <p className="muted">
          {cases.length} stored case(s){query ? ` · ${filtered?.length ?? 0} matching “${query}”` : ''} —
          created only by live analysis, never seeded.
        </p>
      </header>
      {cases.length > 0 && (
        <div className="row">
          <input
            className="input"
            placeholder="Filter by case id, title or status…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(0);
            }}
            aria-label="Filter cases"
          />
        </div>
      )}
      {cases.length === 0 ? (
        <p className="muted">
          No contradiction cases yet. Cases are created by live analysis — run an analysis from Overview.
        </p>
      ) : (
        <>
          <table>
            <thead>
              <tr>
                <th>Case</th>
                <th>Title</th>
                <th>{sortButton('status', 'Status')}</th>
                <th>{sortButton('severity', 'Severity')}</th>
                <th>{sortButton('updatedAt', 'Updated')}</th>
              </tr>
            </thead>
            <tbody>
              {(rows ?? []).map((c) => (
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
          {pageCount > 1 && (
            <div className="row">
              <button className="button" disabled={safePage === 0} onClick={() => setPage(safePage - 1)}>
                ← Previous
              </button>
              <span className="muted">
                Page {safePage + 1} of {pageCount}
              </span>
              <button
                className="button"
                disabled={safePage >= pageCount - 1}
                onClick={() => setPage(safePage + 1)}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
