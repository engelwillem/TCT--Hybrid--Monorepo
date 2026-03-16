# Environment Diff Log

## Purpose
Mencatat perbedaan environment yang dapat menyebabkan drift perilaku antara local, cPanel backend, dan Tencent Edge frontend.

Jangan isi nilai rahasia. Catat nama variable, peran, expected behavior, dan mismatch-nya.

## Status Legend
- OPEN
- VERIFIED
- BLOCKED
- NEEDS SERVER VALIDATION
- CLOSED

## Entry Template

### Entry ID
`env-diff-000`

### Date
YYYY-MM-DD

### Layer
- backend
- frontend
- proxy
- shared

### Variable Name
Contoh:
- APP_URL
- NEXT_PUBLIC_APP_URL
- SANCTUM_STATEFUL_DOMAINS
- SESSION_DOMAIN
- ASSET_URL
- APP_ENV

### Secret?
- yes / no

### Expected Role
Jelaskan fungsi variable terhadap runtime

### Expected Local Value Pattern
Contoh:
- `http://localhost:9002`
- `localhost,127.0.0.1`
- production host pattern

### Expected Production Value Pattern
Contoh:
- backend host production
- frontend Tencent Edge host
- cookie domain production

### Observed Local State
- configured / missing / unknown
- notes:

### Observed Production State
- configured / missing / unknown
- notes:

### Risk if Drift Exists
Contoh:
- redirect salah host
- CSRF gagal
- cookie tidak terkirim
- upload URL rusak
- share URL salah
- API proxy gagal

### Related Flows
- auth
- profile
- inbox
- community
- today
- versehub
- journeys
- all

### Verification Steps
1.
2.
3.

### Resolution
- documented
- updated env
- pending server update
- pending validation

### Status
- OPEN
- VERIFIED
- BLOCKED
- NEEDS SERVER VALIDATION
- CLOSED

---

## Critical Variables Checklist
### Backend
- [ ] APP_ENV
- [ ] APP_URL
- [ ] ASSET_URL
- [ ] SESSION_DOMAIN
- [ ] SANCTUM_STATEFUL_DOMAINS
- [ ] CORS / frontend allowed origins related vars
- [ ] filesystem/public storage related vars

### Frontend
- [ ] NEXT_PUBLIC_APP_URL
- [ ] NEXT_PUBLIC_API_URL or equivalent
- [ ] any Firebase/public auth keys used by runtime
- [ ] any share/og/public asset host config

### Shared / Operational
- [ ] database connection pattern documented
- [ ] queue/mail toggles that affect UX documented
- [ ] build-time vars for Tencent Edge documented
- [ ] cPanel runtime assumptions documented

---

## Active Environment Drift Entries
Tambahkan entry baru di bawah bagian ini dengan urutan terbaru di atas.
