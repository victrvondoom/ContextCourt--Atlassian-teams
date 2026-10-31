import { useEffect, useState } from 'react';
import { invoke } from '@forge/bridge';
import { useSandbox } from '../sandbox/SandboxContext';
import { listSandboxAuditEvents, verifySandboxChainAsync } from '../sandbox/sandboxEngine';

interface AuditEventView {
  id: string;
  actor: string;
  action: string;
  target: string;
  timestamp: string;
  result: string;
}

export function AuditLedger() {
  const { sandbox } = useSandbox();
  const [events, setEvents] = useState<AuditEventView[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [chain, setChain] = useState<{ valid: boolean; eventCount: number } | null>(null);
  const [chainBusy, setChainBusy] = useState(false);

  const verifyChain = async () => {
    setChainBusy(true);
    try {
      if (sandbox) {
        setChain(await verifySandboxChainAsync());
      } else {
        const res = (await invoke('verifyAuditChain')) as {
          status: string;
          valid: boolean;
          eventCount: number;
        };
        setChain(res.status === 'OK' ? { valid: res.valid, eventCount: res.eventCount } : null);
      }
    } catch {
      setChain(null);
    } finally {
      setChainBusy(false);
    }
  };

  useEffect(() => {
    if (sandbox) {
      // Events written by the in-browser engine this session — real chain.
      setEvents(listSandboxAuditEvents());
      return;
    }
    invoke('listAuditEvents')
      .then((res) => setEvents((res as { events: AuditEventView[] }).events))
      .catch((e) => setError(String(e)));
  }, [sandbox]);

  const q = query.trim().toLowerCase();
  const filtered =
    events === null
      ? null
      : q
        ? events.filter(
            (e) =>
              e.action.toLowerCase().includes(q) ||
              e.actor.toLowerCase().includes(q) ||
              e.target.toLowerCase().includes(q) ||
              e.result.toLowerCase().includes(q),
          )
        : events;

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
    <>
      <div className="row">
        <input
          className="input"
          placeholder="Filter by action, actor, target or result…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Filter audit events"
        />
        <button className="button" disabled={chainBusy} onClick={verifyChain}>
          {chainBusy ? 'Verifying…' : 'Verify chain integrity'}
        </button>
        {chain && (
          <span className={`pill status-${chain.valid ? 'available' : 'analysis-failed'}`}>
            {chain.valid
              ? `chain intact — ${chain.eventCount} event(s) verified`
              : `TAMPER DETECTED — chain broken`}
          </span>
        )}
      </div>
      {filtered !== null && filtered.length === 0 && <p className="muted">No events match “{query}”.</p>}
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
          {(filtered ?? events).map((e) => (
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
    </>
  );
}
