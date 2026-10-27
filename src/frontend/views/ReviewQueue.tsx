/**
 * Review queue placeholder — remediation proposals are created by live
 * analysis; approving requires a human approval binding (M7). The queue
 * shows proposals stored for the tenant once analysis creates them.
 */
export function ReviewQueue() {
  return (
    <div className="view">
      <header className="view-header">
        <h1>Review queue</h1>
        <p className="muted">
          Remediation proposals awaiting human approval. Nothing executes without an explicit, recorded
          approval bound to user, tenant, target and payload digest.
        </p>
      </header>
      <section className="card">
        <p className="muted">
          No proposals pending. Proposals appear after live analysis detects contradictions.
        </p>
      </section>
    </div>
  );
}
