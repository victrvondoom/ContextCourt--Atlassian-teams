import { useEffect, useState } from 'react';
import { invoke } from '@forge/bridge';
import type { AnalysisView, HealthStatus } from '../types';
import { StatusPill, SeverityPill } from '../components/Pills';
import { useSandbox } from '../sandbox/SandboxContext';
import { runSandboxAnalysis, sandboxStoreCounts, listSandboxCases } from '../sandbox/sandboxEngine';

interface CaseSummary {
  caseId: string;
  title: string;
  status: string;
  severity: string;
  updatedAt: string;
}

export function Overview(props: { issueKey: string | null; onHealth: (h: HealthStatus) => void }) {
  const { sandbox } = useSandbox();
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisView | null>(null);
  const [busy, setBusy] = useState(false);
  const [inputKey, setInputKey] = useState(props.issueKey ?? '');
  const [recentCases, setRecentCases] = useState<CaseSummary[] | null>(null);

  const loadCases = async () => {
    if (sandbox) {
      setRecentCases(listSandboxCases().slice(0, 5));
      return;
    }
    try {
      const res = (await invoke('listCases')) as { cases: CaseSummary[] };
      setRecentCases(res.cases.slice(0, 5));
    } catch {
      setRecentCases([]);
    }
  };

  const refresh = async () => {
    if (sandbox) {
      // Sandbox health is honest: nothing is wired to live Jira; the engine
      // itself runs in-browser. Integration states say so explicitly.
      const h: HealthStatus = {
        app: 'contextcourt-ai (sandbox)',
        version: 'sandbox',
        integrations: {
          jira: 'not-wired',
          teamworkGraph: 'not-wired',
          rovoAgent: 'not-wired',
          mcp: 'not-wired',
        },
        checkedAt: new Date().toISOString(),
      };
      setHealth(h);
      props.onHealth(h);
      return;
    }
    try {
      const h = (await invoke('health')) as HealthStatus;
      setHealth(h);
      props.onHealth(h);
    } catch {
      /* surfaced via health state */
    }
  };

  useEffect(() => {
    refresh();
    loadCases();
  }, [sandbox]);

  const runAnalysis = async () => {
    const rawKey = inputKey || props.issueKey || '';
    if (!rawKey.trim()) return;
    const key = rawKey.toUpperCase();
    setBusy(true);
    try {
      if (sandbox) {
        // The REAL engine runs in-browser over the deterministic fixture for
        // this key — the displayed result is computed, never hardcoded.
        const res = (await runSandboxAnalysis(key)) as AnalysisView;
        setAnalysis(res);
        loadCases();
        return;
      }
      const res = (await invoke('analyzeIssue', { issueKey: key })) as AnalysisView;
      setAnalysis(res);
      loadCases();
    } catch (err) {
      setAnalysis({ status: 'ANALYSIS_FAILED', error: String(err) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="view">
      <header className="view-header">
        <h1>Overview</h1>
        <p className="muted">
          Evidence-driven contradiction analysis. No evidence → no verified contradiction.
        </p>
      </header>

      <section className="card" aria-labelledby="analyze-h">
        <h2 id="analyze-h">Run analysis</h2>
        <div className="row">
          <input
            className="input"
            placeholder="Jira issue key, e.g. PAY-142"
            value={inputKey}
            onChange={(e) => setInputKey(e.target.value)}
            aria-label="Jira issue key"
          />
          <button className="button primary" onClick={runAnalysis} disabled={busy}>
            {busy ? 'Analyzing…' : 'Analyze issue'}
          </button>
        </div>
        {analysis && <AnalysisResult result={analysis} />}
      </section>

      <section className="card" aria-labelledby="health-h">
        <h2 id="health-h">Integration health</h2>
        {health ? (
          <ul className="health-list">
            <li>
              Jira: <StatusPill state={health.integrations.jira} />
            </li>
            <li>
              Teamwork Graph: <StatusPill state={health.integrations.teamworkGraph} />
            </li>
            <li>
              Rovo agent: <StatusPill state={health.integrations.rovoAgent} />
            </li>
            <li>
              MCP tools: <StatusPill state={health.integrations.mcp} />
            </li>
          </ul>
        ) : (
          <p className="muted">Checking integrations…</p>
        )}
      </section>

      <section className="card" aria-labelledby="cases-h">
        <h2 id="cases-h">Open cases</h2>
        {recentCases === null && <p className="muted">Loading cases…</p>}
        {recentCases && recentCases.length === 0 && (
          <p className="muted">
            No cases yet — an empty state means no analysis has detected a contradiction. Run an analysis
            above{sandbox ? ' (sandbox analyses create real in-memory cases)' : ''}.
          </p>
        )}
        {recentCases && recentCases.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Case</th>
                <th>Title</th>
                <th>Status</th>
                <th>Severity</th>
              </tr>
            </thead>
            <tbody>
              {recentCases.map((c) => (
                <tr key={c.caseId}>
                  <td className="mono">{c.caseId}</td>
                  <td>{c.title}</td>
                  <td>
                    <span className={`pill status-${c.status.toLowerCase()}`}>{c.status}</span>
                  </td>
                  <td>
                    <span className={`pill severity-${c.severity.toLowerCase()}`}>{c.severity}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {sandbox && (
          <p className="muted">
            Sandbox engine this session: {sandboxStoreCounts().cases} case(s), {sandboxStoreCounts().findings}{' '}
            finding(s), {sandboxStoreCounts().auditEvents} audit event(s) — all computed by the real engine,
            stored in memory.
          </p>
        )}
      </section>
    </div>
  );
}

function AnalysisResult({ result }: { result: AnalysisView }) {
  if (result.status === 'ANALYSIS_FAILED') {
    return (
      <div className="alert error" role="alert">
        Analysis failed: {result.error ?? 'unknown error'}
      </div>
    );
  }
  return (
    <div className="analysis-result">
      <div className="row">
        <StatusPill state={result.status.toLowerCase() as never} />
        {result.issue && (
          <span className="muted">
            {result.issue.key} — {result.issue.summary}
          </span>
        )}
        {typeof result.evidenceCount === 'number' && (
          <span className="muted">{result.evidenceCount} evidence record(s)</span>
        )}
      </div>
      {(result.findings ?? []).length === 0 ? (
        <p className="muted">No contradiction candidates found in the accessible evidence.</p>
      ) : (
        <ul className="finding-list">
          {(result.findings ?? []).map((f) => (
            <li key={f.findingId} className="finding">
              <SeverityPill severity={f.severity} />
              <StatusPill state={f.status.toLowerCase().replace(/_/g, '-') as never} />
              <span>{f.explanation}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
