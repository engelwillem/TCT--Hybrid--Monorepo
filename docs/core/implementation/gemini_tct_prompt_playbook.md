Saya sudah audit dua repo Anda. Kesimpulannya: repo hybrid **sudah bukan blank migration**. Fondasinya sudah ada di `backend-api/routes/api.php` dan banyak proxy Next di `src/app/api/*`, jadi strategi terbaik adalah **selesaikan gap per domain**, bukan migrasi ulang total.

Temuan paling penting dari repo sekarang:

* **VerseHub** masih jadi gap terbesar untuk parity end-to-end.
* **Profile/Auth** ada mismatch nyata: `src/app/profile/page.tsx` mengirim **`POST /api/profile`** untuk avatar, padahal route Next saat ini hanya `GET/PATCH/DELETE`.
* `src/app/profile/page.tsx` juga memanggil **`/api/versehub/reader-actions/summary`**, sementara summary masih tampak hidup di jalur web Laravel, bukan API decoupled yang rapi.
* Dokumen internal hybrid ada yang **tertinggal dari kode aktual**, jadi Gemini harus selalu **audit file nyata dulu**, jangan percaya docs mentah-mentah.

Di bawah ini pola prompt yang paling cocok untuk Gemini Anda: pendek, bertahap, dan keras soal “jangan lompat sebelum beres”.

## Prompt pembuka sesi

Pakai ini sekali di awal chat Gemini:

```text
Kamu adalah principal engineer untuk 2 repo saya: `/home/user/studio/docs/TCT--Laravel--Legacy-main.zip` (sumber) dan `TCT--Hybrid--Monorepo-main` (target adalah root web saat ini). Selalu audit repo dulu, kerjakan 1 masalah sampai 100% selesai, jangan lompat step, jangan asumsi, dan jangan perluas scope. Output wajib: TEMUAN -> PATCH PLAN -> PATCH -> VERIFIKASI -> STATUS: PASS/BLOCKED.
```

## Urutan kerja yang paling tepat

Untuk kondisi repo Anda sekarang, urutan aman adalah:

1. VerseHub parity + API-first penuh
2. Profile/Auth lifecycle hardening
3. Inbox/DM end-to-end
4. Community hardening
5. Today hardening
6. Channels + Sabbath School hardening
7. Study Paths hardening
8. Purge frontend legacy dari Laravel setelah parity benar-benar aman

## Prompt inti yang dipakai berulang

### 1) Audit domain

```text
Audit domain `[NAMA_DOMAIN]` dengan membandingkan repo legacy vs hybrid. Cari gap parity, file kunci, endpoint yang ada/belum ada, route mismatch, mock/fallback, dan bug nyata. Jangan coding dulu. Output singkat: GAP, FILE, API, PRIORITAS, STATUS.
```

### 2) Kunci 1 scope

```text
Ambil 1 gap paling prioritas di domain `[NAMA_DOMAIN]`. Definisikan target selesai 100%, file yang boleh diubah, test/cek yang wajib lulus, dan risiko kalau salah. Jangan coding dulu.
```

### 3) Implement backend dulu

```text
Implement backend Laravel API untuk `[FITUR]` di repo hybrid dengan meniru behavior repo legacy. Reuse logic lama bila memungkinkan, return JSON konsisten, validasi ketat, dan jangan sentuh frontend dulu.
```

### 4) Benahi proxy Next

```text
Tambahkan atau perbaiki Next route handler untuk `[ENDPOINT]`. Pastikan method, query string, auth header, FormData, dan status code diproxy benar ke Laravel API.
```

### 5) Hubungkan frontend

```text
Hubungkan halaman/komponen `[HALAMAN]` ke endpoint baru. Pertahankan UI parity dengan legacy, hapus mock/fallback palsu untuk alur tulis, dan jangan ubah desain tanpa alasan kuat.
```

### 6) Verifikasi keras

```text
Verifikasi alur `[FITUR]` sampai tuntas. Cek compile, type, lint, route, payload, error state, auth state, dan flow manual. Jika belum 100% pass, jangan lanjut ke step berikutnya.
```

### 7) Cleanup

```text
Rapikan hasil patch `[FITUR]`: naming, type, duplikasi, dead code, dan error handling. Behavior harus tetap sama. Tampilkan file yang diubah dan sisa risiko. Kalau masih ada risiko, status BLOCKED.
```

### 8) Prompt anti-lompat

```text
Stop. Jangan lanjut ke step berikutnya. Selesaikan masalah saat ini sampai PASS atau nyatakan BLOCKED dengan blocker yang spesifik, file terkait, dan langkah pembuka blocker yang paling kecil.
```

## Prompt bertahap khusus proyek TheChosenTalks

### Step 1 — mulai dari audit paling benar

