You are a senior DevOps engineer and reliability engineer.

You will enhance an existing Laravel deployment script (deploy.sh).

The script already includes:

* atomic releases
* current symlink switch
* healthcheck
* rollback
* artifact validation
* deploy lock
* safe cleanup

Your task is to ADD reliability and observability features WITHOUT modifying the existing deploy logic.

Work step-by-step.

Do NOT rewrite the script.
Only add minimal safe patches.

Return patches for each step.

---

STEP 1 — GLOBAL ERROR HANDLER

Goal:
Ensure every failure triggers structured logging and rollback safety.

Add a global failure handler:

on_deploy_failure() {
local exit_code=$?
log "DEPLOY FAILURE detected (exit code: $exit_code)"

```
if [[ -n "$PREV_RELEASE" && -d "$PREV_RELEASE" ]]; then
    log "Attempting automatic rollback to previous release"
    ln -sfn "$PREV_RELEASE" "$APP_DIR/current" || true
fi
```

}

Register handler:

trap on_deploy_failure EXIT

Do NOT break existing ERR trap.

Return only the patch.

---

STEP 2 — STRUCTURED DEPLOY LOGGING

Goal:
Improve debugging and observability.

Add structured logging format:

DEPLOY_ID="$TIMESTAMP"
HOSTNAME="$(hostname)"

Modify log function to output structured logs:

[DEPLOY_ID] [timestamp] [hostname] message

Example output:

[20260308154950] [2026-03-08 15:49:50] [server01] Starting deployment

Do not change how log() is called elsewhere.

Return only the updated log() function.

---

STEP 3 — DEPLOY METADATA FILE

Goal:
Record deployment history.

After successful deployment, create:

$APP_DIR/deploy-history.log

Append entry:

timestamp
release_path
git_commit (if available)
user_count
hostname

Example format:

20260308154950 | release=/deploy/... | users=120 | host=server01

Return only the code block added near the end of deploy.sh.

---

STEP 4 — HTTP FAILURE AUTO-DIAGNOSTICS

Goal:
When healthcheck fails, capture diagnostics.

If post-switch HTTP healthcheck fails:

Capture:

curl -I $BASE_URL
curl -s $BASE_URL | head -n 20

Save to:

$APP_DIR/deploy-last-error.log

Then perform rollback.

Return only the patch.

---

STEP 5 — OPTIONAL ALERT SYSTEM

Goal:
Send notification when deploy fails.

Add optional environment variables:

DEPLOY_ALERT_WEBHOOK
DEPLOY_ALERT_EMAIL

Behavior:

If DEPLOY_ALERT_WEBHOOK is set:

send POST JSON payload:

{
"event": "deploy_failed",
"timestamp": "...",
"release": "...",
"server": "..."
}

Use curl.

If variable not set → skip silently.

Return only the patch.

---

FINAL OUTPUT

After all steps are complete:

Return the FULL deploy.sh script including:

* deploy lock
* artifact validation
* safe cleanup
* race protection
* structured logging
* deploy history
* failure diagnostics
* optional alerting

Return only the final script.
Do not explain.
