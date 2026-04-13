# Repost ke Talks: Unified Architecture Blueprint (/community)

**Role**: Senior Systems & Product Architect  
**Status**: Final Unified Blueprint (Execution Ready)  
**Scope**: Lifecycle GALERY -> Talks via `Repost ke Talks`  
**Date**: 13 April 2026

---

## 1. Tujuan
Menyatukan keputusan produk dan fondasi teknis untuk `Repost ke Talks` agar:
- benar secara domain,
- idempotent dan aman dari race condition,
- konsisten di backend, API, cache, dan UI,
- maintainable untuk skala jangka panjang.

---

## 2. Kontrak Produk Final (Source of Truth)
- CTA di GALERY: `Repost ke Talks`.
- Toast sukses: `Berhasil Repost ke Talks`.
- Repost memindahkan post dari GALERY ke Talks.
- GALERY tetap area eksplorasi konten lama; repost adalah jalur resmi aktivasi ulang.
- Ejaan `GALERY` dipertahankan sesuai keputusan produk.

---

## 3. Prinsip Domain Utama
`created_at` tidak boleh dipakai sebagai “waktu aktivasi publik”.

Pisahkan dua konsep waktu:
- `created_at`: kapan post pertama kali dibuat (historical truth).
- `activated_at`: kapan post terakhir kali aktif dipublikasikan ke Talks.

Canonical public time:
- `public_at = activated_at ?? created_at`

Konsekuensi:
- sorting Talks, grouping GALERY, dan lifecycle eligibility harus membaca `public_at`, bukan `created_at` mentah.

---

## 4. Model Data yang Direkomendasikan
Entity utama: `CommunityPost`

### 4.1 Lifecycle State
- `status = active` -> tampil di Talks
- `status = gallery` -> tampil di GALERY

### 4.2 Kolom/Metadata
Kolom relasional (utama):
- `status` (`active|gallery`)
- `activated_at` nullable timestamp + index
- `expires_at` nullable timestamp + index
- `last_reposted_by` nullable bigint/foreign key
- `repost_count` unsigned int default 0

Metadata (opsional, bukan source of truth utama):
- `metadata.last_reposted_at`
- `metadata.repost_source`

Catatan penting:
- Gunakan kolom relasional untuk sorting/filtering performan.
- JSON metadata hanya untuk context tambahan, bukan lifecycle utama.

---

## 5. Kontrak API Repost
Endpoint command:
- `POST /api/community/posts/{postId}/repost`

Behavior:
- Auth required.
- Idempotent:
  - jika post sudah `active`, return sukses canonical tanpa efek ganda.
  - jika post `gallery`, transisikan ke `active`.
- Atomic (DB transaction + row lock).

Success response (canonical):
```json
{
  "data": {
    "post": {
      "id": "123",
      "status": "active",
      "createdAt": "2026-03-01T10:00:00Z",
      "activatedAt": "2026-04-13T09:00:00Z",
      "publicAt": "2026-04-13T09:00:00Z",
      "expiresAt": "2026-04-14T09:00:00Z",
      "metadata": {
        "last_reposted_at": "2026-04-13T09:00:00Z",
        "repost_count": 4
      }
    }
  }
}
```

Error envelope:
- `401/403`: unauthorized/forbidden
- `404`: post not found
- `409`: post locked/takedown/tidak eligible repost

---

## 6. Aturan Lifecycle
### Saat Create Post
- `created_at = now()`
- `activated_at = now()`
- `expires_at = activated_at + active_window`
- `status = active`

### Saat Repost
- `activated_at = now()`
- `expires_at = activated_at + active_window`
- `status = active`
- `repost_count += 1`
- `last_reposted_by = actor_id`
- `created_at` tetap, tidak berubah

### Saat Evaluasi Feed
- Talks: berdasarkan `status = active` dan urutan `public_at desc`
- GALERY: berdasarkan `status = gallery`, grouping bulan juga dari `public_at`

---

## 7. Backend Blueprint (Laravel)
### 7.1 Controller
Target file:
- `backend-api/app/Http/Controllers/Api/V1/CommunityApiController.php`

Action:
- validasi auth + policy
- invoke `CommunityRepostService::repostToTalks($postId, $actorId)`
- return canonical post payload (`createdAt`, `activatedAt`, `publicAt`, `expiresAt`, `status`)

### 7.2 Domain Service
File baru:
- `backend-api/app/Services/Community/CommunityRepostService.php`

Responsibility:
- transaction + `FOR UPDATE`
- guard post eligibility
- idempotent transition (`already_active` vs `transitioned`)
- update fields repost
- emit event domain

### 7.3 Event
File baru:
- `backend-api/app/Events/Community/PostRepostedToTalks.php`

Payload:
- `post_id`, `actor_id`, `previous_status`, `reposted_at`

Listener async (queue):
- analytics
- notification/fanout (opsional)
- cache invalidation hook (opsional)

---

## 8. Query & Read Model
### Talks Query
- filter: `status = active`
- order:
1. `COALESCE(activated_at, created_at) DESC`
2. `id DESC` (tie-break)

