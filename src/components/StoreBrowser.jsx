import { useState } from 'react';

const SECTIONS = [
  { key: 'isHotDeal', label: 'Hot Deals', icon: '🔥' },
  { key: 'isNew',     label: 'New In',    icon: '✨' },
  { key: 'isTrending',label: 'Trending',  icon: '↑' },
];

const BackIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);

const ExternalIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
    <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
  </svg>
);

export default function StoreBrowser({ store, items, activeTileFilter, onTryOn, selectedItems, onClose }) {
  // Sections to show: respect the tile filter the user had configured
  const activeFilters = activeTileFilter
    ? SECTIONS.filter(s => activeTileFilter[s.key])
    : SECTIONS;

  // Build section groups
  const sections = activeFilters
    .map(s => ({ ...s, items: items.filter(i => i[s.key]) }))
    .filter(s => s.items.length > 0);

  // All items (for the full grid at the bottom)
  const allItems = items;

  return (
    <div className="store-browser">

      {/* Header */}
      <div className="sb-header">
        <div className="sb-title-row">
          <button type="button" className="sb-back-btn icon-btn" onClick={onClose} aria-label="Back to catalog">
            <BackIcon /> Back
          </button>
          <h2 className="sb-store-name">{store?.name}</h2>
          <a
            href={store?.storeUrl}
            target="_blank"
            rel="noreferrer"
            className="button-link sb-visit"
            onClick={e => e.stopPropagation()}
          >
            Visit store <ExternalIcon />
          </a>
        </div>
        <p className="sb-sub">
          Click <strong>Try it on</strong> to layer onto your avatar. Use <strong>Visit store</strong> for the full catalog.
        </p>
      </div>

      {/* Per-filter sections — each a horizontal scrollable carousel */}
      {sections.map(section => (
        <div key={section.key} className="sb-section">
          <div className="sb-section-header">
            <span className="sb-section-icon">{section.icon}</span>
            <h3 className="sb-section-title">{section.label}</h3>
            <span className="sb-section-count">{section.items.length} items</span>
          </div>
          <div className="sb-carousel">
            {section.items.map(item => (
              <ItemCard
                key={item.id}
                item={item}
                isSelected={selectedItems.some(s => s.id === item.id)}
                onTryOn={onTryOn}
              />
            ))}
          </div>
        </div>
      ))}

      {/* All items grid */}
      <div className="sb-section">
        <div className="sb-section-header">
          <h3 className="sb-section-title">All items</h3>
          <span className="sb-section-count">{allItems.length} items</span>
        </div>
        <div className="sb-all-grid">
          {allItems.map(item => (
            <article key={item.id} className={`sb-grid-card ${selectedItems.some(s => s.id === item.id) ? 'sb-grid-card-active' : ''}`}>
              <img src={item.productImageUrl} alt={item.title} />
              <div className="sb-grid-info">
                <span className="sb-grid-title">{item.title}</span>
                <span className="sb-grid-layer">{item.layerType.replace(/_/g, ' ')}</span>
                <span className="sb-grid-price">R{item.priceZAR.toFixed(2)}</span>
              </div>
              <button
                type="button"
                className={`button ${selectedItems.some(s => s.id === item.id) ? 'button-active' : ''}`}
                onClick={() => onTryOn(item)}
              >
                {selectedItems.some(s => s.id === item.id) ? '✓ On' : 'Try it on'}
              </button>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

function ItemCard({ item, isSelected, onTryOn }) {
  return (
    <div className={`sb-card ${isSelected ? 'sb-card-active' : ''}`}>
      <img src={item.productImageUrl} alt={item.title} />
      <div className="sb-card-info">
        <span className="sb-card-name">{item.title}</span>
        <span className="sb-card-price">R{item.priceZAR.toFixed(2)}</span>
      </div>
      <button
        type="button"
        className={`button sb-card-btn ${isSelected ? 'button-active' : ''}`}
        onClick={() => onTryOn(item)}
      >
        {isSelected ? '✓ Added' : 'Try it on'}
      </button>
    </div>
  );
}
