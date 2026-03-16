# API Contract Diff Log

## Purpose
Dokumen ini melacak perbedaan kontrak dan limitasi (CORS, Payload Rules, Header Stripping) antara Local Laravel 11 dan cPanel Backend (atau Next.js Server Actions di Tencent Edge).

## Log Entri

### 1. Parity Token Proxy Layer
- **Local Expected**: Firebase JWT dan Custom Token Bearer lulus verifikasi.
- **Production (cPanel) Risk**: Seringkali mod_security Apache menghapus header `Authorization` dari request secara *default* jika tidak ditangani via `.htaccess`.
- **Status Verifikasi**: **NEEDS SERVER VALIDATION**
- **Action Required**: Pastikan HTTP header rewrite `CGIPassAuth On` termuat di `.htaccess` cPanel sebelum mengesahkan parity.

### 2. URL Parameter "Smart Composer" (Community Endpoint)
- **Local Expected**: Payload `/api/v1/community/posts` diserap sukses beserta state UI di `localhost`.
- **Production Risk**: Parameter request mungkin terpotong di edge cacing cache (meski kecil kemungkinannya untuk POST).
- **Status Verifikasi**: BLOCKED (Masih di level *Frontend* perombakan *intent* lokal).
