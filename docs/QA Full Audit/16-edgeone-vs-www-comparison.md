# EdgeOne vs WWW Comparison (16)

## Purpose
Melakukan validasi sinkronisasi antara domain referensi EdgeOne (Fresh) dan custom domain production WWW (Stale-suspected).

## Compared Domains
- **EdgeOne:** `https://thechoosentalks.edgeone.dev/`
- **WWW:** `https://www.thechoosentalks.org/`

## Comparison Summary
Berdasarkan audit live (2026-03-23 15:25), **kedua domain terpantau sudah SINKRON**. Keduanya telah menyajikan versi frontend "Intermediate-Fresh" yang sama (ditandai dengan tombol "Masuk" di halaman login). 

Namun, keduanya masih **STALE** terhadap commit terbaru (`1324b5d`) karena perbaikan rute `/register` dan logic `AppShell` untuk overlay VerseHub belum termaterialisasi di kedua domain.

## Route-by-Route Comparison
| Route | EdgeOne Result | WWW Result | Same or Different | Stale Indicator | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/` | Mulai dari hari ini | Mulai dari hari ini | **Same** | None | Sync sukses |
| `/login` | Button: "Masuk" | Button: "Masuk" | **Same** | None | Propagasi "Masuk" berhasil |
| `/login?intent=signup` | Mode: Signup (Visible) | Mode: Signup (Visible) | **Same** | None | Contract sync berhasil |
| `/register` | No Redirect (AppShell) | No Redirect (AppShell) | **Same** | **Both Stale** | Commit `1324b5d` belum live |
| `/versehub/id` | Overlay Overlap (Buggy) | Overlay Overlap (Buggy) | **Same** | **Both Stale** | AppShell update belum live |

## Visual Freshness Markers
- **Login Button:** "Masuk" (Berhasil menggantikan "Buka Blokir").
- **Signup UI:** Field "Nama Lengkap" dan "Konfirmasi Password" tampil di kedua domain.
- **Heading Hero:** "Mulai dari hari ini." aktif.

## Stale Indicators (Commit 1324b5d Lag)
- **VerseHub Overlay:** Bottom Nav masih tumpah tindih (overlapping) dengan sheet di kedua domain. Logic `isVersehubSheetActive` di `AppShell.tsx` belum berefek di runtime live.
- **Register Redirect:** Mengunjungi `/register` masih tidak melakukan redirect otomatis ke `/login?intent=signup`.

## Conclusion
`www.thechoosentalks.org` **TIDAK LAGI STALE** terhadap EdgeOne. Keduanya sudah pada versi build yang sama (Hash main-app: `92a6021aecd156dc`). Keterlambatan sekarang berada pada level propagasi build terbaru (Tencent pipeline) ke seluruh Edge nodes, bukan pada mismatch konfigurasi antar domain.

## Recommendation
1. Tunggu 5-10 menit untuk build Tencent terbaru (yang mengandung redirect `/register`).
2. Jangan lakukan audit E2E backend mendalam sampai `/register` redirect fungsional di `www`.
3. Operator disarankan melakukan **Purge Cache** di Tencent Dashboad untuk mempercepat propagasi commit `1324b5d`.
