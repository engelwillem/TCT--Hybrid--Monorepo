# Profile Readability & UX Review

## 1. Ringkasan Surface
**Modul:** User Profile (`src/app/profile/page.tsx`)
**Reviewer:** Independent UX Analyst
**Konteks:** Audit visual dan pengalaman pengguna (UX) pada halaman profil dengan fokus utama pada keterbacaan teks, kontras, dan persepsi area avatar.

## 2. Masalah Persepsi User
Berdasarkan audit source code dan perbandingan dengan standar desain premium di modul lain (Today, Community), ditemukan beberapa titik kritis yang dapat membuat halaman `/profile` terasa "tidak tuntas" (*unfinished UI*):
- **Ghostly Sections:** Penggunaan `bg-surface-muted` yang sangat dominan dikombinasikan dengan teks berwarna `muted-foreground` menciptakan kesan elemen yang *disabled* atau sedang dalam keadaan *loading/skeleton*.
- **Contrast Anxiety:** Teks penting seperti label input menggunakan opasitas rendah (`text-foreground/70`) dan ukuran mikro (`text-[10px]`), yang sangat melelahkan bagi mata pengguna saat ingin mengisi formulir.
- **Avatar Empty State:** Ketika foto profil tidak tampil, lingkarannya terlihat terlalu pucat sehingga tidak memberikan "anchor" visual yang kuat di bagian atas halaman.

## 3. Readability Findings
- **Label Input:** Menggunakan `uppercase tracking-[0.25em] text-[10px] text-foreground/70`. 
  - *Risk:* Spasi antar huruf (*tracking*) yang terlalu lebar pada ukuran font sangat kecil melemahkan keterbacaan cepat (*glanceability*). 
  - *Impact:* Pengguna mungkin harus menyipitkan mata untuk membaca label seperti "ALAMAT EMAIL".
- **Accordion Titles:** Judul section seperti "Informasi Personal" berada di dalam `AccordionCard`.
  - *Risk:* Jika judul ini tidak memiliki bobot font yang cukup kontras dengan kontennya, hirarki informasi akan runtuh.

## 4. Contrast Findings
- **Input Fields:** Menggunakan `bg-surface-muted`, `border-border/50`, dan `text-foreground`.
  - *Risk:* Border 50% opacity pada background yang diredam (*muted*) seringkali "hilang" pada layar HP dengan tingkat kecerahan rendah.
  - *Impact:* Area input tidak terlihat seperti area interaktif (klik-able).
- **Primary CTA Button:** Tombol "Simpan Perubahan" menggunakan `PrimaryCTA`. Syukurlah elemen ini konsisten, namun jika dikelilingi oleh elemen-elemen pudar, tombol ini bisa terlihat terlalu agresif secara visual sendirian.

## 5. Avatar UX Findings
- **Logic:** `resolveSafeAvatarUrl` sudah mencakup fallback ke API base URL dan Firebase photoURL (Bagus secara teknis).
- **Persepsi Visual:** 
  - **Saat Image Ada:** Ring 4px `ring-border/50` mungkin terlalu tipis untuk membingkai foto dengan background putih.
  - **Saat Fallback (Initials) Tampil:** Menggunakan `text-4xl font-black text-brand`. Ini adalah anchor terbaik di halaman ini, namun background lingkarannya (`bg-surface-muted`) harus sedikit lebih dalam/gelap agar inisial huruf terpancar keluar.
- **Submitting State:** Backdrop `bg-background/60 backdrop-blur-sm` saat upload sudah sangat premium.

## 6. Consistency Review dengan Surface Lain
- **Today/Community:** Modul-modul ini menggunakan kartu dengan kontras tinggi (Teks hitam pekat pada background putih/light surface).
- **Profile:** Terlalu banyak menggunakan warna "abu-abu" (*Muted/Surface*). Dibutuhkan lebih banyak elemen `text-foreground` murni untuk memberikan kesan aplikasi yang "hidup".

## 7. High-Priority UX Recommendations
1. **Bold the Labels:** Tingkatkan opasitas label input dari `text-foreground/70` menjadi `text-foreground/90` atau `muted-foreground` yang lebih gelap. Kecilkan *tracking* menjadi `tracking-widest` saja agar huruf tidak "terpencar".
2. **Deepen the Avatar Anchor:** Ubah background lingkaran avatar fallback dari `bg-surface-muted` menjadi `bg-brand/5` atau `bg-foreground/[0.03]` untuk memberikan kedalaman visual yang lebih baik.
3. **Card Border Emphasis:** Tingkatkan kontras border pada `DarkCard` dan `AccordionCard`. Gunakan `border-border/80` daripada `50` untuk mendefinisikan batas area secara tegas.
4. **Active Text Color:** Pastikan teks di dalam input (`text-[16px] font-bold`) benar-benar menggunakan warna `text-foreground` yang solid.

## 8. Low-Risk Enhancements
- **Shadow Softness:** Tambahkan `shadow-sm` atau `shadow-md` pada `AccordionCard` saat sedang terbuka (*expanded*) untuk meningkatkan persepsi kedalaman (Z-axis).
- **Success Tone:** Warna `emerald-500` untuk verified status sudah bagus, pertimbangkan menambah sedikit *glow* tipis agar terasa lebih "bernilai".

## 9. Final Readability Assessment
**Status: NEEDS ATTENTION (Visual Calibration Required)**
Halaman profil secara fungsionalitas sudah lengkap (2FA, Avatar Upload, Password Update), namun secara visual masih tertinggal dari 'kehangatan' modul Today. Koreksi pada kontras teks dan penegasan batas-batas kartu merupakan kunci agar user tidak merasa berada di dalam UI yang "sedang rusak" atau "pudar".

---
*Catatan: Investigasi teknis mengenai mengapa avatar image fisik tidak tampil (URL resolution) diserahkan sepenuhnya kepada Codex.*
