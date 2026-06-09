import { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import Workspace from './components/Workspace.jsx';
import retailCatalog from './data/catalog.js';
import wardrobeItemsData from './data/wardrobe.js';
import userProfile from './data/user.js';
import storesData from './data/stores.js';

const DEFAULT_AVATAR = userProfile.avatarCanvasUrl;

// ── localStorage persistence ──────────────────────────────────────────────
const STORAGE_PREFIX = 'allstoreza_';

function loadFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage(key, value) {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch {
    // Storage full or unavailable — fail silently
  }
}

/**
 * useState that syncs to localStorage.
 * Reads from storage on mount, writes on every update.
 */
function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => loadFromStorage(key, initialValue));
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Skip writing on initial mount (we just read from storage)
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    saveToStorage(key, value);
  }, [key, value]);

  return [value, setValue];
}

// ── Garment overlay positions (CSS fallback) ──────────────────────────────
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

// ── VTO status constants ──────────────────────────────────────────────────
const VTO_STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  FAILED: 'failed',
  FALLBACK: 'fallback',   // CSS overlay being used because VTO unavailable
  NO_ENDPOINT: 'no_endpoint', // Lambda URL not configured
};

export default function App() {
  const [user] = useState(userProfile);
  const [activeCanvasUrl, setActiveCanvasUrl]   = useState(DEFAULT_AVATAR);
  const [selectedItems, setSelectedItems]       = useState([]);
  const [isLoading, setIsLoading]               = useState(false);
  const [loadingStage, setLoadingStage]         = useState('Ready');
  const [stores, setStores]                     = useState(storesData);
  const [activeStoreId, setActiveStoreId]       = useState(null);
  const [activeTileFilter, setActiveTileFilter] = useState(null);
  const [cartOpen, setCartOpen]                 = useState(false);
  const [payStore, setPayStore]                 = useState(null);

  // ── VTO status tracking ───────────────────────────────────────────────
  const [vtoStatus, setVtoStatus]     = useState(VTO_STATUS.IDLE);
  const [vtoError, setVtoError]       = useState(null);

  // ── Persisted state (survives page refresh) ───────────────────────────
  const [savedOutfits, setSavedOutfits]       = useLocalStorage('saved_outfits', []);
  const [directCart, setDirectCart]             = useLocalStorage('cart', []);
  const [directWishlist, setDirectWishlist]     = useLocalStorage('wishlist', []);

  const [wardrobe, setWardrobe] = useLocalStorage('wardrobe', () => {
    // Initial wardrobe from seed data
    return wardrobeItemsData
      .filter(i => i.userId === user._id)
      .map(i => ({ ...i, inWishlist: false }));
  });

  // ── Dev warning: missing Lambda URL ───────────────────────────────────
  useEffect(() => {
    const endpoint = import.meta.env.VITE_TRYON_LAMBDA_URL;
    if (!endpoint) {
      console.warn(
        '[AllstoreZA] VITE_TRYON_LAMBDA_URL is not set. ' +
        'Try-on will use CSS overlay fallback only. ' +
        'Set this in your .env or Amplify environment variables.'
      );
    }
  }, []);

  // ── Auto-dismiss VTO error after 6 seconds ────────────────────────────
  useEffect(() => {
    if (vtoStatus === VTO_STATUS.FAILED) {
      const timer = setTimeout(() => {
        setVtoStatus(VTO_STATUS.FALLBACK);
        setVtoError(null);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [vtoStatus]);

  // ── Try-on ────────────────────────────────────────────────────────────
  const handleTryOn = useCallback(async (item) => {
    // Toggle off
    if (selectedItems.some(x => x.id === item.id)) {
      setSelectedItems(cur => cur.filter(x => x.id !== item.id));
      return;
    }

    const endpoint = import.meta.env.VITE_TRYON_LAMBDA_URL;

    // No endpoint configured — go straight to overlay
    if (!endpoint) {
      setSelectedItems(cur => [...cur, item]);
      setVtoStatus(VTO_STATUS.NO_ENDPOINT);
      return;
    }

    // Check for blob URL (can't send to Lambda)
    const isBlobAvatar = activeCanvasUrl.startsWith('blob:');

    setIsLoading(true);
    setLoadingStage('Preparing try-on…');
    setVtoStatus(VTO_STATUS.LOADING);
    setVtoError(null);

    try {
      let userImageToSend = activeCanvasUrl;

      // If the avatar is a blob URL (user uploaded), convert to base64 in the browser
      if (isBlobAvatar) {
        setLoadingStage('Processing your photo…');
        userImageToSend = await blobUrlToBase64(activeCanvasUrl);
      }

      setLoadingStage('AI is dressing your avatar…');

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userImageUrl: userImageToSend,
          garmentImageUrl: item.productImageUrl || item.processedImageUrl,
          category: item.layerType,
        }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || `Try-on failed (${res.status})`);
      }

      const data = await res.json();
      console.log('TRYON RESPONSE:', data);

      if (data.success && data.outputUrl) {
        // Real VTO result
        setActiveCanvasUrl(data.outputUrl);
        setSelectedItems(cur => [...cur, item]);
        setVtoStatus(VTO_STATUS.SUCCESS);
        setLoadingStage('Ready');
      } else {
        // Lambda returned an error
        console.warn('VTO error:', data.error || 'Unknown error');
        setSelectedItems(cur => [...cur, item]);
        setVtoStatus(VTO_STATUS.FAILED);
        setVtoError(data.error || 'Try-on service temporarily unavailable');
        setLoadingStage('Ready');
      }
    } catch (err) {
      console.warn('VTO request failed:', err.message);
      // Network error — use overlay fallback
      setSelectedItems(cur => [...cur, item]);
      setVtoStatus(VTO_STATUS.FAILED);
      setVtoError('Could not reach try-on service. Showing preview instead.');
      setLoadingStage('Ready');
    } finally {
      setIsLoading(false);
    }
  }, [activeCanvasUrl, selectedItems]);

  const handleRemoveSelected = useCallback((itemId) => {
    setSelectedItems(cur => {
      const updated = cur.filter(x => x.id !== itemId);
      if (updated.length === 0) {
        setVtoStatus(VTO_STATUS.IDLE);
        setVtoError(null);
      }
      return updated;
    });
  }, []);

  // ── Avatar / upload ───────────────────────────────────────────────────
  const handleUpload = useCallback((file) => {
    if (!file) return;
    setActiveCanvasUrl(URL.createObjectURL(file));
    setSelectedItems([]);
    setVtoStatus(VTO_STATUS.IDLE);
    setVtoError(null);
  }, []);

  const handleReset = useCallback(() => {
    setActiveCanvasUrl(DEFAULT_AVATAR);
    setSelectedItems([]);
    setVtoStatus(VTO_STATUS.IDLE);
    setVtoError(null);
  }, []);

  const handleSaveOutfit = useCallback(() => {
    if (activeCanvasUrl === DEFAULT_AVATAR && selectedItems.length === 0) return;
    const savedDate = new Date().toLocaleDateString('en-ZA', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
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
    setVtoStatus(VTO_STATUS.IDLE);
  }, [activeCanvasUrl, selectedItems, setSavedOutfits]);

  const handleDeleteOutfit = useCallback(
    (id) => setSavedOutfits(prev => prev.filter(o => o.id !== id)),
    [setSavedOutfits]
  );
  const handleLoadOutfit = useCallback((outfit) => setActiveCanvasUrl(outfit.url), []);

  // ── Stores ────────────────────────────────────────────────────────────
  const handleToggleStore = useCallback(
    (id) => setStores(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s)),
    []
  );
  const handleOpenStore = useCallback((storeId, filter) => {
    setActiveStoreId(storeId);
    setActiveTileFilter(filter || null);
  }, []);
  const handleCloseStore = useCallback(() => {
    setActiveStoreId(null);
    setActiveTileFilter(null);
  }, []);

  // ── Wardrobe ──────────────────────────────────────────────────────────
  const handleWishlistToggle = useCallback(
    (id) => setWardrobe(prev => prev.map(i => i.id === id ? { ...i, inWishlist: !i.inWishlist } : i)),
    [setWardrobe]
  );
  const handleDeleteWardrobe = useCallback((id) => {
    setWardrobe(prev => prev.filter(i => i.id !== id));
    setSelectedItems(prev => prev.filter(x => x.id !== id));
  }, [setWardrobe]);

  const handleAddToWardrobe = useCallback((item) => {
    setWardrobe(prev => {
      if (prev.some(i => i.id === item.id)) return prev;
      return [...prev, { ...item, processedImageUrl: item.productImageUrl, inWishlist: false }];
    });
  }, [setWardrobe]);

  // ── Cart ──────────────────────────────────────────────────────────────
  const handleDirectCartAdd = useCallback((item) => {
    setDirectCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...item, qty: 1 }];
    });
  }, [setDirectCart]);

  const handleCartQtyChange = useCallback((itemId, delta) => {
    setDirectCart(prev =>
      prev.map(i => i.id === itemId ? { ...i, qty: Math.max(0, i.qty + delta) } : i)
        .filter(i => i.qty > 0)
    );
  }, [setDirectCart]);

  // ── Wishlist ──────────────────────────────────────────────────────────
  const handleDirectWishlistAdd = useCallback((item) => {
    setDirectWishlist(prev => prev.some(i => i.id === item.id)
      ? prev.filter(i => i.id !== item.id)
      : [...prev, item]
    );
  }, [setDirectWishlist]);

  // ── Cart checkout ─────────────────────────────────────────────────────
  const handleCheckout = useCallback((storeGroup) => {
    setCartOpen(false);
    setPayStore(storeGroup);
  }, []);

  const handlePayComplete = useCallback(() => {
    if (payStore) {
      setDirectCart(prev => prev.filter(i => i.storeSlug !== payStore.storeSlug));
    }
    setPayStore(null);
  }, [payStore, setDirectCart]);

  // ── Derived ───────────────────────────────────────────────────────────
  const activeStoreItems = useMemo(() =>
    activeStoreId ? retailCatalog.filter(i => i.storeSlug === activeStoreId) : [],
    [activeStoreId, retailCatalog]
  );

  const visibleCatalog = useMemo(() => {
    const ids = new Set(stores.filter(s => s.active).map(s => s.id));
    return retailCatalog.filter(i => ids.has(i.storeSlug));
  }, [stores, retailCatalog]);

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
        /* New VTO status props */
        vtoStatus={vtoStatus}
        vtoError={vtoError}
      />
    </div>
  );
}

// ── Utility: convert blob URL to base64 data URI ────────────────────────
async function blobUrlToBase64(blobUrl) {
  const res = await fetch(blobUrl);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Failed to read uploaded image'));
    reader.readAsDataURL(blob);
  });
}
