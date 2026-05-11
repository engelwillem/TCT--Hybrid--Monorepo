You are a senior DevOps and reliability engineer.

You are improving an existing Laravel deployment script (deploy.sh).

The script already supports:

* atomic releases
* current symlink
* deploy lock
* artifact validation
* healthcheck
* rollback
* structured logs
* deploy history
* safe cleanup

Your goal now is to make the deploy script **idempotent and self-recovering**.

This means:
If a deploy is interrupted (SSH drop, CI crash, server restart), the next deploy can safely resume without corrupting the system.

Work step-by-step.

Do NOT rewrite the script.
Add only minimal safe patches.

Return patches for each step.

---

STEP 1 — DEPLOY STATE FILE

Goal:
Track deploy progress.

Create a state file:

DEPLOY_STATE_FILE="$APP_DIR/deploy-state.json"

Write state updates during deploy.

Example structure:

{
"deploy_id": "20260308154950",
"stage": "extracting",
"release": "/deploy/.../releases/20260308154950"
}

Stages should include:

starting
extracting
linking_shared
migrating
pre_healthcheck
switching_symlink
publishing_assets
post_healthcheck
completed

Update the state file whenever the stage changes.

Return the patch.

---

STEP 2 — RECOVERY ON STARTUP

Goal:
Detect interrupted deploys.

When deploy.sh starts:

If deploy-state.json exists AND stage != completed:

Log:

"Detected interrupted deployment."

Then perform safe recovery:

If stage before symlink switch → delete incomplete release

If stage after symlink switch → verify current release integrity

Then continue new deploy normally.

Return the patch.

---

STEP 3 — INCOMPLETE RELEASE CLEANUP

Goal:
Prevent orphan releases.

Before creating NEW_RELEASE:

Scan releases directory.

If any directory exists that:

* does not match current
* was created recently
* but was never completed

Remove it safely using safe_rm_rf.

Return patch.

---

STEP 4 — SYMLINK CONSISTENCY CHECK

Goal:
Prevent broken current symlink.

At deploy start:

Verify:

readlink -f "$APP_DIR/current"

points to an existing directory inside releases.

If symlink is broken:

Automatically switch to the latest valid release.

Log the repair.

Return patch.

---

STEP 5 — SAFE RESUME AFTER FAILURE

Goal:
Ensure next deploy works even if previous one failed.

Before creating new release:

Check if NEW_RELEASE already exists.

If it exists AND deploy-state.json indicates unfinished deploy:

Remove it safely and recreate.

Return patch.

---

STEP 6 — FINALIZE STATE

At successful deployment:

Update state file:

stage = completed

Also include:

release_path
timestamp
hostname

Example:

{
"deploy_id": "20260308154950",
"stage": "completed",
"release": "...",
"host": "server01"
}

Return patch.

---

FINAL OUTPUT

Return the FULL deploy.sh script with:

* atomic releases
* safe cleanup
* artifact validation
* deploy lock
* race protection
* structured logs
* deploy history
* diagnostics
* alert hooks
* deploy state tracking
* automatic recovery

Do not explain.

Return only code.
