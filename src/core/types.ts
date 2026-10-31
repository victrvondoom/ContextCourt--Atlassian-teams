/**
 * ContextCourt AI — core domain model.
 *
 * Fundamental invariant: NO EVIDENCE → NO VERIFIED CONTRADICTION.
 * Missing evidence must produce an explicit unknown / insufficient-evidence state.
 */

export type SourceSystem = 'jira' | 'confluence' | 'bitbucket' | 'teamwork-graph' | 'manual';

/** How a claim was obtained from its source. */
export type ExtractionMethod = 'text_pattern' | 'llm_assisted' | 'api_field' | 'manual_entry';

export type EvidenceVerification = 'verified' | 'unverified' | 'stale' | 'access-restricted';

export interface EvidenceRecord {
  /** Globally unique evidence id. */
  id: string;
  /** Tenant (CloudId) the record belongs to. Tenant isolation is enforced everywhere. */
  tenantId: string;
  sourceSystem: SourceSystem;
  /** Source object id, e.g. Jira issue key or Confluence page id. */
  sourceObjectId: string;
  /** Canonical URL to the source object, when the platform can generate one. */
  canonicalUrl: string | null;
  /** Extracted text/claim span — never an entire document body unless required. */
  extractedText: string;
  /** Source object version at extraction time (e.g. issue updated timestamp, page version). */
  sourceVersion: string;
  /** When we observed this evidence. */
  observedAt: string;
  /** When the source object was last updated. */
  sourceUpdatedAt: string;
  /** SHA-256 of the canonical evidence content. */
  contentDigest: string;
  /** User/actor whose authorization was used to retrieve this record. */
  accessContext: { userId: string; retrievedVia: SourceSystem };
  /** How the claim was extracted from the source. */
  extractionMethod: ExtractionMethod;
  verification: EvidenceVerification;
  staleness: 'current' | 'stale';
}

export interface DecisionRecord {
  id: string;
  tenantId: string;
  subject: string;
  decisionText: string;
  decisionOwner: string;
  approvalState: 'proposed' | 'approved' | 'rejected' | 'superseded';
  effectiveDate: string | null;
  supersededDate: string | null;
  /** Ids of EvidenceRecords supporting this decision. */
  evidenceIds: string[];
  extractedConstraints: string[];
  sourceReferences: Array<{ sourceSystem: SourceSystem; sourceObjectId: string; url: string | null }>;
}

export interface Requirement {
  id: string;
  tenantId: string;
  originalStatement: string;
  acceptanceCriteria: string[];
  version: number;
  affectedSystems: string[];
  evidenceIds: string[];
}

/** Normalized proposition produced by Layer B (claim normalization). */
export interface Proposition {
  id: string;
  /** Canonical subject, e.g. "high-value-transfer". */
  subject: string;
  /** Predicate kind, e.g. "requiresApproval", "forbidden", "active", "supersededBy". */
  predicate: string;
  /** Object or polarity, e.g. "true", "false", decision id. */
  object: string;
  /** Human-readable original wording preserved from the source. */
  originalText: string;
  /** Optional condition, e.g. "amount > threshold". */
  condition: string | null;
  evidenceId: string;
  sourceSystem: SourceSystem;
  sourceObjectId: string;
  /** True when the predicate was inferred rather than explicitly stated. */
  inferred: boolean;
}

export type DetectionType =
  | 'direct_semantic_contradiction'
  | 'policy_violation'
  | 'missing_required_approval'
  | 'decision_supersession_conflict'
  | 'incompatible_requirements'
  | 'release_readiness_discrepancy'
  | 'unresolved_dependency_conflict'
  | 'ownership_inconsistency'
  | 'implementation_requirement_mismatch';

export type ContradictionStatus =
  | 'VERIFIED_CONTRADICTION'
  | 'POTENTIAL_CONTRADICTION'
  | 'CONSISTENT'
  | 'INSUFFICIENT_EVIDENCE'
  | 'STALE_EVIDENCE'
  | 'ACCESS_RESTRICTED'
  | 'ANALYSIS_FAILED';

export interface Finding {
  findingId: string;
  tenantId: string;
  type: DetectionType;
  status: ContradictionStatus;
  /** Human-readable explanation, must cite evidence ids. */
  explanation: string;
  /** Evidence ids supporting both sides. Never empty for verified findings. */
  supportingEvidenceIds: string[];
  competingClaims: Array<{ statement: string; evidenceId: string }>;
  confidence: number; // 0..1
  severity: Severity;
  detectedAt: string;
  affectedWork: Array<{ type: 'jira_issue'; key: string }>;
  /** Provenance of how each side was obtained. */
  provenance: Array<{ evidenceId: string; sourceSystem: SourceSystem; sourceObjectId: string }>;
}

export type ApprovalState =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'EXECUTED'
  | 'REJECTED'
  | 'EXPIRED'
  | 'CANCELLED'
  | 'EXECUTION_FAILED';

export interface ApprovalBinding {
  /** Authenticated user ARI who granted the approval. */
  approverUserId: string;
  tenantId: string;
  /** Exact target, e.g. Jira issue key. */
  target: string;
  /** Exact operation, e.g. "create_remediation_issue". */
  operation: string;
  /** SHA-256 of the canonical payload being approved. */
  payloadDigest: string;
  approvedAt: string;
  expiresAt: string;
}

export interface RemediationProposal {
  id: string;
  tenantId: string;
  caseId: string;
  targetSystem: SourceSystem;
  target: string;
  operation: string;
  expectedChange: string;
  /** Canonical payload that will be executed if approved. */
  payload: unknown;
  payloadDigest: string;
  supportingFindingIds: string[];
  risk: 'low' | 'medium' | 'high';
  state: ApprovalState;
  actor: string;
  createdAt: string;
  binding: ApprovalBinding | null;
  /** Severity of the supporting finding at draft time; drives queue utility. */
  severity?: Severity;
  verificationRequirements: string[];
  /** Independent post-execution verification result (null until executed+verified read). */
  verification?: {
    outcome: 'VERIFIED' | 'MISMATCH' | 'UNVERIFIED';
    detail: string;
    evidenceRef: string | null;
    verifiedAt: string;
  } | null;
}

export interface AuditEvent {
  id: string;
  tenantId: string;
  actor: string;
  action: string;
  target: string;
  timestamp: string;
  /** Fingerprint of the triggering request. */
  requestFingerprint: string;
  result: 'success' | 'failure' | 'denied';
  linkedEvidenceIds: string[];
  /** Digest of the preceding audit event for tamper-evident chaining. */
  precedingEventDigest: string | null;
}

export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface SeverityInputs {
  detectionType: DetectionType;
  evidenceStrength: number; // 0..1
  affectedWorkCount: number;
  /** Age of the newest supporting evidence in days. */
  newestEvidenceAgeDays: number;
  hasVerifiedDependency: boolean;
}

export interface SeverityAssessment {
  severity: Severity;
  /** Confidence that a contradiction exists — separate from severity. */
  confidence: number;
  reasons: string[];
}
