/**
 * Review queue — remediation proposals awaiting a human decision.
 *
 * Live mode: proposals come from the tenant's KVS store via the
 * `listProposals` resolver (documented utility ordering); every action goes
 * through server-side resolvers (approve/reject with rationale, cancel with
 * authority rules, execute with binding checks + independent verification).
 * Sandbox mode: the same core decision/execution modules run in-browser over
 * the sandbox stores — nothing is hardcoded.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { invoke } from '@forge/bridge';
import { StatusPill } from '../components/Pills';
import { useSandbox } from '../sandbox/SandboxContext';
import {
  cancelSandboxProposal,
  decideSandboxProposal,
  executeSandboxProposal,
  listSandboxProposals,
  prepareSandboxProposal,
} from '../sandbox/sandboxEngine';

export interface ProposalView {
  id: string;
  caseId: string;
  target: string;
  operation: string;
  expectedChange: string;
  risk: 'low' | 'medium' | 'high';
  state:
    | 'DRAFT'
    | 'PENDING_APPROVAL'
    | 'APPROVED'
    | 'REJECTED'
    | 'EXECUTED'
    | 'EXECUTION_FAILED'
    | 'EXPIRED'
    | 'CANCELLED';
  actor: string;
  createdAt: string;
  supportingFindingIds: string[];
  payloadDigest: string;
  approverId: string | null;
  expiresAt: string | null;
  viewerIsActor: boolean;
  viewerIsApprover: boolean;
  priorityExplanation?: string;
  decisionRationale?: string | null;
  verification?: {
    outcome: 'VERIFIED' | 'MISMATCH' | 'UNVERIFIED';
    detail: string;
    evidenceRef: string | null;
    verifiedAt: string;
  } | null;
}

function remainingLabel(expiresAt: string): string {
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (ms <= 0) return 'expired';
  const minutes = Math.floor(ms / 60000);
  if (minutes < 60) return `${minutes}m left`;
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m left`;
}

export function ReviewQueue(props: { onPendingCount?: (n: number) => void }) {
  const { sandbox } = useSandbox();
  const [proposals, setProposals] = useState<ProposalView[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [, forceTick] = useState(0);
  const [filter, setFilter] = useState('');
  const [stateFilter, setStateFilter] = useState<'ALL' | ProposalView['state']>('ALL');

  const filtered = useMemo(() => {
    if (!proposals) return null;
    const q = filter.trim().toLowerCase();
    return proposals.filter((p) => {
      if (stateFilter !== 'ALL' && p.state !== stateFilter) return false;
      if (!q) return true;
      return (
        p.id.toLowerCase().includes(q) ||
        p.caseId.toLowerCase().includes(q) ||
        p.target.toLowerCase().includes(q) ||
        p.operation.toLowerCase().includes(q) ||
        p.expectedChange.toLowerCase().includes(q)
      );
    });
  }, [proposals, filter, stateFilter]);

  // Live countdown refresh for approved proposals.
  useEffect(() => {
    const t = setInterval(() => forceTick((n) => n + 1), 30_000);
    return () => clearInterval(t);
  }, []);

  const refresh = useCallback(async () => {
    try {
      if (sandbox) {
        const list = listSandboxProposals();
        setProposals(list);
        props.onPendingCount?.(list.filter((p) => p.state === 'PENDING_APPROVAL').length);
        return;
      }
      const res = (await invoke('listProposals')) as { proposals: ProposalView[] };
      setProposals(res.proposals);
      props.onPendingCount?.(res.proposals.filter((p) => p.state === 'PENDING_APPROVAL').length);
    } catch (e) {
      setError(String(e));
    }
  }, [sandbox]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const act = async (
    proposalId: string,
    action: 'approve' | 'reject' | 'execute' | 'cancel' | 'prepare',
    opts: { caseId?: string; findingId?: string; rationale?: string | null } = {},
  ) => {
    setBusyId(proposalId || `${opts.caseId}:${opts.findingId}`);
    setFeedback(null);
    try {
      let res: {
        status?: string;
        error?: string;
        outcome?: { state: string; detail: string };
      };
      if (sandbox) {
        if (action === 'prepare') {
          res = await prepareSandboxProposal(opts.caseId!, opts.findingId!);
        } else if (action === 'execute') {
          res = await executeSandboxProposal(proposalId);
        } else if (action === 'cancel') {
          res = await cancelSandboxProposal(proposalId, opts.rationale);
        } else {
          res = await decideSandboxProposal(proposalId, action, opts.rationale);
        }
      } else if (action === 'prepare') {
        res = { status: 'UNSUPPORTED' };
      } else if (action === 'execute') {
        if (
          !window.confirm(
            'Execute this approved proposal against Jira? The result will be independently verified.',
          )
        ) {
          setBusyId(null);
          return;
        }
        res = (await invoke('executeProposal', { proposalId })) as never;
      } else if (action === 'cancel') {
        res = (await invoke('cancelProposal', { proposalId, rationale: opts.rationale })) as never;
      } else if (action === 'reject') {
        const rationale =
          window.prompt('Rejection rationale (stored with the decision and visible to the team):') ?? '';
        res = (await invoke('decideProposal', { proposalId, decision: 'reject', rationale })) as never;
      } else {
        res = (await invoke('decideProposal', { proposalId, decision: 'approve' })) as never;
      }
      if (res.status === 'OK') {
        setFeedback(
          action === 'execute'
            ? `Executed: ${res.outcome?.detail ?? 'done'}`
            : action === 'cancel'
              ? 'Proposal cancelled.'
              : `Proposal ${action === 'approve' ? 'approved' : 'rejected'}.`,
        );
      } else if (res.status === 'DECISION_REJECTED' || res.status === 'DECISION_FAILED') {
        setFeedback(`Decision rejected: ${res.error ?? 'not permitted'}`);
      } else if (res.status === 'UNSUPPORTED') {
        setFeedback('Proposals are prepared by the investigator agent — run an analysis first.');
      } else {
        setFeedback(`Action failed: ${res.status}${res.error ? ` — ${res.error}` : ''}`);
      }
      await refresh();
    } catch (e) {
      setFeedback(`Action failed: ${String(e)}`);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="view">
      <header className="view-header">
        <h1>Review queue</h1>
        <p className="muted">
          Remediation proposals awaiting human approval, ordered by the documented review utility (severity ×
          risk × waiting time). Nothing executes without an explicit, recorded approval bound to user, tenant,
          target and payload digest — and the proposal author can never approve their own proposal.
        </p>
      </header>

      {feedback && (
        <div
          className={
            feedback.startsWith('Executed') || feedback.includes('approved') || feedback.includes('cancelled')
              ? 'alert ok'
              : 'alert error'
          }
          role="status"
        >
          {feedback}
        </div>
      )}
      {error && (
        <div className="alert error" role="alert">
          Could not load proposals: {error}
        </div>
      )}
      {!proposals && !error && <p className="muted">Loading proposals…</p>}
      {proposals && proposals.length > 0 && (
        <div className="row">
          <input
            className="input"
            placeholder="Filter proposals by id, case, target, operation…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            aria-label="Filter proposals"
          />
          <select
            className="input"
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value as 'ALL' | ProposalView['state'])}
            aria-label="Filter by state"
          >
            {[
              'ALL',
              'PENDING_APPROVAL',
              'APPROVED',
              'EXECUTED',
              'REJECTED',
              'CANCELLED',
              'EXECUTION_FAILED',
            ].map((s) => (
              <option key={s} value={s}>
                {s === 'ALL' ? 'All states' : s.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
          <span className="muted">
            {(filtered ?? []).length} / {proposals.length} proposal(s)
          </span>
        </div>
      )}
      {proposals && proposals.length === 0 && (
        <section className="card">
          <p className="muted">
            No proposals yet. The investigator agent prepares a remediation proposal after an analysis detects
            a contradiction — ask the Rovo agent to “prepare remediation” for a case, or run an analysis from
            Overview.
          </p>
        </section>
      )}
      {proposals &&
        proposals.map((p) => <ProposalCard key={p.id} proposal={p} busy={busyId === p.id} onAct={act} />)}
    </div>
  );
}

function ProposalCard(props: {
  proposal: ProposalView;
  busy: boolean;
  onAct: (
    proposalId: string,
    action: 'approve' | 'reject' | 'execute' | 'cancel' | 'prepare',
    opts?: { caseId?: string; findingId?: string; rationale?: string | null },
  ) => void;
}) {
  const { proposal: p } = props;
  const pending = p.state === 'PENDING_APPROVAL';
  const approved = p.state === 'APPROVED';
  const expired = approved && p.expiresAt !== null && new Date(p.expiresAt) <= new Date();
  return (
    <section className="card" aria-labelledby={`prop-${p.id}`}>
      <div className="row">
        <h2 id={`prop-${p.id}`} className="mono">
          {p.id}
        </h2>
        <StatusPill state={p.state.toLowerCase().replace(/_/g, '-')} />
        <span
          className={`pill severity-${p.risk === 'high' ? 'high' : p.risk === 'medium' ? 'medium' : 'low'}`}
        >
          risk: {p.risk}
        </span>
      </div>
      <p>{p.expectedChange}</p>
      <p className="muted">
        Case <span className="mono">{p.caseId}</span> · target <span className="mono">{p.target}</span> ·
        operation <span className="mono">{p.operation}</span> · findings{' '}
        <span className="mono">{p.supportingFindingIds.join(', ') || 'none'}</span>
      </p>
      <p className="muted">
        Prepared by <span className="mono">{p.actor}</span> at {new Date(p.createdAt).toLocaleString()}
        {p.approverId ? ` · approved by ${p.approverId}` : ''}
        {p.expiresAt && approved ? ` · ${remainingLabel(p.expiresAt)}` : ''}
      </p>
      {p.priorityExplanation && pending && (
        <p className="muted">
          Queue priority: <span className="mono">{p.priorityExplanation}</span>
        </p>
      )}
      {p.decisionRationale && <p className="muted">Rationale: “{p.decisionRationale}”</p>}
      {p.verification && (
        <div className="row">
          <StatusPill state={`verification-${p.verification.outcome.toLowerCase()}`} />
          <span className="muted">
            {p.verification.detail}
            {p.verification.evidenceRef ? ` · evidence: ${p.verification.evidenceRef}` : ''}
          </span>
        </div>
      )}
      {(pending || approved) && (
        <div className="row">
          {pending && (
            <>
              <button
                className="button primary"
                disabled={props.busy || p.viewerIsActor}
                onClick={() => props.onAct(p.id, 'approve')}
                title={
                  p.viewerIsActor ? 'You prepared this proposal — a second human must approve it' : undefined
                }
              >
                Approve
              </button>
              <button className="button" disabled={props.busy} onClick={() => props.onAct(p.id, 'reject')}>
                Reject
              </button>
              {p.viewerIsActor && (
                <button
                  className="button"
                  disabled={props.busy}
                  onClick={() =>
                    props.onAct(p.id, 'cancel', {
                      rationale: window.prompt('Withdrawal note (optional):'),
                    })
                  }
                >
                  Withdraw
                </button>
              )}
            </>
          )}
          {approved && (
            <>
              <button
                className="button primary"
                disabled={props.busy || expired || !p.viewerIsApprover}
                onClick={() => props.onAct(p.id, 'execute')}
                title={
                  expired
                    ? 'The approval has expired'
                    : !p.viewerIsApprover
                      ? 'Only the approver can execute'
                      : undefined
                }
              >
                Execute
              </button>
              {p.viewerIsApprover && (
                <button
                  className="button"
                  disabled={props.busy}
                  onClick={() =>
                    props.onAct(p.id, 'cancel', {
                      rationale: window.prompt('Revocation reason (stored with the cancellation):'),
                    })
                  }
                >
                  Revoke approval
                </button>
              )}
            </>
          )}
        </div>
      )}
      {pending && p.viewerIsActor && (
        <p className="muted">
          You prepared this proposal, so you cannot approve it — approval requires a second human actor.
        </p>
      )}
    </section>
  );
}
