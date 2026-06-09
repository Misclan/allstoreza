const XIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const MinusIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const PlusIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const ExternalIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
    <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
  </svg>
);

export default function CartPanel({ directCart, onQtyChange, stores, onClose, onCheckout }) {
  // Group items by store
  const storeGroups = [];
  const seenSlugs = {};
  directCart.forEach(cartItem => {
    if (!seenSlugs[cartItem.storeSlug]) {
      const storeData = stores.find(s => s.id === cartItem.storeSlug);
      seenSlugs[cartItem.storeSlug] = storeGroups.length;
      storeGroups.push({
        storeSlug: cartItem.storeSlug,
        storeName: cartItem.storeName,
        storeUrl: storeData?.storeUrl || cartItem.affiliateCheckoutUrl || '#',
        items: [cartItem],
      });
    } else {
      storeGroups[seenSlugs[cartItem.storeSlug]].items.push(cartItem);
    }
  });

  const grandTotal = directCart.reduce((s, i) => s + i.priceZAR * i.qty, 0);
  const totalQty   = directCart.reduce((s, i) => s + i.qty, 0);

  return (
    <>
      <div className="cart-backdrop" onClick={onClose} />
      <div className="cart-panel">
        {/* Header */}
        <div className="cart-panel-header">
          <div>
            <p className="eyebrow">Your selection</p>
            <h2 className="cart-panel-title">
              Cart {totalQty > 0 && <span className="cart-panel-count">{totalQty}</span>}
            </h2>
          </div>
          <button type="button" className="btn-icon" onClick={onClose} aria-label="Close cart">
            <XIcon />
          </button>
        </div>

        {/* Body */}
        <div className="cart-panel-body">
          {directCart.length === 0 ? (
            <div className="empty-state" style={{ flex: 1, justifyContent: 'center' }}>
              <div className="empty-state-icon">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
              </div>
              <p className="empty-state-title">Cart is empty</p>
              <p className="empty-state-sub">Add items from the catalog or your wardrobe.</p>
            </div>
          ) : (
            storeGroups.map(group => {
              const groupTotal = group.items.reduce((s, i) => s + i.priceZAR * i.qty, 0);
              return (
                <div key={group.storeSlug} className="cart-store-group">
                  <div className="cart-store-header">
                    <span className="cart-store-name">{group.storeName}</span>
                    <span className="cart-store-total">R{groupTotal.toFixed(2)}</span>
                  </div>

                  {group.items.map(cartItem => (
                    <div key={cartItem.id} className="cart-item-row">
                      <div className="cart-item-img">
                        <img src={cartItem.productImageUrl} alt={cartItem.title} />
                      </div>
                      <div className="cart-item-info">
                        <span className="cart-item-name">{cartItem.title}</span>
                        <span className="cart-item-unit">R{cartItem.priceZAR.toFixed(2)} each</span>
                        <span className="cart-item-subtotal">R{(cartItem.priceZAR * cartItem.qty).toFixed(2)}</span>
                      </div>
                      <div className="cart-qty-ctrl">
                        <button
                          type="button" className="cart-qty-btn"
                          onClick={() => onQtyChange(cartItem.id, -1)}
                          aria-label="Remove one"
                        ><MinusIcon /></button>
                        <span className="cart-qty-num">{cartItem.qty}</span>
                        <button
                          type="button" className="cart-qty-btn"
                          onClick={() => onQtyChange(cartItem.id, 1)}
                          aria-label="Add one"
                        ><PlusIcon /></button>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    className="cart-pay-btn"
                    onClick={() => onCheckout(group)}
                  >
                    Pay at {group.storeName} <ExternalIcon />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {directCart.length > 0 && (
          <div className="cart-panel-footer">
            <div className="cart-grand-total">
              <span>Grand total</span>
              <span className="cart-grand-amount">R{grandTotal.toFixed(2)}</span>
            </div>
            <p className="cart-footer-hint">Pay per store. Click each store's pay button above.</p>
          </div>
        )}
      </div>
    </>
  );
}
