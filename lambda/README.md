# AllstoreZA – Lambda Deployment Guide

## Function: `allstoreza-tryon`

### Create & deploy (AWS Console)
1. **Lambda → Create function**
   - Runtime: `Node.js 20.x`
   - Architecture: `arm64` (cheaper, faster for I/O-bound functions)
   - Handler: `tryon.handler`
2. Upload `tryon.mjs` as the function code (or paste inline)
3. **Configuration → General**
   - Memory: `256 MB`
   - Timeout: `30 sec` (HF cold starts can be slow)
4. **Configuration → Environment variables**
   - `HF_TRYON_URL` = `https://yisol-idm-vton.hf.space/--replicas/0/api/predict`
   - `ALLOWED_ORIGIN` = your Amplify app URL e.g. `https://main.abcdef.amplifyapp.com`
5. **Add a Function URL** (no API Gateway needed for MVP)
   - Auth type: `NONE` (public endpoint — add Cognito later)
   - CORS: enable, allowed origins = your Amplify URL

### Wire frontend
In Amplify console → App settings → Environment variables:
```
VITE_TRYON_LAMBDA_URL = https://<your-function-url>.lambda-url.af-south-1.on.aws
```

### Local dev
Create `.env.local` in project root:
```
VITE_TRYON_LAMBDA_URL=https://<your-function-url>.lambda-url.af-south-1.on.aws
```
Vite will proxy `/api/tryon` → Lambda URL automatically.
