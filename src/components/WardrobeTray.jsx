const HeartIcon = ({ filled }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);
const CartIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

export default function WardrobeTray({ items, selectedItems, onTryOn, onCartToggle, onWishlistToggle, onDelete }) {
  if (items.length === 0) {
    return <p className="panel-hint">Your wardrobe is empty. Upload clothing items to build your personal style.</p>;
  }

  return (
    <div className="wardrobe-grid">
      {items.map(item => {
        const isOn = selectedItems?.some(s => s.id === item.id);
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
              <button
                type="button"
                className={`btn-outline wcard-cart ${item.inCart ? 'btn-active' : ''}`}
                onClick={() => onCartToggle(item.id)}
              >
                <CartIcon /> {item.inCart ? 'In cart' : 'Cart'}
              </button>
              <button
                type="button"
                className={`btn-icon ${item.inWishlist ? 'btn-icon-wish' : ''}`}
                onClick={() => onWishlistToggle(item.id)}
                aria-label="Wishlist"
              >
                <HeartIcon filled={item.inWishlist} />
              </button>
              <button
                type="button"
                className="btn-icon btn-icon-del"
                onClick={() => onDelete(item.id)}
                aria-label="Delete"
              >
                <TrashIcon />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
