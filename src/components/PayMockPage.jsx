const BackIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);
const LockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

export default function PayMockPage({ storeGroup, onReturn, onComplete }) {
  const total = storeGroup.items.reduce((s, i) => s + i.priceZAR * i.qty, 0);
  const today = new Date().toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="pay-overlay">
      <div className="pay-page">

        {/* Return bar */}
        <div className="pay-return-bar">
          <button type="button" className="btn-ghost pay-return-btn" onClick={onReturn}>
            <BackIcon /> Back to AllstoreZA
          </button>
          <div className="pay-secure-badge">
            <LockIcon /> Secure checkout
          </div>
        </div>

        {/* Store identity */}
        <div className="pay-store-identity">
          <p className="pay-store-domain">{storeGroup.storeUrl?.replace(/https?:\/\//, '').replace(/\/$/, '') || `${storeGroup.storeSlug}.co.za`}</p>
          <h1 className="pay-store-name">{storeGroup.storeName}</h1>
          <p className="pay-store-tagline">Checkout</p>
        </div>

        <div className="pay-body">
          {/* Order summary */}
          <div className="pay-order-card">
            <h3 className="pay-section-title">Order Summary</h3>
            <div className="pay-item-list">
              {storeGroup.items.map(item => (
                <div key={item.id} className="pay-item-row">
                  <div className="pay-item-img">
                    <img src={item.productImageUrl} alt={item.title} />
                  </div>
                  <div className="pay-item-detail">
                    <span className="pay-item-name">{item.title}</span>
                    <span className="pay-item-meta">Qty {item.qty} × R{item.priceZAR.toFixed(2)}</span>
                  </div>
                  <span className="pay-item-total">R{(item.priceZAR * item.qty).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="pay-order-totals">
              <div className="pay-total-row">
                <span>Subtotal</span>
                <span>R{total.toFixed(2)}</span>
              </div>
              <div className="pay-total-row">
                <span>Shipping</span>
                <span className="pay-free">FREE</span>
              </div>
              <div className="pay-total-row pay-grand">
                <span>Total</span>
                <span>R{total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Mock payment form */}
          <div className="pay-form-card">
            <h3 className="pay-section-title">Payment Details</h3>
            <div className="pay-form-field">
              <label className="pay-label">Card number</label>
              <div className="pay-input pay-input-mock">•••• •••• •••• ••••</div>
            </div>
            <div className="pay-form-row">
              <div className="pay-form-field">
                <label className="pay-label">Expiry</label>
                <div className="pay-input pay-input-mock">MM / YY</div>
              </div>
              <div className="pay-form-field">
                <label className="pay-label">CVV</label>
                <div className="pay-input pay-input-mock">•••</div>
              </div>
            </div>
            <div className="pay-form-field">
              <label className="pay-label">Name on card</label>
              <div className="pay-input pay-input-mock">Full name</div>
            </div>

            <div className="pay-mock-note">
              This is a prototype checkout mockup for AllstoreZA. Real payment integration for {storeGroup.storeName} will be connected in Phase 2.
            </div>

            <button type="button" className="btn-primary pay-complete-btn" onClick={onComplete}>
              Complete Purchase — R{total.toFixed(2)}
            </button>
          </div>
        </div>

        <p className="pay-date-note">Order date: {today}</p>
      </div>
    </div>
  );
}
