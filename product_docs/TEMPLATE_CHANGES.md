# ── TEMPLATE.YAML CHANGE ────────────────────────────────────────────────────
# In sam/template.yaml, update the Globals section:
#
# BEFORE (line 43):
#   Timeout: 30
#
# AFTER:
#   Timeout: 60
#
# BEFORE (line 17):
#   Default: https://yisol-idm-vton.hf.space/--replicas/0/api/predict
#
# AFTER:
#   Default: https://yisol-idm-vton.hf.space
#
# These changes let the Lambda survive HF Space cold starts (which can take
# 40-50 seconds) and point to the correct base URL without the replica path.
#
# Also increase MemorySize from 256 to 512 for base64 image processing:
#
# BEFORE (line 44):
#   MemorySize: 256
#
# AFTER:
#   MemorySize: 512
# ─────────────────────────────────────────────────────────────────────────────

# Full replacement Globals and Parameters sections for copy-paste:

Parameters:
  AppName:
    Type: String
    Default: allstoreza

  HuggingFaceUrl:
    Type: String
    Default: https://yisol-idm-vton.hf.space

  GitHubRepoUrl:
    Type: String
    Default: ''
    Description: >
      Full HTTPS URL of your GitHub repo

  GitHubBranch:
    Type: String
    Default: main

  AmplifyAccessToken:
    Type: String
    NoEcho: true
    Default: ''

Globals:
  Function:
    Runtime: nodejs22.x
    Architectures: [arm64]
    Timeout: 60
    MemorySize: 512
