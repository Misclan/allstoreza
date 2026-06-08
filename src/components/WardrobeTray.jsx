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

export default function WardrobeTray({ items, selectedItems, onTryOn, onCartToggle, onWishlistToggle, onDelete }) {
  if (items.length === 0) {
    return <p className="footer-note">Your wardrobe is empty. Upload clothing photos to build your closet.</p>;
  }

  return (
    <div className="wardrobe-grid">
      {items.map(item => {
        const isApplied = selectedItems?.some(s => s.id === item.id);
        return (
          <div
            key={item.id}
            className={`wardrobe-card ${isApplied ? 'wardrobe-card-active' : ''} ${item.inWishlist ? 'wardrobe-card-wishlist' : ''}`}
          >
            {/* Wishlist flag */}
            {item.inWishlist && <span className="wishlist-flag">♥ Saved</span>}

            {/* Garment image */}
            <div className="wardrobe-img-wrap">
              <img src={item.processedImageUrl} alt={item.title} />
            </div>

            {/* Info */}
            <div className="wardrobe-info">
              <span className="wardrobe-title">{item.title}</span>
              <span className="wardrobe-meta">{item.layerType.replace(/_/g, ' ')}</span>
              <span className="wardrobe-price">R{item.priceZAR?.toFixed(2) ?? '—'}</span>
            </div>

            {/* Actions */}
            <div className="wardrobe-actions">
              <button
                type="button"
                className={`button wardrobe-btn-apply ${isApplied ? 'button-active' : ''}`}
                onClick={() => onTryOn(item)}
                title="Try on this item"
              >
                {isApplied ? '✓ On' : 'Try on'}
              </button>
              <button
                type="button"
                className={`button wardrobe-btn-cart ${item.inCart ? 'button-active' : ''}`}
                onClick={() => onCartToggle(item.id)}
                title={item.inCart ? 'Remove from cart' : 'Add to cart'}
              >
                <CartIcon />
                {item.inCart ? 'In cart' : 'Add'}
              </button>
              <button
                type="button"
                className={`wardrobe-btn-wish icon-btn ${item.inWishlist ? 'wish-active' : ''}`}
                onClick={() => onWishlistToggle(item.id)}
                title={item.inWishlist ? 'Remove from wishlist' : 'Save to wishlist'}
                aria-pressed={item.inWishlist}
              >
                <HeartIcon filled={item.inWishlist} />
              </button>
              <button
                type="button"
                className="wardrobe-btn-delete icon-btn"
                onClick={() => onDelete(item.id)}
                title="Remove from wardrobe"
                aria-label={`Remove ${item.title} from wardrobe`}
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
