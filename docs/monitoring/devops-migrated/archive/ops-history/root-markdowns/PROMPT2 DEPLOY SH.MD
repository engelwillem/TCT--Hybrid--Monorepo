You are a senior DevOps engineer and Bash security expert.

You will improve an existing Laravel deployment script (deploy.sh) used for atomic deploys on shared hosting.

The script already supports:

* releases directory
* current symlink
* healthcheck
* rollback
* rsync to public_html

Your task is to ADD advanced safety mechanisms WITHOUT changing deployment logic.

Follow the steps STRICTLY and work step-by-step.

DO NOT skip steps.

DO NOT refactor unrelated code.

Return only code patches.

---

STEP 1 — ADD DEPLOY LOCK (PREVENT PARALLEL DEPLOYS)

Goal:
Ensure only ONE deployment runs at a time.

Add a lock file system using:

LOCK_FILE="$APP_DIR/deploy.lock"

Behavior:

* If lock exists → abort deploy
* If not → create lock
* On script exit → remove lock automatically

Implementation:

* Use flock if available
* fallback to simple lockfile

Example expected behavior:

log "Acquiring deploy lock..."

If another deploy is running:

fail "Another deployment is already running."

Ensure the lock is automatically released on EXIT.

After implementing Step 1:
Return ONLY the modified section.

---

STEP 2 — ADD ARTIFACT INTEGRITY CHECK

Goal:
Ensure the build artifact was not corrupted.

Add optional SHA256 verification.

Variables:

ARTIFACT_SHA256="${ARTIFACT_SHA256:-}"

Behavior:

If ARTIFACT_SHA256 is provided:

sha256sum "$ARTIFACT_PATH"

Compare with expected value.

If mismatch:

fail "Artifact checksum mismatch"

Do NOT enforce checksum if variable is empty.

Return only the new code block.

---

STEP 3 — ADD DEPLOY RACE CONDITION PROTECTION

Goal:
Ensure the release directory cannot be overwritten during deploy.

Add validation before creating NEW_RELEASE:

If directory already exists:

fail "Release directory already exists: $NEW_RELEASE"

Also verify:

NEW_RELEASE must be inside RELEASES_DIR.

Return only the patch.

---

STEP 4 — HARDEN SYMLINK SWITCH

Goal:
Ensure symlink switch cannot point outside releases.

Before switching:

Verify NEW_RELEASE path is inside RELEASES_DIR.

After switching:

Verify readlink -f "$APP_DIR/current" == "$NEW_RELEASE"

Abort if mismatch.

Return only the patch.

---

STEP 5 — SAFE ARTIFACT EXTRACTION

Goal:
Prevent tar path traversal attacks.

Before extraction:

List archive contents:

tar -tzf "$ARTIFACT_PATH"

Fail if archive contains:

absolute paths (/)
or parent traversal (../)

Return only the patch.

---

FINAL OUTPUT

After completing all steps:

Return the FULL deploy.sh script with all patches applied.

Do not explain anything.
Only output code.
