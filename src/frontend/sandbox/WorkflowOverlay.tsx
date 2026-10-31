import { useSandbox } from './SandboxContext';
import { WORKFLOW_STEPS } from './workflowSteps';

export function WorkflowOverlay({ onGoto }: { onGoto: (viewId: string) => void }) {
  const { sandbox, overlayStep, setOverlayStep, setSandbox } = useSandbox();
  if (!sandbox || overlayStep === null) return null;

  const step = WORKFLOW_STEPS[overlayStep];
  if (!step) return null;
  const isLast = overlayStep === WORKFLOW_STEPS.length - 1;

  const close = () => setOverlayStep(null);
  const exitSandbox = () => {
    setSandbox(false);
  };

  return (
    <aside className="workflow-overlay" aria-label="Guided workflow">
      <div className="workflow-overlay-head">
        <span className="pill status-available">Sandbox</span>
        <span className="workflow-step-indicator">
          Step {overlayStep + 1} of {WORKFLOW_STEPS.length}
        </span>
        <button className="button subtle" onClick={close} aria-label="Close workflow guide">
          ✕
        </button>
      </div>
      <h3>{step.title}</h3>
      <p>{step.body}</p>
      <div className="workflow-overlay-actions">
        <button
          className="button"
          disabled={overlayStep === 0}
          onClick={() => setOverlayStep(overlayStep - 1)}
        >
          Back
        </button>
        <button className="button primary" onClick={() => onGoto(step.id)}>
          Go to {step.title.toLowerCase()}
        </button>
        {isLast ? (
          <button className="button" onClick={close}>
            Finish
          </button>
        ) : (
          <button className="button" onClick={() => setOverlayStep(overlayStep + 1)}>
            Next
          </button>
        )}
      </div>
      <div className="workflow-overlay-dots" aria-hidden="true">
        {WORKFLOW_STEPS.map((s, i) => (
          <span key={s.id} className={i === overlayStep ? 'dot active' : 'dot'} />
        ))}
      </div>
      <button className="link-button" onClick={exitSandbox}>
        Exit sandbox
      </button>
    </aside>
  );
}
