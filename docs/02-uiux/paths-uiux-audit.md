# Paths Module UI/UX Audit

## 1. Ringkasan Surface
Surface Paths yang diaudit:
- `src/app/paths/page.tsx`
- `src/app/paths/[slug]/page.tsx` (ditinjau untuk konsistensi visual, tanpa perubahan)
- `src/services/journeys.service.ts` (ditinjau untuk memahami state presentasi)

Fokus audit ini hanya UX/presentasi frontend Paths, khususnya kondisi data production `{"lang":"id","paths":[]}`.

## 2. Masalah UI/UX Saat Ini
Temuan utama sebelum patch:
1. Empty state masih terlalu datar dan terasa seperti placeholder sementara.
2. Tidak ada hierarchy status yang menjelaskan konteks halaman saat data kosong.
3. CTA saat kosong tidak mengarahkan user ke aksi bermakna berikutnya.
4. Loading state terlalu minim (hanya teks), sehingga first impression terasa belum matang.
5. Halaman kurang “hidup” ketika `paths=[]`, meskipun seharusnya tetap memberi pengalaman spiritual yang intentional.

## 3. Dampak ke User
- User bisa merasa halaman “belum jadi” atau ada error backend.
- Ketika jalur belajar kosong, user kehilangan arah dan berhenti eksplorasi.
- Konsistensi premium terhadap modul Today/Community melemah.

## 4. Rekomendasi Prioritas
1. Tambahkan status card kontekstual agar state halaman langsung jelas.
2. Ubah empty state menjadi blok hero yang tenang, hangat, dan actionable.
3. Perkuat CTA multi-arah saat kosong (Community, Today, Refresh).
4. Tingkatkan loading skeleton agar ritme visual lebih stabil sebelum konten muncul.
5. Pertahankan densitas mobile yang ringan.

## 5. Perubahan yang Diusulkan / Dilakukan
Perubahan yang sudah diterapkan di `src/app/paths/page.tsx`:
1. Menambah badge + intro header agar first impression lebih premium dan terarah.
2. Menambah status card:
   - `Journey Siap Dipilih` saat data tersedia.
   - `Ruang Sedang Disiapkan` saat data kosong.
3. Mengganti loading text tunggal menjadi skeleton cards yang menyerupai bentuk konten akhir.
4. Merombak empty state menjadi hero card:
   - Copy yang spiritual dan menenangkan.
   - Preview chips agar halaman tetap terasa hidup.
   - CTA jelas ke `Community`, `Today`, dan `Muat Ulang`.
5. Menambah informasi `steps_count` (jika tersedia) pada card journey agar hierarchy informasi lebih kuat saat data ada.
6. Merapikan typing lokal (`StudyPath`) untuk menjaga stabilitas presentasi.

## 6. Status Akhir
- Status iterasi: **In progress, major UX polish shipped**.
- Hasil:
  - Paths tetap terasa intentional walau `paths=[]`.
  - Empty state sekarang premium, hangat, dan actionable.
  - Mobile readability tetap ringan dengan hierarchy lebih jelas.
- Risiko tersisa:
  - Perlu QA visual real-device untuk memastikan spacing CTA tetap optimal di layar kecil.

## 7. Langkah Iterasi Berikutnya
1. QA mobile breakpoints (360px, 390px, 430px) untuk jarak antar CTA.
2. Uji copy empty state dengan data kosong berkepanjangan agar tone tetap tidak terasa repetitif.
3. Saat data paths mulai terisi, evaluasi ulang density card agar jumlah langkah, durasi, dan CTA tetap seimbang.
