import { useMemo, useState, useCallback } from 'react';
import Workspace from './components/Workspace.jsx';
import retailCatalog from './data/catalog.js';
import wardrobeItemsData from './data/wardrobe.js';
import userProfile from './data/user.js';
import storesData from './data/stores.js';

const DEFAULT_AVATAR = userProfile.avatarCanvasUrl;

// CSS garment overlay positions by layerType (% of canvas container)
const GARMENT_OVERLAYS = {
  inner_body:  { top: '24%', left: '18%', width: '64%',  opacity: 0.88 },
  outer_body:  { top: '18%', left: '13%', width: '74%',  opacity: 0.88 },
  lower_body:  { top: '52%', left: '22%', width: '56%',  opacity: 0.88 },
  full_body:   { top: '17%', left: '14%', width: '72%',  opacity: 0.85 },
  hat:         { top: '1%',  left: '34%', width: '32%',  opacity: 0.90 },
  footwear:    { top: '77%', left: '20%', width: '60%',  opacity: 0.88 },
  handbag:     { top: '44%', left: '58%', width: '32%',  opacity: 0.88 },
  accessory:   { top: '20%', left: '60%', width: '25%',  opacity: 0.88 },
};

export default function App() {
  const [user] = useState(userProfile);
  const [activeCanvasUrl, setActiveCanvasUrl]   = useState(DEFAULT_AVATAR);
  const [selectedItems, setSelectedItems]       = useState([]);
  const [savedOutfits, setSavedOutfits]         = useState([]);
  const [isLoading, setIsLoading]               = useState(false);
  const [loadingStage, setLoadingStage]         = useState('Ready');
  const [stores, setStores]                     = useState(storesData);
  const [activeStoreId, setActiveStoreId]       = useState(null);
  const [activeTileFilter, setActiveTileFilter] = useState(null);
  const [directCart, setDirectCart]             = useState([]); // [{...item, qty}]
  const [directWishlist, setDirectWishlist]     = useState([]);
  const [cartOpen, setCartOpen]                 = useState(false);
  const [payStore, setPayStore]                 = useState(null); // storeGroup for pay mock

  const [wardrobe, setWardrobe] = useState(() =>
    wardrobeItemsData
      .filter(i => i.userId === user._id)
      .map(i => ({ ...i, inWishlist: false }))
  );

  // ── Try-on (with fallback overlay) ──────────────────────────────────────
  const handleTryOn = useCallback(async (item) => {
    // Toggle off
    if (selectedItems.some(x => x.id === item.id)) {
      setSelectedItems(cur => cur.filter(x => x.id !== item.id));
      return;
    }
    setIsLoading(true);
    setLoadingStage('Compositing...');
    try {
      const endpoint = import.meta.env.VITE_TRYON_LAMBDA_URL;
      if (endpoint) {
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
        if (data.success && data.outputUrl) {
          setActiveCanvasUrl(data.outputUrl);
        }
      }
    } catch (err) {
      console.warn('VTO Lambda unavailable — using overlay fallback:', err.message);
    } finally {
      // Always show item regardless of VTO result
      setSelectedItems(cur => [...cur, item]);
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

  const handleSaveOutfit = useCallback(() => {
    if (activeCanvasUrl === DEFAULT_AVATAR && selectedItems.length === 0) return;
    const savedDate = new Date().toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' });
    setSavedOutfits(prev => {
      if (prev.length >= 10) return prev;
      return [...prev, {
        id: Date.now(),
        url: activeCanvasUrl,
        label: `Look ${prev.length + 1}`,
        savedDate,
        garments: selectedItems.map(i => i.title),
      }];
    });
    setActiveCanvasUrl(DEFAULT_AVATAR);
    setSelectedItems([]);
  }, [activeCanvasUrl, selectedItems]);

  const handleDeleteOutfit = useCallback((id) => setSavedOutfits(prev => prev.filter(o => o.id !== id)), []);
  const handleLoadOutfit   = useCallback((outfit) => setActiveCanvasUrl(outfit.url), []);

  // ── Stores ───────────────────────────────────────────────────────────────
  const handleToggleStore = useCallback((id) => setStores(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s)), []);
  const handleOpenStore   = useCallback((storeId, filter) => { setActiveStoreId(storeId); setActiveTileFilter(filter || null); }, []);
  const handleCloseStore  = useCallback(() => { setActiveStoreId(null); setActiveTileFilter(null); }, []);

  // ── Wardrobe ─────────────────────────────────────────────────────────────
  const handleWishlistToggle = useCallback((id) => setWardrobe(prev => prev.map(i => i.id === id ? { ...i, inWishlist: !i.inWishlist } : i)), []);
  const handleDeleteWardrobe = useCallback((id) => {
    setWardrobe(prev => prev.filter(i => i.id !== id));
    setSelectedItems(prev => prev.filter(x => x.id !== id));
  }, []);

  const handleAddToWardrobe = useCallback((item) => {
    setWardrobe(prev => {
      if (prev.some(i => i.id === item.id)) return prev;
      return [...prev, { ...item, processedImageUrl: item.productImageUrl, inWishlist: false }];
    });
  }, []);

  // ── Cart (quantity-based) ────────────────────────────────────────────────
  const handleDirectCartAdd = useCallback((item) => {
    setDirectCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...item, qty: 1 }];
    });
  }, []);

  const handleCartQtyChange = useCallback((itemId, delta) => {
    setDirectCart(prev =>
      prev.map(i => i.id === itemId ? { ...i, qty: Math.max(0, i.qty + delta) } : i)
         .filter(i => i.qty > 0)
    );
  }, []);

  // ── Wishlist ─────────────────────────────────────────────────────────────
  const handleDirectWishlistAdd = useCallback((item) => {
    setDirectWishlist(prev => prev.some(i => i.id === item.id)
      ? prev.filter(i => i.id !== item.id)
      : [...prev, item]
    );
  }, []);

  // ── Cart checkout (pay mock) ─────────────────────────────────────────────
  const handleCheckout = useCallback((storeGroup) => {
    setCartOpen(false);
    setPayStore(storeGroup);
  }, []);

  const handlePayComplete = useCallback(() => {
    if (payStore) {
      setDirectCart(prev => prev.filter(i => i.storeSlug !== payStore.storeSlug));
    }
    setPayStore(null);
  }, [payStore]);

  // ── Derived ──────────────────────────────────────────────────────────────
  const activeStoreItems = useMemo(() =>
    activeStoreId ? retailCatalog.filter(i => i.storeSlug === activeStoreId) : [],
    [activeStoreId]
  );

  const visibleCatalog = useMemo(() => {
    const ids = new Set(stores.filter(s => s.active).map(s => s.id));
    return retailCatalog.filter(i => ids.has(i.storeSlug));
  }, [stores]);

  const cartCount = useMemo(() =>
    directCart.reduce((s, i) => s + i.qty, 0),
    [directCart]
  );

  const wishlistCount = useMemo(() =>
    wardrobe.filter(i => i.inWishlist).length + directWishlist.length,
    [wardrobe, directWishlist]
  );

  return (
    <div className="app-shell">
      <Workspace
        activeCanvasUrl={activeCanvasUrl}
        defaultAvatarUrl={DEFAULT_AVATAR}
        garmentOverlays={GARMENT_OVERLAYS}
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
        onWishlistToggle={handleWishlistToggle}
        onDeleteWardrobe={handleDeleteWardrobe}
        onAddToWardrobe={handleAddToWardrobe}
        onDirectCartAdd={handleDirectCartAdd}
        onCartQtyChange={handleCartQtyChange}
        onDirectWishlistAdd={handleDirectWishlistAdd}
        directCart={directCart}
        directWishlist={directWishlist}
        cartCount={cartCount}
        wishlistCount={wishlistCount}
        cartOpen={cartOpen}
        onCartOpen={() => setCartOpen(true)}
        onCartClose={() => setCartOpen(false)}
        payStore={payStore}
        onCheckout={handleCheckout}
        onPayComplete={handlePayComplete}
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
