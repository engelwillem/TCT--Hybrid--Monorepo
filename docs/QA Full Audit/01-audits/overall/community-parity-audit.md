# Community Parity Audit

## 1. Ringkasan Masalah
Terjadi mismatch parity pada surface Community:
- Backend production mengembalikan `data.posts = []`.
- Backend production mengembalikan `data.archivePosts` berisi post nyata.
- Frontend tab default **Diskusi** hanya menampilkan `posts`, sehingga terlihat kosong walau data nyata tersedia di `archivePosts`.

## 2. Bukti Respons Backend
Verifikasi endpoint production:
- URL: `https://api.thechoosentalks.org/api/v1/community/posts`
- Hasil:
  - `HTTP=200`
  - `POSTS=0`
  - `ARCHIVE=12`
  - contoh item arsip pertama: `id=4`, `type=member_post`, `createdAt=2 weeks ago`

## 3. Audit Backend Community
### File yang diaudit
- `backend-api/app/Http/Controllers/Api/V1/CommunityApiController.php`
- `backend-api/app/Services/TodayFeedService.php`
- `backend-api/app/Models/MemberPost.php`

### Temuan backend
1. Endpoint Community memang mengembalikan dua bucket terpisah:
   - `posts` berasal dari `TodayFeedService::getTodayData()['feed']`.
   - `archivePosts` berasal dari query post expired (`expires_at <= now()`).
2. Feed aktif dibentuk oleh `MemberPost::active()`:
   - hanya post yang tidak hidden dan belum melewati ambang aktif.
3. Arsip dibentuk explicit dari post expired:
   - `whereNotNull('expires_at')->where('expires_at', '<=', $now)`.

Kesimpulan backend: pemisahan `posts` vs `archivePosts` adalah desain by-state (aktif vs expired), bukan bug serialisasi response.

## 4. Audit Frontend Community
### File yang diaudit
- `src/services/community.service.ts`
- `src/features/community/pages/CommunityPage.tsx`
- `src/features/community/types.ts`

### Temuan frontend
1. Service sudah membaca dua bucket:
   - `posts: payload.data.posts`
   - `archivePosts: payload.data.archivePosts`
2. Namun tab default Diskusi hanya merender `posts`:
   - saat `posts.length === 0`, UI menampilkan state kosong.
3. Akibatnya ada gap parity persepsi:
   - data nyata ada (di arsip), tetapi layar default tampak seolah tidak ada data sama sekali.

## 5. Akar Mismatch Parity
Mismatch ada di **keduanya secara perilaku**:
- Backend: data dipisah ketat berdasarkan state lifecycle (active vs expired).
- Frontend: tab Diskusi default tidak menyediakan fallback saat active feed kosong, walau archive berisi data.

Jadi akar parity yang terlihat user ada pada **mapping/presentasi frontend terhadap kontrak backend yang valid**.

## 6. Perbaikan yang Dilakukan (jika ada)
Dilakukan patch minimal dan aman di frontend Community page:
1. Menambahkan fallback rendering di tab Diskusi:
   - jika `posts` kosong dan `archivePosts` ada, tampilkan arsip terbaru (maks 6 item) sebagai fallback parity.
2. Menambahkan penanda UI bahwa feed aktif kosong dan sedang menampilkan arsip terbaru.
3. Menyelaraskan update interaksi (like/bookmark/comments) agar bekerja di dua state (`posts` dan `archivePosts`) saat fallback aktif.

File diubah:
- `src/features/community/pages/CommunityPage.tsx`

## 7. Status Akhir
- Kontrak backend tetap valid dan tidak diubah.
- Frontend tidak lagi tampak kosong saat `posts=[]` tetapi `archivePosts` berisi.
- Parity tampilan Community membaik: data nyata tetap terlihat pada surface default tanpa mengubah modul lain.

## 8. Rekomendasi Langkah Berikutnya
1. Content ops: isi kembali feed aktif agar `posts` tidak kosong berkepanjangan.
2. Pertimbangkan menambahkan field reason/state di backend response (mis. `activeFeedEmptyReason`) untuk UX messaging yang lebih eksplisit.
3. Tambahkan smoke test parity untuk skenario:
   - `posts=[]`, `archivePosts>0`
   - memastikan tab Diskusi tidak jatuh ke empty misleading state.
