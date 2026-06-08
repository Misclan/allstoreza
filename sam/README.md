# AllstoreZA – SAM Deployment

One command deploys the entire backend stack:
- Lambda (try-on engine) with Function URL
- 4 DynamoDB tables (on-demand billing)
- Amplify app wired to your GitHub repo (auto-deploys on push)

---

## Prerequisites (one-time setup)

**1. AWS CLI**
```bash
pip install awscli
aws configure
# Region: af-south-1 (Cape Town)
```

**2. SAM CLI**
```bash
pip install aws-sam-cli
# or: brew install aws-sam-cli
```

**3. GitHub personal access token**
- Go to: https://github.com/settings/tokens/new?scopes=repo
- Scope: `repo`
- Copy the token — you'll paste it during deploy

---

## Deploy

```bash
cd sam
chmod +x deploy.sh
./deploy.sh
```

The script will ask for your GitHub repo URL and token, then deploy everything.

**Subsequent deploys** (after code changes):
```bash
./deploy.sh --update
```

---

## What gets created

| Resource | Name | Cost |
|----------|------|------|
| Lambda function | `allstoreza-tryon` | R0.00 (1M req/month free) |
| Lambda Function URL | auto-generated | R0.00 |
| DynamoDB table | `allstoreza-users` | R0.00 (25GB free) |
| DynamoDB table | `allstoreza-wardrobe` | R0.00 |
| DynamoDB table | `allstoreza-catalog` | R0.00 |
| DynamoDB table | `allstoreza-stores` | R0.00 |
| Amplify app | `allstoreza-frontend` | R0.00 (100GB transfer free) |
| **Total** | | **R0.00 / month** |

---

## After deploy

Stack outputs will print in your terminal. Copy the `TryOnFunctionUrl` —
it's automatically set as `VITE_TRYON_LAMBDA_URL` in your Amplify app.

Push any commit to `main` → Amplify auto-builds and deploys the frontend.

---

## Tear down

```bash
aws cloudformation delete-stack --stack-name allstoreza --region af-south-1
```

Deletes everything. DynamoDB tables and Lambda function are removed cleanly.

---

## Skipping Amplify

If you want Lambda + DynamoDB only (wire frontend manually), just hit enter
when the script asks for your GitHub token. You'll get the Lambda URL in
the outputs and can add it to Amplify Console manually.
