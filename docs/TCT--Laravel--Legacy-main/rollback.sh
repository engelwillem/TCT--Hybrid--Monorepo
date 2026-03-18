#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-$HOME/deploy/apps/thechoosentalks}"
RELEASES_DIR="$APP_DIR/releases"
PUBLIC_HTML_DIR="${PUBLIC_HTML_DIR:-$HOME/public_html}"

TARGET_RELEASE=""
SKIP_SWITCH="0"

while [[ $# -gt 0 ]]; do
    case "$1" in
    --release)
        TARGET_RELEASE="$2"
        shift 2
        ;;
    --skip-switch)
        SKIP_SWITCH="1"
        shift
        ;;
    *)
        echo "Unknown arg: $1" >&2
        exit 2
        ;;
    esac
done

if [[ -z "$TARGET_RELEASE" ]]; then
    CURRENT="$(readlink -f "$APP_DIR/current" || true)"
    RELEASE_LIST_FILE="$(mktemp)"
    trap 'rm -f "$RELEASE_LIST_FILE"' EXIT

    find "$RELEASES_DIR" -mindepth 1 -maxdepth 1 -type d -printf '%f\n' | sort -r >"$RELEASE_LIST_FILE"

    RELEASE_COUNT="$(wc -l <"$RELEASE_LIST_FILE" | tr -d ' ')"
    if [[ "${RELEASE_COUNT:-0}" -lt 2 ]]; then
        echo "Rollback aborted: previous release not found." >&2
        exit 1
    fi

    while IFS= read -r rel; do
        full="$RELEASES_DIR/$rel"
        if [[ "$full" != "$CURRENT" ]]; then
            TARGET_RELEASE="$full"
            break
        fi
    done <"$RELEASE_LIST_FILE"
fi

[[ -n "$TARGET_RELEASE" && -d "$TARGET_RELEASE" ]] || { echo "Invalid rollback target: $TARGET_RELEASE"; exit 1; }

if [[ "$SKIP_SWITCH" != "1" ]]; then
    ln -sfn "$TARGET_RELEASE" "$APP_DIR/current"
fi

mkdir -p "$PUBLIC_HTML_DIR"
rsync -a --delete --exclude='index.php' "$TARGET_RELEASE/public/" "$PUBLIC_HTML_DIR/"
cp "$TARGET_RELEASE/public/.htaccess" "$PUBLIC_HTML_DIR/" 2>/dev/null || true
rm -f "$PUBLIC_HTML_DIR/hot"

cat >"$PUBLIC_HTML_DIR/index.php" <<'PHP'
<?php
declare(strict_types=1);
require __DIR__ . '/../deploy/apps/thechoosentalks/current/public/index.php';
PHP

echo "Rollback complete. current -> $(readlink -f "$APP_DIR/current")"