### GALERY Query
- filter: `status = gallery`
- sorting/filter kategori/search tetap berjalan
- grouping bulan berdasarkan `public_at`

Tujuan:
- setelah repost, post langsung keluar dari GALERY dan muncul di Talks secara deterministik.

---

## 9. Frontend Blueprint (Next.js)
### 9.1 API Mapping
Target file:
- `src/services/community.service.ts`

Kontrak model frontend:
- tambah `activatedAt?: string | null`
- tambah `publicAt?: string | null` (atau helper komputasi)

Helper tunggal:
- `getCommunityPublicDate(post) => post.activatedAt ?? post.createdAt`

### 9.2 State Transition
Target file:
- `src/features/community/pages/CommunityPage.tsx`

Rules:
- optimistic update boleh, tetapi reconcile dengan response canonical server.
- on success:
  - pindahkan post GALERY -> Talks
  - close detail dialog jika terbuka
  - tampilkan toast exact: `Berhasil Repost ke Talks`

### 9.3 UX Guard
- disable CTA saat request in-flight (`reposting`)
- single busy source per `postId` untuk mencegah double submit card/dialog

---

## 10. Concurrency, Idempotency, dan Safety
- transaction + row lock wajib.
- double click / retry network tidak boleh menggandakan `repost_count`.
- idempotency key opsional; baseline aman dengan row lock + status guard.

Rule output service:
- `transitioned`
- `already_active`
- `rejected`

---

## 11. Cache Strategy
Setelah repost sukses:
- invalidate feed key `community/posts`
- invalidate scoped user feed cache jika dipakai
- invalidate cache view GALERY/Talks terkait

Prinsip:
- cache invalidation mengikuti event repost, bukan polling UI semata.

---

## 12. Security & Policy
- Authenticated user only.
- Policy minimum:
  - owner dapat repost post miliknya.
  - moderator/admin dapat override sesuai aturan produk.
- Post moderation lock/takedown tidak boleh direpost (`409`).

---

## 13. Observability
Metric minimum:
- `community.repost.request.count`
- `community.repost.success.count`
- `community.repost.idempotent_hit.count`
- `community.repost.error.count` (by status code)
- `community.repost.latency.p95`

Structured logs:
- `post_id`, `actor_id`, `result`, `status_before`, `status_after`, `public_at_after`

---

## 14. Migration & Rollout Plan
### Phase 1: Foundation
1. Tambah kolom `activated_at`, `status`, `repost_count`, `last_reposted_by`.
2. Backfill `activated_at = created_at` untuk data lama.
3. Pastikan indeks query untuk `status`, `activated_at`, `expires_at`.

### Phase 2: Command Path
1. Implement `CommunityRepostService`.
2. Update endpoint repost agar return canonical payload.
3. Emit event `PostRepostedToTalks`.

### Phase 3: Read Path Unification
1. Semua query Talks/GALERY pakai `public_at`.
2. Frontend pakai helper tunggal `publicAt`.
3. Hentikan ketergantungan lifecycle pada metadata JSON.

### Phase 4: Validation
1. Backend feature tests.
2. Frontend integration/e2e tests.
3. Runtime validation via Docker (`/community` + repost flow).

---

## 15. Test Matrix (Wajib)
### Backend
Target:
- `backend-api/tests/Feature/CommunityRepostLifecycleTest.php`

Cases:
1. repost gallery -> active (200, transitioned)
2. repost active -> 200 idempotent (already_active)
3. unauthorized -> 401/403
4. locked/takedown -> 409
5. concurrent request -> hasil final konsisten, tanpa double increment
6. `created_at` tidak berubah setelah repost
7. `activated_at` berubah setelah repost

### Frontend
Target:
- `tests/community-repost-galery.spec.ts` (baru/extend sesuai struktur test saat ini)

Cases:
1. CTA label `Repost ke Talks` tampil di GALERY
2. toast sukses exact
3. post pindah GALERY -> Talks
4. CTA disabled saat pending
5. sorting/grouping menggunakan `public_at` setelah repost

---

## 16. Definition of Done
- Endpoint repost idempotent + transaction-safe.
- `created_at` tetap historis; `activated_at/public_at` jadi source of truth publik.
- UI GALERY/Talks konsisten setelah repost (tanpa refresh paksa).
- Toast, CTA, dan behavior produk sesuai kontrak final.
- Test matrix lulus.
- Tidak ada regresi filter rail/chevron/hover enhancement.

---

## 17. Post-Release Operations (Week 1)
Paket monitor metrik GALERY + dashboard minimum minggu pertama ada di:
- `docs/CORE/architecture/laravel-decoupled-hybrid/community/galery-post-release-monitoring-week1.md`

Ruang lingkup paket:
- checklist operasional harian,
- SQL widget dashboard minimum,
- guardrail threshold,
- runtime command,
- incident playbook singkat.

---

*Blueprint ini adalah hasil merge final dokumentasi arsitektur dan keputusan produk menjadi satu acuan implementasi.*
