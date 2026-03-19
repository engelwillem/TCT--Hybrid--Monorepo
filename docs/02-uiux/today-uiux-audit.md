# Today Module UI/UX Audit

## 1. Ringkasan Surface
Modul **Today** (`src/features/today/pages/TodayPage.tsx`) adalah beranda utama *dashboard* user. Halaman ini bertugas menyajikan kutipan/ayat rohani harian (Daily Verse), sorotan cuplikan posting komunitas, serta akses cepat (*Quick Actions*) ke fitur esensial seperti Komunitas, VerseHub, Paths, dan Kotak Masuk. Tujuannya adalah memberi kesan hangat, segar, dan menjadi kompas orientasi utama setelah login. 

## 2. Masalah UI/UX Saat Ini
Berdasarkan tinjauan visual dan behavior kode pada versi sebelumnya:
1. **Abrupt Loading & Layout Shift:** Data diinisialisasi secara bertahap dalam state `isLoading` tanpa adanya *Skeleton* / penanda pemuatan. Begitu data selesai di-fetch, antarmuka tiba-tiba "melompat" muncul.
2. **Fake Mock Fallback:** Jika respons dari backend kosong (misalnya karena tidak ada *highlight* atau belum ada konten hari ini), aplikasi justru secara *hardcoded* mengeluarkan `MOCK_POSTS` dan teks "Sebab Aku ini mengetahui rancangan..." yang terkesan mencederai keaslian aplikasi dinamis dan membingungkan jika dilihat oleh end-user sungguhan.
3. **Visual Hierarchy Menumpuk:** Layout section title (seperti "Ayat Hari Ini" dan "Sorotan Komunitas") kurang memiliki diferensiasi tipografi yang tajam dengan elemen *card* itu sendiri, menjadikan mata user sulit melakukan *scanning* dengan leluasa.
4. **Kepadatan Teks (Content Density):** Teks kutipan terasa terlalu tebal, dan kartu komponen tidak memiliki radius lengkungan (*border-radius*) bernuansa modern ala mobile-app yang biasanya memanjakan sentuhan mata.

## 3. Dampak ke User
- **Kesan Kurang Premium:** Tampilan yang melompat (*layout shift*) tanpa *shimmer/skeleton* serta keberadaan *mock data* tiruan ketika kondisi asli sedang kosong menurunkan drastis kredibilitas produk (terasa belum selesai/versi *staging*).
- **Kebingungan Konteks:** Membaca *mock data* padahal user mungkin adalah pendaftar baru yang wajarnya belum punya aktivitas komunitas, membuat ekspektasi alur tidak wajar.

## 4. Rekomendasi Prioritas
1. **Singkirkan MOCKS:** Ganti segala *fallback array data palsu* ke dalam rupa desain state kosong (*Empty State*) yang jujur, suportif, dan tetap estetik.
2. **Implementasi Skeleton Loading:** Sisipkan *placeholder shimmer* persis sesuai dimensi *card* yang akan dirender agar layout stabil selama pemuatan dari server.
3. **Penyempurnaan Border & Spacing:** Manfaatkan `rounded-full` pada tombol, atau `rounded-[32px]` pada kartu hero untuk menciptakan impresi antarmuka mobile/tablet modern tingkat atas.
4. **Tipografi Hirarki:** Pasangkan kapital-lebar (`tracking-widest`, `uppercase`) pada *Label / Kategori* dan mainkan berat ketebalan huruf (`font-black`) pada penanda dominan (seperti *Judul Heading*).

## 5. Perubahan yang Dilakukan
Pada iterasi ini, file `src/features/today/pages/TodayPage.tsx` telah diubah secara utuh (rewrite):
- **Menghapus dependensi** terhadap `MOCK_POSTS` dari folder `community/mock`.
- **Menambahkan Empty States Elegan:**
  - Jika `dailyVerse` kosong -> Ditampilkan kartu bergaris putus dengan ikon angin (`Wind`) bernada pesan *"Ayat hari ini belum diterbitkan."* dan tombol call-to-action untuk menjelajah Library/VerseHub langsung.
  - Jika `highlights` kosong -> Ditampilkan ikon percakapan dengan nada *"Belum ada sorotan, jadilah yang pertama berbagi hari ini."*
- **Menambahkan Skeleton UI:** Komponen `@/components/ui/skeleton` kini merender animasi tulang punggung (mock dimensi tata letak) yang indah sebelum setelan Fetch merespons.
- **Tipografi Premium:** Heading `"Selamat Pagi, Chosen"` dipecah ketajamannya. Font untuk Daily Verse kini mematuhi `font-serif` agar terasa eskatologis dan klasik tapi modern.
- **Desain Premium Card (Akses Cepat):** Kartu *Premium Active* dimodulasi menggunakan perlakuan `bg-zinc-950` plus gradien pendar dari belakang bertema *brand* untuk *luxury vibe*. Quick Actions dimodernisasi dengan kontur border lembut `rounded-[20px]`.

## 6. Status Akhir
- **Modul**: Today 
- **Status Audit**: ✅ **DONE & REFACTORED**
- **Kesehatan UX**: Tampilan sudah lebih stabil, tidak berbohong/tiruan dengan data palsu, tenang, terkurasi secara hierarki tipografi, dan elegan ketika data tidak tersedia.

## 7. Langkah Iterasi Berikutnya
Langkah logis setelah membenahi "halaman pintu masuk Utama" (Today) adalah masuk ke dalam modul aktivitas inti, yaitu **Community**. Audit UI/UX selanjutnya akan memusatkan ke halaman *Community Feed* dengan kaidah prioritas serupa. 
