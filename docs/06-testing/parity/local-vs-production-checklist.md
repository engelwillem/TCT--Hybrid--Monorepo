# Local vs Production Checklist

## Konvensi Target Environment
| Target | Local Development | Production |
|--------|-------------------|------------|
| Frontend | Next.js Node dev-server (`localhost:9002`) | Tencent Edge Node.js Runtime |
| Backend | PHP Artisan Serve (`localhost:8000`) | cPanel Shared/Dedicated Hosting Apache |

## Matriks Pengecekan Kritis

### 1. API Contract Parity
- [ ] Apakah HTTPS/HTTP routing API backend konsisten secara port/origin di cPanel?
- [ ] Apakah `OPTIONS` preflight rute API `/api/v1/*` terblokir oleh *firewall* / *mod_security* di cPanel?

### 2. Environment Variables (*Env parity*)
- [ ] *Symmetric keys* NEXT_PUBLIC backend sinkron antara lokal dan Tencent Edge.
- [ ] Laravel `APP_URL`, `SANCTUM_STATEFUL_DOMAINS`, dan `SESSION_DOMAIN` sesuai dengan rute Tencent Edge?

### 3. Database Schema
- [ ] Skema relasional yang menyokong *MemberPost* metadata di database lokal MySQL sama persis dengan tabel *production* cPanel.

### 4. Storage / Asset URL Behavior
- [ ] Unggahan avatar pengguna teresolusi dengan benar dan dapat di-*read* langsung tanpa konfigurasi *Storage Link* manual di struktur folder `public_html/storage` (cPanel issue yang terisolasi).

### 5. Auth / Session Parity
- [ ] Token Bearer (*Firebase Custom Sync*) ditangkap aman lewat HTTP Header *server-to-server*/Edge request tanpa terpotong Apache cPanel *Header stripping*.

## Status Verifikasi Global
- **NEEDS SERVER VALIDATION** (Fase deploy/staging di struktur _Tencent-cPanel_ belum dieskalasi atau terhubung dengan alat *E2E bypass* jarak jauh).
