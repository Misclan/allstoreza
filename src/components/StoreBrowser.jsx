import { useState } from 'react';

const TILE_OPTIONS = [
  { key: 'isHotDeal', label: 'Hot Deals' },
  { key: 'isNew', label: 'New In' },
  { key: 'isTrending', label: 'Trending' },
];

export default function StoreBrowser({ store, items, onTryOn, selectedItems, onClose }) {
  const [tileFilter, setTileFilter] = useState({ isHotDeal: true, isNew: true, isTrending: true });
  const [configOpen, setConfigOpen] = useState(false);

  const featured = items.filter((item) =>
    Object.entries(tileFilter).some(([k, v]) => v && item[k])
  ).slice(0, 4);

  const rest = items.filter((item) => !featured.includes(item));

  return (
    <div className="store-browser">
      {/* Header */}
      <div className="sb-header">
        <div className="sb-title-row">
          <button className="icon-btn" onClick={onClose} type="button" aria-label="Back">
            ← Back
          </button>
          <h2 className="sb-store-name">{store?.name}</h2>
          <a href={store?.storeUrl} target="_blank" rel="noreferrer" className="button-link sb-visit">
            Visit website ↗
          </a>
        </div>
        <p className="sb-sub">Items from <strong>{store?.name}</strong> — click "Try it on" to layer onto your avatar.</p>
      </div>

      {/* Featured carousel */}
      {featured.length > 0 && (
        <div className="sb-featured-section">
          <div className="sb-featured-header">
            <span className="section-heading" style={{ margin: 0 }}>Featured</span>
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                className="icon-btn config-pencil"
                onClick={() => setConfigOpen((v) => !v)}
                title="Configure tiles"
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
          </div>
          <div className="sb-carousel">
            {featured.map((item) => (
              <FeaturedCard key={item.id} item={item} onTryOn={onTryOn} selectedItems={selectedItems} />
            ))}
          </div>
        </div>
      )}

      {/* All items */}
      <div className="sb-all-section">
        <h3 className="section-heading">All items</h3>
        <div className="store-grid">
          {items.map((item) => (
            <article key={item.id} className="item-card">
              <img src={item.productImageUrl} alt={item.title} />
              <div>
                <h3>{item.title}</h3>
                <p>{item.layerType.replace('_', ' ')}</p>
                <p className="keyword">R{item.priceZAR.toFixed(2)}</p>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  className={`button ${selectedItems.some(s => s.id === item.id) ? 'button-active' : ''}`}
                  type="button"
                  onClick={() => onTryOn(item)}
                >
                  {selectedItems.some(s => s.id === item.id) ? '✓ On' : 'Try it on'}
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

function FeaturedCard({ item, onTryOn, selectedItems }) {
  const isSelected = selectedItems.some(s => s.id === item.id);
  return (
    <div className="featured-card">
      <img src={item.productImageUrl} alt={item.title} />
      <div className="featured-card-info">
        <span className="featured-card-name">{item.title}</span>
        <span className="featured-card-price">R{item.priceZAR.toFixed(2)}</span>
      </div>
      <button
        type="button"
        className={`button featured-try-btn ${isSelected ? 'button-active' : ''}`}
        onClick={() => onTryOn(item)}
      >
        {isSelected ? '✓ Added' : 'Try it on'}
      </button>
    </div>
  );
}
