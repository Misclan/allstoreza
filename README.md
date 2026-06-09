# AllstoreZA MVP

AI-powered personal fitting room for South African fashion — try on garments on your avatar before you buy.

## Stack

| Layer             | Technology                | Monthly Cost (Free Tier) |
|-------------------|---------------------------|--------------------------|
| Frontend Hosting  | AWS Amplify               | R0.00 (100 GB transfer)  |
| Backend API       | AWS Lambda (Function URL) | R0.00 (1M req/month)     |
| Database          | AWS DynamoDB (defined)    | R0.00 (25 GB storage)    |
| AI Try-On Engine  | Hugging Face IDM-VTON     | R0.00 (shared GPU)       |
| **Baseline**      |                           | **R0.00 / month**        |

## Features

- **Try-On Studio** — dress your avatar with catalog items; VTO Lambda (v2) downloads images, converts to base64, calls Gradio with retries and queue support; CSS garment overlay fallback when Lambda is unavailable
- **VTO status tracking** — frontend tracks pipeline state (`idle` / `loading` / `success` / `failed` / `fallback` / `no_endpoint`) with error banners and preview/success badges on the canvas
- **Product catalog** — store tiles with search, category filters (Tops / Outerwear / Bottoms / Dresses / Accessories / Footwear)
- **Store browser** — per-store view with curated sections (Sale / New In / Trending), in-store search, View All modal
- **Cart** — quantity-based (each tap increments); slide-in panel grouped by store with +/− controls
- **Pay deeplink** — mock store checkout page per store group; real affiliate redirect in Phase 2
- **Wishlist** — save items from catalog or wardrobe; count shown in topnav
- **Wardrobe tabs** — *Try-On* (all tried items, filterable by Saved / Cart) and *Saved Looks* (avatar snapshots grouped by date)
- **Guest mode** — cart, wishlist, wardrobe, and saved outfits persisted to `localStorage` (`allstoreza_` prefix); no auth required

## Local dev

```bash
npm install
cp .env.example .env.local
# Optional: add VITE_TRYON_LAMBDA_URL — app works without it (overlay fallback)
npm run dev
```

Without `VITE_TRYON_LAMBDA_URL`, the console will log a warning and all try-ons use the CSS overlay fallback. The app is fully functional in this mode.

## Deploy (frontend only)

```bash
git add .
git commit -m "your message"
git push
```

Amplify auto-detects the push, runs `npm run build` per `amplify.yml`, and deploys.
No SAM build needed unless you are changing the Lambda backend.

## Deploy (Lambda backend — only when changing VTO)

```bash
cd sam
sam build --config-file samconfig.toml --config-env backend
sam deploy --config-file samconfig.toml --config-env backend
```

Grab the Function URL from the SAM outputs and add it as `VITE_TRYON_LAMBDA_URL` in Amplify environment variables.

**SAM template notes (v2):**
- Lambda timeout set to **60s** (HF Space cold starts can take 40-50s)
- Lambda memory set to **512 MB** (base64 image processing needs headroom)
- `HuggingFaceUrl` parameter points to base space URL (`https://yisol-idm-vton.hf.space`) — no `/--replicas/0/` path

## Project structure

```
src/
  components/
    AvatarStrip.jsx    – Outfit thumbnail strip (Save Look; upload via camera icon)
    CanvasLoader.jsx   – VTO loading overlay with stage text
    CartPanel.jsx      – Slide-in cart drawer, grouped by store
    FilmStrip.jsx      – (unused legacy; safe to remove)
    PayMockPage.jsx    – Mock store checkout (Phase 2: affiliate redirect)
    StoreBrowser.jsx   – In-store product grid with sections + View All modal
    StoreGrid.jsx      – Catalog tiles with search + category filters
    StoreManager.jsx   – Enable/disable stores modal
    WardrobeTray.jsx   – Try-On + Saved Looks tabs with filter chips
    Workspace.jsx      – Main layout shell, topnav, VTO error/preview badges
  data/
    catalog.js         – Retail catalog (move to DynamoDB)
    stores.js          – Store registry (move to DynamoDB)
    user.js            – User profile + default avatar (move to DynamoDB + Cognito)
    wardrobe.js        – Seed wardrobe items (move to DynamoDB)
  App.jsx              – State + handlers; useLocalStorage hook; VTO status tracking
  index.css            – Design system + component styles
  vto-status.css       – VTO error banner, preview badge, success badge styles
sam/
  template.yaml          – Full stack SAM template (Lambda + DynamoDB + Amplify)
  template-backend.yaml  – Lambda + DynamoDB only
  template-frontend.yaml – Amplify only
  lambda/tryon.mjs       – VTO Lambda v2 (base64 conversion, retries, queue API)
  samconfig.toml         – SAM deploy config
  deploy.sh              – Interactive deploy script
amplify.yml              – Amplify build spec
.env.example             – Env var template
```

