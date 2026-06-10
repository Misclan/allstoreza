# ALLSTOREZA — PROJECT CONTEXT DOCUMENT

Use this document to bootstrap a new Claude session. It contains everything needed to continue development without re-reading the full codebase.

---

## What This Product Is

AllstoreZA is an AI-powered personal fitting room for the South African market.

**The problem:** People hesitate to buy clothing online because they can't predict how garments will look on them.

**The mission:** Give users confidence before they spend money.

**Positioning:** "Your AI-powered personal fitting room for South African fashion." The product sells confidence, not technology. Shopping is primary. AI is a superpower hidden behind the experience.

**Business model:** Affiliate. Users discover and try on clothing, then click through to the retailer to buy. AllstoreZA earns referral commission. Not a marketplace — no payments, no inventory, no fulfilment.

---

## Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Frontend | React 18 + Vite 5 | No TypeScript. No Tailwind — vanilla CSS with custom design tokens. |
| Hosting | AWS Amplify | Auto-deploys on git push. Not available in af-south-1 — deployed to us-east-1. |
| Backend | AWS Lambda (Node 22, arm64) | Function URL, no API Gateway. Single function: VTO pipeline. |
| Database | AWS DynamoDB (on-demand) | 4 tables defined in SAM but **not yet used** — frontend reads from hardcoded JS data files. |
| AI Engine | Hugging Face IDM-VTON | Free community Gradio space. Unreliable — see Known Issues. |
| IaC | AWS SAM | Two-template split for af-south-1 / us-east-1 regional constraint. |

**Cost:** R0.00/month on free tier at MVP scale.

**Key constraint:** Ken strongly prefers free or low-cost tools. Factor this into all recommendations.

---

## Architecture

```
Browser (React + Vite)
  │
  ├── Try-On click
  │     │
  │     ▼
  │   Lambda Function URL (POST)
  │     │
  │     ├── Downloads user image + garment image
  │     ├── Converts to base64
  │     ├── Calls HF IDM-VTON Gradio API (with retries + queue fallback)
  │     │
  │     ▼
  │   Returns { success, outputUrl } or { success: false, error, errorType }
  │
  ├── If VTO succeeds → sets composited image as avatar
  ├── If VTO fails → CSS overlay fallback (garment image positioned on avatar)
  │
  ├── All user state persisted to localStorage (allstoreza_ prefix)
  │     ├── allstoreza_cart
  │     ├── allstoreza_wishlist
  │     ├── allstoreza_wardrobe
  │     └── allstoreza_saved_outfits
  │
  └── Catalog, stores, user profile loaded from hardcoded JS data files
```

---

## File Structure

```
src/
  App.jsx              — Root state container. useLocalStorage hook. VTO status tracking.
                         Handlers: tryOn, cart, wishlist, wardrobe, outfits, stores.
                         GARMENT_OVERLAYS object defines CSS overlay positions by layerType.

  components/
    Workspace.jsx      — Main layout shell. Topnav (brand, Saved, Cart, Guest badge).
                         Two-column grid: canvas-panel (left) + catalog-panel (right).
                         VTO error banner, preview badge, success badge.
    StoreGrid.jsx      — Catalog home view. Store tiles (4 product thumbs per store).
                         Search bar, category filter chips, store manager toggle.
                         SearchCard component for search results.
    StoreBrowser.jsx    — Full in-store view. Sections: Sale / New In / Trending.
                         BrowserCard component with Try-On / Cart / Wishlist buttons.
                         View All modal. In-store search.
    WardrobeTray.jsx   — Two tabs: Try-On (wardrobe grid, filterable) + Saved Looks.
                         Filter chips: All / Saved / In Cart.
    CartPanel.jsx      — Slide-in right panel. Items grouped by store. Qty +/− controls.
                         Per-store "Pay at {Store}" button → opens PayMockPage.
    PayMockPage.jsx    — Full-screen mock checkout. Fake credit card form.
                         TO BE REPLACED with affiliate redirect confirmation.
    AvatarStrip.jsx    — Horizontal scroll strip below canvas. Default avatar slot,
                         saved outfit thumbnails, "Save look" dashed add button.
    CanvasLoader.jsx   — Loading overlay for canvas. Spinner + stage text.
    StoreManager.jsx   — Modal to enable/disable stores with toggle switches.
    FilmStrip.jsx      — UNUSED LEGACY. Safe to delete.

  data/
    catalog.js         — 24 items across 6 stores (Cotton On, Edgars, Jet, Mr Price,
                         Woolworths, Zara). Unsplash placeholder images.
                         Schema: { id, storeName, storeSlug, title, priceZAR, layerType,
                                   productImageUrl, affiliateCheckoutUrl,
                                   isHotDeal, isNew, isTrending }
    stores.js          — 7 stores (5 active, 2 inactive). { id, name, logo, storeUrl, active }
    user.js            — Single hardcoded user. Default avatar on S3.
    wardrobe.js        — 4 seed wardrobe items.

  index.css            — 826 lines. Design tokens in :root. DM Sans body + Playfair Display headings.
                         Monolithic — all component styles in one file.
  vto-status.css       — VTO error banner, preview badge, success badge styles.
                         Appended to index.css or imported separately in main.jsx.

sam/
  lambda/tryon.mjs     — VTO Lambda v2. Base64 image conversion, Gradio predict + queue API,
                         2 retries with backoff, honest error responses.
  template.yaml        — Full stack: Lambda + 4 DynamoDB tables + Amplify.
  template-backend.yaml / template-frontend.yaml — Split templates for regional deploy.
  samconfig.toml       — SAM deploy config.
```

