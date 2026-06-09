import { useRef, useState } from 'react';
import CanvasLoader from './CanvasLoader.jsx';
import WardrobeTray from './WardrobeTray.jsx';
import StoreGrid from './StoreGrid.jsx';
import StoreBrowser from './StoreBrowser.jsx';
import AvatarStrip from './AvatarStrip.jsx';

const DotsIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/>
  </svg>
);
const CameraIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
);
const CartIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
  </svg>
);
const HeartIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

export default function Workspace({
  activeCanvasUrl, defaultAvatarUrl,
  onUpload, onReset, onSaveOutfit, onDeleteOutfit, onLoadOutfit, savedOutfits,
  onTryOn, onRemoveSelected, selectedItems,
  isLoading, loadingStage,
  retailCatalog, wardrobe,
  onCartToggle, onWishlistToggle, onDeleteWardrobe,
  onAddToWardrobe, onDirectCartAdd, onDirectWishlistAdd,
  directCart, directWishlist,
  cartCount, wishlistCount,
  stores, onToggleStore,
  activeStoreId, activeTileFilter, onOpenStore, onCloseStore, activeStoreItems,
}) {
  const [activeChipId, setActiveChipId] = useState(null);
  const fileInputRef = useRef();
  const storeOpen    = !!activeStoreId;
  const activeStore  = stores.find(s => s.id === activeStoreId);

  return (
    <div className="workspace-root" onClick={() => setActiveChipId(null)}>

      {/* ── TOPNAV ──────────────────────────────────────────────────────── */}
      <header className="topnav">
        <div className="topnav-brand">
          <span className="brand-name">Allstore<span className="brand-accent">ZA</span></span>
        </div>
        <div className="topnav-right">
          <button className="topnav-action" title="Wishlist">
            <HeartIcon />
            Saved
            {wishlistCount > 0 && <span className="topnav-count topnav-count-wish">{wishlistCount}</span>}
          </button>
          <button className="topnav-action" title="Cart">
            <CartIcon />
            Cart
            {cartCount > 0 && <span className="topnav-count">{cartCount}</span>}
          </button>
          <div className="topnav-divider" />
          <span className="topnav-badge">Guest</span>
        </div>
      </header>

      <div className={`workspace-grid ${storeOpen ? 'store-open' : ''}`}>

        {/* ── FITTING ROOM ────────────────────────────────────────────── */}
        <section className="canvas-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Fitting Room</p>
              <h2 className="panel-title">Try-on studio</h2>
            </div>
          </div>

          <div className="canvas-preview">
            <img src={activeCanvasUrl} alt="Avatar" />
            {isLoading && <CanvasLoader stageText={loadingStage} />}
            <button
              type="button"
              className="canvas-camera-btn"
              onClick={() => fileInputRef.current?.click()}
              title="Upload your photo"
              aria-label="Upload photo"
            >
              <CameraIcon />
            </button>
          </div>

          {selectedItems.length > 0 && (
            <div className="outfit-chips" onClick={e => e.stopPropagation()}>
              {selectedItems.map(item => (
                <div key={item.id} className="chip-wrap">
                  <button
                    type="button"
                    className={`chip ${activeChipId === item.id ? 'chip-open' : ''}`}
                    onClick={() => setActiveChipId(p => p === item.id ? null : item.id)}
                  >
                    {item.title} <DotsIcon />
                  </button>
                  {activeChipId === item.id && (
                    <div className="chip-menu">
                      <button className="chip-menu-item chip-remove" onClick={() => { onRemoveSelected(item.id); setActiveChipId(null); }}>
                        Remove
                      </button>
                      <button className="chip-menu-item" onClick={() => { onOpenStore(item.storeSlug, null); setActiveChipId(null); }}>
                        Browse {item.storeName}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <AvatarStrip
            defaultAvatarUrl={defaultAvatarUrl}
            activeCanvasUrl={activeCanvasUrl}
            savedOutfits={savedOutfits}
            onLoad={onLoadOutfit}
            onDelete={onDeleteOutfit}
            onUpload={onUpload}
            onReset={onReset}
            onSaveOutfit={onSaveOutfit}
            fileInputRef={fileInputRef}
          />

          <p className="panel-hint">Select items from the catalog to try on your avatar.</p>
        </section>

        {/* ── CATALOG / STORE BROWSER ──────────────────────────────────── */}
        <section className="catalog-panel">
          {storeOpen ? (
            <StoreBrowser
              store={activeStore}
              items={activeStoreItems}
              activeTileFilter={activeTileFilter}
              onTryOn={onTryOn}
              onAddToWardrobe={onAddToWardrobe}
              onDirectCartAdd={onDirectCartAdd}
              onDirectWishlistAdd={onDirectWishlistAdd}
              directCart={directCart}
              directWishlist={directWishlist}
              selectedItems={selectedItems}
              onClose={onCloseStore}
            />
          ) : (
            <>
              <div className="panel-header" style={{ marginBottom: '1rem' }}>
                <div>
                  <p className="eyebrow">Retail catalog</p>
                  <h2 className="panel-title">Curated collections</h2>
                </div>
              </div>
              <StoreGrid
                items={retailCatalog}
                stores={stores}
                onItemClick={onTryOn}
                onToggleStore={onToggleStore}
                onOpenStore={onOpenStore}
                selectedItems={selectedItems}
              />
            </>
          )}
        </section>
      </div>

      {/* ── WARDROBE ─────────────────────────────────────────────────────── */}
      <section className="wardrobe-panel">
        <div className="panel-header" style={{ marginBottom: '1rem' }}>
          <div>
            <p className="eyebrow">My wardrobe</p>
            <h2 className="panel-title">Your saved pieces</h2>
          </div>
        </div>
        <WardrobeTray
          items={wardrobe}
          selectedItems={selectedItems}
          onTryOn={onTryOn}
          onCartToggle={onCartToggle}
          onWishlistToggle={onWishlistToggle}
          onDelete={onDeleteWardrobe}
        />
      </section>
    </div>
  );
}
