import { useState } from 'react';

const SECTIONS = [
  { key: 'isHotDeal',  label: 'On Sale',  badge: 'SALE', color: 'badge-sale' },
  { key: 'isNew',      label: 'New In',   badge: 'NEW',  color: 'badge-new'  },
  { key: 'isTrending', label: 'Trending', badge: 'HOT',  color: 'badge-hot'  },
];

const BackIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);
const ExternalIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
    <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
  </svg>
);
const CartIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
  </svg>
);
const HeartIcon = ({ filled }) => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);
const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const XIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

export default function StoreBrowser({
  store, items, activeTileFilter,
  onTryOn, onAddToWardrobe, onDirectCartAdd, onDirectWishlistAdd,
  directCart, directWishlist, selectedItems, onClose
}) {
  const [searchTerm, setSearchTerm]           = useState('');
  const [viewAllSection, setViewAllSection]   = useState(null); // { label, items }

  const activeFilters = activeTileFilter
    ? SECTIONS.filter(s => activeTileFilter[s.key])
    : SECTIONS;

  const trimmed = searchTerm.trim().toLowerCase();
  const filteredItems = trimmed
    ? items.filter(i =>
        i.title.toLowerCase().includes(trimmed) ||
        i.layerType.replace(/_/g, ' ').toLowerCase().includes(trimmed)
      )
    : items;

  const sections = activeFilters
    .map(s => ({ ...s, items: filteredItems.filter(i => i[s.key]) }))
    .filter(s => s.items.length > 0);

  const handleTryOn = (item) => {
    onTryOn(item);
    onAddToWardrobe(item);
  };

  const getCartQty = (id) => directCart.find(c => c.id === id)?.qty || 0;
  const isWishlisted = (id) => directWishlist.some(w => w.id === id);
  const isSelected = (id) => selectedItems.some(s => s.id === id);

  return (
    <div className="store-browser">

      {/* View-all modal */}
      {viewAllSection && (
        <div className="view-all-overlay" onClick={() => setViewAllSection(null)}>
          <div className="view-all-panel" onClick={e => e.stopPropagation()}>
            <div className="view-all-header">
              <h3 className="view-all-title">{viewAllSection.label}</h3>
              <button type="button" className="btn-icon" onClick={() => setViewAllSection(null)}>
                <XIcon />
              </button>
            </div>
            <div className="view-all-grid">
              {viewAllSection.items.map(item => (
                <BrowserCard
                  key={item.id}
                  item={item}
                  showBadge
                  isOn={isSelected(item.id)}
                  cartQty={getCartQty(item.id)}
                  inWishlist={isWishlisted(item.id)}
                  onTryOn={() => { handleTryOn(item); setViewAllSection(null); }}
                  onCart={() => onDirectCartAdd(item)}
                  onWishlist={() => onDirectWishlistAdd(item)}
                  grid
                />
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="sb-header">
        <div className="sb-title-row">
          <button type="button" className="btn-ghost sb-back" onClick={onClose}>
            <BackIcon /> Back
          </button>
          <h2 className="sb-store-name">{store?.name}</h2>
          <a href={store?.storeUrl} target="_blank" rel="noreferrer" className="btn-outline sb-visit">
            Visit store <ExternalIcon />
          </a>
        </div>
        <p className="sb-sub">Try on items to see how they look. Items are saved to your wardrobe.</p>
      </div>

      <div className="sb-search-wrap">
        <span className="sb-search-icon"><SearchIcon /></span>
        <input
          type="text"
          placeholder={`Search in ${store?.name}…`}
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button className="catalog-search-clear" onClick={() => setSearchTerm('')}>
            <XIcon />
          </button>
        )}
      </div>

      {/* Curated sections — NO badges on thumbnails here, section header gives context */}
      {!trimmed && sections.map(section => (
        <div key={section.key} className="sb-section">
          <div className="sb-section-header">
            <span className={`sb-section-badge ${section.color}`}>{section.badge}</span>
            <h3 className="sb-section-title">{section.label}</h3>
            <button
              type="button"
              className="sb-view-all-btn"
              onClick={() => setViewAllSection(section)}
            >
              View all
            </button>
          </div>
          <div className="sb-carousel">
            {section.items.map(item => (
              <BrowserCard
                key={item.id}
                item={item}
                showBadge={false}
                isOn={isSelected(item.id)}
                cartQty={getCartQty(item.id)}
                inWishlist={isWishlisted(item.id)}
                onTryOn={() => handleTryOn(item)}
                onCart={() => onDirectCartAdd(item)}
                onWishlist={() => onDirectWishlistAdd(item)}
              />
            ))}
          </div>
        </div>
      ))}

      {/* All items grid — badges shown here since no section context */}
      <div className="sb-section">
        <div className="sb-section-header">
          <h3 className="sb-section-title">{trimmed ? 'Results' : 'All items'}</h3>
          <button
            type="button"
            className="sb-view-all-btn"
            onClick={() => setViewAllSection({ label: trimmed ? 'Results' : 'All items', items: filteredItems })}
          >
            View all
          </button>
        </div>
        {filteredItems.length === 0 ? (
          <p className="panel-hint">No items match your search.</p>
        ) : (
          <div className="sb-grid">
            {filteredItems.map(item => {
              const badge = SECTIONS.find(s => item[s.key]);
              return (
                <BrowserCard
                  key={item.id}
                  item={item}
                  badge={badge}
                  showBadge
                  isOn={isSelected(item.id)}
                  cartQty={getCartQty(item.id)}
                  inWishlist={isWishlisted(item.id)}
                  onTryOn={() => handleTryOn(item)}
                  onCart={() => onDirectCartAdd(item)}
                  onWishlist={() => onDirectWishlistAdd(item)}
                  grid
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function BrowserCard({ item, badge, showBadge, isOn, cartQty, inWishlist, onTryOn, onCart, onWishlist, grid }) {
  return (
    <div className={`sb-card ${grid ? 'sb-card-grid' : ''} ${isOn ? 'sb-card-on' : ''}`}>
      <div className="sb-card-img">
        {showBadge && badge && <span className={`sb-img-badge ${badge.color}`}>{badge.badge}</span>}
        <img src={item.productImageUrl} alt={item.title} />
      </div>
      <div className="sb-card-info">
        <span className="sb-card-name">{item.title}</span>
        <span className="sb-card-store">{item.storeName}</span>
        <span className="sb-card-price">R{item.priceZAR.toFixed(2)}</span>
      </div>
      <div className="sb-card-actions">
        <button
          type="button"
          className={`btn-primary sb-try-btn ${isOn ? 'btn-active' : ''}`}
          onClick={onTryOn}
        >
          {isOn ? 'Undo' : 'Try on'}
        </button>
        <div className="sb-secondary-actions">
          <button
            type="button"
            className={`btn-icon-square sb-wish-btn ${inWishlist ? 'btn-icon-square-wish' : ''}`}
            onClick={onWishlist}
            title={inWishlist ? 'Remove from saved' : 'Save item'}
          >
            <HeartIcon filled={inWishlist} />
          </button>
          <button
            type="button"
            className={`btn-icon-square sb-cart-btn ${cartQty > 0 ? 'btn-icon-square-active' : ''}`}
            onClick={onCart}
            title="Add to cart"
          >
            {cartQty > 0 ? (
              <span style={{ fontSize: '0.7rem', fontWeight: 700 }}>{cartQty}</span>
            ) : (
              <CartIcon />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
