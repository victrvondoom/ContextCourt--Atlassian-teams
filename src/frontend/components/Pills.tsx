import type { IntegrationState } from '../types';

const LABELS: Record<string, string> = {
  available: 'Available',
  degraded: 'Degraded',
  'not-wired': 'Not wired',
  unavailable: 'Unavailable',
  'verified-contradiction': 'Verified contradiction',
  'potential-contradiction': 'Potential contradiction',
  consistent: 'Consistent',
  'insufficient-evidence': 'Insufficient evidence',
  'stale-evidence': 'Stale evidence',
  'access-restricted': 'Access restricted',
  'analysis-failed': 'Analysis failed',
  'verification-verified': 'Verified state',
  'verification-mismatch': 'Verification mismatch',
  'verification-unverified': 'Unverified state',
};

export function StatusPill({ state }: { state: IntegrationState | string }) {
  return <span className={`pill status-${state}`}>{LABELS[state] ?? state}</span>;
}

export function SeverityPill({ severity }: { severity: string }) {
  return <span className={`pill severity-${severity.toLowerCase()}`}>{severity}</span>;
}
