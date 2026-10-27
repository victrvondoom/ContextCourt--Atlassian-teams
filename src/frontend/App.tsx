import { useCallback, useEffect, useState } from 'react';
import { view } from '@forge/bridge';
import { Sidebar, type NavItem } from './components/Sidebar';
import { Overview } from './views/Overview';
import { Cases, CaseDetail, ReviewQueue, AuditLedger, Integrations } from './views/Static';
import type { HealthStatus } from './types';

const NAV: NavItem[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'cases', label: 'Cases' },
  { id: 'review', label: 'Review queue' },
  { id: 'audit', label: 'Audit ledger' },
  { id: 'integrations', label: 'Integrations' },
];

export function App() {
  const [active, setActive] = useState('overview');
  const [issueKey, setIssueKey] = useState<string | null>(null);
  const [health, setHealth] = useState<HealthStatus | null>(null);

  useEffect(() => {
    view
      .getContext()
      .then((ctx) => {
        const key = (ctx as { extension?: { issue?: { key?: string } } })?.extension?.issue?.key ?? null;
        setIssueKey(key);
      })
      .catch(() => setIssueKey(null));
  }, []);

  const onHealth = useCallback((h: HealthStatus) => setHealth(h), []);

  return (
    <div className="app-shell">
      <Sidebar
        items={NAV}
        active={active}
        onSelect={setActive}
        badge={{ id: 'review', count: 0 }}
        environment={health ? environmentLabel(health) : 'checking…'}
      />
      <main className="app-main" role="main">
        {active === 'overview' && <Overview issueKey={issueKey} onHealth={onHealth} />}
        {active === 'cases' && <Cases />}
        {active === 'review' && <ReviewQueue />}
        {active === 'audit' && <AuditLedger />}
        {active === 'integrations' && <Integrations health={health} />}
        {active === 'case-detail' && <CaseDetail />}
      </main>
    </div>
  );
}

function environmentLabel(h: HealthStatus): string {
  if (h.integrations.jira === 'available') return 'Jira connected';
  return 'Jira unavailable';
}
