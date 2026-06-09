# AllstoreZA — Product Engineering Audit

**Date:** 9 June 2026
**Scope:** Full codebase review — VTO pipeline, UX, conversion, technical debt, launch blockers

---

## Executive Summary

AllstoreZA has strong product instincts and a clean codebase skeleton. The architecture (React + Vite, Lambda, DynamoDB, Amplify) is well-chosen for the SA market and free-tier constraints.

However, the app cannot launch in its current state. The core try-on flow is broken at every layer — backend, frontend, and data — and the shopping experience has several structural gaps that would prevent any user from completing the intended journey.

This audit identifies **23 issues** across 5 categories, with replacement files provided for the 3 highest-impact fixes.

---

## P0 — VTO Pipeline Failure (LAUNCH BLOCKER)

The entire try-on flow is broken. A user who clicks "Try on" sees a brief spinner, then their unchanged avatar with a flat garment image crudely overlaid via CSS. There is no actual AI compositing happening.

### Root Cause 1: Lambda hits a dead endpoint

`tryon.mjs` line 14 targets:
```
https://yisol-idm-vton.hf.space/--replicas/0/api/predict
```

This URL has three fatal problems:
- `/--replicas/0/` targets a **specific replica** that may not exist after a space restart or scale event — this path 404s intermittently
- The space is a **free community demo** — it sleeps after inactivity, rate-limits aggressively, and has cold starts exceeding 60 seconds
- The Lambda timeout is 28 seconds — any cold-start request will always timeout

**Every request to this endpoint either 404s or times out.**

### Root Cause 2: Lambda sends URLs, not image data

The Lambda sends raw image URLs to the Gradio API:
```js
{ background: userImageUrl, layers: [], composite: null }
```

The Gradio API for IDM-VTON expects **base64-encoded image data**, not URLs. Even if the endpoint were reachable, the request payload is malformed.

### Root Cause 3: Blob URLs from user uploads are inaccessible

When a user uploads their own photo, `App.jsx` line 86 creates:
```js
URL.createObjectURL(file)
```

This produces a `blob:` URL that exists only in the user's browser. The Lambda receives this blob URL and forwards it to HF, which cannot access it. User-uploaded photos **can never work** through this pipeline.

### Root Cause 4: The "graceful fallback" is deceptive

`tryon.mjs` lines 108-118: when the HF call fails (which is every time), the Lambda returns:
```json
{ "success": true, "outputUrl": "<original user image>", "fallback": true }
```

The frontend (`App.jsx` line 65) sees `success: true`, sets the avatar to... the same image. The user's avatar doesn't change. Then the CSS overlay kicks in (Workspace.jsx lines 125-139) and places a flat product image at hardcoded percentages on top.

### Root Cause 5: Product images are lifestyle photos

The catalog uses Unsplash stock photography — lifestyle shots of people wearing clothes, shoes on colored backgrounds, etc. Even a working VTO model needs **isolated garment images** (white background, garment only) to produce meaningful results. The current images would produce garbage even with a perfect pipeline.

### Root Cause 6: No error feedback to the user

`App.jsx` line 69-71 silently catches all errors:
```js
catch (err) {
  console.warn('VTO Lambda unavailable — using overlay fallback:', err.message);
}
```

The user sees a spinner, then a bad overlay. No toast, no "try again", no explanation. This destroys trust.

### Root Cause 7: Missing env var skips VTO entirely

`App.jsx` line 54: if `VITE_TRYON_LAMBDA_URL` is not set, the entire Lambda call is skipped. Local dev never fires VTO. No warning.

### Fix delivered

See `tryon.mjs` (replacement) — addresses roots 1-4 with:
- Correct Gradio API endpoint (no replica path)
- Image download + base64 conversion in Lambda
- Retry logic with exponential backoff
- Queue-based Gradio API (handles cold starts)
- Honest error responses (no fake `success: true`)
- 55-second timeout to handle cold starts

See `App.jsx` (replacement) — addresses roots 6-7 with:
- `vtoStatus` state: `'idle' | 'loading' | 'success' | 'failed' | 'fallback'`
- Error toast/banner when VTO fails
- Clear "Preview mode" label when using CSS overlay fallback
- Env var warning in dev console

---

## P0 — No State Persistence (LAUNCH BLOCKER)

Every piece of user state — cart, wishlist, wardrobe, saved outfits — is held in React `useState`. A page refresh wipes everything.

The product spec says: "Use local storage for Cart, Wishlist, Wardrobe, Saved outfits."

This is not implemented.

### Impact

- User adds 5 items to cart → refreshes page → empty cart
- User saves 3 outfits → navigates away → gone
- User builds a wardrobe → closes tab → starts over

### Fix delivered

See `App.jsx` (replacement) — adds `useLocalStorage` hook that syncs all four stores to `localStorage` with a `allstoreza_` key prefix. Hydrates on mount, writes on change.

---

## P0 — No Path to Purchase (LAUNCH BLOCKER)

The checkout flow is a dead end. `PayMockPage.jsx` renders a fake credit card form and prominently says "This is a prototype checkout mockup." The "Complete Purchase" button clears the cart and shows nothing.

### The real issue

AllstoreZA is an **affiliate discovery product**, not a marketplace. The "checkout" should redirect users to the actual retailer's product page with an affiliate tracking parameter — not simulate a payment form that can never process anything.

### What exists

Each catalog item has `affiliateCheckoutUrl` — but it just points to the store homepage (`https://cottonon.com/za/`), not the actual product.

### What should happen

```
User clicks "Buy at Cotton On"
    → Redirect to cottonon.com/za/product/essential-black-tee?ref=allstoreza
    → AllstoreZA earns affiliate commission
```

### Fix recommendation (not in replacement files — requires business setup)

