/**
 * Case detail: stored case record + its persisted findings with evidence ids.
 * Live mode reads via the `getCase` resolver; sandbox mode reads the
 * in-browser engine's in-memory store. Findings that justify remediation can
 * prepare a proposal directly (agent-independent path into the Review queue).
 */
import { useCallback, useEffect, useState } from 'react';
import { invoke } from '@forge/bridge';
import { StatusPill, SeverityPill } from '../components/Pills';
import { useSandbox } from '../sandbox/SandboxContext';
import { getSandboxCase, prepareSandboxProposal } from '../sandbox/sandboxEngine';

interface CaseRecordView {
  caseId: string;
  tenantId?: string;
  title: string;
  status: string;
  severity: string;
  findingIds: string[];
  createdAt: string;
  updatedAt: string;
  owner: string | null;
}

interface FindingView {
  findingId: string;
  type: string;
  status: string;
  explanation: string;
  supportingEvidenceIds: string[];
  severity: string;
  detectedAt: string;
  affectedWork: Array<{ type: string; key: string }>;
}

export function CaseDetail(props: { caseId: string | null; onBack: () => void }) {
  const { sandbox } = useSandbox();
  const [data, setData] = useState<{ case: CaseRecordView; findings: FindingView[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyFinding, setBusyFinding] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!props.caseId) return;
    if (sandbox) {
      const stored = getSandboxCase(props.caseId);
      if (!stored) {
        setData(null);
        setError('No sandbox case with this id — run an analysis from Overview first.');
        return;
      }
      setError(null);
      setData(stored);
      return;
    }
    try {
      const res = (await invoke('getCase', { caseId: props.caseId })) as {
        status: string;
        case: CaseRecordView | null;
        findings: FindingView[];
      };
      if (res.status !== 'OK' || !res.case) {
        setData(null);
        setError('Case not found (it may belong to another site or was not stored).');
        return;
      }
      setError(null);
      setData({ case: res.case, findings: res.findings ?? [] });
    } catch (e) {
      setError(String(e));
    }
  }, [props.caseId, sandbox]);

  useEffect(() => {
    load();
  }, [load]);

  const prepareRemediation = async (finding: FindingView) => {
    if (!data) return;
    setBusyFinding(finding.findingId);
    setFeedback(null);
    try {
      if (sandbox) {
        const res = await prepareSandboxProposal(data.case.caseId, finding.findingId);
        setFeedback(
          res.status === 'OK'
            ? 'Proposal prepared — see the Review queue.'
            : `Could not prepare a proposal for this finding (${res.status}). The finding may not meet the operation's severity gate.`,
        );
        return;
      }
      const res = (await invoke('prepareProposal', {
        caseId: data.case.caseId,
        findingId: finding.findingId,
        operation: 'add_decision_reference',
      })) as { status: string; proposalId?: string; error?: string };
      if (res.status === 'OK') {
        setFeedback(`Proposal ${res.proposalId} prepared — it now waits in the Review queue.`);
      } else {
        setFeedback(`Could not prepare a proposal: ${res.error ?? res.status}`);
      }
    } catch (e) {
      setFeedback(`Could not prepare a proposal: ${String(e)}`);
    } finally {
      setBusyFinding(null);
    }
  };

  if (!props.caseId) {
    return (
      <div className="view">
        <header className="view-header">
          <h1>Case detail</h1>
        </header>
        <section className="card">
          <p className="muted">Select a case from the Cases list to see its findings and evidence.</p>
        </section>
      </div>
    );
  }

  return (
    <div className="view">
      <header className="view-header">
        <button className="button" onClick={props.onBack}>
          ← All cases
        </button>
        <h1>{data ? `${data.case.caseId} — ${data.case.title}` : 'Case detail'}</h1>
        {data && (
          <div className="row">
            <StatusPill state={data.case.status.toLowerCase().replace(/_/g, '-')} />
            <SeverityPill severity={data.case.severity} />
            <span className="muted">Owner: {data.case.owner ?? 'unassigned'}</span>
          </div>
        )}
      </header>
      {error && (
        <div className="alert error" role="alert">
          {error}
        </div>
      )}
      {feedback && (
        <div className={feedback.includes('Proposal') ? 'alert ok' : 'alert error'} role="status">
          {feedback}
        </div>
      )}
      {!data && !error && <p className="muted">Loading case…</p>}
      {data &&
        (data.findings.length === 0 ? (
          <section className="card">
            <p className="muted">
              No stored findings for this case. Re-run analysis from Overview to refresh them.
            </p>
          </section>
        ) : (
          data.findings.map((f) => (
            <section className="card" key={f.findingId}>
              <h2>{f.findingId}</h2>
              <div className="row">
                <StatusPill state={f.status.toLowerCase().replace(/_/g, '-')} />
                <SeverityPill severity={f.severity} />
                <span className="mono muted">{f.type}</span>
              </div>
              <p>{f.explanation}</p>
              <p className="muted">
                Evidence: {f.supportingEvidenceIds.join(', ') || 'none cited'}
                {f.affectedWork.length > 0
                  ? ` · Affected: ${f.affectedWork.map((w) => w.key).join(', ')}`
                  : ''}
              </p>
              {(f.status === 'VERIFIED_CONTRADICTION' || f.status === 'POTENTIAL_CONTRADICTION') && (
                <button
                  className="button"
                  disabled={busyFinding === f.findingId}
                  onClick={() => prepareRemediation(f)}
                >
                  {busyFinding === f.findingId ? 'Preparing…' : 'Prepare remediation proposal'}
                </button>
              )}
            </section>
          ))
        ))}
    </div>
  );
}
