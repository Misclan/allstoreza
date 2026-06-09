export default function StoreManager({ stores, onToggle, onClose }) {
  return (
    <div className="store-manager-overlay" onClick={onClose}>
      <div className="store-manager-panel" onClick={(e) => e.stopPropagation()}>
        <div className="store-manager-header">
          <h2>Manage Stores</h2>
          <button
            type="button"
            className="btn-ghost"
            onClick={onClose}
            aria-label="Close"
            style={{ padding: '0.25rem 0.5rem', fontSize: '0.9rem' }}
          >✕</button>
        </div>
        <p className="store-manager-sub">Toggle which stores appear in the catalog.</p>
        <ul className="store-list">
          {stores.map((store) => (
            <li key={store.id} className="store-list-item">
              <span className="store-list-name">{store.name}</span>
              <button
                type="button"
                className={`toggle-btn ${store.active ? 'toggle-on' : 'toggle-off'}`}
                onClick={() => onToggle(store.id)}
                aria-pressed={store.active}
              >
                <span className="toggle-knob" />
              </button>
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="btn-primary"
          style={{ marginTop: '1.5rem', width: '100%', borderRadius: 'var(--radius-sm)' }}
          onClick={onClose}
        >
          Done
        </button>
      </div>
    </div>
  );
}
