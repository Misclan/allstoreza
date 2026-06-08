import { useRef } from 'react';
import CanvasLoader from './CanvasLoader.jsx';
import WardrobeTray from './WardrobeTray.jsx';
import StoreGrid from './StoreGrid.jsx';
import StoreBrowser from './StoreBrowser.jsx';
import FilmStrip from './FilmStrip.jsx';

export default function Workspace({
  user,
  activeCanvasUrl,
  defaultAvatarUrl,
  onUpload,
  onReset,
  onSaveOutfit,
  onLoadOutfit,
  savedOutfits,
  onTryOn,
  onRemoveSelected,
  selectedItems,
  isLoading,
  loadingStage,
  uploadError,
  retailCatalog,
  wardrobeItems,
  activeTotal,
  stores,
  onToggleStore,
  activeStoreId,
  onOpenStore,
  onCloseStore,
  activeStoreItems,
}) {
  const fileRef = useRef();
  const isDefaultAvatar = activeCanvasUrl === defaultAvatarUrl;
  const activeStore = stores.find((s) => s.id === activeStoreId);
  const storeOpen = !!activeStoreId;

  return (
    <div className="workspace-root">
      {/* TOP NAV */}
      <header className="topnav">
        <div className="topnav-brand">
          <span className="brand-dot" />
          <span className="brand-name">AllstoreZ<span className="brand-accent">A</span></span>
        </div>
        <div className="topnav-right">
          <span className="keyword">Guest mode</span>
          {selectedItems.length > 0 && (
            <span className="keyword total-badge">
              Outfit total: <strong>R{activeTotal.toFixed(2)}</strong>
            </span>
          )}
        </div>
      </header>

      <div className={`workspace-grid ${storeOpen ? 'store-open' : ''}`}>
        {/* ===== LEFT: FITTING ROOM ===== */}
        <section className={`canvas-panel ${storeOpen ? 'canvas-panel-slim' : ''}`}>
          <div className="canvas-toolbar">
            <div>
              <p className="eyebrow">Live Fitting Room</p>
              <h2 className="section-heading">Try-on studio</h2>
            </div>
            {!isDefaultAvatar && (
              <button type="button" className="button" onClick={onReset} title="Reset to default avatar">
                ↺ Reset
              </button>
            )}
          </div>

          <div className="canvas-preview">
            <img src={activeCanvasUrl} alt="Active avatar canvas" />
            {isLoading && <CanvasLoader stageText={loadingStage} />}
          </div>

          {/* Selected outfit chips */}
          {selectedItems.length > 0 && (
            <div className="outfit-chips">
              {selectedItems.map((item) => (
                <span key={item.id} className="outfit-chip">
                  {item.title}
                  <button
                    type="button"
                    className="chip-remove"
                    onClick={() => onRemoveSelected(item.id)}
                    aria-label={`Remove ${item.title}`}
                  >×</button>
                </span>
              ))}
            </div>
          )}

          {/* Filmstrip of saved outfits */}
          <FilmStrip outfits={savedOutfits} onLoad={onLoadOutfit} />

          {/* Upload bar */}
          <div className="upload-bar">
            <button className="button" type="button" onClick={() => fileRef.current?.click()}>
              📷 Upload photo
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => onUpload(e.target.files?.[0])}
            />
            {!isDefaultAvatar && (
              <button className="button" type="button" onClick={onSaveOutfit} title="Save current outfit to filmstrip">
                🎞 Save fit
              </button>
            )}
          </div>

          {uploadError && <p className="alert-text">{uploadError}</p>}
          <p className="footer-note">Select an outfit from the catalog or your wardrobe to update the canvas.</p>
        </section>

        {/* ===== RIGHT / MAIN: STORE BROWSER OR CATALOG ===== */}
        <section className="catalog-panel">
          {storeOpen ? (
            <StoreBrowser
              store={activeStore}
              items={activeStoreItems}
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
                <span className="keyword">Total: R{activeTotal.toFixed(2)}</span>
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

      {/* ===== WARDROBE TRAY (always visible at bottom) ===== */}
      <section className="wardrobe-panel">
        <div className="canvas-toolbar">
          <div>
            <p className="eyebrow">My wardrobe</p>
            <h2 className="section-heading">Uploaded closet</h2>
          </div>
          <span className="keyword">Personal style</span>
        </div>
        <WardrobeTray
          items={wardrobeItems}
          onSelect={onTryOn}
          selectedItems={selectedItems}
        />
      </section>
    </div>
  );
}
