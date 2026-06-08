#!/usr/bin/env bash
# AllstoreZA – SAM deploy helper
# Usage:
#   ./deploy.sh           → guided first deploy (prompts for GitHub token etc.)
#   ./deploy.sh --update  → fast redeploy with existing samconfig.toml values

set -e

SAM_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SAM_DIR"

echo ""
echo "  ╔═══════════════════════════════╗"
echo "  ║   AllstoreZA – SAM Deploy     ║"
echo "  ╚═══════════════════════════════╝"
echo ""

# Check SAM CLI is installed
if ! command -v sam &>/dev/null; then
  echo "  ✗ SAM CLI not found."
  echo "  Install: pip install aws-sam-cli"
  echo "  Docs: https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html"
  exit 1
fi

# Check AWS credentials are configured
if ! aws sts get-caller-identity &>/dev/null; then
  echo "  ✗ AWS credentials not configured."
  echo "  Run: aws configure"
  exit 1
fi

echo "  ✓ SAM CLI found: $(sam --version)"
echo "  ✓ AWS identity: $(aws sts get-caller-identity --query Arn --output text)"
echo ""

if [[ "$1" == "--update" ]]; then
  echo "  → Fast redeploy (using samconfig.toml values)..."
  sam build && sam deploy
  echo ""
  echo "  ✓ Done. Outputs:"
  aws cloudformation describe-stacks \
    --stack-name allstoreza \
    --query 'Stacks[0].Outputs[*].[OutputKey,OutputValue]' \
    --output table
  exit 0
fi

# Guided first deploy
echo "  First-time deploy. You'll need:"
echo "  1. Your GitHub repo URL"
echo "  2. A GitHub personal access token (repo scope)"
echo "     → https://github.com/settings/tokens/new?scopes=repo"
echo ""

read -r -p "  GitHub repo URL (e.g. https://github.com/username/allstorez): " REPO_URL
read -r -s -p "  GitHub access token (input hidden): " GH_TOKEN
echo ""
echo ""

# Validate inputs
if [[ -z "$REPO_URL" || -z "$GH_TOKEN" ]]; then
  echo "  ⚠  Repo URL and token are required for Amplify auto-deploy."
  echo "  You can re-run with these filled in, or deploy Lambda+DynamoDB now"
  echo "  and wire Amplify manually afterwards."
  read -r -p "  Continue without Amplify? (y/N): " SKIP_AMPLIFY
  if [[ "$SKIP_AMPLIFY" != "y" && "$SKIP_AMPLIFY" != "Y" ]]; then
    exit 1
  fi
  OVERRIDES="AppName=allstoreza GitHubBranch=main"
else
  OVERRIDES="AppName=allstoreza GitHubRepoUrl=${REPO_URL} AmplifyAccessToken=${GH_TOKEN} GitHubBranch=main"
fi

echo "  Building..."
sam build

echo ""
echo "  Deploying to af-south-1 (Cape Town)..."
sam deploy \
  --stack-name allstoreza \
  --region af-south-1 \
  --capabilities CAPABILITY_IAM \
  --resolve-s3 \
  --parameter-overrides $OVERRIDES \
  --confirm-changeset false

echo ""
echo "  ✓ Stack deployed. Outputs:"
aws cloudformation describe-stacks \
  --stack-name allstoreza \
  --query 'Stacks[0].Outputs[*].[OutputKey,OutputValue]' \
  --output table

echo ""
echo "  Next steps:"
echo "  1. Copy TryOnFunctionUrl output above"
echo "  2. If you skipped Amplify: add VITE_TRYON_LAMBDA_URL in Amplify console"
echo "  3. Trigger a build in Amplify Console or push a commit"
echo ""
