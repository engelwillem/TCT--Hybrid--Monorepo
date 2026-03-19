# Current Status

## Frontend Product Snapshot (Updated 2026-03-18)

Core experience sekarang sudah bergerak ke arah utama produk:

- Landing `/` sudah diganti menjadi narasi spiritual companion yang fokus.
- Shortcut utama di Today sudah dipindah dari `channels` ke `paths`.
- CTA refleksi dari detail Paths sudah handoff ke Community composer (`intent=reflection`).
- Halaman `channels` masih tersedia sebagai lapisan transisi dengan arahan ke pilar inti.
- Permukaan legacy `library`, `visitors`, dan `gate-updates` sekarang diperlakukan sebagai legacy bridge menuju route inti.

Implikasi:

- Drift antara IA lama vs IA baru sudah berkurang signifikan di entry point utama.
- User baru lebih cepat masuk ke flow inti: Today -> VerseHub/Paths -> Community.
- Risiko kebingungan akibat halaman lawas yang masih "terlihat aktif" berhasil ditekan.

## Summary

Project state is now split more cleanly across infrastructure, backend deployment, and frontend product work.

The most important recent shift came from direct manual cPanel/server audit. That audit confirmed that the production backend is **not** a blank Laravel root and **not** a simple single-folder deploy. Production already uses a release-based deployment architecture with:

- `releases/`
- `shared/.env`
- `shared/storage`
- `current`
- `deploy.sh`
- `rollback.sh`
- `healthcheck.sh`

It also confirmed that:

- `~/public_html/index.php` forwards to:
  `/home/thechoosentalks/deploy/apps/thechoosentalks/current/public/index.php`
- the existing deployment model was artifact-based
- the repo-side deployment redesign has now been adapted toward **Path B1**:
  preserve `releases/current/shared`, but replace artifact materialization with release-based shallow clone + sparse checkout of `backend-api`

## Stable / Closed Areas

The following product/domain tracks are already considered stable/closed for the current phase:

- Profile lifecycle — CLOSED
- Inbox / DM — CLOSED
- Community — CLOSED
- VerseHub — CLOSED
- Spiritual Journeys — CLOSED

Infrastructure/public host progress already achieved:

- `https://www.thechoosentalks.org` is healthy
- EdgeOne binding for `www` is effective
- HTTPS for `www` is deployed and working

Frontend system progress already achieved:

- visual foundation / shell reset has passed
- Core V1 navigation has been tightened
- Dawn/light-direction shell cleanup has started successfully

## In Progress

### Backend deployment redesign
Repo-side deployment redesign is now considered **PASS**.

What has been completed:

- push-based GitHub Actions deploy via SSH/SCP has been retired as the preferred path
- deployment redesign now targets a pull-style release materialization model
- existing production release architecture is being preserved
- Path B1 was selected:
  release-based shallow clone with sparse checkout of `backend-api`
- `backend-api/deploy.sh` has been adapted repo-side accordingly

### Manual server execution
Manual cPanel/server work has started and several steps are already complete:

- server environment validated:
  - `php` available
  - `composer` available
  - `git` available
- current symlink verified
- existing `deploy.sh` backed up
- replacement `deploy.sh` placed server-side
- `/home/thechoosentalks/.deploy_secret` created
- GitHub deploy key created
- GitHub SSH authentication works

### Backend codebase cleanup (Laravel scope narrowing)
Cleanup menuju scope backend saat ini sudah berjalan dan progres utama tercapai:

- web legacy routes telah dipangkas ke minimum yang masih relevan untuk Next + Filament
- auth/web legacy controllers dan middleware yang tidak dipakai lagi telah dihapus
- dependency cleanup fase 2 selesai untuk paket yang sudah tidak terpakai:
  - `tightenco/ziggy` removed
  - `laravel/breeze` removed
- fase 3 selesai:
  - controller campuran API/Inertia sudah direfactor menjadi API JSON-only
  - `inertiajs/inertia-laravel` removed (final)
- validasi integritas aplikasi pasca-cleanup: route list dan composer validation tetap lulus

## Newly Learned From Manual cPanel Audit

The manual shell audit changed several earlier assumptions.

### Production backend layout is real and already operational
The server already has a real production deployment structure. This means deployment redesign must **adapt** an existing system rather than replace it from scratch.

