import { useState } from 'react';
import StoreManager from './StoreManager.jsx';

const FILTERS = [
  { key: 'isHotDeal', label: 'Hot Deals', badge: '🔥', color: 'hot' },
  { key: 'isNew',     label: 'New In',    badge: 'New', color: 'new' },
  { key: 'isTrending',label: 'Trending',  badge: '↑',   color: 'trend' },
];

// Professional sliders icon
const SlidersIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/>
    <line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/>
    <line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/>
    <line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/>
    <line x1="17" y1="16" x2="23" y2="16"/>
  </svg>
);

export default function StoreGrid({ items, stores, onItemClick, onToggleStore, onOpenStore, selectedItems }) {
  const [managerOpen, setManagerOpen] = useState(false);
  // Per-store tile filter config, lifted here so it can be passed to StoreBrowser
  const [tileFilters, setTileFilters] = useState(() =>
    Object.fromEntries(stores.map(s => [s.id, { isHotDeal: true, isNew: true, isTrending: true }]))
  );

  const byStore = {};
  items.forEach(item => {
    if (!byStore[item.storeSlug]) byStore[item.storeSlug] = [];
    byStore[item.storeSlug].push(item);
  });

  const activeStores = stores.filter(s => s.active && byStore[s.id]);

  const handleFilterChange = (storeId, key) => {
    setTileFilters(prev => ({
      ...prev,
      [storeId]: { ...prev[storeId], [key]: !prev[storeId]?.[key] },
    }));
  };

  return (
    <>
      {managerOpen && (
        <StoreManager stores={stores} onToggle={onToggleStore} onClose={() => setManagerOpen(false)} />
      )}

      <div className="catalog-header">
        <button type="button" className="button manage-stores-btn" onClick={() => setManagerOpen(true)}>
          <SlidersIcon /> Manage stores
        </button>
      </div>

      {activeStores.length === 0 && (
        <p className="footer-note">No active stores. Click "Manage stores" to enable some.</p>
      )}

      <div className="store-sections">
        {activeStores.map(store => (
          <StoreTile
            key={store.id}
            store={store}
            items={byStore[store.id] || []}
            filter={tileFilters[store.id] || { isHotDeal: true, isNew: true, isTrending: true }}
            onFilterChange={(key) => handleFilterChange(store.id, key)}
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

  // Show items matching active filters; pad to 4 with remaining items if needed
  const filtered = items.filter(item => Object.entries(filter).some(([k, v]) => v && item[k]));
  const displayItems = (filtered.length >= 4 ? filtered : [...filtered, ...items.filter(i => !filtered.includes(i))]).slice(0, 4);

  return (
    <div
      className="store-tile"
      onClick={onOpenStore}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onOpenStore()}
      aria-label={`Browse ${store.name}`}
    >
      {/* Header: store name + sliders icon (stops propagation) */}
      <div className="store-tile-header">
        <span className="store-tile-name">{store.name}</span>
        <div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
          <button
            type="button"
            className={`icon-btn sliders-btn ${configOpen ? 'sliders-btn-active' : ''}`}
            onClick={() => setConfigOpen(v => !v)}
            title="Configure tile"
            aria-label="Configure tile filters"
          >
            <SlidersIcon />
          </button>
          {configOpen && (
            <div className="tile-config-popover">
              <p className="tile-config-title">Show on this tile</p>
              {FILTERS.map(({ key, label }) => (
                <label key={key} className="tile-config-row">
                  <input
                    type="checkbox"
                    checked={!!filter[key]}
                    onChange={() => onFilterChange(key)}
                  />
                  {label}
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 4-item thumbnail carousel */}
      <div className="store-thumb-carousel">
        {displayItems.map(item => {
          const isSelected = selectedItems.some(s => s.id === item.id);
          const badge = FILTERS.find(f => filter[f.key] && item[f.key]);
          return (
            <div
              key={item.id}
              className={`store-thumb-item ${isSelected ? 'store-thumb-selected' : ''}`}
              onClick={e => { e.stopPropagation(); onItemClick(item); }}
              role="button"
              tabIndex={0}
              onKeyDown={e => { if (e.key === 'Enter') { e.stopPropagation(); onItemClick(item); } }}
              title={`${item.title} — R${item.priceZAR.toFixed(2)}`}
            >
              <img src={item.productImageUrl} alt={item.title} />
              <span className="store-thumb-price">R{item.priceZAR.toFixed(2)}</span>
              {isSelected && <span className="store-thumb-check">✓</span>}
              {badge && <span className={`store-thumb-badge ${badge.color}`}>{badge.badge}</span>}
            </div>
          );
        })}
        {/* Empty placeholder slots if fewer than 4 items */}
        {Array.from({ length: Math.max(0, 4 - displayItems.length) }).map((_, i) => (
          <div key={`empty-${i}`} className="store-thumb-item store-thumb-empty" />
        ))}
      </div>

      <div className="store-tile-cta">Browse {store.name} →</div>
    </div>
  );
}
