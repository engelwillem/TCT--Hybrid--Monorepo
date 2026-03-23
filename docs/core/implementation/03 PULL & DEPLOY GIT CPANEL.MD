# Pull & Deploy Git cPanel

Dokumen ini menjelaskan alur operator backend dari lokal sampai runtime cPanel live.

Fokus dokumen ini:
- kapan backend perlu dipull dan dideploy
- urutan kerja operator yang benar
- bagaimana memisahkan frontend auto-deploy vs backend manual deploy

Kalau Anda butuh command siap copy-paste, buka:
- [04 SCRIPT PULL & DEPLOY GIT CPANEL.MD](e:/thechoosentalksnext/docs/CORE/implementation/04%20SCRIPT%20PULL%20%26%20DEPLOY%20GIT%20CPANEL.MD)

Kalau Anda butuh pemahaman struktur server dari nol, buka:
- [05 GUIDE BOOK FULL END-TO-END CPANEL MAPPING.md](e:/thechoosentalksnext/docs/CORE/implementation/05%20GUIDE%20BOOK%20FULL%20END-TO-END%20CPANEL%20MAPPING.md)

## 1. Reality Model

Project ini memakai model hybrid monorepo:

- frontend:
  - source di monorepo
  - runtime production auto-redeploy dari `main`
- backend:
  - source di monorepo
  - runtime production **tidak** auto-deploy
  - runtime baru berubah setelah operator menjalankan deploy backend di cPanel

## 2. Kapan Operator Harus Melakukan Deploy Backend

Anda perlu deploy backend kalau ada perubahan pada hal-hal seperti:

- route Laravel
- controller
- middleware
- config backend
- auth/session/sanctum behavior
- resource/serializer
- logic profile/community/today/versehub di backend

Anda **tidak** perlu deploy backend hanya karena:

- ada perubahan frontend-only
- ada perubahan dokumen
- ada perubahan UI yang tidak menyentuh runtime Laravel

## 3. Urutan Kerja Operator yang Benar

1. siapkan perubahan di lokal
2. commit dan push ke `main`
3. frontend akan ikut auto-redeploy sendiri
4. kalau perubahan menyentuh backend, operator masuk ke cPanel
5. jalankan deploy backend manual
6. verifikasi route dan endpoint
7. baru lakukan retest aplikasi

## 4. Alur Minimal Operator

### Dari Lokal

Lakukan:

- `git status`
- cek file backend yang masuk commit
- push ke `main`

### Dari cPanel

Lakukan:

- precheck script
- jalankan `deploy.sh`
- baca target `current`
- cek route penting
- cek endpoint dasar

## 5. Apa yang Sebenarnya Dilakukan Deploy Backend

Secara operasional, deploy backend pada server ini:

1. menarik source backend dari monorepo branch `main`
2. mematerialisasi release baru di `releases/<timestamp>`
3. melink `.env` dari `shared/.env`
4. melink `storage` dari `shared/storage`
5. sync `public/` ke `public_html`
6. menggeser symlink `current`
7. menjalankan healthcheck
8. menyimpan beberapa release untuk rollback

## 6. Jalur Runtime yang Harus Dipahami

```text
GitHub monorepo
-> deploy.sh di server
-> releases/<timestamp>
-> symlink current
-> current/public/index.php
-> public_html/index.php bridge
-> request publik
```

## 7. Jalur State Bersama yang Harus Dipahami

```text
shared/.env
shared/storage
-> dipakai oleh release aktif mana pun
-> tidak ikut hilang saat release berganti
```

## 8. Verifikasi Setelah Deploy

Minimal verifikasi:

- `readlink -f current`
- `php artisan route:list | grep ...`
- `curl -i https://api.thechoosentalks.org/api/today/session`
- `curl -i` ke login/register dengan payload invalid untuk melihat route tetap hidup

## 9. Kapan Harus Rollback

Rollback masuk akal kalau:

- deploy script gagal di tengah
- route inti hilang
- endpoint dasar tiba-tiba tidak merespons wajar
- release baru jelas merusak runtime

Rollback tidak boleh jadi kebiasaan panik. Lihat log dulu kalau masih aman.

## 10. Dokumen Turunan yang Harus Dibaca

Urutan baca yang paling baik:

1. [01 READING ORDER CPANEL OPERATOR PACKAGE.md](e:/thechoosentalksnext/docs/CORE/implementation/01%20READING%20ORDER%20CPANEL%20OPERATOR%20PACKAGE.md)
2. [02 QUICK START 5 MENIT CPANEL OPERATOR.md](e:/thechoosentalksnext/docs/CORE/implementation/02%20QUICK%20START%205%20MENIT%20CPANEL%20OPERATOR.md)
3. [05 GUIDE BOOK FULL END-TO-END CPANEL MAPPING.md](e:/thechoosentalksnext/docs/CORE/implementation/05%20GUIDE%20BOOK%20FULL%20END-TO-END%20CPANEL%20MAPPING.md)
4. [04 SCRIPT PULL & DEPLOY GIT CPANEL.MD](e:/thechoosentalksnext/docs/CORE/implementation/04%20SCRIPT%20PULL%20%26%20DEPLOY%20GIT%20CPANEL.MD)
5. [06 CPANEL SERVER FULL MAIN BLUEPRINT MAP.md](e:/thechoosentalksnext/docs/CORE/implementation/06%20CPANEL%20SERVER%20FULL%20MAIN%20BLUEPRINT%20MAP.md)
