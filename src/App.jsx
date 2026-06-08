import { useMemo, useState, useCallback } from 'react';
import Workspace from './components/Workspace.jsx';
import retailCatalog from './data/catalog.js';
import wardrobeItems from './data/wardrobe.js';
import userProfile from './data/user.js';
import storesData from './data/stores.js';

const DEFAULT_AVATAR = userProfile.avatarCanvasUrl;

export default function App() {
  const [user] = useState(userProfile);
  const [activeCanvasUrl, setActiveCanvasUrl] = useState(DEFAULT_AVATAR);
  const [selectedItems, setSelectedItems] = useState([]);
  const [savedOutfits, setSavedOutfits] = useState([]); // filmstrip
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState('Ready to try on');
  const [uploadError, setUploadError] = useState('');
  const [stores, setStores] = useState(storesData);
  // Store browser state
  const [activeStoreId, setActiveStoreId] = useState(null);

  const userWardrobe = useMemo(
    () => wardrobeItems.filter((item) => item.userId === user._id),
    [user._id]
  );

  const handleUpload = useCallback((file) => {
    if (!file) { setUploadError('Please choose an image file.'); return; }
    setUploadError('');
    setActiveCanvasUrl(URL.createObjectURL(file));
  }, []);

  const handleReset = useCallback(() => {
    setActiveCanvasUrl(DEFAULT_AVATAR);
    setSelectedItems([]);
  }, []);

  const handleSaveOutfit = useCallback(() => {
    if (activeCanvasUrl === DEFAULT_AVATAR) return;
    setSavedOutfits((prev) => [
      { id: Date.now(), url: activeCanvasUrl, label: `Fit ${prev.length + 1}` },
      ...prev,
    ]);
  }, [activeCanvasUrl]);

  const handleLoadOutfit = useCallback((outfit) => {
    setActiveCanvasUrl(outfit.url);
  }, []);

  const handleTryOn = useCallback(async (item) => {
    setIsLoading(true);
    setLoadingStage('Analyzing silhouette...');
    setTimeout(() => setLoadingStage('Compositing final outfit...'), 1200);
    try {
      // In prod: VITE_TRYON_LAMBDA_URL is the Lambda Function URL (set in Amplify env vars)
      // In dev:  Vite proxies /api/tryon → VITE_TRYON_LAMBDA_URL (see vite.config.js)
      const tryonEndpoint = import.meta.env.VITE_TRYON_LAMBDA_URL || '/api/tryon';
      const response = await fetch(tryonEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userImageUrl: activeCanvasUrl,
          garmentImageUrl: item.productImageUrl || item.processedImageUrl,
          category: item.layerType,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setActiveCanvasUrl(data.outputUrl || activeCanvasUrl);
        setSelectedItems((cur) =>
          cur.some((x) => x.id === item.id) ? cur : [...cur, item]
        );
      }
    } catch (err) {
      console.error('Try-on failed:', err);
    } finally {
      setLoadingStage('Ready to try on');
      setIsLoading(false);
    }
  }, [activeCanvasUrl]);

  const handleRemoveSelected = useCallback((itemId) => {
    setSelectedItems((cur) => cur.filter((x) => x.id !== itemId));
  }, []);

  const handleToggleStore = useCallback((storeId) => {
    setStores((prev) =>
      prev.map((s) => s.id === storeId ? { ...s, active: !s.active } : s)
    );
  }, []);

  const activeStoreItems = useMemo(() => {
    if (!activeStoreId) return [];
    return retailCatalog.filter((item) => item.storeSlug === activeStoreId);
  }, [activeStoreId]);

  const visibleCatalog = useMemo(() => {
    const activeStoreIds = new Set(stores.filter((s) => s.active).map((s) => s.id));
    return retailCatalog.filter((item) => activeStoreIds.has(item.storeSlug));
  }, [stores]);

  const activeTotal = selectedItems.reduce((sum, i) => sum + i.priceZAR, 0);

  return (
    <div className="app-shell">
      <Workspace
        user={user}
        activeCanvasUrl={activeCanvasUrl}
        defaultAvatarUrl={DEFAULT_AVATAR}
        onUpload={handleUpload}
        onReset={handleReset}
        onSaveOutfit={handleSaveOutfit}
        onLoadOutfit={handleLoadOutfit}
        savedOutfits={savedOutfits}
        onTryOn={handleTryOn}
        onRemoveSelected={handleRemoveSelected}
        selectedItems={selectedItems}
        isLoading={isLoading}
        loadingStage={loadingStage}
        uploadError={uploadError}
        retailCatalog={visibleCatalog}
        wardrobeItems={userWardrobe}
        activeTotal={activeTotal}
        stores={stores}
        onToggleStore={handleToggleStore}
        activeStoreId={activeStoreId}
        onOpenStore={setActiveStoreId}
        onCloseStore={() => setActiveStoreId(null)}
        activeStoreItems={activeStoreItems}
      />
    </div>
  );
}