```text
Audit penuh TheChosenTalks legacy vs hybrid, tetapi fokus hanya pada 1 gap paling kritis yang paling dekat ke production impact. Jangan coding dulu. Bandingkan file nyata, bukan docs saja. Output: GAP TERBESAR, FILE TERKAIT, ROOT CAUSE, LANGKAH EKSEKUSI TERKECIL, STATUS.
```

### Step 2 — eksekusi gap paling kritis

```text
Ambil gap paling kritis tadi dan selesaikan end-to-end di repo hybrid: backend Laravel API -> Next proxy -> frontend -> verifikasi. Jangan pindah ke masalah lain sebelum PASS 100%.
```

### Step 3 — VerseHub

```text
Audit penuh domain VerseHub antara legacy dan hybrid. Fokus pada reader, verse share, comments, reader-actions, mentor, reflections, OG, dan route parity. Output hanya gap nyata dan urutan implementasi terkecil-ke-terbesar.
```

### Step 4 — Profile/Auth

```text
Audit dan benahi profile/auth lifecycle di hybrid. Fokus pada profile read/update, password, 2FA, avatar upload, logout, token invalidation, dan mismatch route/method. Selesaikan 1 bug paling kritis dulu sampai PASS.
```

### Step 5 — Inbox/DM

```text
Audit Inbox/DM legacy vs hybrid. Pastikan list thread, open thread, send message, approve message, mark all read, auth, dan optimistic UI benar. Ambil 1 gap paling kritis dan selesaikan end-to-end.
```

### Step 6 — Community

```text
Audit Community di hybrid. Fokus pada create post, comments, pray, bookmark, auth failure, media upload, share flow, dan fallback palsu. Benahi gap paling berisiko tanpa mengubah UI premium yang sudah ada.
```

### Step 7 — Today

```text
Audit Today page di hybrid. Fokus pada daily verse, feed, rituals, fallback backend, dan payload parity dari Laravel. Kecilkan fallback palsu dan pastikan data API jadi source of truth.
```

### Step 8 — Channels + Sabbath School

```text
Audit Channels dan Sabbath School di hybrid. Fokus pada route parity, lesson/day payload, comments CRUD, membership state, dan error UX. Selesaikan 1 gap paling kritis dulu sampai PASS.
```

### Step 9 — Purge legacy frontend

```text
Audit apakah frontend Next sudah benar-benar parity dan API-first. Jika ya, buat rencana purge aman untuk frontend legacy di Laravel backend: file target, dependency yang dihapus, urutan delete, dan rollback plan. Jangan delete apa pun sebelum checklist PASS.
```

## Prompt harian untuk coding biasa

### Bugfix

```text
Perbaiki bug `[DESKRIPSI]` di repo hybrid. Temukan root cause dulu, buat patch sekecil mungkin, verifikasi sampai pass, lalu ringkas file yang berubah. Jangan refactor area lain.
```

### Refactor

```text
Refactor area `[FILE/DOMAIN]` untuk clean code tanpa mengubah behavior. Hilangkan duplikasi, rapikan type, kecilkan kompleksitas, dan tampilkan bukti bahwa behavior tetap sama.
```

### Optimasi

```text
Optimasi `[HALAMAN/FLOW]` dengan perubahan minimal dan dampak terbesar. Fokus pada render berlebih, request tidak perlu, bundle berat, atau query mahal. Jangan ubah UX kecuali memang memperbaiki masalah.
```

### Feature baru

```text
Tambahkan fitur `[FITUR]` ke hybrid dengan pola arsitektur yang sudah ada. Buat langkah paling kecil yang bisa selesai end-to-end, lalu verifikasi dulu sebelum menambah scope.
```

### Code review

```text
Review patch/area `[FILE/PR/FITUR]` dengan mode reviewer keras. Cari bug logika, route mismatch, auth issue, typing lemah, fallback palsu, duplikasi, dan technical debt. Output singkat: TEMUAN, RISIKO, FIX TERKECIL.
```

## Prompt pertama yang paling saya sarankan Anda pakai sekarang

Mulai dari ini:

```text
Audit penuh TheChosenTalks legacy vs hybrid, tetapi fokus hanya pada 1 gap paling kritis yang paling dekat ke production impact. Jangan coding dulu. Bandingkan file nyata, bukan docs saja. Output: GAP TERBESAR, FILE TERKAIT, ROOT CAUSE, LANGKAH EKSEKUSI TERKECIL, STATUS.
```

Lalu lanjut dengan ini:

```text
Ambil gap paling kritis tadi dan selesaikan end-to-end di repo hybrid: backend Laravel API -> Next proxy -> frontend -> verifikasi. Jangan pindah ke masalah lain sebelum PASS 100%.
```

Saya juga sudah rapikan semua ini jadi file siap pakai: [gemini_tct_prompt_playbook.md](sandbox:/mnt/data/gemini_tct_prompt_playbook.md)