### `public_html` is only a bridge
`public_html` is not the full backend root. It acts as a webroot bridge to the active release through `current/public/index.php`.

### Existing deploy system is more mature than originally assumed
The presence of:

- release directories
- shared state
- rollback
- healthcheck
- current symlink switching

means production already has a zero-downtime style deployment shape worth preserving.

## Still Open / Unresolved

### Backend deploy execution not yet validated
Repo-side redesign is complete, but the new deployment path has **not yet been executed successfully on the real server**.

Still pending:

- create real webhook file in `public_html`
- validate webhook PHP syntax
- validate absolute paths in webhook
- run new `deploy.sh` manually
- verify release creation and `current` switch
- verify sparse-checkout materialization is complete and correct
- manually test webhook via `curl`
- only then wire GitHub Actions to the new webhook

### Apex HTTPS remains unresolved
`https://thechoosentalks.org` is still a separate unresolved server-side concern.

Current understanding:

- `www` is healthy and should remain the active public host
- apex HTTPS recovery still requires separate server-side handling
- webhook should use the healthy `www` host for now

### Frontend V1 redesign batch is paused, not cancelled
Frontend shell/foundation reset already passed, but deeper V1 surface redesign has not resumed yet because backend deployment execution and server reality work took priority.

Pending frontend continuation later:

- Today redesign
- VerseHub surface redesign
- Community surface redesign
- Paths surface redesign
- route deprecation/removal cleanup after redesign stabilizes


Deploy backend sekarang sukses penuh.
Status akhir yang sudah terbukti:
frontend public:
https://thechoosentalks.org → OK
https://www.thechoosentalks.org → OK

backend:
https://api.thechoosentalks.org/api/v1/today → OK JSON
https://admin.thechoosentalks.org/admintalk/login → OK

deploy:
release aktif 20260318155349
healthcheck OK
prune fix berhasil
rollback logic tetap ada

Jadi fondasi production sekarang sudah rapi:
frontend = Tencent Edge
backend/api/admin = cPanel Laravel
DNS = Cloudflare
deploy backend = hardened dan working

Diagnosis akhir

Blocker besar Anda sebelumnya memang bukan fitur, melainkan:
DNS/domain routing kacau
deploy script rusak
env backend belum sesuai domain final
cleanup deploy tidak kompatibel
Semua itu sekarang sudah tertutup.


Bagus. Hasil audit end-to-end sekarang lulus di layer infrastruktur dan auth dasar.

Yang sudah terbukti benar

Frontend public live:
thechoosentalks.org → OK
www.thechoosentalks.org → OK

API backend live:
api.thechoosentalks.org/api/v1/today → 200 JSON

Admin backend live:
admin.thechoosentalks.org/admintalk/login → 200

CORS preflight dari frontend asli lulus:
apex → 204
www → 204
Access-Control-Allow-Origin sudah benar

Sanctum CSRF/session cookie sudah benar:
domain .thechoosentalks.org
secure
samesite=lax

Kesimpulan audit
Secara end-to-end, jalur frontend ↔ API sekarang sudah sehat untuk:
DNS
TLS
routing
backend env
CORS
Sanctum cookie issuance
deployment backend

Jadi blocker besar integrasi sudah selesai.

# hasil yang sangat penting:
Kesimpulan audit end-to-end

## Flow login sudah tembus penuh:
- csrf-cookie → 204
- POST /api/auth/login → 422 JSON valid

## response body backend terbaca normal:
These credentials do not match our records.

## Artinya:
- frontend → proxy → backend sudah berfungsi
- session/XSRF sudah benar
- JSON response sudah benar

error “tidak dapat terhubung ke server” yang tadi muncul adalah error handling UI lama, bukan kegagalan koneksi aktual

## Diagnosis akhir
Secara integrasi, sistem Anda sekarang sudah sehat.
Yang gagal sekarang hanya autentikasi karena kredensial tidak cocok, bukan karena infrastruktur.

# Apa artinya untuk project
Anda sudah menyelesaikan bagian tersulit:
- domain split frontend/backend
- TLS frontend
- proxy frontend ke Laravel
- cookie Sanctum
- deploy backend
- CORS
login endpoint end-to-end
