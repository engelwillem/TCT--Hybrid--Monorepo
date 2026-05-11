# Command ZIP Whitelist (Siap Tempel)

Paste command ini di terminal saat posisi ada di `E:\thechoosentalksnext`:

```powershell
@'
import json, fnmatch
from pathlib import Path
from datetime import datetime
from zipfile import ZipFile, ZIP_DEFLATED

repo = Path.cwd()
config = json.loads((repo / "scripts/main-website-zip.whitelist.json").read_text(encoding="utf-8"))

def norm(p: str) -> str:
    return p.replace("\\", "/").lstrip("./")

def excluded(rel: str) -> bool:
    r = norm(rel)
    return any(fnmatch.fnmatch(r, norm(pat)) for pat in config["exclude"])

files = []
seen = set()
for entry in config["include"]:
    src = repo / entry
    if not src.exists():
        continue
    if src.is_file():
        rel = norm(str(src.relative_to(repo)))
        if not excluded(rel) and rel not in seen:
            seen.add(rel)
            files.append(src)
        continue
    for fp in src.rglob("*"):
        if not fp.is_file():
            continue
        rel = norm(str(fp.relative_to(repo)))
        if excluded(rel) or rel in seen:
            continue
        seen.add(rel)
        files.append(fp)

zip_name = f"website-main-{datetime.now().strftime('%Y%m%d-%H%M%S')}.zip"
zip_path = repo / zip_name
with ZipFile(zip_path, "w", compression=ZIP_DEFLATED, compresslevel=9) as zf:
    for fp in files:
        zf.write(fp, arcname=norm(str(fp.relative_to(repo))))

print(f"ZIP_OK {zip_path}")
print(f"FILES {len(files)}")
print(f"SIZE_MB {zip_path.stat().st_size / 1024 / 1024:.2f}")
'@ | python -
```
