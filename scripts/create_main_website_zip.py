from __future__ import annotations

import argparse
import fnmatch
import json
import os
import subprocess
import time
from datetime import datetime
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile


REPO_ROOT = Path(__file__).resolve().parent.parent
CONFIG_PATH = Path(__file__).resolve().with_name("main-website-zip.whitelist.json")


def load_config() -> dict:
    with CONFIG_PATH.open("r", encoding="utf-8") as fh:
        return json.load(fh)


def normalize(path: str) -> str:
    return path.replace("\\", "/").lstrip("./")


def is_excluded(relative_path: str, patterns: list[str]) -> bool:
    normalized = normalize(relative_path)
    return any(fnmatch.fnmatch(normalized, normalize(pattern)) for pattern in patterns)


def iter_whitelisted_files(config: dict) -> list[Path]:
    files: list[Path] = []
    seen: set[str] = set()
    excludes = config["exclude"]

    for entry in config["include"]:
        source = REPO_ROOT / entry
        if not source.exists():
            print(f"Skipped missing path: {entry}")
            continue

        if source.is_file():
            relative = normalize(str(source.relative_to(REPO_ROOT)))
            if not is_excluded(relative, excludes) and relative not in seen:
                seen.add(relative)
                files.append(source)
            continue

        for file_path in source.rglob("*"):
            if not file_path.is_file():
                continue
            relative = normalize(str(file_path.relative_to(REPO_ROOT)))
            if is_excluded(relative, excludes) or relative in seen:
                continue
            seen.add(relative)
            files.append(file_path)

    return files


def build_zip() -> Path:
    started_at = time.perf_counter()
    config = load_config()
    output_dir = REPO_ROOT / "deliverables"
    output_dir.mkdir(parents=True, exist_ok=True)

    timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    zip_path = output_dir / f"website-main-{timestamp}.zip"
    files = iter_whitelisted_files(config)

    print("ZIP")
    print(f"  target={zip_path}")
    print(f"  files={len(files)}")

    with ZipFile(zip_path, "w", compression=ZIP_DEFLATED, compresslevel=9) as archive:
        for file_path in files:
            archive.write(file_path, arcname=normalize(str(file_path.relative_to(REPO_ROOT))))

    size_mb = zip_path.stat().st_size / (1024 * 1024)
    elapsed = time.perf_counter() - started_at
    print(f"  [OK] size_mb={size_mb:.2f}")
    print(f"  [OK] elapsed_s={elapsed:.2f}")
    return zip_path


def clean_existing_archives() -> int:
    output_dir = REPO_ROOT / "deliverables"
    if not output_dir.exists():
        return 0

    removed = 0
    for zip_path in output_dir.glob("website-main-*.zip"):
        zip_path.unlink()
        removed += 1

    return removed


def reveal_in_explorer(zip_path: Path) -> None:
    started_at = time.perf_counter()
    if os.name != "nt":
        print("REVEAL")
        print(f"  [OK] skipped={zip_path}")
        return

    print("REVEAL")
    print(f"  [OK] select={zip_path.resolve()}")
    subprocess.Popen(["explorer.exe", f"/select,{zip_path.resolve()}"])
    elapsed = time.perf_counter() - started_at
    print(f"  [OK] elapsed_s={elapsed:.2f}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--clean", action="store_true", help="Delete previous website-main zip archives before creating a new one.")
    parser.add_argument("--reveal", action="store_true", help="Open Windows Explorer and select the created zip.")
    args = parser.parse_args()

    if args.clean:
        started_at = time.perf_counter()
        removed = clean_existing_archives()
        elapsed = time.perf_counter() - started_at
        print("CLEAN")
        print(f"  [OK] removed={removed}")
        print(f"  [OK] elapsed_s={elapsed:.2f}")

    created_zip = build_zip()

    if args.reveal:
        reveal_in_explorer(created_zip)

    print("DONE")
    print(f"  [OK] zip={created_zip}")
