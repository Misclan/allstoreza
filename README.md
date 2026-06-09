# AllstoreZA MVP

AI-powered personal fitting room for South African fashion — try on garments on your avatar before you buy.

## Stack

| Layer             | Technology                | Monthly Cost (Free Tier) |
|-------------------|---------------------------|--------------------------|
| Frontend Hosting  | AWS Amplify               | R0.00 (100 GB transfer)  |
| Backend API       | AWS Lambda (Function URL) | R0.00 (1M req/month)     |
| Database          | AWS DynamoDB              | R0.00 (25 GB storage)    |
| AI Try-On Engine  | Hugging Face IDM-VTON     | R0.00 (shared GPU)       |
| **Baseline**      |                           | **R0.00 / month**        |

## Features (Sprint 1 + 2)

- **Try-On Studio** — dress your avatar with catalog items; CSS garment overlay fallback when VTO Lambda is unavailable
- **Product catalog** — store tiles with search, category filters (Tops / Outerwear / Bottoms / Dresses / Accessories / Footwear)
- **Store browser** — per-store view with curated sections (Sale / New In / Trending), in-store search, View All modal
- **Cart** — quantity-based (each tap increments); slide-in panel grouped by store with +/− controls
- **Pay deeplink** — mock store checkout page per store group; real affiliate URLs connected in Phase 2
- **Wishlist** — save items from catalog or wardrobe; count shown in topnav
- **Wardrobe tabs** — *Try-On* (all tried items, filterable by Saved/Cart) and *Saved Looks* (avatar snapshots grouped by date)
- **Guest mode** — all state in memory; no auth required for Phase 1

## Local dev

```bash
npm install
cp .env.example .env.local
# Optional: add VITE_TRYON_LAMBDA_URL — app works without it (overlay fallback)
npm run dev
```

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

## Project structure

```
src/
  components/
    AvatarStrip.jsx    – Outfit thumbnail strip (Save Look only — upload via camera icon)
    CanvasLoader.jsx   – VTO loading overlay
    CartPanel.jsx      – Slide-in cart drawer, grouped by store
    FilmStrip.jsx      – (legacy) saved outfit thumbnails
    PayMockPage.jsx    – Mock store checkout page (Phase 2: real deeplinks)
    StoreBrowser.jsx   – In-store product grid with sections + View All modal
    StoreGrid.jsx      – Catalog tiles with search + category filters
    StoreManager.jsx   – Enable/disable stores modal
    WardrobeTray.jsx   – Try-On + Saved Looks tabs with filter chips
    Workspace.jsx      – Main layout shell + topnav
  data/
    catalog.js         – Retail catalog (move to DynamoDB)
    stores.js          – Store registry (move to DynamoDB)
    user.js            – User profile (move to DynamoDB + Cognito)
    wardrobe.js        – Seed wardrobe items (move to DynamoDB)
  App.jsx              – State + handlers (cart qty, wishlist, VTO fallback)
  index.css            – Design system + component styles
sam/
  template-backend.yaml  – Lambda + DynamoDB SAM template
  template-frontend.yaml – Amplify SAM template
  lambda/tryon.mjs       – VTO Lambda handler (HF IDM-VTON)
  samconfig.toml         – SAM deploy config
amplify.yml              – Amplify build spec
.env.example             – Env var template
```

## Environment variables

| Variable                | Required | Description                                  |
|-------------------------|----------|----------------------------------------------|
| `VITE_TRYON_LAMBDA_URL` | No       | Lambda Function URL for HF IDM-VTON pipeline |

If `VITE_TRYON_LAMBDA_URL` is not set, the app falls back to CSS garment overlays positioned by `layerType`.

## Roadmap

### Phase 1 (current)
- [x] Fix VTO pipeline / add overlay fallback
- [x] Cart with quantity
- [x] Wishlist
- [x] Search + category filters
- [x] Wardrobe tabs (Try-On + Saved Looks)
- [x] Pay deeplink mockup
- [ ] Auth (Cognito)
- [ ] Move data to DynamoDB

### Phase 2
- [ ] Real affiliate deeplinks per store
- [ ] Outfit sharing (WhatsApp)
- [ ] Share link (`/look/:id`)
- [ ] Cloud wardrobe (S3 + DynamoDB)

### Phase 3
- [ ] AI Stylist
- [ ] Price alerts
- [ ] Mobile app (React Native)
