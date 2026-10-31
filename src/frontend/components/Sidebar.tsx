export interface NavItem {
  id: string;
  label: string;
}

export function Sidebar(props: {
  items: NavItem[];
  active: string;
  onSelect: (id: string) => void;
  badge?: { id: string; count: number };
  environment?: string;
  sandbox?: boolean;
  onToggleSandbox?: () => void;
}) {
  return (
    <nav className="sidebar" aria-label="ContextCourt navigation">
      <div className="sidebar-brand">
        <span className="brand-mark" aria-hidden="true">
          ⚖
        </span>
        <div>
          <div className="brand-name">ContextCourt</div>
          <div className="brand-sub">Decision intelligence</div>
        </div>
      </div>
      <ul className="nav-list">
        {props.items.map((item) => (
          <li key={item.id}>
            <button
              className={`nav-item${props.active === item.id ? ' active' : ''}`}
              onClick={() => props.onSelect(item.id)}
              aria-current={props.active === item.id ? 'page' : undefined}
            >
              {item.label}
              {props.badge?.id === item.id && props.badge.count > 0 && (
                <span className="badge">{props.badge.count}</span>
              )}
            </button>
          </li>
        ))}
      </ul>
      {props.onToggleSandbox && (
        <div className="sidebar-sandbox">
          <button
            className={`button${props.sandbox ? '' : ' primary'}`}
            onClick={props.onToggleSandbox}
            aria-pressed={props.sandbox}
          >
            {props.sandbox ? 'Exit sandbox' : 'Sandbox demo'}
          </button>
        </div>
      )}
      <div className="sidebar-footer">
        <span className={`env-dot ${props.environment?.startsWith('Jira connected') ? 'ok' : 'warn'}`} />
        {props.environment}
      </div>
    </nav>
  );
}
