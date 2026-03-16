# Local vs Production Checklist

## Purpose
Memastikan parity perilaku antara:
- local development
- backend production di cPanel
- frontend production di Tencent Edge

Dokumen ini adalah checklist release gate, bukan catatan opini.

## Status Legend
- PASS
- BLOCKED
- NEEDS SERVER VALIDATION
- NOT STARTED

## Environment Targets
### Local
- Backend: Laravel local
- Frontend: Next.js local
- Database: local MySQL
- Storage: local/public storage

### Production
- Backend: Laravel di cPanel
- Frontend: Next.js di Tencent Edge
- Database: production MySQL
- Storage: production public/storage/CDN path

---

## 1. URL and Origin Parity
### Checks
- [ ] `APP_URL` local dan production terdokumentasi
- [ ] `NEXT_PUBLIC_APP_URL` local dan production terdokumentasi
- [ ] `NEXT_PUBLIC_API_URL` atau padanannya terdokumentasi
- [ ] Frontend origin Tencent Edge sesuai dengan origin yang diizinkan backend
- [ ] Redirect backend selalu mengarah ke frontend origin yang benar
- [ ] Share URL / OG URL memakai host production yang benar

### Notes
- Local:
- Production:
- Risks:
- Status:

---

## 2. Auth / Session / Sanctum Parity
### Checks
- [ ] Sanctum stateful domains sesuai
- [ ] Cookie domain/path/secure flags sesuai environment
- [ ] CSRF cookie bisa diterbitkan dan dibaca dengan benar
- [ ] Login/logout behavior sama di local dan production
- [ ] 401/403 behavior tidak disamarkan
- [ ] Authorization header tidak terpotong di cPanel/Apache
- [ ] Route proxy Next meneruskan auth data dengan benar
- [ ] Firebase/token sync flow tidak drift antar environment

### Notes
- Local:
- Production:
- Risks:
- Status:

---

## 3. API Contract Parity
### Checks
- [ ] Endpoint kritis merespons status code yang sama
- [ ] Shape payload sukses sama
- [ ] Shape validation error `422` sama
- [ ] Shape auth error `401/403` sama
- [ ] Redirect contract sama
- [ ] Upload endpoint tetap menerima format yang sama
- [ ] Pagination/query params berperilaku sama
- [ ] Empty/not-found behavior sama

### Critical Flows
- [ ] Auth login / forgot / reset
- [ ] Profile read / update / avatar / password / 2FA / delete
- [ ] Inbox list / thread / send / mark all read / approval
- [ ] Community feed / create post / comments / share
- [ ] Today / VerseHub / Journeys / lainnya yang aktif

### Notes
- Local:
- Production:
- Risks:
- Status:

---

## 4. Database Schema Parity
### Checks
- [ ] Migration set local dan production sama
- [ ] Tabel domain kritis ada di local dan production
- [ ] Kolom penting sama (type, nullable, default)
- [ ] Index penting sama
- [ ] Enum/status field sama
- [ ] Seed minimum untuk smoke test tersedia
- [ ] Tidak ada drift schema yang belum terdokumentasi

### Critical Tables
- [ ] users / profiles / personal_access_tokens
- [ ] inbox / messages / approvals related tables
- [ ] community / comments / reactions / bookmarks related tables
- [ ] journeys / content tables bila sudah dipakai
- [ ] tables lain yang menjadi dependency runtime

### Notes
- Local:
- Production:
- Risks:
- Status:

---

## 5. Storage / Asset / Upload Parity
### Checks
- [ ] Avatar upload path sama
- [ ] Community media path sama bila ada
- [ ] Public storage symlink/path valid di cPanel
- [ ] Asset URL yang dirender frontend valid di Tencent Edge
- [ ] OG image/share metadata memakai asset URL yang benar
- [ ] Next image/domain policy sesuai host production bila relevan

### Notes
- Local:
- Production:
- Risks:
- Status:

---

## 6. Build / Runtime Parity
### Checks
- [ ] Next build berhasil dengan env production-equivalent
- [ ] Laravel config/cache route cache aman untuk production
- [ ] Edge runtime assumptions terdokumentasi
- [ ] cPanel rewrite/redirect rules tidak bertabrakan dengan hybrid routes
- [ ] SSR/CSR behavior tidak bergantung pada local-only assumptions
- [ ] Proxy path dan rewrite path sama

### Notes
- Local:
- Production:
- Risks:
- Status:

---

## 7. Domain Release Gate
### Profile Lifecycle
- Local Status:
- Production Status:
- Notes:

### Inbox / DM
- Local Status:
- Production Status:
- Notes:

### Community
- Local Status:
- Production Status:
- Notes:

### Today
- Local Status:
- Production Status:
- Notes:

### VerseHub
- Local Status:
- Production Status:
- Notes:

### Relevance / Reflection / Journeys
- Local Status:
- Production Status:
- Notes:

---

## 8. Final Release Gate
### Blocking Issues
- None / list blockers here

### Residual Risks
- List only real risks

### Final Status
- PASS
- BLOCKED
- NEEDS SERVER VALIDATION
- NOT STARTED
