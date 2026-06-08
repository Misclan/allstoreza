#!/usr/bin/env bash
# AllstoreZA – Two-stack deploy script
#
# Usage:
#   ./deploy.sh             → full guided deploy (backend then frontend)
#   ./deploy.sh --backend   → backend only (af-south-1)
#   ./deploy.sh --frontend  → frontend only (us-east-1)
#   ./deploy.sh --update    → redeploy both with existing values

set -e

SAM_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SAM_DIR"

echo ""
echo "  ╔══════════════════════════════════════╗"
echo "  ║   AllstoreZA – SAM Deploy            ║"
echo "  ║   Backend  → af-south-1 (Cape Town)  ║"
echo "  ║   Frontend → us-east-1 (N. Virginia) ║"
echo "  ╚══════════════════════════════════════╝"
echo ""

# ── Preflight ─────────────────────────────────────────────────────────────────
if ! command -v sam &>/dev/null; then
  echo "  ✗ SAM CLI not found. Install: pip install aws-sam-cli"
  exit 1
fi

if ! aws sts get-caller-identity &>/dev/null; then
  echo "  ✗ AWS credentials not configured. Run: aws configure"
  exit 1
fi

echo "  ✓ SAM CLI: $(sam --version)"
echo "  ✓ AWS identity: $(aws sts get-caller-identity --query Arn --output text)"
echo ""

# ── Backend deploy (af-south-1) ───────────────────────────────────────────────
deploy_backend() {
  local allowed_origin="${1:-*}"

  echo "  ── Backend: building (template-backend.yaml) ──"
  sam build \
    --template-file template-backend.yaml \
    --build-dir .aws-sam/build-backend

  echo "  ── Backend: deploying to af-south-1 ──"
  sam deploy \
    --template-file .aws-sam/build-backend/template.yaml \
    --stack-name allstoreza-backend \
    --region af-south-1 \
    --capabilities CAPABILITY_IAM \
    --resolve-s3 \
    --no-confirm-changeset \
    --no-fail-on-empty-changeset \
    --parameter-overrides \
      "AppName=allstoreza AllowedOrigin=${allowed_origin}"

  LAMBDA_URL=$(aws cloudformation describe-stacks \
    --stack-name allstoreza-backend \
    --region af-south-1 \
    --query 'Stacks[0].Outputs[?OutputKey==`TryOnFunctionUrl`].OutputValue' \
    --output text)

  echo ""
  echo "  ✓ Backend deployed."
  echo "  ✓ Lambda URL: $LAMBDA_URL"
  echo ""
  echo "$LAMBDA_URL"
}

# ── Frontend deploy (us-east-1) ───────────────────────────────────────────────
deploy_frontend() {
  local lambda_url="$1"

  if [[ -z "$lambda_url" ]]; then
    read -r -p "  Paste your Lambda Function URL: " lambda_url
  fi

  read -r -p "  GitHub repo URL (e.g. https://github.com/username/allstorez): " REPO_URL
  read -r -s -p "  GitHub access token (repo scope, input hidden): " GH_TOKEN
  echo ""
  echo ""

  echo "  ── Frontend: building (template-frontend.yaml) ──"
  sam build \
    --template-file template-frontend.yaml \
    --build-dir .aws-sam/build-frontend

  echo "  ── Frontend: deploying to us-east-1 ──"
  sam deploy \
    --template-file .aws-sam/build-frontend/template.yaml \
    --stack-name allstoreza-frontend \
    --region us-east-1 \
    --capabilities CAPABILITY_IAM \
    --resolve-s3 \
    --no-confirm-changeset \
    --no-fail-on-empty-changeset \
    --parameter-overrides \
      "AppName=allstoreza GitHubBranch=main GitHubRepoUrl=${REPO_URL} AmplifyAccessToken=${GH_TOKEN} LambdaUrl=${lambda_url}"

  APP_URL=$(aws cloudformation describe-stacks \
    --stack-name allstoreza-frontend \
    --region us-east-1 \
    --query 'Stacks[0].Outputs[?OutputKey==`AmplifyAppUrl`].OutputValue' \
    --output text)

  echo ""
  echo "  ✓ Frontend deployed: $APP_URL"
  echo ""
  echo "$APP_URL"
}

# ── Handlers ──────────────────────────────────────────────────────────────────

if [[ "$1" == "--backend" ]]; then
  deploy_backend "*"
  exit 0
fi

if [[ "$1" == "--frontend" ]]; then
  deploy_frontend ""
  exit 0
fi

if [[ "$1" == "--update" ]]; then
  echo "  → Redeploying backend..."
  LAMBDA_URL=$(deploy_backend "*")
  echo "  → Redeploying frontend..."
  deploy_frontend "$LAMBDA_URL"
  exit 0
fi

# ── Full guided deploy ────────────────────────────────────────────────────────
echo "  Step 1 of 2: Backend (Lambda + DynamoDB)"
LAMBDA_URL=$(deploy_backend "*")

echo "  Step 2 of 2: Frontend (Amplify)"
APP_URL=$(deploy_frontend "$LAMBDA_URL")

# Lock CORS now that we have the Amplify URL
echo "  → Locking Lambda CORS to $APP_URL ..."
deploy_backend "$APP_URL" > /dev/null

echo "  ════════════════════════════════════════"
echo "  ✓ AllstoreZA fully deployed"
echo "  App:    $APP_URL"
echo "  Lambda: $LAMBDA_URL"
echo "  ════════════════════════════════════════"
echo ""
echo "  Push any commit to main → Amplify auto-builds."
echo ""
echo "  To tear down:"
echo "    aws cloudformation delete-stack --stack-name allstoreza-backend --region af-south-1"
echo "    aws cloudformation delete-stack --stack-name allstoreza-frontend --region us-east-1"
echo ""
