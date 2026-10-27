export type IntegrationState = 'available' | 'degraded' | 'not-wired' | 'unavailable';

export interface HealthStatus {
  app: string;
  version: string;
  integrations: {
    jira: IntegrationState;
    teamworkGraph: IntegrationState;
    rovoAgent: IntegrationState;
    mcp: IntegrationState;
  };
  checkedAt: string;
}

export interface FindingView {
  findingId: string;
  type: string;
  status: string;
  explanation: string;
  supportingEvidenceIds: string[];
  confidence: number;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  detectedAt: string;
  affectedWork: Array<{ type: string; key: string }>;
}

export interface AnalysisView {
  status: string;
  issue?: { key: string; summary: string; status: string | null };
  findings?: FindingView[];
  evidenceCount?: number;
  evaluatedAt?: string;
  error?: string;
}
