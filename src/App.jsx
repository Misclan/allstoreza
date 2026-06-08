import { useMemo, useState, useCallback } from 'react';
import Workspace from './components/Workspace.jsx';
import retailCatalog from './data/catalog.js';
import wardrobeItemsData from './data/wardrobe.js';
import userProfile from './data/user.js';
import storesData from './data/stores.js';

const DEFAULT_AVATAR = userProfile.avatarCanvasUrl;

export default function App() {
  const [user] = useState(userProfile);
  const [activeCanvasUrl, setActiveCanvasUrl] = useState(DEFAULT_AVATAR);
  const [selectedItems, setSelectedItems]     = useState([]);
  const [savedOutfits, setSavedOutfits]       = useState([]);
  const [isLoading, setIsLoading]             = useState(false);
  const [loadingStage, setLoadingStage]       = useState('Ready');
  const [stores, setStores]                   = useState(storesData);
  const [activeStoreId, setActiveStoreId]     = useState(null);
  const [activeTileFilter, setActiveTileFilter] = useState(null);
  const [directCart, setDirectCart]           = useState([]); // items added straight to cart from browser

  const [wardrobe, setWardrobe] = useState(() =>
    wardrobeItemsData
      .filter(i => i.userId === user._id)
      .map(i => ({ ...i, inCart: false, inWishlist: false }))
  );

  // ── Try-on ──────────────────────────────────────────────────────────────
  const handleTryOn = useCallback(async (item) => {
    // Toggle off if already applied
    if (selectedItems.some(x => x.id === item.id)) {
      setSelectedItems(cur => cur.filter(x => x.id !== item.id));
      return;
    }
    setIsLoading(true);
    setLoadingStage('Compositing...');
    try {
      const endpoint = import.meta.env.VITE_TRYON_LAMBDA_URL || '/api/tryon';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userImageUrl: activeCanvasUrl,
          garmentImageUrl: item.productImageUrl || item.processedImageUrl,
          category: item.layerType,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActiveCanvasUrl(data.outputUrl || activeCanvasUrl);
        setSelectedItems(cur => [...cur, item]);
      }
    } catch (err) {
      console.error('Try-on error:', err);
    } finally {
      setLoadingStage('Ready');
      setIsLoading(false);
    }
  }, [activeCanvasUrl, selectedItems]);

  const handleRemoveSelected = useCallback((itemId) => {
    setSelectedItems(cur => cur.filter(x => x.id !== itemId));
  }, []);

  // ── Avatar / upload ──────────────────────────────────────────────────────
  const handleUpload = useCallback((file) => {
    if (!file) return;
    setActiveCanvasUrl(URL.createObjectURL(file));
    setSelectedItems([]);
  }, []);

  const handleReset = useCallback(() => {
    setActiveCanvasUrl(DEFAULT_AVATAR);
    setSelectedItems([]);
  }, []);

  // Save current look to strip, then reset avatar for next pairing
  const handleSaveOutfit = useCallback(() => {
    if (activeCanvasUrl === DEFAULT_AVATAR) return;
    setSavedOutfits(prev => {
      if (prev.length >= 5) return prev;
      return [...prev, { id: Date.now(), url: activeCanvasUrl, label: `Look ${prev.length + 1}` }];
    });
    setActiveCanvasUrl(DEFAULT_AVATAR);
    setSelectedItems([]);
  }, [activeCanvasUrl]);

  const handleDeleteOutfit  = useCallback((id) => setSavedOutfits(prev => prev.filter(o => o.id !== id)), []);
  const handleLoadOutfit    = useCallback((outfit) => setActiveCanvasUrl(outfit.url), []);

  // ── Stores ───────────────────────────────────────────────────────────────
  const handleToggleStore   = useCallback((id) => setStores(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s)), []);
  const handleOpenStore     = useCallback((storeId, filter) => { setActiveStoreId(storeId); setActiveTileFilter(filter || null); }, []);
  const handleCloseStore    = useCallback(() => { setActiveStoreId(null); setActiveTileFilter(null); }, []);

  // ── Wardrobe ─────────────────────────────────────────────────────────────
  const handleCartToggle    = useCallback((id) => setWardrobe(prev => prev.map(i => i.id === id ? { ...i, inCart: !i.inCart } : i)), []);
  const handleWishlistToggle= useCallback((id) => setWardrobe(prev => prev.map(i => i.id === id ? { ...i, inWishlist: !i.inWishlist } : i)), []);
  const handleDeleteWardrobe= useCallback((id) => { setWardrobe(prev => prev.filter(i => i.id !== id)); setSelectedItems(prev => prev.filter(x => x.id !== id)); }, []);

  // Add catalog item to wardrobe (called from StoreBrowser "Try on")
  const handleAddToWardrobe = useCallback((item) => {
    setWardrobe(prev => {
      if (prev.some(i => i.id === item.id)) return prev;
      return [...prev, { ...item, processedImageUrl: item.productImageUrl, inCart: false, inWishlist: false }];
    });
  }, []);

  // Direct cart from StoreBrowser
  const handleDirectCartAdd = useCallback((item) => {
    setDirectCart(prev => prev.some(i => i.id === item.id) ? prev.filter(i => i.id !== item.id) : [...prev, item]);
  }, []);

  // ── Derived ──────────────────────────────────────────────────────────────
  const activeStoreItems = useMemo(() =>
    activeStoreId ? retailCatalog.filter(i => i.storeSlug === activeStoreId) : [],
    [activeStoreId]
  );

  const visibleCatalog = useMemo(() => {
    const ids = new Set(stores.filter(s => s.active).map(s => s.id));
    return retailCatalog.filter(i => ids.has(i.storeSlug));
  }, [stores]);

  const activeTotal = useMemo(() => [
    ...selectedItems,
    ...wardrobe.filter(i => i.inCart),
    ...directCart,
  ].reduce((s, i) => s + (i.priceZAR || 0), 0), [selectedItems, wardrobe, directCart]);

  return (
    <div className="app-shell">
      <Workspace
        activeCanvasUrl={activeCanvasUrl}
        defaultAvatarUrl={DEFAULT_AVATAR}
        onUpload={handleUpload}
        onReset={handleReset}
        onSaveOutfit={handleSaveOutfit}
        onDeleteOutfit={handleDeleteOutfit}
        onLoadOutfit={handleLoadOutfit}
        savedOutfits={savedOutfits}
        onTryOn={handleTryOn}
        onRemoveSelected={handleRemoveSelected}
        selectedItems={selectedItems}
        isLoading={isLoading}
        loadingStage={loadingStage}
        retailCatalog={visibleCatalog}
        wardrobe={wardrobe}
        onCartToggle={handleCartToggle}
        onWishlistToggle={handleWishlistToggle}
        onDeleteWardrobe={handleDeleteWardrobe}
        onAddToWardrobe={handleAddToWardrobe}
        onDirectCartAdd={handleDirectCartAdd}
        directCart={directCart}
        activeTotal={activeTotal}
        stores={stores}
        onToggleStore={handleToggleStore}
        activeStoreId={activeStoreId}
        activeTileFilter={activeTileFilter}
        onOpenStore={handleOpenStore}
        onCloseStore={handleCloseStore}
        activeStoreItems={activeStoreItems}
      />
    </div>
  );
}
