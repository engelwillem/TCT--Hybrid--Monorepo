# Branch Protection Checklist (Main)

Tanggal acuan: 2026-04-20
Repo: `thechoosentalksnext`
Branch target: `main`

## Tujuan

Mengunci merge ke `main` agar hanya lewat gate CI utama GitHub Actions.

## Rule yang harus aktif di GitHub

1. Require a pull request before merging
2. Require approvals: minimum 1
3. Dismiss stale approvals when new commits are pushed
4. Require status checks to pass before merging
5. Require branches to be up to date before merging
6. Include administrators (recommended)
7. Restrict force pushes
8. Restrict deletions

## Required Checks (wajib)

Set check wajib berikut:

- `Release Gate Status`
- `Code Scanning Precheck`

Catatan:
- `Release Gate Status` adalah ringkasan gate blocking dari workflow `.github/workflows/devsecops-e2e.yml`.
- Security + hygiene + artifact blocking tahap berjalan sudah tercakup di `Release Gate Status` (repo hygiene, gitleaks, artifact policy, trivy CRITICAL FS/container, dependency blocking stage).
- Dependency audit masih advisory sampai remediation debt dependency selesai.
- Jika Code Scanning belum aktif di repo GitHub, aktifkan dulu agar check CodeQL konsisten.

## Validation cepat setelah set rule

1. Buat PR kecil yang sengaja gagal typecheck.
2. Pastikan PR tertahan oleh `Release Gate Status`.
3. Perbaiki PR dan pastikan merge hanya bisa saat check kembali hijau.

## Ownership

- DevOps owner: maintain rule + update required checks saat policy berubah.
- Engineering lead: approve perubahan policy blocking/advisory.