## Environment variables

| Variable                | Required | Description                                  |
|-------------------------|----------|----------------------------------------------|
| `VITE_TRYON_LAMBDA_URL` | No       | Lambda Function URL for HF IDM-VTON pipeline |

If `VITE_TRYON_LAMBDA_URL` is not set, the app falls back to CSS garment overlays positioned by `layerType`. A dev console warning is logged on mount.

## VTO pipeline (v2)

The Lambda try-on handler:

1. Receives `userImageUrl` + `garmentImageUrl` from the frontend
2. Downloads both images and converts to base64 (handles blob URLs by rejecting with a clear error — the frontend converts blob URLs to base64 before sending)
3. Calls the Gradio `/api/predict` endpoint with the correct payload format
4. If `/api/predict` fails (503 / timeout), falls back to the Gradio queue API (`/queue/join` → poll `/queue/status`)
5. Retries up to 2 times with exponential backoff
6. Returns `{ success: true, outputUrl }` on success or `{ success: false, error, errorType }` on failure — never fakes success

The frontend tracks VTO status and shows:
- **Error banner** when VTO fails (auto-dismisses after 6s, switches to fallback mode)
- **"Preview" badge** on the canvas when CSS overlay is being used
- **"AI Try-On" badge** when real VTO compositing succeeded

## Known issues

- **HF Space reliability** — the public IDM-VTON space is a free community demo; cold starts, rate limits, and downtime are expected. A dedicated HF Inference Endpoint or Replicate deployment would be the production fix.
- **Product images are stock photos** — catalog uses Unsplash lifestyle images, not isolated garment images. Real VTO needs white-background garment shots. CSS overlay works regardless.
- **No size selection** — product schema has no size field; cart accepts items without a size choice.
- **Missing filters** — only Category is implemented. Brand, Colour, Price range, Size still needed.
- **No routing** — single-page app with no router. Deep links (`/look/:id`) and per-store URLs require react-router.
- **Mock checkout** — PayMockPage simulates a payment form. Should be replaced with an affiliate redirect confirmation.
- **No mobile layout** — single breakpoint at 1080px stacks columns. No mobile nav or bottom tab bar.
- **Duplicate SVG icons** — same icons copy-pasted across 6 components. Should be extracted to a shared module.

## Roadmap

### Phase 1 (current)
- [x] Cart with quantity
- [x] Wishlist
- [x] Search + category filters
- [x] Wardrobe tabs (Try-On + Saved Looks)
- [x] Pay deeplink mockup
- [x] CSS overlay fallback
- [x] VTO Lambda v2 (base64, retries, queue, honest errors)
- [x] VTO status tracking + error/preview badges
- [x] localStorage persistence (cart, wishlist, wardrobe, saved outfits)
- [ ] Brand / Colour / Price / Size filters
- [ ] Size selection on product cards + cart
- [ ] Replace PayMockPage with affiliate redirect
- [ ] Source real product images (isolated garments)
- [ ] Extract shared icon components
- [ ] Add react-router
- [ ] Mobile responsive layout
- [ ] Move data to DynamoDB
- [ ] Auth (Cognito)

### Phase 2
- [ ] Real affiliate deeplinks per product
- [ ] Outfit sharing (WhatsApp)
- [ ] Share link (`/look/:id`)
- [ ] Cloud wardrobe (S3 + DynamoDB)
- [ ] Click-through / conversion analytics

### Phase 3
- [ ] AI Stylist ("build me an outfit under R1500")
- [ ] Price alerts + sale notifications
- [ ] Dedicated VTO backend (HF Inference Endpoint or Replicate)
- [ ] Mobile app (React Native)
