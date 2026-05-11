warning extension seperti curl/openssl/mbstring/pdo_sqlite tidak bisa diload. Langkah: 1. Jalankan perintah dari **Terminal Laragon** (bukan terminal biasa) atau set PATH. 2. Pastikan PHP yang dipakai minimal **8.2**

Siap 👍 Kita fokus STEP 1 dulu (Stabilkan Local Environment) supaya nggak loncat-loncat dan kamu nggak kelewat current step.

Kita pecah super pelan dan newbie-friendly ya.

🎯 STEP 1 — Bikin php Bisa Dikenali (Fix Error Ini Dulu)

Error kamu:

'php' is not recognized as an internal or external command


Artinya:
👉 Windows kamu tidak tahu lokasi php.exe
👉 Biasanya karena PATH belum benar ATAU kamu tidak pakai Terminal Laragon

🧭 Cara yang BENAR Jalankan PHP di Laragon
✅ Cara Paling Aman (Recommended)
1️⃣ Buka Laragon

Buka aplikasi Laragon

Pastikan statusnya:

Apache: Running
MySQL: Running


Kalau belum, klik Start All

# Masuk windows Powershell

## 🔥 Langkah pamungkas yang pasti berhasil)
Ketik ini untuk tes langsung dari PATH:
- Get-Command php -ErrorAction SilentlyContinue

## Pastikan yang dipanggil itu php.exe beneran
Di PowerShell, jalankan:
- php.exe -v

Mantap ✅ berarti PHP kamu sudah bisa dipanggil, minimal sebagai php.exe.

Sekarang target kita tinggal 1 langkah kecil: bikin php -v juga jalan (tanpa .exe). Ini biasanya karena PowerShell belum “ngeh” command baru, atau ada alias/function bernama php yang bentrok.

Kita tetap 1 step aja ya.

🎯 STEP 3I — Cek apakah php itu alias (bentrok)

Jalankan ini di PowerShell:

Get-Alias php -ErrorAction SilentlyContinue

✅ Kalau outputnya ADA (misalnya ada alias “php → …”)

Berarti php ketimpa alias. Kita hapus aliasnya (hanya untuk sesi ini):

Remove-Item Alias:php -ErrorAction SilentlyContinue


Lalu tes lagi:

php -v

✅ Kalau output Get-Alias KOSONG (tidak ada alias)

Berarti ini cuma masalah cache sesi / refresh. Coba panggil pakai “command resolver”:

& php -v


Kalau masih gagal juga, tutup PowerShell dan buka lagi, lalu coba:

php -v

Nice ✅ Get-Alias php kosong = nggak ada alias yang bentrok.

Sekarang yang kamu jalankan terakhir & php -v belum ngasih output (di chat kamu nggak muncul hasilnya), jadi kemungkinan:

command php masih dianggap “nggak ada” (PATH belum kebaca di sesi ini), atau

sebenarnya ada, tapi PowerShell belum resolve dan butuh refresh sesi.

Kita kunci dengan cara yang paling pasti dan tetap step-by-step.

🎯 STEP 3J — Cek resolusi command php (bukan php.exe)

Jalankan ini:

Get-Command php -All

Interpretasi cepat

Kalau ada baris php.exe → harusnya php -v bisa.

Kalau tidak ada → PATH untuk nama php belum kebaca di sesi ini.

✅ STEP 3K — Tes php sekali lagi dengan cara paling “paksa”
cmd /c "php -v"


Ini jalanin php -v via CMD.
Kalau di CMD berhasil tapi di PowerShell gagal → berarti PowerShell kamu perlu refresh/session issue.

✅ STEP 3L — Solusi paling bersih (kalau masih gagal)

Tutup PowerShell, buka PowerShell baru (benar-benar baru), lalu tes:

php -v

YES ✅✅✅ Beres total!

Sekarang status kamu:

php -v ✅ jalan dari mana saja

PHP versi 8.3.30 ✅ (lebih dari cukup)

Jadi STEP “php dikenali” selesai. Kita lanjut ke masalah yang kamu sebut dari awal:

warning extension curl/openssl/mbstring/pdo_sqlite tidak bisa diload

🎯 STEP 4 — Cek Extension yang Aktif (biar jelas yang missing apa)
4A) Lihat file php.ini yang dipakai

Jalankan:

php --ini


Nanti keluar info seperti:

Loaded Configuration File → ini php.ini yang dipakai

Scan for additional .ini files → folder tambahan config

👉 Ini penting supaya kita edit php.ini yang benar (nggak salah file).

4B) Cek extension yang kebaca (curl/openssl/mbstring/sqlite)

Jalankan ini (boleh copy-paste):

php -m | findstr /i "curl openssl mbstring pdo_sqlite sqlite"


Interpretasi:

Kalau ada yang muncul → extension itu aktif ✅

Kalau kosong untuk salah satu → extension itu belum ke-load ❌

4C) (Optional tapi membantu) Lihat semua warning saat start

Jalankan:

php -v


Lihat apakah ada baris warning sebelum output versi.

Sip—ini hasilnya bersih banget ✅

Kondisi sekarang (ringkas)

Loaded php.ini sudah jelas:
E:\Local Sites\laragon\bin\php\php-8.3.30-Win32-vs16-x64\php.ini

Extension yang dulu bikin warning sekarang SUDAH AKTIF:

curl ✅

openssl ✅

mbstring ✅

pdo_sqlite ✅

sqlite3 ✅

php -v juga tanpa warning ✅

Artinya: STEP “Stabilkan Local Environment” sudah beres. 🎉

🎯 NEXT STEP (Step 2 versi plan kamu): Validasi Composer (biar siap install vendor)

Karena tujuan akhirnya deploy Laravel (atau PHP project) dan kamu butuh vendor/, kita cek Composer sekarang.

STEP 5A — Cek Composer ada atau belum

Jalankan:

composer -V

Kalau keluar versi Composer → ✅ lanjut Step 5B
Kalau error “composer not recognized” → kita install Composer (simple banget)
STEP 5B — Tes install dependency (di folder project)

Masuk ke folder project kamu (yang ada composer.json), lalu:

composer install


Mantap ✅ Composer kamu sudah siap.

Sekarang kita masuk ke bagian “plan final 2 skenario” tapi tetap per step dan newbie-friendly.

🎯 STEP 6 — Pilih Skenario Deploy (biar saya bisa eksekusi langkahnya)
🅰️ Skenario A (Ideal) — Server punya SSH + Composer

Ilustrasi:

Kamu “masak” source code di lokal

Di server, kita “masak” vendor langsung pakai Composer (lebih rapi & ringan)

✅ Pro:

Upload lebih kecil (nggak bawa vendor/)

Lebih aman & standar

Update dependency gampang

📌 Butuh:

Akses SSH

composer tersedia di server

🅱️ Skenario B (Paling kompatibel shared hosting) — Tanpa SSH/Composer

Ilustrasi:

Kamu “masak semuanya” di lokal (termasuk vendor/)

Ke server tinggal “antar makanan jadi” (upload semua)

✅ Pro:

Bisa jalan di hosting yang super ketat (cPanel biasa)

Tidak butuh SSH

⚠️ Kontra:

Upload lebih berat (karena vendor/ besar)

Deploy lebih lama

📌 Butuh:

Cuma File Manager / FTP

✅ STEP 6A — Jawab 2 pertanyaan cepat (cukup pilih aja)

Di cPanel kamu ada menu Terminal/SSH Access?

Ada / Tidak ada

Kamu mau pakai skenario yang mana?

Ketik: A atau B

Kalau kamu bingung: pilih B (karena shared hosting paling sering nggak ada SSH).


