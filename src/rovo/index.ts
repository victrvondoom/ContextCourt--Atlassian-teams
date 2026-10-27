/**
 * Forge function handlers for Rovo agent actions and rovo:mcp tools.
 *
 * Each action in the manifest gets its own function so the handler knows
 * which operation to run without relying on invocation context.
 * All actions run with the invoking user's permissions.
 * prepare-remediation is proposal-only and never executes a change.
 */
import {
  getCase,
  getApprovalStatus,
  getEvidence,
  getImpact,
  investigateIssue,
  prepareRemediation,
} from './actions';

type ForgeInvocation = { payload?: unknown; context?: unknown };

export const getCaseHandler = async (req: ForgeInvocation) =>
  getCase({ payload: req.payload, context: req.context });
export const investigateIssueHandler = async (req: ForgeInvocation) =>
  investigateIssue({ payload: req.payload, context: req.context });
export const getEvidenceHandler = async (req: ForgeInvocation) =>
  getEvidence({ payload: req.payload, context: req.context });
export const getImpactHandler = async (req: ForgeInvocation) =>
  getImpact({ payload: req.payload, context: req.context });
export const prepareRemediationHandler = async (req: ForgeInvocation) =>
  prepareRemediation({ payload: req.payload, context: req.context });
export const getApprovalStatusHandler = async (req: ForgeInvocation) =>
  getApprovalStatus({ payload: req.payload, context: req.context });
