#!/usr/bin/env bash
# PULL-BASED DEPLOYMENT SCRIPT
# This script must run on the server, triggered by the secure webhook.

set -euo pipefail

# Absolute path to the log file (should be outside public_html ideally)
LOG_FILE="${DEPLOY_LOG_FILE:-storage/logs/deploy_webhook.log}"

# Function to log with timestamps
log() { 
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" >> "$LOG_FILE"
}

log "======================================"
log "Starting Pull Deployment..."

# Navigate to the project root directory
# (Assumes this script is run from inside the repository root)
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"
log "Working directory set to: $PROJECT_ROOT"

# 1. Pull latest code from GitHub
log "Fetching latest code from origin..."
git fetch --all >> "$LOG_FILE" 2>&1
log "Applying hard reset to origin/main..."
git reset --hard origin/main >> "$LOG_FILE" 2>&1

# 2. Update PHP dependencies
log "Installing Composer dependencies..."
composer install --no-interaction --prefer-dist --optimize-autoloader >> "$LOG_FILE" 2>&1

# 3. Database migrations
log "Running database migrations..."
php artisan migrate --force >> "$LOG_FILE" 2>&1

# 4. Conservative Cache Reset
log "Clearing caches..."
php artisan optimize:clear >> "$LOG_FILE" 2>&1
php artisan config:cache >> "$LOG_FILE" 2>&1
php artisan view:cache >> "$LOG_FILE" 2>&1
php artisan event:cache >> "$LOG_FILE" 2>&1
# Note: route:cache is omitted deliberately to avoid Closure serialization issues.

# 5. Fix permissions (if necessary, adjustable per server context)
# chmod -R 755 storage bootstrap/cache

log "Pull Deployment completed successfully."
log "======================================"