1. Replace PayMockPage with a simple redirect confirmation: "You're leaving AllstoreZA to complete your purchase at {Store}."
2. Add `productUrl` field to catalog items (deep link to actual product page)
3. Append `?ref=allstoreza` or appropriate affiliate parameter
4. Track click-through events for analytics

---

## P1 — UX Issues

### 1. Layout prioritizes technology over shopping

The homepage is a two-column split: Fitting Room (left) | Catalog (right). The avatar takes ~40% of the screen. Users arrive wanting to browse clothes, not configure an avatar.

**Recommendation:** Flip the hierarchy. Shopping catalog should be the primary experience. Try-on should feel like a superpower you discover while shopping, not the homepage.

### 2. Missing filters (spec requires 5, only 1 exists)

The product spec requires: Category, Brand, Colour, Price, Size.
Only Category is implemented.

**Impact:** Users can't narrow down 24 items across 6 stores. At scale (hundreds of products), this is completely unusable.

### 3. No size selection anywhere

The product schema has no `size` field. The user profile has `baseTopSize: 'S'` and `baseBottomSize: '32'` but nothing uses them. You can add items to cart without selecting a size.

**Impact:** A clothing shopping app without sizes is not shippable. This is a launch blocker for any user who intends to actually buy.

### 4. Wardrobe auto-populates on try-on

`StoreBrowser.jsx` line 67-68: clicking "Try on" automatically adds the item to the wardrobe. This conflates "I want to preview this" with "I want to save this." Users exploring the catalog will have a wardrobe full of items they glanced at once.

### 5. No mobile experience

One breakpoint at 1080px that stacks columns. No mobile navigation, no hamburger menu, no bottom tab bar. The cart panel is 420px wide and fills the entire mobile screen without proper touch handling.

### 6. Duplicate product images in catalog

Multiple products share the same Unsplash URL:
- `edgars_blazer_03` and `zara_blazer_01` → same blazer image
- `edgars_skirt_02` and `woolworths_skirt_03` → same skirt image
- `mrprice_white_tee_02` and `cottonon_white_tee_03` → same white tee image

Users will notice identical products across "different" stores.

---

## P1 — Conversion Issues

### 1. Cart "Pay" button opens a fake checkout

Instead of redirecting to the retailer, it opens `PayMockPage` — a mock credit card form. This trains users to expect a checkout that will never exist (AllstoreZA is affiliate, not marketplace).

### 2. No "Visit Store" or "Buy Now" in product cards

The SearchCard component has a "View store" button that opens the AllstoreZA store browser — not the actual retailer's website. There's no way to go from a product card directly to the retailer to purchase.

### 3. Affiliate URLs are homepage links

Every `affiliateCheckoutUrl` points to the store's homepage, not the product page. A user clicking through from a specific blazer lands on cottonon.com's homepage and has to find the blazer themselves.

### 4. No analytics or event tracking

No click tracking, no try-on completion tracking, no add-to-cart events. Without this, you can't measure the funnel or prove value to affiliate partners.

---

## P2 — Technical Debt

### 1. SVG icons duplicated across 6 files

CartIcon, HeartIcon, SearchIcon, XIcon, TrashIcon, BackIcon, ExternalIcon — all copy-pasted in multiple components. Should be a single `icons.jsx` module.

### 2. No routing

Single-page app with no router. Can't deep-link to stores, products, or shared looks. Phase 2 sharing (`/look/{id}`) is impossible without routing.

### 3. DynamoDB tables defined but unused

SAM template creates 4 tables (users, wardrobe, catalog, stores). The frontend reads exclusively from hardcoded JS data files. The Lambda makes no DynamoDB calls.

### 4. CSS specificity conflicts

Two `.canvas-preview` blocks in `index.css` (lines 134 and 562). The second overrides the first with `!important`. This is a maintenance trap.

### 5. 826-line monolithic CSS

All styles in a single file. No CSS modules, no component-scoped styles. Will become unmanageable at scale.

### 6. No error boundary

If any component throws, the entire app white-screens. Should wrap `<App>` in a React error boundary.

### 7. FilmStrip component is unused

`FilmStrip.jsx` is imported nowhere. Dead code.

---

## Launch Blockers — Summary

| # | Blocker | Severity | Fix Effort |
|---|---------|----------|------------|
| 1 | VTO pipeline returns no result | Critical | 2-3 days (Lambda + frontend) |
| 2 | All state lost on page refresh | Critical | 2-4 hours (localStorage hook) |
| 3 | No path to actual purchase | Critical | 1 day (replace PayMock with redirect) |
| 4 | No size selection | High | 4-6 hours (schema + UI) |
| 5 | Missing filters (Brand, Colour, Price, Size) | High | 1 day |
| 6 | No mobile layout | High | 2-3 days |
| 7 | Product images are stock photos | High | Ongoing (need real product feeds) |

---

## Replacement Files Provided

1. **`sam/lambda/tryon.mjs`** — Rewritten Lambda with proper Gradio API handling, base64 image conversion, retry logic, queue support, and honest error responses.

2. **`src/App.jsx`** — Rewritten with localStorage persistence for cart/wishlist/wardrobe/outfits, proper VTO status tracking, user-facing error states, and env var validation.

3. **`src/components/Workspace.jsx`** — Updated with VTO status display, "Preview mode" labeling for CSS overlay fallback, error banner, and retry action.

---

## Recommended Next Sprint (after applying fixes)

1. Replace PayMockPage with affiliate redirect flow
2. Add size selection to product schema and cart
3. Add Brand, Colour, Price range filters
4. Add react-router for deep linking
5. Extract shared icons to `icons.jsx`
6. Source real product images (even 10 real items beats 24 stock photos)
7. Add mobile bottom navigation
