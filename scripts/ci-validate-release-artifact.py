from __future__ import annotations

import fnmatch
import json
import subprocess
import sys
from pathlib import Path
from zipfile import ZipFile

REPO_ROOT = Path(__file__).resolve().parent.parent
WHITELIST_PATH = REPO_ROOT / "scripts" / "main-website-zip.whitelist.json"
ZIP_SCRIPT = REPO_ROOT / "scripts" / "create_main_website_zip.py"
DELIVERABLES = REPO_ROOT / "deliverables"

REQUIRED_INCLUDE = {
    "src",
    "public",
    "backend-api",
    "docker",
    "docker-compose.yml",
    "package.json",
    "package-lock.json",
    "next.config.ts",
}

FORBIDDEN_INCLUDE_PREFIX = (
    "docs",
    "node_modules",
    ".next",
    "tmp",
    "deliverables",
    "backups",
)

REQUIRED_EXCLUDE_PATTERNS = {
    "docs/**",
    "node_modules/**",
    ".next/**",
    "deliverables/**",
    "*.zip",
    ".env",
    "backend-api/.env",
    "backend-api/vendor/**",
}

FORBIDDEN_ZIP_PATTERNS = (
    "docs/*",
    "docs/**",
    ".github/*",
    ".github/**",
    "node_modules/*",
    "node_modules/**",
    ".next/*",
    ".next/**",
    "tmp/*",
    "tmp/**",
    "deliverables/*",
    "deliverables/**",
    "*.log",
    "*.tmp",
    "*.bak",
    "*.zip",
    "*.rar",
)

REQUIRED_ZIP_ENTRIES = {
    "package.json",
    "package-lock.json",
    "docker-compose.yml",
    "src/app/page.tsx",
}

MAX_ZIP_SIZE_MB = 80
MIN_ZIP_FILES = 200


def fail(message: str) -> None:
    print(f"[FAIL] {message}")
    raise SystemExit(1)


def load_whitelist() -> dict:
    if not WHITELIST_PATH.exists():
        fail(f"Whitelist config not found: {WHITELIST_PATH}")

    with WHITELIST_PATH.open("r", encoding="utf-8") as f:
        return json.load(f)


def validate_whitelist(config: dict) -> None:
    includes = set(config.get("include", []))
    excludes = set(config.get("exclude", []))

    missing_required = sorted(REQUIRED_INCLUDE - includes)
    if missing_required:
        fail(f"Whitelist include missing required entries: {missing_required}")

    for inc in includes:
        normalized = inc.strip().replace("\\", "/")
        for forbidden_prefix in FORBIDDEN_INCLUDE_PREFIX:
            if normalized == forbidden_prefix or normalized.startswith(f"{forbidden_prefix}/"):
                fail(f"Whitelist include contains forbidden path: {normalized}")

    missing_excludes = sorted(REQUIRED_EXCLUDE_PATTERNS - excludes)
    if missing_excludes:
        fail(f"Whitelist exclude missing required patterns: {missing_excludes}")


def run_zip_builder() -> Path:
    subprocess.run([sys.executable, str(ZIP_SCRIPT), "--clean"], check=True, cwd=str(REPO_ROOT))
    zips = sorted(DELIVERABLES.glob("website-main-*.zip"), key=lambda p: p.stat().st_mtime, reverse=True)
    if not zips:
        fail("No release zip generated in deliverables/")
    return zips[0]


def validate_zip(zip_path: Path) -> None:
    size_mb = zip_path.stat().st_size / (1024 * 1024)
    if size_mb > MAX_ZIP_SIZE_MB:
        fail(f"Zip exceeds max size {MAX_ZIP_SIZE_MB} MB: {size_mb:.2f} MB")

    with ZipFile(zip_path, "r") as zf:
        names = [n.strip() for n in zf.namelist() if n and not n.endswith("/")]

    if len(names) < MIN_ZIP_FILES:
        fail(f"Zip has too few files ({len(names)}), expected >= {MIN_ZIP_FILES}")

    missing_entries = sorted([entry for entry in REQUIRED_ZIP_ENTRIES if entry not in names])
    if missing_entries:
        fail(f"Zip missing required entries: {missing_entries}")

    offenders: list[str] = []
    for name in names:
        for pattern in FORBIDDEN_ZIP_PATTERNS:
            if fnmatch.fnmatch(name, pattern):
                offenders.append(name)
                break

    if offenders:
        sample = offenders[:20]
        fail(f"Zip contains forbidden entries (sample): {sample}")


def main() -> None:
    config = load_whitelist()
    validate_whitelist(config)
    zip_path = run_zip_builder()
    validate_zip(zip_path)
    print("[OK] Release artifact policy check passed.")
    print(f"[OK] Zip: {zip_path}")


if __name__ == "__main__":
    main()
