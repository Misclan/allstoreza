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
  const [selectedItems, setSelectedItems] = useState([]);   // try-on overlay items
  const [savedOutfits, setSavedOutfits] = useState([]);     // avatar strip saved fits
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState('Ready to try on');
  const [stores, setStores] = useState(storesData);
  const [activeStoreId, setActiveStoreId] = useState(null);
  const [activeTileFilter, setActiveTileFilter] = useState(null);

  // Wardrobe with cart/wishlist state attached
  const [wardrobe, setWardrobe] = useState(() =>
    wardrobeItemsData
      .filter(i => i.userId === user._id)
      .map(i => ({ ...i, inCart: false, inWishlist: false }))
  );

  // ── Try-on ──────────────────────────────────────────────────────────────
  const handleTryOn = useCallback(async (item) => {
    setIsLoading(true);
    setLoadingStage('Analyzing silhouette...');
    const t = setTimeout(() => setLoadingStage('Compositing final outfit...'), 1200);
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
        setSelectedItems(cur => cur.some(x => x.id === item.id) ? cur : [...cur, item]);
      }
    } catch (err) {
      console.error('Try-on failed:', err);
    } finally {
      clearTimeout(t);
      setLoadingStage('Ready to try on');
      setIsLoading(false);
    }
  }, [activeCanvasUrl]);

  const handleRemoveSelected = useCallback((itemId) => {
    setSelectedItems(cur => cur.filter(x => x.id !== itemId));
  }, []);

  // ── Avatar / upload ──────────────────────────────────────────────────────
  const handleUpload = useCallback((file) => {
    if (!file) return;
    setActiveCanvasUrl(URL.createObjectURL(file));
  }, []);

  const handleReset = useCallback(() => {
    setActiveCanvasUrl(DEFAULT_AVATAR);
    setSelectedItems([]);
  }, []);

  const handleSaveOutfit = useCallback(() => {
    if (activeCanvasUrl === DEFAULT_AVATAR) return;
    setSavedOutfits(prev => {
      if (prev.length >= 5) return prev; // max 5 saved (+ default = 6 slots)
      return [...prev, { id: Date.now(), url: activeCanvasUrl, label: `Fit ${prev.length + 1}` }];
    });
  }, [activeCanvasUrl]);

  const handleDeleteOutfit = useCallback((outfitId) => {
    setSavedOutfits(prev => prev.filter(o => o.id !== outfitId));
  }, []);

  const handleLoadOutfit = useCallback((outfit) => {
    setActiveCanvasUrl(outfit.url);
  }, []);

  // ── Stores ───────────────────────────────────────────────────────────────
  const handleToggleStore = useCallback((storeId) => {
    setStores(prev => prev.map(s => s.id === storeId ? { ...s, active: !s.active } : s));
  }, []);

  const handleOpenStore = useCallback((storeId, tileFilter) => {
    setActiveStoreId(storeId);
    setActiveTileFilter(tileFilter || null);
  }, []);

  const handleCloseStore = useCallback(() => {
    setActiveStoreId(null);
    setActiveTileFilter(null);
  }, []);

  // ── Wardrobe ─────────────────────────────────────────────────────────────
  const handleCartToggle = useCallback((itemId) => {
    setWardrobe(prev => prev.map(i => i.id === itemId ? { ...i, inCart: !i.inCart } : i));
  }, []);

  const handleWishlistToggle = useCallback((itemId) => {
    setWardrobe(prev => prev.map(i => i.id === itemId ? { ...i, inWishlist: !i.inWishlist } : i));
  }, []);

  const handleDeleteWardrobe = useCallback((itemId) => {
    setWardrobe(prev => prev.filter(i => i.id !== itemId));
    setSelectedItems(prev => prev.filter(x => x.id !== itemId));
  }, []);

  // ── Derived ──────────────────────────────────────────────────────────────
  const activeStoreItems = useMemo(() =>
    activeStoreId ? retailCatalog.filter(i => i.storeSlug === activeStoreId) : [],
    [activeStoreId]
  );

  const visibleCatalog = useMemo(() => {
    const activeIds = new Set(stores.filter(s => s.active).map(s => s.id));
    return retailCatalog.filter(i => activeIds.has(i.storeSlug));
  }, [stores]);

  // Total = try-on selected + wardrobe cart items
  const activeTotal = useMemo(() => {
    const tryOnTotal = selectedItems.reduce((s, i) => s + i.priceZAR, 0);
    const cartTotal = wardrobe.filter(i => i.inCart).reduce((s, i) => s + i.priceZAR, 0);
    return tryOnTotal + cartTotal;
  }, [selectedItems, wardrobe]);

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
