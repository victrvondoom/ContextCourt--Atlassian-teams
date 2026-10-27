import { useEffect, useState } from 'react';
import { invoke } from '@forge/bridge';
import type { AnalysisView, HealthStatus } from '../types';
import { StatusPill, SeverityPill } from '../components/Pills';

export function Overview(props: { issueKey: string | null; onHealth: (h: HealthStatus) => void }) {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisView | null>(null);
  const [busy, setBusy] = useState(false);
  const [inputKey, setInputKey] = useState(props.issueKey ?? '');

  const refresh = async () => {
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
  }, []);

  const runAnalysis = async () => {
    const key = (inputKey || props.issueKey || '').toUpperCase();
    if (!key) return;
    setBusy(true);
    try {
      const res = (await invoke('analyzeIssue', { issueKey: key })) as AnalysisView;
      setAnalysis(res);
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

      <section className="card">
        <h2>Open cases</h2>
        <p className="muted">
          Cases appear here after live analysis detects verified or potential contradictions. This build has
          no synthetic placeholder cases — an empty state means no analysis has run.
        </p>
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
