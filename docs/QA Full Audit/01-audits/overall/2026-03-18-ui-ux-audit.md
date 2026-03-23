# UI/UX Audit - 2026-03-18

## Scope
Audit ini menilai:
- arah UI/UX yang sudah tertulis di `docs`
- realitas permukaan UI yang aktif di codebase
- gap antara visi produk dan pengalaman aktual

## Executive Verdict
Produk ini tidak lagi bergerak ke arah "website konten rohani biasa". Arah yang paling konsisten adalah:

`spiritual companion web app`

bukan blog, bukan forum generik, dan bukan library ayat semata.

Secara UI/UX, fondasinya sudah kuat:
- mobile-first
- mood-based relevance
- light/premium visual language
- handoff lintas domain (`Today` -> `VerseHub` -> `Community` -> `Paths`)

Namun saat ini pengalaman masih terasa seperti **dua produk yang belum sepenuhnya melebur**:
1. produk baru: tenang, app-like, relevan, fokus
2. produk lama: modular, banyak rute, dan belum sepenuhnya dibersihkan

## Product Direction Already Visible
Dari dokumen produk dan implementasi UI, bentuk produk yang paling nyata adalah:

### 1. Today sebagai "Context Router"
`/today` bukan homepage biasa. Ia sedang dibentuk menjadi layar pembuka yang membaca kondisi emosional/spiritual user lalu mengurutkan aksi berikutnya.

### 2. VerseHub sebagai utilitas inti
`/versehub` bukan sekadar halaman baca Alkitab. Ia adalah mesin inti untuk membaca, merenung, bertanya, menyimpan, dan membagikan konteks ke domain lain.

### 3. Community sebagai response layer
`/community` bukan feed sosial umum. Ia berfungsi sebagai tempat jawaban atas apa yang dibaca/dirasakan user dari Today, Paths, dan VerseHub.

### 4. Paths sebagai retention loop
`/paths` memindahkan pengalaman dari konsumsi konten menjadi pertumbuhan bertahap.

## What Is Strong Today

### 1. Product thesis sudah unik
Gabungan `Today + VerseHub + Community + Paths` membentuk ekosistem yang lebih khas daripada web rohani biasa.

### 2. Dawn Theme cukup konsisten
Bahasa visual yang terdokumentasi dan diterapkan sekarang sudah punya identitas:
- terang
- lembut
- premium
- breathing space besar
- glass-card / soft-shadow / rounded geometry

### 3. Mobile-app feel sudah terasa
`MobileAppLayout`, bottom-nav, sticky header, dan card-stack behavior membuat produk terasa seperti aplikasi, bukan halaman web datar.

### 4. Handoff UX antar domain sudah benar
Konsep `HookCard` dan Smart Composer sangat penting karena membuat user flow tidak berhenti di satu layar.

## High-Signal UX Problems

### 1. Route architecture belum sebersih visi produk
Dokumen `navigation-ia.md` sudah jelas ingin merampingkan produk ke:
- Today
- VerseHub
- Paths
- Community
- Profile

Tetapi realitas codebase masih memuat:
- `/channels`
- `/library`
- `/visitors`
- `/gate-updates`
- `/reflections`

Akibatnya, arsitektur mental user masih berisiko terasa bercabang.

### 2. Landing page dan app shell terasa berasal dari dua dunia visual
Landing page `/` masih memakai bahasa visual gelap, hero-stack marketing, dan nada promosi yang berbeda dari Dawn/light system pada area aplikasi.

Ini bukan sekadar beda tema. Ini membuat brand terasa belum memutuskan:
- apakah ini app rohani yang tenang
- atau showcase produk yang futuristik/tech-heavy

### 3. Naming masih drift
Ada beberapa istilah yang hidup bersamaan:
- VerseHub
- Bible
- Mentor
- Today Feed
- Community
- Channels

Secara UX, drift istilah ini menaikkan beban kognitif. User perlu merasa tiap permukaan adalah bagian dari satu sistem, bukan kumpulan modul.

