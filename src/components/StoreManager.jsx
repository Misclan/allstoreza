export default function StoreManager({ stores, onToggle, onClose }) {
  return (
    <div className="store-manager-overlay" onClick={onClose}>
      <div className="store-manager-panel" onClick={(e) => e.stopPropagation()}>
        <div className="store-manager-header">
          <h2>Manage Stores</h2>
          <button className="icon-btn" onClick={onClose} type="button" aria-label="Close">✕</button>
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
        <button className="button" style={{ marginTop: '1.5rem', width: '100%' }} onClick={onClose} type="button">
          Done
        </button>
      </div>
    </div>
  );
}
