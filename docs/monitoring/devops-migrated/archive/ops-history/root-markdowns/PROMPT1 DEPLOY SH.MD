You are a senior DevOps and security engineer.

Your task is to PATCH an existing Bash deployment script to improve its safety and reliability WITHOUT changing its deployment logic.

The script is used for atomic Laravel deployment on cPanel shared hosting using:

* releases directories
* current symlink
* shared storage
* artifact tarball
* rsync to public_html

You must implement the following SECURITY improvements.

IMPORTANT RULES:

* Do NOT change deployment logic.
* Do NOT remove existing health checks, migration logic, or permission logic.
* Only add safety guards.
* Preserve all existing variable names and structure.

---

## PATCH REQUIREMENTS

1. ADD SAFE DELETE GUARDS

Add these functions after the require_cmd() function:

safe_under_dir() {
local path="$1"
local base="$2"

```
local real_path
local real_base

real_path="$(readlink -f "$path" 2>/dev/null || true)"
real_base="$(readlink -f "$base" 2>/dev/null || true)"

[[ -n "$real_path" && -n "$real_base" ]] || return 1
[[ "$real_path" == "$real_base"/* ]]
```

}

safe_rm_rf() {
local target="$1"

```
[[ -n "$target" ]] || fail "Refusing rm -rf on empty path"

safe_under_dir "$target" "$RELEASES_DIR" \
    || fail "Refusing to remove path outside releases dir: $target"

rm -rf -- "$target"
```

}

2. FIX cleanup_failed_release()

Replace:

rm -rf "$NEW_RELEASE"

with:

safe_rm_rf "$NEW_RELEASE"

3. VALIDATE ARTIFACT BEFORE EXTRACTION

Before the line:

tar -xzf "$ARTIFACT_PATH" -C "$NEW_RELEASE"

insert:

log "Validating artifact contents"

tar -tzf "$ARTIFACT_PATH" >/dev/null

if tar -tzf "$ARTIFACT_PATH" | grep -E '(^/|(^|/)..(/|$))' >/dev/null; then
fail "Artifact contains unsafe paths"
fi

4. REPLACE UNSAFE RELEASE CLEANUP

Replace this block:

ls -dt * 2>/dev/null | tail -n +"$((KEEP_RELEASES + 1))" | xargs -r rm -rf

with a safer implementation:

find "$RELEASES_DIR" -mindepth 1 -maxdepth 1 -type d 
| sort -r 
| tail -n +"$((KEEP_RELEASES + 1))" 
| while read -r old_release; do
[[ -n "$old_release" ]] || continue
safe_rm_rf "$RELEASES_DIR/$old_release"
done

5. VERIFY SYMLINK SWITCH

After the line:

ln -sfn "$NEW_RELEASE" "$APP_DIR/current"

add:

CURRENT_REAL="$(readlink -f "$APP_DIR/current" 2>/dev/null || true)"
[[ "$CURRENT_REAL" == "$NEW_RELEASE" ]] || fail "current symlink verification failed"

---

## OUTPUT FORMAT

Return the FULL corrected deploy.sh file.

Do not summarize.
Do not explain.
Return only the patched script.
