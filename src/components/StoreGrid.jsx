import { useState } from 'react';
import StoreManager from './StoreManager.jsx';

const TILE_OPTIONS = [
  { key: 'isHotDeal', label: 'Hot Deals' },
  { key: 'isNew', label: 'New In' },
  { key: 'isTrending', label: 'Trending' },
];

export default function StoreGrid({ items, stores, onItemClick, onToggleStore, onOpenStore, selectedItems }) {
  const [managerOpen, setManagerOpen] = useState(false);

  // Group items by store
  const byStore = {};
  items.forEach((item) => {
    if (!byStore[item.storeSlug]) byStore[item.storeSlug] = [];
    byStore[item.storeSlug].push(item);
  });

  const activeStores = stores.filter((s) => s.active && byStore[s.id]);

  return (
    <>
      {managerOpen && (
        <StoreManager
          stores={stores}
          onToggle={onToggleStore}
          onClose={() => setManagerOpen(false)}
        />
      )}

      <div className="catalog-header">
        <div />
        <button
          type="button"
          className="button manage-stores-btn"
          onClick={() => setManagerOpen(true)}
        >
          ⚙ Manage stores
        </button>
      </div>

      {activeStores.length === 0 && (
        <p className="footer-note">No active stores. Use "Manage stores" to add some.</p>
      )}

      <div className="store-sections">
        {activeStores.map((store) => (
          <StoreTile
            key={store.id}
            store={store}
            items={byStore[store.id] || []}
            onItemClick={onItemClick}
            onOpenStore={onOpenStore}
            selectedItems={selectedItems}
          />
        ))}
      </div>
    </>
  );
}

function StoreTile({ store, items, onItemClick, onOpenStore, selectedItems }) {
  const [tileFilter, setTileFilter] = useState({ isHotDeal: true, isNew: true, isTrending: true });
  const [configOpen, setConfigOpen] = useState(false);

  const featured = items.filter((item) =>
    Object.entries(tileFilter).some(([k, v]) => v && item[k])
  ).slice(0, 4);

  const displayItems = featured.length > 0 ? featured : items.slice(0, 4);

  return (
    <div className="store-tile">
      <div className="store-tile-header">
        <span className="store-tile-name">{store.name}</span>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              className="icon-btn config-pencil"
              onClick={() => setConfigOpen((v) => !v)}
              title="Configure tile"
            >
              ✏️
            </button>
            {configOpen && (
              <div className="tile-config-popover" onClick={(e) => e.stopPropagation()}>
                <p className="tile-config-title">Show tiles for:</p>
                {TILE_OPTIONS.map(({ key, label }) => (
                  <label key={key} className="tile-config-row">
                    <input
                      type="checkbox"
                      checked={!!tileFilter[key]}
                      onChange={() =>
                        setTileFilter((prev) => ({ ...prev, [key]: !prev[key] }))
                      }
                    />
                    {label}
                  </label>
                ))}
              </div>
            )}
          </div>
          <button
            type="button"
            className="button-link store-open-btn"
            onClick={() => onOpenStore(store.id)}
          >
            Browse store →
          </button>
        </div>
      </div>

      <div className="store-thumb-carousel">
        {displayItems.map((item) => {
          const isSelected = selectedItems.some((s) => s.id === item.id);
          return (
            <button
              key={item.id}
              type="button"
              className={`store-thumb-item ${isSelected ? 'store-thumb-selected' : ''}`}
              onClick={() => onItemClick(item)}
              title={item.title}
            >
              <img src={item.productImageUrl} alt={item.title} />
              <span className="store-thumb-price">R{item.priceZAR.toFixed(2)}</span>
              {isSelected && <span className="store-thumb-check">✓</span>}
              {item.isHotDeal && tileFilter.isHotDeal && (
                <span className="store-thumb-badge hot">🔥</span>
              )}
              {item.isNew && tileFilter.isNew && (
                <span className="store-thumb-badge new">New</span>
              )}
              {item.isTrending && tileFilter.isTrending && (
                <span className="store-thumb-badge trend">↑</span>
              )}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        className="store-browse-all"
        onClick={() => onOpenStore(store.id)}
      >
        Browse all {store.name} items →
      </button>
    </div>
  );
}
