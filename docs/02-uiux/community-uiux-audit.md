# Community Module UI/UX Audit

## 1. Ringkasan Surface
Modul **Community** (`src/features/community/pages/CommunityPage.tsx`) adalah ruang publik utama untuk berbagi refleksi, doa, dan kesaksian. Halaman ini memiliki logika *fallback* unik di mana jika tidak ada postingan aktif dalam 24 jam terakhir, sistem secara otomatis menarik konten terbaik dari arsip agar halaman tidak terlihat mati. Fokus iterasi ini adalah memastikan pengalaman transisi dan visual terasa premium, bukan sekadar "tambal sulam" logika.

## 2. Masalah UI/UX Saat Ini
Fokus utama audit menemukan beberapa poin kelemahan visual:
1. **Fallback Message Terasa Kesalahan Sistem:** Pesan *"Menampilkan arsip terbaru sebagai fallback parity"* mengesankan ada fitur yang rusak, bukan kurasi konten lama yang berharga.
2. **Skeleton Loading Belum Matang:** Penggunaan *spinner* standar atau skeleton yang tidak presisi menyebabkan *Layout Shift* yang mengganggu saat feed muncul.
3. **Hierarchy Tab & Action Bar:** Tab "Diskusi", "Arsip", dan "Simpanan" memiliki kontras yang lemah saat aktif, kurang memberikan kesan kedalaman (*depth*).
4. **Empty State Kaku:** Status jika data benar-benar kosong (Arsip/Simpanan) menggunakan kotak abu-abu kaku yang tidak seirama dengan desain *Today* yang sudah diperbaiki.
5. **Toast & Feedback:** Notifikasi "Berhasil" atau "Gagal" muncul di atas (menutupi header) dan memiliki desain standar yang kurang berkarakter *premium*.

## 3. Dampak ke User
- **User Confusion:** Pengguna mungkin mengira aplikasi sedang *error* saat melihat pesan "fallback parity".
- **Unpolished Feel:** Lonjakan konten saat loading (*Layout Shift*) membuat aplikasi terasa "berat" dan kurang responsif.
- **Low Engagement:** Tanpa CTA yang jelas pada *empty state*, pengguna baru mungkin bingung harus melakukan apa jika komunitas sedang sepi.

## 4. Rekomendasi Prioritas
1. **Humanizing Fallback:** Mengubah peringatan teknis menjadi sapaan hangat "Inspirasi Pilihan" dengan ikon *Sparkles*.
2. **Standardisasi Roundness:** Mengadopsi `rounded-[32px]` dan `rounded-[40px]` secara konsisten di seluruh kartu feed agar terasa seperti aplikasi seluler modern kelas atas.
3. **Full-Block Skeleton:** Membuat kerangka pemuatan yang meniru persis dimensi `MemberPostCard` (foto profil, teks, media) untuk stabilitas visual total.
4. **Enhanced Tab Navigation:** Menggunakan skema kontras tinggi (*Black on White*) untuk tab aktif guna memperjelas lokasi pengguna.

## 5. Perubahan yang Dilakukan
Modul `CommunityPage.tsx` telah diperbarui dengan perubahan berikut:
- **Refined Fallback Notification:** Mengganti banner kuning "amber" yang kaku dengan notifikasi transparan berpendar (*glow*) bertajuk "Inspirasi Pilihan". Menggunakan ikon *Sparkles* untuk memberi kesan konten yang dikurasi.
- **Premium Skeleton Feed:** Mengimplementasikan blok skeleton yang meniru tata letak *MemberPostCard* secara detail (Avatar, Metadata, Content, Media Block).
- **Modern Tab UI:** Merombak `TabsList` dengan radius `[24px]` dan `TabsTrigger` yang menggunakan animasi transisi halus ke mode gelap (*background-foreground*) saat aktif.
- **Standardized Empty States:** Status kosong kini menggunakan kartu gaya *Dashed* melingkar `rounded-[40px]` dengan ikon besar terpusat dan tombol CTA (Call to Action) yang jelas untuk memicu interaksi awal.
- **Repositioned Toasts:** Memindahkan notifikasi (*toast*) ke bagian bawah (`bottom-24`) dengan gaya *Premium Dark* agar tidak menutupi navigasi atas dan lebih mudah dijangkau jempol di perangkat mobile.
- **Archive Groups Styling:** Menambahkan garis gradien (*gradient dividers*) di antara kelompok tanggal arsip untuk mempertegas pemisahan waktu tanpa menambah beban visual.

## 6. Status Akhir
- **Modul**: Community
- **Status Audit**: ✅ **DONE & POLISHED**
- **Kesehatan UX**: Halaman terasa hidup dan stabil. Transisi dari loading ke konten kini mulus tanpa lompatan layout. Nuansa "Arsip" kini terasa seperti "Mesin Waktu Inspiratif", bukan sekadar data cadangan.

## 7. Langkah Iterasi Berikutnya
Target berikutnya adalah modul **Paths** (Perjalanan Spiritual). Kita perlu memastikan daftar perjalanan rohani memiliki visual progress yang menggugah dan interaksi klik yang setara dengan kemewahan *Today* dan *Community*. 
