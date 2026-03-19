# CLEAN LOAD NEXT JS REPO
memuat ulang dengan environment Next.js yang 100% bersih dan menjalankan server Turbopack dengan lancar setelah repo github di update dengan file terbaru yang sudah diperbaiki.
```bash
git fetch origin
git reset --hard origin/main
npm cache clean --force
rm -rf .next
npm run dev
```

# GitHub CLI mendukung gh run list dengan output JSON termasuk databaseId, dan gh run delete untuk menghapus run.

## versi PowerShell yang menyisakan 10 workflow run terbaru dan menghapus semua run yang lebih lama.

```powershell
cd E:\thechoosentalksnext
# 1) Pastikan GitHub CLI sudah login
gh auth status

# 2) Lihat 15 run terbaru dulu sebagai preview
gh run list --limit 15

# 3) Ambil semua run, urutannya terbaru -> lama, lalu simpan hanya 10 terbaru
$runIdsToDelete = gh run list --limit 200 --json databaseId --jq ".[10:] | .[].databaseId"

# 4) Hapus semua run di luar 10 terbaru
$runIdsToDelete | ForEach-Object {
    gh run delete $_
}

# 5) Verifikasi hasil akhir
gh run list --limit 20
```

## Kalau run Anda lebih dari 200 Pakai versi ini supaya lebih aman dan lengkap:
```powershell
cd E:\thechoosentalksnext

gh auth status

$runIdsToDelete = gh api repos/engelwillem/TCT--Hybrid--Monorepo/actions/runs --paginate --jq '.workflow_runs[].id' |
    Select-Object -Skip 10

$runIdsToDelete | ForEach-Object {
    gh api -X DELETE repos/engelwillem/TCT--Hybrid--Monorepo/actions/runs/$_
}

gh run list --limit 20
```

## gh api --paginate tersedia di CLI dan cocok untuk mengambil banyak halaman hasil API.

### Yang dilakukan command ini
- gh auth status memastikan Anda sudah login.
- gh run list --limit 200 --json databaseId --jq ".[10:] | .[].databaseId" mengambil ID run mulai dari urutan ke-11, jadi 10 terbaru aman.
- gh run delete <id> menghapus run satu per satu.

### Saran aman sebelum eksekusi
Kalau mau lebih hati-hati, jalankan ini dulu untuk melihat ID mana yang akan dihapus:
```powershell
gh run list --limit 50 --json databaseId,workflowName,createdAt,conclusion --jq ".[10:]"
```

Kalau Anda mau, saya juga bisa buatkan versi yang hanya membersihkan workflow tertentu sambil tetap menyisakan 10 run terbaru.

