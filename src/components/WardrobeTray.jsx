import { useState, useEffect } from 'react';

const HeartIcon = ({ filled }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);
const CartIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
  </svg>
);
const TrashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);

export default function WardrobeTray({
  items, savedOutfits, selectedItems,
  onTryOn, onWishlistToggle, onDelete,
  onCartAdd, directCart,
  onDeleteOutfit, onLoadOutfit,
  externalSavedFilter, // changes value when topnav Saved is clicked
}) {
  const [tab,    setTab]    = useState('tryOn');   // 'tryOn' | 'savedLooks'
  const [filter, setFilter] = useState('all');     // 'all' | 'saved' | 'cart'

  // Topnav "Saved" click: jump to try-on tab, filter to saved
  useEffect(() => {
    if (externalSavedFilter) {
      setTab('tryOn');
      setFilter('saved');
    }
  }, [externalSavedFilter]);

  // Filtered wardrobe items for Try-On tab
  const filteredItems = items.filter(item => {
    if (filter === 'saved') return item.inWishlist;
    if (filter === 'cart')  return directCart.some(c => c.id === item.id);
    return true;
  });

  // Group savedOutfits by date for Saved Looks tab
  const outfitsByDate = {};
  (savedOutfits || []).forEach(outfit => {
    const d = outfit.savedDate || 'Today';
    if (!outfitsByDate[d]) outfitsByDate[d] = [];
    outfitsByDate[d].push(outfit);
  });

  return (
    <div className="wardrobe-tray">
      {/* Tabs */}
      <div className="wardrobe-tabs">
        <button
          type="button"
          className={`wardrobe-tab ${tab === 'tryOn' ? 'wardrobe-tab-active' : ''}`}
          onClick={() => setTab('tryOn')}
        >
          Try-On
          {items.length > 0 && <span className="wardrobe-tab-count">{items.length}</span>}
        </button>
        <button
          type="button"
          className={`wardrobe-tab ${tab === 'savedLooks' ? 'wardrobe-tab-active' : ''}`}
          onClick={() => setTab('savedLooks')}
        >
          Saved Looks
          {savedOutfits?.length > 0 && <span className="wardrobe-tab-count">{savedOutfits.length}</span>}
        </button>

        {/* Filter chips — only visible on Try-On tab */}
        {tab === 'tryOn' && (
          <div className="wardrobe-filters">
            <button
              type="button"
              className={`filter-chip ${filter === 'all' ? 'filter-chip-active' : ''}`}
              onClick={() => setFilter('all')}
            >All</button>
            <button
              type="button"
              className={`filter-chip ${filter === 'saved' ? 'filter-chip-active' : ''}`}
              onClick={() => setFilter(f => f === 'saved' ? 'all' : 'saved')}
            >♡ Saved</button>
            <button
              type="button"
              className={`filter-chip ${filter === 'cart' ? 'filter-chip-active' : ''}`}
              onClick={() => setFilter(f => f === 'cart' ? 'all' : 'cart')}
            >🛒 In Cart</button>
          </div>
        )}
      </div>

      {/* ── TRY-ON TAB ────────────────────────────────────────────────── */}
      {tab === 'tryOn' && (
        filteredItems.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.57a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.57a2 2 0 0 0-1.34-2.23z"/>
              </svg>
            </div>
            <p className="empty-state-title">
              {filter === 'saved' ? 'No saved items' : filter === 'cart' ? 'Nothing in cart' : 'Wardrobe is empty'}
            </p>
            <p className="empty-state-sub">
              {filter === 'saved' ? 'Save items with the heart button while browsing.' :
               filter === 'cart'  ? 'Add items to cart from the catalog.' :
               'Try on items from the catalog to build your wardrobe.'}
            </p>
          </div>
        ) : (
          <div className="wardrobe-grid">
            {filteredItems.map(item => {
              const isOn = selectedItems?.some(s => s.id === item.id);
              const cartQty = directCart.find(c => c.id === item.id)?.qty || 0;
              return (
                <div key={item.id} className={`wcard ${isOn ? 'wcard-on' : ''} ${item.inWishlist ? 'wcard-wish' : ''}`}>
                  {item.inWishlist && <span className="wcard-wish-badge">Saved</span>}
                  <div className="wcard-img">
                    <img src={item.processedImageUrl} alt={item.title} />
                  </div>
                  <div className="wcard-info">
                    <span className="wcard-title">{item.title}</span>
                    <span className="wcard-meta">{item.layerType.replace(/_/g, ' ')}</span>
                    <span className="wcard-price">R{item.priceZAR?.toFixed(2) ?? '—'}</span>
                  </div>
                  <div className="wcard-actions">
                    <button
                      type="button"
                      className={`btn-primary wcard-try ${isOn ? 'btn-active' : ''}`}
                      onClick={() => onTryOn(item)}
                    >
                      {isOn ? 'Undo' : 'Try on'}
                    </button>
                    {/* Cart: shows qty if in cart, increments on click */}
                    <button
                      type="button"
                      className={`btn-icon-square ${cartQty > 0 ? 'btn-icon-square-active' : ''}`}
                      onClick={() => onCartAdd(item)}
                      title={cartQty > 0 ? `In cart (${cartQty}) — click to add more` : 'Add to cart'}
                    >
                      {cartQty > 0 ? (
                        <span style={{ fontSize: '0.68rem', fontWeight: 700 }}>{cartQty}</span>
                      ) : (
                        <CartIcon />
                      )}
                    </button>
                    <button
                      type="button"
                      className={`btn-icon-square ${item.inWishlist ? 'btn-icon-square-wish' : ''}`}
                      onClick={() => onWishlistToggle(item.id)}
                      title={item.inWishlist ? 'Remove from saved' : 'Save item'}
                    >
                      <HeartIcon filled={item.inWishlist} />
                    </button>
                    <button
                      type="button"
                      className="btn-icon-square wcard-del-btn"
                      onClick={() => onDelete(item.id)}
                      title="Remove from wardrobe"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* ── SAVED LOOKS TAB ───────────────────────────────────────────── */}
      {tab === 'savedLooks' && (
        Object.keys(outfitsByDate).length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <path d="M3 9h18M9 21V9"/>
              </svg>
            </div>
            <p className="empty-state-title">No saved looks yet</p>
            <p className="empty-state-sub">Try on items and click "Save look" in the fitting room strip.</p>
          </div>
        ) : (
          <div className="saved-looks-wrap">
            {Object.entries(outfitsByDate).map(([date, looks]) => (
              <div key={date} className="saved-looks-group">
                <p className="saved-looks-date">{date}</p>
                <div className="saved-looks-strip">
                  {looks.map(outfit => (
                    <div key={outfit.id} className="saved-look-thumb">
                      <img
                        src={outfit.url}
                        alt={outfit.label}
                        onClick={() => onLoadOutfit(outfit)}
                        title={`Load ${outfit.label}`}
                      />
                      {outfit.garments?.length > 0 && (
                        <p className="saved-look-garments">{outfit.garments.join(', ')}</p>
                      )}
                      <div className="saved-look-actions">
                        <span className="saved-look-label">{outfit.label}</span>
                        <button
                          type="button"
                          className="btn-icon btn-icon-del"
                          onClick={() => onDeleteOutfit(outfit.id)}
                          title="Delete look"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
