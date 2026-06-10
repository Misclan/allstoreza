# v0.9.2: Critical Bug Fixes + Production Hardening

## Summary

Applied Ken's architectural feedback: image preload verification, duplicate prevention, stale closure fix, improved error handling, and timeout safety margins.

---

## 🔴 Critical Bugs Fixed

### Bug #1: VTO State Can Lie (Image Preload Verification)

**Problem:**
```javascript
// OLD: Set success immediately without verifying image loads
setActiveCanvasUrl(data.outputUrl);
setVtoStatus(VTO_STATUS.SUCCESS);
// Image URL could be 404, broken, or expired
```

**Fix:**
```javascript
// NEW: Verify image loads before declaring success
try {
  await preloadImage(data.outputUrl);
  setActiveCanvasUrl(data.outputUrl);
  setVtoStatus(VTO_STATUS.SUCCESS);
} catch (imgErr) {
  // Broken image → fallback to overlay
  setVtoStatus(VTO_STATUS.FALLBACK);
}
```

**Added:** `preloadImage()` utility function that validates image URL is actually accessible.

---

### Bug #2: Selected Item Duplicates

**Problem:**
```javascript
// OLD: Always append without checking
setSelectedItems(cur => [...cur, item]);
// If IDs aren't perfectly unique: shirt, shirt, shirt
```

**Fix:**
```javascript
// NEW: Helper that checks existence first
const addUniqueSelectedItem = useCallback((item) => {
  setSelectedItems(cur => {
    if (cur.some(x => x.id === item.id)) {
      return cur;  // Already selected, skip
    }
    return [...cur, item];
  });
}, []);
```

**Impact:** No more duplicate items in try-on queue, cleaner state.

---

### Bug #3: handleRemoveSelected Stale Closure

**Problem:**
```javascript
// OLD: Uses stale selectedItems from closure
const handleRemoveSelected = useCallback((itemId) => {
  setSelectedItems(cur => cur.filter(x => x.id !== itemId));
  if (selectedItems.length <= 1) {  // ← STALE!
    setVtoStatus(VTO_STATUS.IDLE);
  }
}, [selectedItems]);  // ← Dependency pollution
```

**Fix:**
```javascript
// NEW: Use updater function, no stale closures
const handleRemoveSelected = useCallback((itemId) => {
  setSelectedItems(cur => {
    const updated = cur.filter(x => x.id !== itemId);
    if (updated.length === 0) {  // ← Fresh value
      setVtoStatus(VTO_STATUS.IDLE);
      setVtoError(null);
    }
    return updated;
  });
}, []);  // ← No dependencies needed
```

---

## 🟡 Production Safety Improvements

### Error Handling: Improved HTTP Response Handling

```javascript
// Properly catches 503 and other error codes
if (!res.ok) {
  const errBody = await res.json().catch(() => ({}));
  throw new Error(errBody.error || `Try-on failed (${res.status})`);
}
```

### Error Boundary

Added React Error Boundary component in App.jsx. If any component throws:
- User sees error message instead of blank page
- Full stack trace visible in error UI
- Reload button available to recover

```javascript
// Wraps entire app in main.jsx
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

### Lambda Timeout Safety

**Changed:** 60s → 90s

Inference models are unpredictable. With request handling, JSON parsing, and network latency:
- 50s request timeout
- 5s buffer for serialization
- 5s buffer for response writing
- Total: Need 60s just for Lambda execution

**New margin:** 90s - 60s = 30s safety buffer

### Blob URL Memory Leak Prevention

(Pending implementation) — when user uploads multiple photos, blob URLs should be revoked:
```javascript
if (previousBlobRef.current) {
  URL.revokeObjectURL(previousBlobRef.current);
}
previousBlobRef.current = newBlobUrl;
```

---

## 🟢 Enhanced Features

### Additional VTO Payload Metadata

For better debugging:
```javascript
{
  userImageUrl,
  garmentImageUrl,
  category,
  garmentId: item.id,          // ← NEW
  garmentName: item.title,     // ← NEW
  storeSlug: item.storeSlug,   // ← NEW
}
```

Now when debugging Lambda logs, you can see which exact item failed.

### UX Enhancement: "Rendering result…" Stage

Added loading stage between VTO completion and image display:
```javascript
setLoadingStage('Rendering result…');
await preloadImage(data.outputUrl);
```

Perceived performance improvement + clearer progress indication.

---

## Files Modified

| File | Changes |
|------|---------|
| `src/App.jsx` | Error boundary, image preload, duplicate prevention, stale closure fix, metadata payload, stage text |
| `src/main.jsx` | Wrap app with ErrorBoundary |
| `sam/template.yaml` | Timeout: 60s → 90s |
| `sam/template-backend.yaml` | Timeout: 60s → 90s |

---

## State Changes

| Item | Status |
|------|--------|
| VTO state machine | ✅ Improved (image preload added) |
| Duplicate prevention | ✅ Implemented |
| Stale closure bug | ✅ Fixed |
| Error boundary | ✅ Implemented |
| Lambda timeout safety | ✅ Increased to 90s |
| HTTP error handling | ✅ Improved |

---

## Testing Checklist

### Scenario 1: VTO Succeeds
- [ ] Upload avatar
- [ ] Click "Try on shirt"
- [ ] Spinner shows "AI is dressing your avatar…"
- [ ] Spinner shows "Rendering result…"
- [ ] AI image displays (overlay hidden)
- [ ] Badge shows "✓ AI Try-On"

### Scenario 2: VTO Image URL Broken (404)
- [ ] Upload avatar
- [ ] Click "Try on shirt"
- [ ] AI returns 200 but image is 404
- [ ] Falls back to overlay
- [ ] Shows "Preview Mode" badge
- [ ] Error: "Try-on processed but image unavailable"

### Scenario 3: VTO Service Down
- [ ] Upload avatar
- [ ] Click "Try on shirt"
- [ ] Lambda times out or returns 503
- [ ] Shows overlay + "Preview Mode" badge
- [ ] Error: "Could not reach try-on service"

### Scenario 4: Duplicate Prevention
- [ ] Click "Try on shirt"
- [ ] Click "Try on shirt" again
- [ ] Should remain selected once (no duplicate)

### Scenario 5: Remove Items
- [ ] Try on multiple shirts
- [ ] Remove all items
- [ ] VTO status resets to IDLE
- [ ] Canvas clears of overlays

---

## Deployment Notes

1. **Lambda timeout:**  
   When deploying SAM changes, ensure:
   ```bash
   sam deploy --template sam/template.yaml \
     --region us-east-1 \
     --capabilities CAPABILITY_NAMED_IAM
   ```

2. **Frontend:** Standard Amplify deploy (git push to main)

3. **Monitoring:** Check CloudWatch logs for:
   - `HF RAW RESPONSE:` — HF payload shape
   - `TRYON RESPONSE:` — Lambda response
   - `Avatar image failed to load:` — broken URLs

---

## Next Steps (P0 Roadmap)

Now that core VTO reliability is solid:

1. **Size selection** (4-6 hrs) — Makes product shippable
2. **Affiliate redirect** (4-6 hrs) — Enables monetization
3. **React Router** (4-6 hrs) — Enables deep linking
4. **Brand/Colour/Price filters** (1 day) — Improves UX

---

## Technical Debt Addressed

- [x] VTO state verification
- [x] Duplicate item prevention
- [x] Stale closure bugs
- [x] Error boundary coverage
- [x] HTTP error handling
- [ ] Blob URL memory leak (pending)
- [ ] LocalStorage lazy initializer (already fixed)

