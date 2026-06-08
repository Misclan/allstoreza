# AllstoreZA MVP

Virtual try-on aggregator for SA retail — curated catalog, live avatar canvas, AI garment overlay.

## Stack

| Layer            | Technology              | Monthly Cost (Free Tier) |
|-----------------|-------------------------|--------------------------|
| Frontend Hosting | AWS Amplify             | R0.00 (100 GB transfer)  |
| Backend API      | AWS Lambda (Function URL)| R0.00 (1M req/month)    |
| Database         | AWS DynamoDB            | R0.00 (25 GB storage)    |
| AI Try-On Engine | Hugging Face Spaces     | R0.00 (shared GPU)       |
| **Baseline**     |                         | **R0.00 / month**        |

## Local dev

```bash
npm install
cp .env.example .env.local
# Fill in VITE_TRYON_LAMBDA_URL in .env.local
npm run dev
```

## Deploy

### 1. Lambda (AI backend)
See `lambda/README.md` — deploy `lambda/tryon.mjs`, grab the Function URL.

### 2. Amplify (frontend)
1. Push repo to GitHub
2. AWS Amplify Console → New app → Connect GitHub repo
3. Build settings auto-detected from `amplify.yml`
4. Add env var: `VITE_TRYON_LAMBDA_URL` = your Lambda Function URL
5. Deploy

### 3. DynamoDB (data)
See `lambda/dynamodb-schema.md` — create tables as described.
For MVP the frontend reads from local `src/data/` files;
wire to DynamoDB when adding auth + user persistence.

## Project structure

```
src/
  components/
    CanvasLoader.jsx   – AI loading overlay
    FilmStrip.jsx      – Saved outfit thumbnails
    StoreBrowser.jsx   – In-app store page
    StoreGrid.jsx      – Catalog with per-store tiles
    StoreManager.jsx   – Add/remove store modal
    WardrobeTray.jsx   – User's uploaded closet
    Workspace.jsx      – Main layout shell
  data/
    catalog.js         – Retail catalog (move to DynamoDB)
    stores.js          – Store registry (move to DynamoDB)
    user.js            – User profile (move to DynamoDB + Cognito)
    wardrobe.js        – Wardrobe items (move to DynamoDB)
  App.jsx              – State + API logic
  index.css            – Global styles
lambda/
  tryon.mjs            – Lambda handler (HF try-on)
  README.md            – Deployment instructions
  dynamodb-schema.md   – Table schemas
amplify.yml            – Amplify build spec
.env.example           – Env var template
```
