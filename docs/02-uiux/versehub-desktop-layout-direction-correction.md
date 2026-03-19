# VerseHub Desktop Layout Direction Correction

## 1. Ringkasan Kesalahan Iterasi Sebelumnya
Pada analisis sebelumnya, terjadi kesalahan identifikasi akar masalah "double sidebar". Iterasi tersebut menghapus **Dark Hero Card**, padahal elemen tersebut adalah *emotional anchor* utama yang memberikan identitas visual premium pada VerseHub. 

Kesalahan persepsi "double sidebar" sebenarnya dipicu oleh **Card Branding Duplikat** (blok "Gerbang VerseHub" yang berisi deskripsi berulang) yang diletakkan di sisi kiri atas area konten, berdekatan dengan sidebar navigasi global.

## 2. Elemen yang HARUS Dipertahankan
- **Dark Hero Card (bg-slate-900):** Harus dikembalikan/dipertahankan. Ini adalah titik fokus emosional yang membedakan VerseHub sebagai "Ruang Teduh". Tanpa ini, layout desktop menjadi terlalu datar dan kehilangan karakteristik premiumnya.
- **OT/NT Entry Buttons:** Sebagai bagian dari Hero Card, memberikan struktur eksplorasi yang jelas bagi pengguna.

## 3. Elemen yang HARUS Dihapus
- **Card Branding Duplikat ("Gerbang VerseHub"):** Blok teks ini harus dihilangkan jika sedang berada pada tampilan Desktop. Blok ini hanya menambah kepadatan kognitif dan menciptakan garis vertikal tambahan yang meniru sidebar. 
- **Badge Duplikat:** Jika di dalam Hero Card terdapat elemen branding (seperti logo/text TCT) yang identik dengan yang ada di sidebar kiri, elemen tersebut harus disederhanakan agar tidak repetitif.

## 4. Alasan UX
- **Anchor & Focus:** Desktop membutuhkan *center of interest* yang kuat. Dark Hero Card berfungsi sebagai *anchor* tersebut. 
- **De-cluttering:** Menghilangkan card branding kecil di atas kiri akan memberikan "napas" (*white space*) yang cukup antara navigasi global (sidebar kiri) dan area fungsional (search & content). Hal ini menghilangkan efek "double sidebar" karena mata pengguna tidak lagi melihat dua blok informasi berjejer yang memiliki gaya visual serupa.

## 5. Prinsip Layout Desktop yang Benar
1. **Sidebar Kiri:** Navigasi global (Hanya satu).
2. **Main Content (Kanan):** 
   - **Header:** Konteks halaman (VerseHub / Judul Pasal).
   - **Hero:** Aspirasi/Emotional entry (Dark Hero Card).
   - **Functional Areas:** Search, Quick Access, Reader.

## 6. Kriteria Visual Lulus
- [ ] Dark Hero Card muncul kembali sebagai elemen paling dominan di fold pertama.
- [ ] Tidak ada card info statis ("Gerbang VerseHub") yang "menempel" di sebelah kanan sidebar.
- [ ] Area di bawah header bersih langsung menuju fungsionalitas utama (Search) atau emosional utama (Hero).
- [ ] Kesan visual stabil: Sidebar kiri stabil sebagai 'tulang punggung', area kanan mengalir sebagai 'isi'.

---
**Status Audit:** ⚠️ **DIRECTION CORRECTED**
Dokumen ini menginstruksikan Codex untuk memulihkan Dark Hero Card dan hanya membuang card branding/info kecil yang redundan di area atas konten.
