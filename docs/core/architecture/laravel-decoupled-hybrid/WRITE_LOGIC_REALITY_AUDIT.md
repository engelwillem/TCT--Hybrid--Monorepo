# Write Logic Reality Audit

**Tanggal Audit:** 2026-03-13  
**Status Parity:** PARTIAL (Core persistence exists, Social/Follow logic is broken)

---

## 1. Mutation Mapping Matrix

| Action | Frontend Trigger | Proxy Route (Next.js) | Backend Endpoint (Laravel) | DB Effect | Status |
|---|---|---|---|---|---|
| **Pray (Post)** | `ActionBar.tsx` | `/api/community/posts/[id]/pray` | `/api/v1/community/posts/{id}/pray` | `member_post_reactions` | **REAL** |
| **Bookmark (Post)** | `ActionBar.tsx` | `/api/community/posts/[id]/bookmark` | `/api/v1/community/posts/{id}/bookmark` | `member_post_bookmarks` | **REAL** |
| **Comment (Post)** | `CommentsSheet.tsx` | `/api/community/posts/[id]/comments` | `/api/v1/community/posts/{id}/comments` | `member_post_comments` | **REAL** |
| **Create Post** | `PostComposer.tsx` | `/api/community/posts` | `/api/v1/community/posts` | `member_posts` | **PARTIAL**¹ |
| **Verse Action** | `VersehubReaderPage` | `/api/versehub/[lang]/actions` | `/api/v1/versehub/{lang}/reader-actions` | `user_verse_actions` | **REAL** |
| **Reflection** | `ReflectionComposer` | `/api/versehub/[lang]/reflections` | `/api/v1/versehub/{lang}/reflections` | `reflection_responses` | **REAL** |
| **Follow User** | `ChatPopover.tsx` | **MISSING** | `/users/{user}/follow-toggle` (Web) | `user_follows` | **BROKEN**² |
| **Send DM** | `ChatPopover.tsx` | `/api/inbox/messages` | `/api/v1/inbox/messages` | `direct_messages` | **REAL** |
| **Profile Update** | `ProfilePage.tsx` | `/api/profile` | `/api/v1/profile` | `users` | **REAL** |

---

## 2. Detailed Gap Analysis

### ¹ Create Post (Partial)
- **Current Flow**: `PostComposer.tsx` di Next.js saat ini hanya melakukan `console.log` dan pembersihan state lokal. Jalur menuju `CommunityService.createPost` sudah ada secara teknis, namun integrasi di komponen belum memanggil service tersebut.
- **Legacy Parity**: Legacy menggunakan form multipart untuk upload gambar. Next.js proxy sudah mendukung binary body, namun `PostComposer` belum mengirimkan file gambar secara nyata ke Laravel.

### ² Follow User (Broken)
- **Current Flow**: `ChatPopover.tsx` mencoba memanggil `/users/${partnerId}/follow-toggle` secara langsung.
- **Gap**: Route ini tidak terdaftar di Next.js `src/app/api`, dan di Laravel masih berada di `web.php` (bukan `api.php` v1). 
- **Risk**: Aksi "Follow" tidak akan pernah berhasil (404/405 error) sehingga fitur Inbox tab "Primary" tidak akan pernah terisi secara dinamis.

### Optimistic UI & Rollback
- **Community Feed**: Sudah memiliki logika `rollbackPost` jika API gagal. Ini adalah standar parity yang baik.
- **Verse Actions**: `VersehubReaderPage` melakukan update state lokal secara instan, namun belum ada penanganan jika `fetch` gagal (data di UI tersimpan, tapi di MySQL tidak).

---

## 3. Findings: Mock & Fake Logic

1.  **Fake Like Count (`src/features/community/pages/CommunityPage.tsx`)**: Fungsi `toggleLike` hanya memanipulasi angka di level komponen (`+1 / -1`), belum mensinkronkan data hasil perhitungan terbaru dari Laravel.
2.  **Mock Success in Composer**: `PostComposer.tsx` mensimulasikan sukses tanpa melakukan request network yang sebenarnya.
3.  **Local-Only Guest State**: Beberapa interaksi (seperti nama tamu untuk komentar) disimpan di `localStorage` tanpa verifikasi validitas nama di sisi backend.

---

## 4. Source of Truth

- **Persistence Owner**: Laravel (`backend-api`) melalui MySQL.
- **State Sync**: Next.js Proxy (`src/app/api`) bertindak sebagai gerbang tunggal. Dilarang melakukan bypass proxy langsung ke port Laravel (8000).

---

## 5. Execution Priority (Batch 0: Write Logic)

### P0: Critical Persistence (Must Fix Now)
- **Follow Logic Bridge**: Buat Next.js API route `/api/users/[id]/follow` dan pindahkan logic Laravel ke `api.php`.
- **Post Creation Reality**: Hubungkan `PostComposer.tsx` ke `CommunityService.createPost` dan aktifkan persistence nyata.

### P1: UX Polishing (Hardening)
- **Rollback Hardening**: Tambahkan mekanisme rollback di `VersehubReaderPage` dan `ReflectionComposer`.
- **Media Upload Proxy**: Pastikan gambar dari `PostComposer` (multipart/form-data) diteruskan dengan benar melalui proxy Next.js.

---
*Audit Write Logic selesai. Fokus berikutnya: Menghidupkan Follow dan Post Persistence.*