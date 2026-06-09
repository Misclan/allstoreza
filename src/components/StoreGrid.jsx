import { useState, useMemo } from 'react';
import StoreManager from './StoreManager.jsx';

const FILTERS = [
  { key: 'isHotDeal',  label: 'On Sale',  badge: 'SALE',  color: 'badge-sale' },
  { key: 'isNew',      label: 'New In',   badge: 'NEW',   color: 'badge-new'  },
  { key: 'isTrending', label: 'Trending', badge: 'HOT',   color: 'badge-hot'  },
];

const CATEGORIES = [
  { label: 'All',        value: null },
  { label: 'Tops',       value: ['inner_body'] },
  { label: 'Outerwear',  value: ['outer_body'] },
  { label: 'Bottoms',    value: ['lower_body'] },
  { label: 'Dresses',    value: ['full_body'] },
  { label: 'Accessories',value: ['hat', 'handbag', 'accessory'] },
  { label: 'Footwear',   value: ['footwear'] },
];

const SlidersIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/>
    <line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/>
    <line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/>
    <line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/>
    <line x1="17" y1="16" x2="23" y2="16"/>
  </svg>
);
const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const XIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const CartIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
  </svg>
);

export default function StoreGrid({ items, stores, onItemClick, onToggleStore, onOpenStore, selectedItems }) {
  const [managerOpen, setManagerOpen]   = useState(false);
  const [searchTerm, setSearchTerm]     = useState('');
  const [activeCategory, setActiveCategory] = useState(null); // null = All
  const [tileFilters, setTileFilters]   = useState(() =>
    Object.fromEntries(stores.map(s => [s.id, { isHotDeal: true, isNew: true, isTrending: true }]))
  );

  const byStore = {};
  items.forEach(item => {
    if (!byStore[item.storeSlug]) byStore[item.storeSlug] = [];
    byStore[item.storeSlug].push(item);
  });

  // Category-filtered items
  const categoryFilteredItems = useMemo(() => {
    if (!activeCategory) return items;
    return items.filter(item => activeCategory.includes(item.layerType));
  }, [items, activeCategory]);

  // Active stores for tile display
  const activeStores = stores
    .filter(s => s.active && byStore[s.id])
    .sort((a, b) => a.name.localeCompare(b.name));

  // Search logic
  const trimmed = searchTerm.trim().toLowerCase();
  const isSearching = trimmed.length > 0;

  const searchResults = useMemo(() => {
    if (!isSearching) return [];
    return categoryFilteredItems.filter(item =>
      item.title.toLowerCase().includes(trimmed) ||
      item.storeName.toLowerCase().includes(trimmed) ||
      item.layerType.replace(/_/g, ' ').toLowerCase().includes(trimmed)
    );
  }, [categoryFilteredItems, trimmed, isSearching]);

  // Filtered stores (by category, for tile view)
  const filteredStores = useMemo(() => {
    if (!activeCategory) return activeStores;
    return activeStores.filter(store =>
      (byStore[store.id] || []).some(item => activeCategory.includes(item.layerType))
    );
  }, [activeStores, activeCategory, byStore]);

  const resultCount = isSearching ? searchResults.length : categoryFilteredItems.length;

  return (
    <>
      {managerOpen && (
        <StoreManager stores={stores} onToggle={onToggleStore} onClose={() => setManagerOpen(false)} />
      )}

      {/* ── Toolbar: search + manage stores ─────────────────────────── */}
      <div className="catalog-search-wrap">
        <div className="catalog-search">
          <span className="catalog-search-icon"><SearchIcon /></span>
          <input
            type="text"
            placeholder="Search clothing, stores…"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="catalog-search-clear" onClick={() => setSearchTerm('')}>
              <XIcon />
            </button>
          )}
        </div>
        <button type="button" className="btn-outline manage-stores-btn" onClick={() => setManagerOpen(true)}>
          <SlidersIcon /> Stores
        </button>
      </div>

      {/* ── Category filter chips ────────────────────────────────────── */}
      <div className="filter-row">
        {CATEGORIES.map(cat => (
          <button
            key={cat.label}
            type="button"
            className={`filter-chip ${activeCategory === cat.value ? 'filter-chip-active' : ''}`}
            onClick={() => setActiveCategory(
              activeCategory === cat.value ? null : cat.value
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* ── Results toolbar ──────────────────────────────────────────── */}
      {(isSearching || activeCategory) && (
        <div className="store-toolbar" style={{ marginBottom: '0.75rem' }}>
          <span className="store-results-count">
            {isSearching
              ? `${resultCount} result${resultCount !== 1 ? 's' : ''} for "${searchTerm}"`
              : `${resultCount} item${resultCount !== 1 ? 's' : ''}`}
          </span>
        </div>
      )}

      {/* ── Search results grid ──────────────────────────────────────── */}
      {isSearching ? (
        searchResults.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <SearchIcon />
            </div>
            <p className="empty-state-title">No results</p>
            <p className="empty-state-sub">Try a different search term or browse by category.</p>
          </div>
        ) : (
          <div className="sb-grid">
            {searchResults.map(item => (
              <SearchCard
                key={item.id}
                item={item}
                isOn={selectedItems.some(s => s.id === item.id)}
                onTryOn={() => onItemClick(item)}
                onOpenStore={() => onOpenStore(item.storeSlug)}
              />
            ))}
          </div>
        )
      ) : (
        /* ── Store tiles ──────────────────────────────────────────────── */
        <>
          {filteredStores.length === 0 ? (
            <div className="empty-state">
              <p className="empty-state-title">No stores in this category</p>
              <p className="empty-state-sub">Try a different category or enable more stores.</p>
            </div>
          ) : (
            <div className="store-sections">
              {filteredStores.map(store => {
                const storeItems = activeCategory
                  ? (byStore[store.id] || []).filter(item => activeCategory.includes(item.layerType))
                  : (byStore[store.id] || []);
                return (
                  <StoreTile
                    key={store.id}
                    store={store}
                    items={storeItems}
                    filter={tileFilters[store.id] || { isHotDeal: true, isNew: true, isTrending: true }}
                    onFilterChange={key => setTileFilters(prev => ({
                      ...prev,
                      [store.id]: { ...prev[store.id], [key]: !prev[store.id]?.[key] }
                    }))}
                    onOpenStore={() => onOpenStore(store.id, tileFilters[store.id])}
                    onItemClick={onItemClick}
                    selectedItems={selectedItems}
                  />
                );
              })}
            </div>
          )}
        </>
      )}
    </>
  );
}

function SearchCard({ item, isOn, onTryOn, onOpenStore }) {
  const badge = FILTERS.find(f => item[f.key]);
  return (
    <div className={`sb-card sb-card-grid ${isOn ? 'sb-card-on' : ''}`}>
      <div className="sb-card-img" onClick={onOpenStore} style={{ cursor: 'pointer' }}>
        {badge && <span className={`sb-img-badge ${badge.color}`}>{badge.badge}</span>}
        <img src={item.productImageUrl} alt={item.title} />
      </div>
      <div className="sb-card-info">
        <span className="sb-card-name">{item.title}</span>
        <span className="sb-card-store">{item.storeName}</span>
        <span className="sb-card-price">R{item.priceZAR.toFixed(2)}</span>
      </div>
      <div className="sb-card-actions">
        <button type="button" className={`btn-primary sb-try-btn ${isOn ? 'btn-active' : ''}`} onClick={onTryOn}>
          {isOn ? 'Undo' : 'Try on'}
        </button>
        <div className="sb-secondary-actions">
          <button type="button" className="btn-outline sb-cart-btn" onClick={onOpenStore} title="View in store">
            View store
          </button>
        </div>
      </div>
    </div>
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

      <div className="store-tile-cta">Browse {store.name} →</div>
    </div>
  );
}
