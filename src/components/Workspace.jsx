import { useState } from 'react';
import CanvasLoader from './CanvasLoader.jsx';
import WardrobeTray from './WardrobeTray.jsx';
import StoreGrid from './StoreGrid.jsx';
import StoreBrowser from './StoreBrowser.jsx';
import AvatarStrip from './AvatarStrip.jsx';

// Inline SVG icons
const ChipMenuIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>
  </svg>
);

export default function Workspace({
  activeCanvasUrl, defaultAvatarUrl,
  onUpload, onReset, onSaveOutfit, onDeleteOutfit, onLoadOutfit, savedOutfits,
  onTryOn, onRemoveSelected, selectedItems,
  isLoading, loadingStage,
  retailCatalog, wardrobe,
  onCartToggle, onWishlistToggle, onDeleteWardrobe,
  activeTotal, stores, onToggleStore,
  activeStoreId, activeTileFilter, onOpenStore, onCloseStore, activeStoreItems,
}) {
  const [activeChipId, setActiveChipId] = useState(null);
  const storeOpen = !!activeStoreId;
  const activeStore = stores.find(s => s.id === activeStoreId);

  const handleChipClick = (itemId) => {
    setActiveChipId(prev => prev === itemId ? null : itemId);
  };

  return (
    <div className="workspace-root" onClick={() => setActiveChipId(null)}>

      {/* ── TOP NAV ─────────────────────────────────────────────────────── */}
      <header className="topnav">
        <div className="topnav-brand">
          <span className="brand-dot" />
          <span className="brand-name">AllstoreZ<span className="brand-accent">A</span></span>
        </div>
        <div className="topnav-right">
          <span className="topnav-total">
            Outfit total: <strong>R{activeTotal.toFixed(2)}</strong>
          </span>
          <span className="keyword">Guest mode</span>
        </div>
      </header>

      <div className={`workspace-grid ${storeOpen ? 'store-open' : ''}`}>

        {/* ── FITTING ROOM ──────────────────────────────────────────────── */}
        <section className={`canvas-panel ${storeOpen ? 'canvas-panel-slim' : ''}`}>
          <div className="canvas-toolbar">
            <div>
              <p className="eyebrow">Live Fitting Room</p>
              <h2 className="section-heading">Try-on studio</h2>
            </div>
          </div>

          {/* Canvas with camera icon overlay */}
          <div className="canvas-preview-wrap">
            <div className="canvas-preview">
              <img src={activeCanvasUrl} alt="Avatar canvas" />
              {isLoading && <CanvasLoader stageText={loadingStage} />}
            </div>
          </div>

          {/* Selected item chips */}
          {selectedItems.length > 0 && (
            <div className="outfit-chips" onClick={e => e.stopPropagation()}>
              {selectedItems.map(item => (
                <div key={item.id} className="outfit-chip-wrap">
                  <span
                    className={`outfit-chip ${activeChipId === item.id ? 'outfit-chip-open' : ''}`}
                    onClick={() => handleChipClick(item.id)}
                  >
                    {item.title}
                    <ChipMenuIcon />
                  </span>
                  {activeChipId === item.id && (
                    <div className="chip-menu">
                      <button
                        type="button"
                        className="chip-menu-btn chip-menu-remove"
                        onClick={() => { onRemoveSelected(item.id); setActiveChipId(null); }}
                      >
                        Remove
                      </button>
                      <button
                        type="button"
                        className="chip-menu-btn"
                        onClick={() => { onOpenStore(item.storeSlug, null); setActiveChipId(null); }}
                      >
                        Browse {item.storeName}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Avatar strip — replaces upload button + filmstrip */}
          <AvatarStrip
            defaultAvatarUrl={defaultAvatarUrl}
            activeCanvasUrl={activeCanvasUrl}
            savedOutfits={savedOutfits}
            onLoad={onLoadOutfit}
            onDelete={onDeleteOutfit}
            onUpload={onUpload}
            onReset={onReset}
            onSaveOutfit={onSaveOutfit}
          />

          <p className="footer-note">Select items from the catalog or your wardrobe to try on.</p>
        </section>

        {/* ── CATALOG / STORE BROWSER ────────────────────────────────────── */}
        <section className="catalog-panel">
          {storeOpen ? (
            <StoreBrowser
              store={activeStore}
              items={activeStoreItems}
              activeTileFilter={activeTileFilter}
              onTryOn={onTryOn}
              selectedItems={selectedItems}
              onClose={onCloseStore}
            />
          ) : (
            <>
              <div className="canvas-toolbar">
                <div>
                  <p className="eyebrow">Retail catalog</p>
                  <h2 className="section-heading">Curated collections</h2>
                </div>
                {/* Manage stores button lives here — total is in topnav */}
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

      {/* ── WARDROBE ────────────────────────────────────────────────────── */}
      <section className="wardrobe-panel">
        <div className="canvas-toolbar">
          <div>
            <p className="eyebrow">My wardrobe</p>
            <h2 className="section-heading">Uploaded closet</h2>
          </div>
          <span className="keyword">Personal style</span>
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
