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
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

export default function StoreBrowser({
  store, items, activeTileFilter,
  onTryOn, onAddToWardrobe, onDirectCartAdd, directCart,
  selectedItems, onClose
}) {
  const activeFilters = activeTileFilter
    ? SECTIONS.filter(s => activeTileFilter[s.key])
    : SECTIONS;

  const sections = activeFilters
    .map(s => ({ ...s, items: items.filter(i => i[s.key]) }))
    .filter(s => s.items.length > 0);

  const handleTryOn = (item) => {
    onTryOn(item);
    onAddToWardrobe(item); // dress avatar + add to wardrobe simultaneously
  };

  return (
    <div className="store-browser">
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
        <p className="sb-sub">Try on items to layer onto your avatar. <em>Try on</em> also saves to your wardrobe.</p>
      </div>

      {/* Filtered sections — each a horizontal carousel */}
      {sections.map(section => (
        <div key={section.key} className="sb-section">
          <div className="sb-section-header">
            <span className={`sb-section-badge ${section.color}`}>{section.badge}</span>
            <h3 className="sb-section-title">{section.label}</h3>
            <span className="sb-count">{section.items.length}</span>
          </div>
          <div className="sb-carousel">
            {section.items.map(item => (
              <BrowserCard
                key={item.id}
                item={item}
                isOn={selectedItems.some(s => s.id === item.id)}
                inCart={directCart.some(c => c.id === item.id)}
                onTryOn={() => handleTryOn(item)}
                onCart={() => onDirectCartAdd(item)}
              />
            ))}
          </div>
        </div>
      ))}

      {/* All items grid */}
      <div className="sb-section">
        <div className="sb-section-header">
          <h3 className="sb-section-title">All items</h3>
          <span className="sb-count">{items.length}</span>
        </div>
        <div className="sb-grid">
          {items.map(item => (
            <BrowserCard
              key={item.id}
              item={item}
              isOn={selectedItems.some(s => s.id === item.id)}
              inCart={directCart.some(c => c.id === item.id)}
              onTryOn={() => handleTryOn(item)}
              onCart={() => onDirectCartAdd(item)}
              grid
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function BrowserCard({ item, isOn, inCart, onTryOn, onCart, grid }) {
  return (
    <div className={`sb-card ${grid ? 'sb-card-grid' : ''} ${isOn ? 'sb-card-on' : ''}`}>
      <div className="sb-card-img">
        <img src={item.productImageUrl} alt={item.title} />
      </div>
      <div className="sb-card-info">
        <span className="sb-card-name">{item.title}</span>
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
        <button
          type="button"
          className={`btn-icon-square ${inCart ? 'btn-icon-square-active' : ''}`}
          onClick={onCart}
          title={inCart ? 'Remove from cart' : 'Add to cart'}
          aria-label="Cart"
        >
          <CartIcon />
        </button>
      </div>
    </div>
  );
}
