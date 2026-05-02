#!/bin/bash
set -e

echo "[post-merge] Installing dependencies..."
npm install --prefer-offline --silent 2>/dev/null || npm install --silent

echo "[post-merge] Installing git hooks (husky)..."
npx husky install

cp .husky/post-commit .git/hooks/post-commit
chmod +x .git/hooks/post-commit

echo "[post-merge] Setup complete."