### 4. Today sudah relevan, tapi belum cukup "decisive"
`/today` sudah mulai tepat secara arah, tetapi masih bisa terasa sebagai susunan card yang cantik, belum sepenuhnya menjadi layar keputusan utama harian.

Yang masih kurang:
- prioritas harian tunggal yang paling jelas
- rasa progres lintas domain
- alasan "mengapa sekarang saya harus ke sini dulu"

### 5. Community masih kuat sebagai feed, belum sepenuhnya kuat sebagai spiritual response space
Secara visual dan teknis, Community sudah matang. Tapi secara UX positioning, feed masih bisa terasa seperti timeline umum kalau konteks asal kiriman tidak cukup terasa.

### 6. Paths masih terasa sebagai modul bagus, belum sebagai "journey operating system"
Paths detail sudah lebih baik daripada daftar teks biasa, tetapi hubungan antara:
- progress
- reflection
- verse context
- community handoff

belum terasa seutuh visi jangka panjang.

### 7. Reader experience punya potensi tinggi tetapi belum menjadi pusat gravitasi merek
VerseHub sudah sangat dekat ke inti produk. Justru karena itu, kualitas reader, mentor touchpoints, dan transisi ke refleksi/community nantinya akan sangat menentukan identitas brand.

## UX Direction Recommendation

### North Star
Website ini sebaiknya berkembang menjadi:

`Calm + Bible reading companion + guided community`

di dalam satu ekosistem yang terasa ringan, fokus, dan personal.

### The Future Product Shape
Produk idealnya memiliki 3 lapisan:

#### A. Public Front Door
Landing yang menjelaskan nilai produk secara sederhana:
- mulai dari keadaan hati hari ini
- baca firman dengan lebih dalam
- bertumbuh lewat journey
- berbagi lewat komunitas

Fungsinya bukan memamerkan semua modul, tetapi menjelaskan 1 perjalanan utuh.

#### B. Personal Daily App
Sesudah login, user masuk ke Today sebagai pusat keputusan:
- apa yang paling relevan hari ini
- apa yang perlu dibaca
- apa yang perlu ditulis
- apa yang perlu dilanjutkan

#### C. Deep Utility Layer
VerseHub, Paths, Community, dan Profile menjadi alat spesifik yang mendukung satu perjalanan yang sama.

## Future UX Rules

### 1. Satu produk, satu bahasa visual
Landing dan app tidak harus identik, tetapi harus terasa berasal dari brand yang sama.

### 2. Satu sistem, bukan kumpulan modul
Setiap surface harus menjawab:
- datang dari mana
- untuk apa
- ke mana langkah berikutnya

### 3. Relevance lebih penting daripada density
Lebih sedikit pilihan, tapi lebih tepat, akan lebih cocok untuk produk ini daripada layar yang terlalu ramai.

### 4. Reader dan response harus jadi loop utama
Loop ideal:
`Today -> VerseHub -> Reflection / Community -> Paths -> kembali ke Today`

### 5. Secondary routes harus benar-benar secondary
Jika rute lama masih perlu hidup, ia harus diposisikan sebagai sementara, bukan sebagai bagian dari wajah utama produk.

## Recommended Design Direction Per Surface

### Landing
- ubah dari showcase kartu modular menjadi product-story page
- tekankan perjalanan user, bukan daftar fitur

### Today
- jadikan "daily command center"
- tampilkan 1 prioritas utama yang paling jelas

### VerseHub
- jadikan permukaan paling refined
- reader harus menjadi ikon pengalaman produk

### Community
- tonjolkan konteks asal refleksi/doa
- bukan sekadar feed, tetapi response layer

### Paths
- tonjolkan sense of continuity
- hubungkan lebih kuat ke VerseHub dan Community

## Final Verdict
UI/UX website ini sedang menuju bentuk yang sangat menarik:

`a spiritually-aware web app with a calm premium interface`

Bila dibersihkan dengan disiplin, hasil akhirnya bukan "portal rohani", melainkan:

`daily spiritual operating system for reading, reflecting, growing, and responding together`
