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
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
);

const SlidersIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/>
    <line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/>
    <line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/>
    <line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/>
    <line x1="17" y1="16" x2="23" y2="16"/>
  </svg>
);

export default function Workspace({
  activeCanvasUrl, defaultAvatarUrl,
  onUpload, onReset, onSaveOutfit, onDeleteOutfit, onLoadOutfit, savedOutfits,
  onTryOn, onRemoveSelected, selectedItems,
  isLoading, loadingStage,
  retailCatalog, wardrobe,
  onCartToggle, onWishlistToggle, onDeleteWardrobe,
  onAddToWardrobe, onDirectCartAdd, directCart,
  activeTotal, stores, onToggleStore,
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
          <span className="brand-name">AllstoreZ<span className="brand-accent">A</span></span>
        </div>
        <div className="topnav-right">
          <span className="topnav-total">
            Total <strong>R{activeTotal.toFixed(2)}</strong>
          </span>
          <span className="topnav-badge">Guest</span>
        </div>
      </header>

      <div className={`workspace-grid ${storeOpen ? 'store-open' : ''}`}>

        {/* ── FITTING ROOM ────────────────────────────────────────────── */}
        <section className="canvas-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Live Fitting Room</p>
              <h2 className="panel-title">Try-on studio</h2>
            </div>
          </div>

          {/* Canvas */}
          <div className="canvas-preview">
            <img src={activeCanvasUrl} alt="Avatar" />
            {isLoading && <CanvasLoader stageText={loadingStage} />}
            {/* Camera icon — top right corner of canvas */}
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

          {/* Outfit chips */}
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

          {/* Avatar strip */}
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

          <p className="panel-hint">Select items from the catalog or your wardrobe to try on.</p>
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
              directCart={directCart}
              selectedItems={selectedItems}
              onClose={onCloseStore}
            />
          ) : (
            <>
              <div className="panel-header">
                <div>
                  <p className="eyebrow">Retail catalog</p>
                  <h2 className="panel-title">Curated collections</h2>
                </div>
                {/* Manage stores — aligned with heading */}
                <button type="button" className="btn-outline manage-stores-btn" onClick={() => {
                  // trigger via StoreGrid's internal state — pass down a prop
                }}>
                  <SlidersIcon /> Manage stores
                </button>
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
        <div className="panel-header">
          <div>
            <p className="eyebrow">My wardrobe</p>
            <h2 className="panel-title">Your personal styles</h2>
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
