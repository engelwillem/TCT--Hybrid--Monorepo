# Community Module UI/UX Audit

## 1. Ringkasan Surface
Surface Community yang diaudit berada di:
- `src/features/community/pages/CommunityPage.tsx`
- `src/features/community/components/MemberPostCard.tsx`
- `src/features/community/components/PostComposer.tsx`
- `src/features/community/components/VerseHubFeaturedCard.tsx`

Fokus audit ini hanya UX/presentasi frontend Community. Parity backend tidak diubah.

## 2. Masalah UI/UX Saat Ini
Temuan paling terasa user-facing sebelum patch:
1. Import icon di `CommunityPage.tsx` memakai `lucide-center` sehingga berisiko mematahkan halaman.
2. Saat `posts` kosong dan fallback arsip aktif, status halaman belum cukup eksplisit untuk menjelaskan konteks “kurasi”, sehingga bisa terasa seperti feed bermasalah.
3. Tab Simpanan hanya membaca `posts`, bukan gabungan `posts + archivePosts`, membuat pengalaman simpanan terasa tidak konsisten ketika feed aktif kosong.
4. Metadata waktu di kartu post statis (`Baru Saja`) sehingga hierarchy konten terasa datar dan kurang premium.
5. Copy empty-state Arsip/Simpanan masih generik dan kurang mengarahkan aksi user.

## 3. Dampak ke User
- Persepsi kualitas turun karena state fallback tampak ambigu.
- User bisa salah paham bahwa post tersimpan hilang saat tab Simpanan tidak menampilkan item dari arsip.
- Feed terasa kurang “hidup” karena semua post terlihat dipublikasikan pada waktu yang sama.
- Empty-state tidak cukup membantu user mengambil langkah berikutnya.

## 4. Rekomendasi Prioritas
1. Stabilkan surface dulu (fix import blocker).
2. Buat status feed lebih eksplisit: bedakan “Feed Aktif Hari Ini” vs “Mode Kurasi Arsip”.
3. Samakan sumber data tab Simpanan agar konsisten lintas state feed.
4. Tampilkan waktu relatif per post untuk memperkuat hierarchy.
5. Rapikan copy empty-state agar lebih hangat dan actionable.

## 5. Perubahan yang Diusulkan / Dilakukan
Perubahan yang sudah diterapkan:
1. Perbaikan import icon di `CommunityPage.tsx` dari `lucide-center` ke `lucide-react`.
2. Penambahan status card kontekstual di atas feed Diskusi:
   - “Feed Aktif Hari Ini” saat post aktif tersedia.
   - “Mode Kurasi Arsip” saat fallback arsip berjalan.
3. Penyempurnaan copy fallback agar intentional:
   - Menjelaskan bahwa arsip adalah kurasi, bukan error.
4. Tab Simpanan kini memakai daftar gabungan `posts + archivePosts` (dedupe by `id`) agar bookmark tetap muncul konsisten.
5. `MemberPostCard` kini menerima `createdAt` dan menampilkan waktu relatif (`x menit lalu`, `x jam lalu`, dst) dengan fallback tanggal lokal Indonesia.
6. Copy empty-state Arsip/Simpanan diperjelas agar user tahu tindakan berikutnya.

## 6. Status Akhir
- Status iterasi: **In progress, major polish shipped**.
- Hasil saat ini:
  - Fallback archive terasa jauh lebih intentional.
  - Hierarchy feed lebih jelas.
  - Tab Simpanan lebih konsisten.
  - Kartu post lebih hidup dengan metadata waktu nyata.
- Risiko tersisa:
  - Perlu QA visual lintas device untuk memastikan tidak ada regressions spacing.

## 7. Langkah Iterasi Berikutnya
1. QA mobile real-device untuk densitas komposer dan ritme antar card.
2. Fine-tuning tipografi caption/meta di card agar kontras tetap nyaman pada layar kecil.
3. Uji skenario low-activity 3 kondisi:
   - no `posts`, ada `archivePosts`
   - no `posts`, no `archivePosts`
   - `posts` aktif + bookmark dari arsip
