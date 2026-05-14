#!/usr/bin/env bash
# PATH B1: SYMLINK ZERO-DOWNTIME PULL DEPLOYMENT (Shallow Clone)
# Automatically materializes a new release from Git, links shared variables, and atomically switches traffic.

set -euo pipefail

# Configuration
BASE_DIR="${BASE_DIR:-/home/thechoosentalks/deploy/apps/thechoosentalks}"
REPO_URL="git@github.com:engelwillem/TCT--Hybrid--Monorepo.git"
BRANCH="${BRANCH:-main}"
BACKEND_DIR="backend-api" # Directory inside monorepo where Laravel lives
KEEP_RELEASES=5
# GUARDED MIGRATION: Set to "true" securely in your environment to auto-migrate.
RUN_MIGRATIONS="${RUN_MIGRATIONS:-false}" 

# Layout Paths
TIMESTAMP=$(date +%Y%m%d%H%M%S)
RELEASES_DIR="$BASE_DIR/releases"
SHARED_DIR="$BASE_DIR/shared"
TEMP_CLONE_DIR="$BASE_DIR/temp_clone_$TIMESTAMP"
NEW_RELEASE_DIR="$RELEASES_DIR/$TIMESTAMP"
CURRENT_LINK="$BASE_DIR/current"
LOG_FILE="$BASE_DIR/deploy_pull.log"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" >> "$LOG_FILE"
}

log "=================================================="
log "Starting Path B1 Deployment: $TIMESTAMP"

# Ensure foundational layout exists implicitly
mkdir -p "$RELEASES_DIR"
mkdir -p "$SHARED_DIR"

# 1. Fetch code via Staging Clone (Sparse Checkout)
log "Cloning $BACKEND_DIR from $BRANCH branch via sparse checkout..."
mkdir -p "$TEMP_CLONE_DIR"
cd "$TEMP_CLONE_DIR"

git init >> "$LOG_FILE" 2>&1
git remote add origin "$REPO_URL" >> "$LOG_FILE" 2>&1
# Enable sparse checkout to pull only the backend folder
git config core.sparseCheckout true >> "$LOG_FILE" 2>&1
echo "$BACKEND_DIR/*" >> .git/info/sparse-checkout
log "Fetching branch $BRANCH..."
git pull --depth=1 origin "$BRANCH" >> "$LOG_FILE" 2>&1

# 2. Re-root Monorepo to isolate the backend, delete staging metadata
log "Materializing backend project into release directory..."
# Move the contents of the backend directory out strictly
mv "$BACKEND_DIR" "$NEW_RELEASE_DIR"

# Persist build metadata for deterministic release verification
cd "$NEW_RELEASE_DIR"
COMMIT_SHA="$(git -C "$BASE_DIR/temp_clone_$TIMESTAMP" rev-parse HEAD 2>/dev/null || true)"
COMMIT_SHORT="$(git -C "$BASE_DIR/temp_clone_$TIMESTAMP" rev-parse --short HEAD 2>/dev/null || true)"
{
  echo "{"
  echo "  \"commit_sha\": \"${COMMIT_SHA}\","
  echo "  \"commit_short\": \"${COMMIT_SHORT}\","
  echo "  \"branch\": \"${BRANCH}\","
  echo "  \"release_timestamp\": \"${TIMESTAMP}\","
  echo "  \"build_time_utc\": \"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\""
  echo "}"
} > "$NEW_RELEASE_DIR/build-info.json"
log "build-info.json written for release verification."

# Clean up the staging area
cd "$BASE_DIR"
rm -rf "$TEMP_CLONE_DIR"
log "Release materialized safely at $NEW_RELEASE_DIR"

# 3. Mount shared environmental and persistent directories
log "Linking shared .env and storage..."
if [ -f "$SHARED_DIR/.env" ]; then
    ln -nfs "$SHARED_DIR/.env" "$NEW_RELEASE_DIR/.env"
else
    log "WARNING: Shared .env not found at $SHARED_DIR/.env!"
fi

if [ -d "$SHARED_DIR/storage" ]; then
    rm -rf "$NEW_RELEASE_DIR/storage"
    ln -nfs "$SHARED_DIR/storage" "$NEW_RELEASE_DIR/storage"
else
    log "WARNING: Shared storage directory not found at $SHARED_DIR/storage!"
fi

# Switch working directory to the isolated backend release
cd "$NEW_RELEASE_DIR"

# 4. PHP Libraries
log "Installing Composer dependencies..."
composer install --no-interaction --prefer-dist --optimize-autoloader >> "$LOG_FILE" 2>&1

# 5. Caching Layer
log "Running conservative cache resets..."
php artisan optimize:clear >> "$LOG_FILE" 2>&1
php artisan config:cache >> "$LOG_FILE" 2>&1
php artisan view:cache >> "$LOG_FILE" 2>&1
php artisan event:cache >> "$LOG_FILE" 2>&1
# route:cache is deliberately omitted.

# 6. Database Schema (Conditional)
if [ "$RUN_MIGRATIONS" == "true" ]; then
    log "Running database migrations (--force)..."
    php artisan migrate --force >> "$LOG_FILE" 2>&1
else
    log "Skipping migrations (RUN_MIGRATIONS is disabled)."
fi

# 7. Zero-Downtime Swap
log "Atomically switching 'current' symlink to release $TIMESTAMP..."
ln -nfs "$NEW_RELEASE_DIR" "$CURRENT_LINK"

# 8. Pruning
log "Pruning old releases (keeping last $KEEP_RELEASES)..."
cd "$RELEASES_DIR"
# List by time, exclude top N+1, remove others
ls -1t | tail -n +$((KEEP_RELEASES + 1)) | xargs -I {} rm -rf {}

log "Path B1 Deployment logic completed successfully."
log "=================================================="