---

## Code Patterns & Conventions

**State management:** All state in App.jsx via useState / useLocalStorage. Props drilled through Workspace to child components. No context, no Redux, no state library.

**CSS approach:** Vanilla CSS with BEM-ish class names. Design tokens in :root variables. No CSS modules, no Tailwind. Font pairing: DM Sans (body) + Playfair Display (headings). Color palette is warm neutral (white bg, #1A1916 text, #1A5C3A green accent).

**Component pattern:** Functional components only. SVG icons defined inline at top of each component file (duplicated — extraction is a known debt item). useCallback on all handlers passed as props.

**Overlay system:** layerType field on each catalog item maps to a position in the GARMENT_OVERLAYS object (App.jsx). CSS overlays use absolute positioning + mix-blend-mode: multiply. This is the fallback when VTO is unavailable.

**VTO status:** App.jsx tracks vtoStatus as one of: idle, loading, success, failed, fallback, no_endpoint. Workspace.jsx renders error banners and canvas badges based on this.

**localStorage keys:** allstoreza_cart, allstoreza_wishlist, allstoreza_wardrobe, allstoreza_saved_outfits. JSON serialized. useLocalStorage hook handles hydration and sync.

---

## Completed Work

- [x] React + Vite frontend with full component tree
- [x] Product catalog with 24 items across 6 SA retailers
- [x] Store tiles, store browser, in-store sections (Sale / New / Trending)
- [x] Search (catalog-level + in-store)
- [x] Category filter chips (Tops, Outerwear, Bottoms, Dresses, Accessories, Footwear)
- [x] Cart with quantity (slide-in panel, grouped by store, +/− controls)
- [x] Wishlist (toggle from catalog and wardrobe, count in topnav)
- [x] Wardrobe with tabs (Try-On + Saved Looks) and filter chips
- [x] Outfit saving (up to 10 looks, avatar strip with thumbnails)
- [x] Guest mode (no auth required)
- [x] localStorage persistence for cart, wishlist, wardrobe, saved outfits
- [x] VTO Lambda v2 (base64 conversion, retries, queue API, honest errors)
- [x] VTO status tracking with error banners and preview/success badges
- [x] Blob URL → base64 conversion in browser for user-uploaded photos
- [x] CSS garment overlay fallback with layerType positioning
- [x] SAM templates (Lambda + 4 DynamoDB tables + Amplify)
- [x] Mock checkout page (placeholder for affiliate redirect)
- [x] Amplify auto-deploy on git push

---

## Known Issues (from audit)

### Critical
1. **HF Space is unreliable** — free community demo, cold starts, rate limits, downtime. VTO Lambda v2 handles this gracefully (retries + fallback) but real VTO results are inconsistent. Production fix: dedicated HF Inference Endpoint or Replicate.
2. **Product images are Unsplash stock photos** — lifestyle shots, not isolated garments. Some images duplicated across stores. VTO models need white-background garment images. CSS overlay works regardless.
3. **Mock checkout is a dead end** — PayMockPage simulates a credit card form. Should be an affiliate redirect confirmation ("You're leaving AllstoreZA to buy at {Store}").

### High
4. **No size selection** — product schema has no size field. Can't add to cart with a size. Clothing app without sizes is not shippable.
5. **Missing filters** — only Category exists. Need Brand, Colour, Price range, Size.
6. **No routing** — single-page app, no react-router. Can't deep-link to stores, products, or shared looks. Blocks Phase 2 sharing.
7. **No mobile layout** — one breakpoint at 1080px stacks columns. No mobile nav, no bottom tab bar, no touch-optimized interactions.
8. **affiliateCheckoutUrl points to store homepage** — not the actual product page. No affiliate tracking parameters.

### Medium
9. **SVG icons duplicated across 6+ files** — CartIcon, HeartIcon, SearchIcon, XIcon, TrashIcon etc. Should be extracted to shared icons.jsx.
10. **DynamoDB tables defined but unused** — SAM creates 4 tables, frontend reads from JS files.
11. **CSS specificity conflicts** — two .canvas-preview blocks in index.css, second overrides first with !important.
12. **No error boundary** — any component throw white-screens the app.
13. **Wardrobe auto-populates on try-on** — StoreBrowser.handleTryOn adds items to wardrobe automatically. Conflates "preview" with "save."
14. **Layout prioritizes technology over shopping** — avatar/fitting room is left column (40% of screen). Users arrive wanting to browse, not configure an avatar.

---

## Prioritised Roadmap

### Sprint: Next (P0 — unblock launch)

| Task | Impact | Effort |
|---|---|---|
| Replace PayMockPage with affiliate redirect flow | Conversion | 4-6 hrs |
| Add size selection (schema + product cards + cart) | Shippable product | 4-6 hrs |
| Add Brand / Colour / Price / Size filters | Usability | 1 day |
| Add react-router (/, /store/:id, /look/:id) | Deep linking, sharing | 4-6 hrs |
| Source 10-20 real product images (isolated garments) | VTO quality, credibility | Ongoing |
| Extract shared icons to icons.jsx | Code health | 1-2 hrs |
| Add React error boundary | Stability | 30 min |

### Sprint: After That (P1 — shopping experience)

| Task | Impact | Effort |
|---|---|---|
| Mobile responsive layout + bottom tab nav | Reach | 2-3 days |
| Flip layout: shopping-first, fitting room secondary | UX | 1 day |
| Sorting (Price low/high, Newest, Trending) | Usability | 2-3 hrs |
| Product deep links (affiliateCheckoutUrl → actual product page) | Conversion | Depends on retailers |
| Click-through analytics (track store redirects) | Measurement | 4-6 hrs |
| Stop auto-adding to wardrobe on try-on | UX | 30 min |

### Phase 2 — Social + Sharing

| Task | Impact | Effort |
|---|---|---|
| WhatsApp outfit sharing | Virality | 1 day |
| Share link (/look/:id) with OG metadata | Virality | 1 day |
| Affiliate tracking on shared links | Revenue | 1 day |
| Move data to DynamoDB (catalog, stores, wardrobe) | Scale | 2-3 days |
| Auth (Cognito) + cloud wardrobe | Retention | 2-3 days |

### Phase 3 — Intelligence

| Task | Impact | Effort |
|---|---|---|
| AI Stylist ("outfit under R1500") | Differentiation | 1-2 weeks |
| Price tracking + sale notifications | Retention | 1 week |
| Dedicated VTO backend (HF Endpoint / Replicate) | Reliability | 1 day + cost |
| Cultural & traditional fashion categories | SA market | Future |

---

## Environment Variables

| Variable | Required | Where | Description |
|---|---|---|---|
| `VITE_TRYON_LAMBDA_URL` | No | Amplify / .env.local | Lambda Function URL. Without it, CSS overlay fallback only. |
| `HF_TRYON_URL` | No | Lambda env | HF Space base URL. Default: `https://yisol-idm-vton.hf.space` |
| `ALLOWED_ORIGIN` | No | Lambda env | CORS origin. Default: `*` |

---

## Key Product Rules

1. **User confidence over technical correctness.** If a simpler approach produces a better user experience, prefer it.
2. **Shopping first, AI second.** Users arrive wanting to find clothes, not use AI.
3. **One garment per card.** Never display multiple garments in a single thumbnail.
4. **Buttons never wrap.** Try-On, Cart, Wishlist, Delete must always fit in one row.
5. **Affiliate, not marketplace.** No payments, no inventory. Redirect to retailers.
6. **Private before public.** Build and validate before any marketing or exposure.
7. **Free tier first.** Default to free/low-cost tools. Flag cost implications explicitly.

---

## For Claude: When Working on This Codebase

- Generate vanilla CSS (no Tailwind). Use existing :root tokens.
- Use functional React components with hooks. No class components.
- Keep state in App.jsx. Drill props. Don't introduce Context or Redux without discussing first.
- Match existing naming conventions (camelCase for JS, kebab-case for CSS classes).
- Inline SVG icons at component top is the current pattern (debt acknowledged).
- localStorage keys use `allstoreza_` prefix.
- All prices in ZAR. Format as `R{amount.toFixed(2)}`.
- Ken prefers direct communication. No over-explaining. Call out issues without hesitation.
