import { useState } from 'react';
import StoreManager from './StoreManager.jsx';

const FILTERS = [
  { key: 'isHotDeal',  label: 'On Sale',  badge: 'SALE',  color: 'badge-sale' },
  { key: 'isNew',      label: 'New In',   badge: 'NEW',   color: 'badge-new'  },
  { key: 'isTrending', label: 'Trending', badge: 'HOT',   color: 'badge-hot'  },
];

const SlidersIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/>
    <line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/>
    <line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/>
    <line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/>
    <line x1="17" y1="16" x2="23" y2="16"/>
  </svg>
);

export default function StoreGrid({ items, stores, onItemClick, onToggleStore, onOpenStore, selectedItems, onManageStores }) {
  const [managerOpen, setManagerOpen] = useState(false);
  const [tileFilters, setTileFilters] = useState(() =>
    Object.fromEntries(stores.map(s => [s.id, { isHotDeal: true, isNew: true, isTrending: true }]))
  );

  const byStore = {};
  items.forEach(item => {
    if (!byStore[item.storeSlug]) byStore[item.storeSlug] = [];
    byStore[item.storeSlug].push(item);
  });

  // Alphabetical, active only
  const activeStores = stores
    .filter(s => s.active && byStore[s.id])
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <>
      {managerOpen && (
        <StoreManager stores={stores} onToggle={onToggleStore} onClose={() => setManagerOpen(false)} />
      )}

      {/* Manage stores button is rendered by Workspace in the panel-header row
          but we expose a trigger here for the catalog-only view */}
      <div className="store-manage-row">
        <button type="button" className="btn-outline" onClick={() => setManagerOpen(true)}>
          <SlidersIcon /> Manage stores
        </button>
      </div>

      {activeStores.length === 0 && (
        <p className="panel-hint" style={{ marginTop: '1rem' }}>No active stores. Click "Manage stores" to enable some.</p>
      )}

      <div className="store-sections">
        {activeStores.map(store => (
          <StoreTile
            key={store.id}
            store={store}
            items={byStore[store.id] || []}
            filter={tileFilters[store.id] || { isHotDeal: true, isNew: true, isTrending: true }}
            onFilterChange={key => setTileFilters(prev => ({
              ...prev,
              [store.id]: { ...prev[store.id], [key]: !prev[store.id]?.[key] }
            }))}
            onOpenStore={() => onOpenStore(store.id, tileFilters[store.id])}
            onItemClick={onItemClick}
            selectedItems={selectedItems}
          />
        ))}
      </div>
    </>
  );
}

function StoreTile({ store, items, filter, onFilterChange, onOpenStore, onItemClick, selectedItems }) {
  const [configOpen, setConfigOpen] = useState(false);

  const filtered = items.filter(item => Object.entries(filter).some(([k, v]) => v && item[k]));
  const displayItems = (filtered.length >= 4
    ? filtered
    : [...filtered, ...items.filter(i => !filtered.includes(i))]
  ).slice(0, 4);

  return (
    <div
      className="store-tile"
      onClick={onOpenStore}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onOpenStore()}
      aria-label={`Browse ${store.name}`}
    >
      <div className="store-tile-header">
        <span className="store-tile-name">{store.name}</span>
        <div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
          <button
            type="button"
            className={`tile-config-btn ${configOpen ? 'tile-config-btn-active' : ''}`}
            onClick={() => setConfigOpen(v => !v)}
            aria-label="Configure tile"
          >
            <SlidersIcon />
          </button>
          {configOpen && (
            <div className="tile-config-popover">
              <p className="tile-config-title">Show on tile</p>
              {FILTERS.map(({ key, label }) => (
                <label key={key} className="tile-config-row">
                  <input type="checkbox" checked={!!filter[key]} onChange={() => onFilterChange(key)} />
                  {label}
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="store-thumb-row">
        {displayItems.map(item => {
          const isSelected = selectedItems.some(s => s.id === item.id);
          const badge = FILTERS.find(f => filter[f.key] && item[f.key]);
          return (
            <div
              key={item.id}
              className={`store-thumb ${isSelected ? 'store-thumb-on' : ''}`}
              onClick={e => { e.stopPropagation(); onItemClick(item); }}
              role="button"
              tabIndex={0}
              onKeyDown={e => { if (e.key === 'Enter') { e.stopPropagation(); onItemClick(item); } }}
              title={`${item.title} — R${item.priceZAR.toFixed(2)}`}
            >
              <img src={item.productImageUrl} alt={item.title} />
              {badge && <span className={`thumb-badge ${badge.color}`}>{badge.badge}</span>}
              {isSelected && <span className="thumb-check">✓</span>}
              <span className="thumb-price">R{item.priceZAR.toFixed(2)}</span>
            </div>
          );
        })}
        {Array.from({ length: Math.max(0, 4 - displayItems.length) }).map((_, i) => (
          <div key={`ph-${i}`} className="store-thumb store-thumb-empty" />
        ))}
      </div>

      <div className="store-tile-cta">Browse {store.name}</div>
    </div>
  );
}
