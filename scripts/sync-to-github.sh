#!/bin/bash
set -e

REMOTE="origin"
BRANCH="${1:-$(git rev-parse --abbrev-ref HEAD)}"
SYNC_LOG=".git/sync-status.log"

log_failure() {
  local msg="$1"
  echo "[sync] $msg"
  echo "$(date -u +"%Y-%m-%dT%H:%M:%SZ") FAILED: $msg" >> "$SYNC_LOG"
}

log_success() {
  echo "[sync] Successfully pushed branch '$BRANCH' to GitHub."
  echo "$(date -u +"%Y-%m-%dT%H:%M:%SZ") OK: pushed $BRANCH" >> "$SYNC_LOG"
}

if [ -z "$GITHUB_PERSONAL_ACCESS_TOKEN" ]; then
  log_failure "GITHUB_PERSONAL_ACCESS_TOKEN is not set — skipping GitHub push. Set this secret in Replit to enable automatic sync."
  exit 0
fi

REMOTE_URL=$(git remote get-url "$REMOTE" 2>/dev/null || echo "")
if [ -z "$REMOTE_URL" ]; then
  log_failure "Remote '$REMOTE' not found — skipping GitHub push."
  exit 0
fi

if echo "$REMOTE_URL" | grep -q "^git@"; then
  HTTPS_URL=$(echo "$REMOTE_URL" | sed -E 's|git@([^:]+):|https://\1/|')
  echo "[sync] Converted SSH remote to HTTPS for token-based auth: $HTTPS_URL"
elif echo "$REMOTE_URL" | grep -q "^https://"; then
  HTTPS_URL="$REMOTE_URL"
else
  log_failure "Unrecognised remote URL format: $REMOTE_URL — cannot push."
  exit 0
fi

echo "[sync] Pushing branch '$BRANCH' to GitHub..."

PUSH_ERROR=$(git \
  -c "http.extraheader=Authorization: Basic $(printf "x-access-token:${GITHUB_PERSONAL_ACCESS_TOKEN}" | base64 -w 0)" \
  push "$HTTPS_URL" "HEAD:refs/heads/$BRANCH" --quiet 2>&1) && {
  log_success
} || {
  if echo "$PUSH_ERROR" | grep -q "workflow"; then
    log_failure "Push blocked: your GitHub PAT needs the 'workflow' scope."
    echo "[sync] Fix: GitHub → Settings → Developer settings → Personal access tokens"
    echo "[sync]       → edit your token → enable 'workflow' → update GITHUB_PERSONAL_ACCESS_TOKEN in Replit."
  else
    log_failure "Push failed. Check your GITHUB_PERSONAL_ACCESS_TOKEN and remote URL."
  fi
  exit 0
}
