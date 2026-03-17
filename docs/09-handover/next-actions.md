# Next Actions

## Immediate
1. Eksekusi `Apex Redirect Validation Checklist` menggunakan URL Uji Strict: `http://thechoosentalks.org`, `https://thechoosentalks.org`, `http://thechoosentalks.org/today`, `https://thechoosentalks.org/community`.
2. Selesaikan mitigasi Auth Header cPanel (Patch `.htaccess` sudah siap, butuh uji *Server Validation* nyata).
3. URGENT: TLS SAN / Domain Binding untuk Host WWW. Status `www.thechoosentalks.org` saat ini terkunci di `ERR_CERT_COMMON_NAME_INVALID`. Admin Server / Registrar WAJIB mengeksekusi 3 lapisan pemeriksaan eksternal mutlak (DNS CNAME ke Edge, Edge Panel Domain Binding, & TLS SAN Certificate Re-issue ganda). Tidak ada sentuhan di dalam repositori kode yang bisa menambal ini. Rujuk checklist eksekusi murni pada Blocker #6.
4. Bersihkan laman tersisa (`/library`, `/visitors`) karena fondasi warna dan sistem (_Globals.css_, Token CSS Dawn Theme, dsb) telah mapan. Serta ganti keping desain `MobileAppLayout` dan `Today` agar menyerap _spacing_ p-8 dan _glass drop-shadows_ baru.

## After Immediate
1. Rapihkan halaman sisa (`/versehub`, `/community`, `/paths`) dengan tata letak (_Layout Shell_) elegan (warna Twilight cerah, sudut _rounded_ lapang, efek _glassmorphism_ tipis).
2. Siapkan release-readiness report

## Execution Rule
Jangan buka step berikutnya sebelum step sekarang berstatus PASS atau BLOCKED.
