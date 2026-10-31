/**
 * Sandbox type aliases — the sandbox engine uses the REAL domain types from
 * src/core/types.ts; only the lightweight case view is sandbox-specific.
 */
export type { EvidenceRecord, Finding, RemediationProposal, AuditEvent } from '../../core/types';

export interface CaseRecordLite {
  caseId: string;
  title: string;
  status: string;
  severity: string;
  findingIds: string[];
  createdAt: string;
  updatedAt: string;
  owner: string | null;
}
