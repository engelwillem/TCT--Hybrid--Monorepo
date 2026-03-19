# Community Module UI/UX Audit

## 1. Ringkasan Surface
Modul **Community** (`src/features/community/pages/CommunityPage.tsx`) adalah jembatan sosial dari The Chosen Talks. Halaman ini berfungsi sebagai *timeline* interaktif di mana pengguna bisa saling berbagi *Quotes*, *Reflections*, *Prayer Requests*, dan *Testimonies*. Surface ini vital karena mendukung konsep komunitas rohani global melalui tab **Diskusi**, **Arsip**, dan **Simpanan**. 

## 2. Masalah UI/UX Saat Ini
Saat ini secara logika (Parity), halaman ini sudah bisa beroperasi menukar konten aktif menjadi arsip jika diskusi harian kosong. Namun secara presentasi, pengalaman pengguna masih belum maksimal:
1. **Fallback Message Terasa Teknis:** Terdapat teks `"Menampilkan arsip terbaru sebagai fallback parity"`. Teks *development* ini kurang pantas di hadapan _end-user_ nyata dan membuat platform terasa seperti *beta software*.
2. **Skeleton & Transisi Pemuatan:** Status _pemuatan_ (`isLoading`) hanya diwakili dengan ikon _spinner_ `Loader2` "Memperbarui Feed...", yang tidak proporsional dengan tinggi blok konten, menyebabkan *Layout Shift* dan mencederai kemewahan app.
3. **Empty States Kasar:** Tab _Arsip_ dan _Simpanan_ memiliki status kosong berupa komponen kotak kaku yang belum menganut konsistensi garis putus-putus (*dashed line*) seperti yang diaplikasikan pada modul Today. Desain saat ini cenderung mendominasi spasi halaman dengan kaku.
4. **Desain Tab & Chip Filter Kaku:** Tombol _filter archive categories_ (Semua, Quotes, Refleksi, dll.) hanya berupa varian abu-abu yang menumpuk. Kurang menonjol ketika *state active*.

## 3. Dampak ke User
- **Hilangnya Kredibilitas Konten:** Penyebutan frasa teknis _“Fallback Parity”_ mencederai nuansa aplikasi. User mungkin tidak akan memikirkan itu sebagai bacaan masa lalu yang direkomendasikan secara hangat, melainkan _error fallback_ pada aplikasi.
- **Kelelahan Interaksi:** Layout shift (melompatnya kartu saat `Loader2` berganti menjadi konten post sesungguhnya) mengurangi kepuasan pengalaman _scrolling_.

## 4. Rekomendasi Prioritas
1. **Refining Fallback Impression:** Ganti copy tulisan fallback teknikal menjadi lebih hangat dan bermakna rohani (*"Menampilkan inspirasi dari arsip"*). Rancang *component* _Archive Fallback Notification_ menjadi lebih membaur elegan (*soft borders*, tanpa background kuning *alert* *amber-50* yang biasanya mendeskripsikan error).
2. **Konsistensi Skeleton Loaders:** Samakan persis pola dan durasi skeleton dari halaman "Today" yang sudah dirombak sebelumnya agar transisi tulang-punggung mulus (*Skeleton UI* bulat mengikuti ukuran *Card* asli).
3. **Penyempurnaan Kosong Kosong Ciptaan:** Rapikan segala _Empty State_ (*Arsip*, *Bookmarks*, *No Active Feeds*) ke format *Card Dashed*, rounded, margin dan *muted-foreground text* selaras `rounded-[32px]`.
4. **Sentuhan Interaktif Tombol (Chip Filter):** Perbagus status aktif kelompok Filter Tab Arsip agar terlihat lebih menyatu sebagai baris kompas menu _Mobile First_.

## 5. Perubahan yang Dilakukan
Pada iterasi ini, file `src/features/community/pages/CommunityPage.tsx` telah di-patasi (Refactored) secara penuh:
- **Skeleton Loader Tersinkronisasi:** Menarik _Lucide Loader2_ keluar, menggantinya dengan iterasi 3 blok *Card Skeleton* persis dengan struktur *MemberPostCard*.
- **Pesan Fallback Arsip yang Puitis:** Merubah kartu peringatan berwarna kuning dengan bahasa teknikal menjadi seksi peringatan transparan bernuansa magis: Ikon *Sparkles* transparan, dengan teks "Belum ada percakapan baru" & "Menampilkan inspirasi dari arsip komunitas".
- **Empty States Seragam:** Mereproduksi Empty States untuk Tab Diskusi, Arsip, dan Simpanan (*Bookmarks*) menyerupai kartu `TodayPage`. Memakai pinggiran *dashed* bundar dan modifikasi ikon sentral abu-abu.
- **Filter Archive Bar Rapi:** Membenahi radius susunan kelompok *ArchiveCategory* agar mengadopsi struktur _pill/chip_ tajam pada *Mobile view* (*bg-foreground text-background shadow-md border* saat aktif).
- **Penyelarasan Hirarki & Spasing:** Menyusun elemen header `text-3xl` menjadi `max-w-[640px]` _margin-auto_, memperlancar *padding* atas-bawah dan radius _tabs container_.

## 6. Status Akhir
- **Modul**: Community 
- **Status Audit**: ✅ **DONE & REFACTORED**
- **Kesehatan UX**: Komunitas sekarang bukan lagi hanya fitur *Fallback Parity*, namun telah dihidupkan sebagai kanvas inspiratif yang nyaman dipandang dalam kondisi sesepi apa pun atau sepenuh apa pun, menularkan konsistensi ketenangan UI.

## 7. Langkah Iterasi Berikutnya
Setelah "Today" dan "Community" solid, iterasi alami berikutnya adalah **"Paths"** (Perjalanan Spiritual Interaktif). Kita harus menilik interaksi klik daftar _Path_, penamaan _Tracker_, _Daily Path Check-in_, agar sama-sama berkelas dan tidak memiliki *Layout Shift* yang buruk.
