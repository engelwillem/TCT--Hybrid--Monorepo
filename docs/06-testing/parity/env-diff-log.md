# Environment Config Diff Log

## Purpose
Mensinkronkan dan memantau perbedaan variabel di `.env` lokal `.env.local` (*NextJS*) dengan konfigurasi di peladen publik.

## Log Entri

### 1. SANCTUM_STATEFUL_DOMAINS 
- **Local Expected**: `localhost:9002` (Peladen Next) dan `127.0.0.1:8000` (Backend Laravel).
- **Production (cPanel) Risk**: `SANCTUM_STATEFUL_DOMAINS` harus berisi nama domain TCT (*The Chosen Talks*) yang beroperasi di *Tencent Edge*. Bila tidak ada, rute login dan *Auth Cookie/Proxy* akan dihancurkan oleh CSRF Laravel.
- **Status Verifikasi**: **NEEDS SERVER VALIDATION**
- **Action Required**: Tentukan origin/domain produksi sebelum rilis!

### 2. SESSION_DOMAIN
- **Local Expected**: `.localhost`
- **Production Risk**: Domain harus `.thechoosentalks.com` (atau sejenisnya). Kesalahan tanda titik (.) di awal sangat sensitif.
- **Status Verifikasi**: **PENDING**

### 3. NEXT_PUBLIC_API_URL
- **Local Expected**: `http://127.0.0.1:8000`
- **Production Risk**: `https://api.domain.com` (Mesti HTTP**S** untuk keamanan bearer token payload).
- **Status Verifikasi**: **PENDING**
