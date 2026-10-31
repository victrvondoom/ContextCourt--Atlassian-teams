import { useCallback, useEffect, useState } from 'react';
import { view } from '@forge/bridge';
import { Sidebar, type NavItem } from './components/Sidebar';
import { Overview } from './views/Overview';
import { Cases } from './views/Cases';
import { CaseDetail } from './views/CaseDetail';
import { ReviewQueue } from './views/ReviewQueue';
import { AuditLedger } from './views/AuditLedger';
import { Integrations } from './views/Integrations';
import { SandboxProvider, useSandbox } from './sandbox/SandboxContext';
import { WorkflowOverlay } from './sandbox/WorkflowOverlay';
import { listSandboxProposals } from './sandbox/sandboxEngine';
import { invoke } from '@forge/bridge';
import type { HealthStatus } from './types';

const NAV: NavItem[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'cases', label: 'Cases' },
  { id: 'review', label: 'Review queue' },
  { id: 'audit', label: 'Audit ledger' },
  { id: 'integrations', label: 'Integrations' },
];

/**
 * Standalone detection: outside the Forge panel (e.g. `npm run preview` in a
 * plain browser) there is no panel context and no Forge backend — the app
 * then starts in sandbox mode, which runs the REAL engine in-browser over
 * deterministic fixtures and never calls live Jira. This makes the whole
 * product clickable with zero Atlassian credentials.
 */
export function App() {
  return (
    <SandboxProvider>
      <Shell />
    </SandboxProvider>
  );
}

function Shell() {
  const [active, setActive] = useState('overview');
  const [standalone, setStandalone] = useState(false);
  const [issueKey, setIssueKey] = useState<string | null>(null);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [selectedCase, setSelectedCase] = useState<string | null>(null);
  const [pendingProposals, setPendingProposals] = useState(0);
  const { sandbox, setSandbox, setOverlayStep } = useSandbox();

  useEffect(() => {
    view
      .getContext()
      .then((ctx) => {
        const key = (ctx as { extension?: { issue?: { key?: string } } })?.extension?.issue?.key ?? null;
        setIssueKey(key);
      })
      .catch(() => {
        // No Forge panel context → standalone browser preview: enable the
        // in-browser engine (sandbox) so every control is live and clickable.
        setIssueKey(null);
        setStandalone(true);
        setSandbox(true);
      });
  }, []);

  // The review badge shows real pending proposals, refreshed when views change.
  useEffect(() => {
    const count = (list: { state: string }[]) => list.filter((p) => p.state === 'PENDING_APPROVAL').length;
    if (sandbox) {
      setPendingProposals(count(listSandboxProposals()));
      return;
    }
    invoke('listProposals')
      .then((res) => setPendingProposals(count((res as { proposals: { state: string }[] }).proposals)))
      .catch(() => setPendingProposals(0));
  }, [sandbox, active]);

  const onHealth = useCallback((h: HealthStatus) => setHealth(h), []);

  const openCase = useCallback((caseId: string) => {
    setSelectedCase(caseId);
    setActive('case-detail');
  }, []);

  return (
    <div className={`app-shell${sandbox ? ' sandbox-active' : ''}`}>
      <Sidebar
        items={NAV}
        active={active}
        onSelect={setActive}
        badge={{ id: 'review', count: Math.min(pendingProposals, 99) }}
        environment={health ? environmentLabel(health) : 'checking…'}
        sandbox={sandbox}
        onToggleSandbox={() => setSandbox(!sandbox)}
      />
      <main className="app-main" role="main">
        <div className="topbar">
          <span className="topbar-spacer" />
          <button className="button" onClick={() => setOverlayStep(0)}>
            Workflow guide
          </button>
        </div>
        {standalone && (
          <div className="sandbox-banner" role="status">
            Standalone preview — running the real ContextCourt engine in your browser (sandbox mode). Live
            Jira integration activates after the Forge app is installed; see the README.
          </div>
        )}
        {sandbox && (
          <div className="sandbox-banner" role="status">
            Sandbox mode — every value below is computed by the real engine over deterministic fixtures.
            Nothing calls live Jira. Try issue key PAY-142 to see a verified contradiction.
          </div>
        )}
        {active === 'overview' && <Overview issueKey={issueKey} onHealth={onHealth} />}
        {active === 'cases' && <Cases onOpen={openCase} />}
        {active === 'review' && <ReviewQueue onPendingCount={setPendingProposals} />}
        {active === 'audit' && <AuditLedger />}
        {active === 'integrations' && <Integrations health={health} />}
        {active === 'case-detail' && <CaseDetail caseId={selectedCase} onBack={() => setActive('cases')} />}
      </main>
      <WorkflowOverlay onGoto={setActive} />
    </div>
  );
}

function environmentLabel(h: HealthStatus): string {
  if (h.integrations.jira === 'available') return 'Jira connected';
  return 'Jira unavailable';
}
