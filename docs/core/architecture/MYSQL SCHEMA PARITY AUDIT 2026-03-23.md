# MySQL Schema Parity Audit 2026-03-23

Dokumen ini memisahkan audit schema database dari audit runtime umum.

Tujuannya:
- memastikan tim tidak mencampur route parity dengan schema parity
- memberi baseline yang bisa dipakai untuk bug data, security, dan Filament
- membedakan:
  - source migration parity
  - local database parity
  - production database parity

---

## 1. Scope

Audit ini mencakup:
- inventory migration source di `backend-api/database/migrations`
- status migrasi lokal melalui `php artisan migrate:status`
- pembacaan bukti runtime cPanel yang sudah ada dari audit server sebelumnya

Audit ini belum mencakup:
- dump schema MySQL production mentah
- diff kolom per tabel production vs local
- row/data parity
- index/constraint verification via direct `information_schema`

Jadi ini adalah schema parity baseline, bukan full forensic database diff.

---

## 2. Evidence yang Dipakai

### Source migration inventory
- lokasi: [backend-api/database/migrations](../../../backend-api/database/migrations)
- jumlah file migration source: `66`

### Local migration status
Command:

```powershell
php backend-api/artisan migrate:status --no-ansi
```

Hasil ringkas:
- local ran count: `66`
- source migration file count: `66`

Artinya:
- database lokal yang sedang terhubung ke env local sudah menjalankan seluruh migration source yang ada

### Production runtime evidence
Yang sudah terbukti dari audit cPanel sebelumnya:
- aplikasi production berjalan normal untuk route penting
- tabel yang secara fungsional pasti hidup:
  - `users`
  - `member_posts`
  - `personal_access_tokens`
  - `daily_contents`
  - `study_paths`
  - `user_verse_actions`
  - `ss_day_comments`
  - `direct_messages`
- profile authenticated dan community payload production pernah berhasil dibaca, yang menandakan DB boundary nyata hidup

### Production migration status after deploy
Setelah deploy backend dari commit `8679efa`, audit ulang cPanel berhasil menangkap tail `migrate:status` live:

```text
2026_03_06_200007_create_user_study_path_progress_table ............ [2] Ran
2026_03_06_200008_alter_bible_verses_add_testament ................. [2] Ran
2026_03_07_110000_create_versehub_landing_events_table ............. [2] Ran
2026_03_07_120000_create_landing_click_events_table ................ [2] Ran
2026_03_07_200000_add_media_paths_to_member_posts_table ............ [2] Ran
2026_03_09_120000_enable_guest_comments_for_channels_and_versehub .. [3] Ran
2026_03_10_160000_add_firebase_uid_to_users_table .................. [4] Ran
2026_03_11_164500_create_personal_access_tokens_table .............. [4] Ran
2026_03_17_011419_add_spiritual_state_to_users_table ............... [5] Ran
```

### Batasan evidence production pada pass ini
- `php artisan migrate:status` live sekarang berhasil ditangkap sebagian setelah deploy
- jadi status production schema di dokumen ini dibaca sebagai:
  - `freshly re-captured in sampled form`
  - `belum full dump satu pass stabil`

---

## 3. Migration Surface Map

### Core foundation
- `users`
- `password_reset_tokens`
- `sessions`
- `cache`
- `jobs`
- `failed_jobs`
- `personal_access_tokens`

### Admin, security, and user state
- `add_is_admin_to_users_table`
- `add_filament_mfa_fields_to_users_table`
- `add_avatar_path_to_users_table`
- `add_last_seen_at_to_users_table`
- `add_is_it_to_users_table`
- `add_firebase_uid_to_users_table`
- `add_spiritual_state_to_users_table`
- `create_admin_audit_logs_table`

### Today / ritual / reflection
- `create_daily_contents_table`
- `fix_daily_contents_unique_index`
- `create_reflection_responses_table`
- `drop_legacy_today_tables`

### Community
- `create_member_posts_table`
- `enhance_member_posts_table`
- `add_media_paths_to_member_posts_table`
- `create_member_post_comments_table`
- `create_member_post_reactions_table`
- `create_member_post_bookmarks_table`
- `create_member_post_reports_table`
- `create_member_post_meta_table`

### VerseHub / Bible / mentor
- `create_bible_verses_table`
- `create_bible_verses_fts5`
- `create_versehub_comments_table`
- `create_user_verse_actions_table`
- `create_user_journal_drafts_table`
- `create_verse_relationships_table`
- `create_verse_themes_table`
- `create_verse_theme_mappings_table`
- `create_user_mentor_sessions_table`
- `alter_bible_verses_add_testament`

### Study paths / lessons / sabbath school
- `create_ss_quarters_table`
- `create_ss_lessons_table`
- `create_ss_days_table`
- `add_media_links_to_ss_days_table`
- `add_cover_image_url_to_ss_days_table`
- `create_ss_day_comments_table`
- `create_quarters_table`
- `create_lessons_table`
- `create_user_lesson_progress_table`
- `create_study_paths_table`
- `create_study_path_steps_table`
- `create_user_study_path_progress_table`

### Social graph / inbox / events
- `create_user_follows_table`
- `create_direct_messages_table`
- `create_notifications_table`
- `create_versehub_landing_events_table`
- `create_landing_click_events_table`
- `create_channel_members_table`
- `create_channel_posts_table`
- `create_channels_table`
- `create_posts_table`
- `add_meta_to_posts_table`

### Operational/data lifecycle
- `create_data_lifecycle_markers_table`
- `mark_legacy_today_tables_drop_ready`
- `create_app_settings_table`
- `create_feed_items_table`
- `create_user_metrics_table`

---

## 4. Local Schema Verdict

Verdict: `PASS`

Alasan:
- seluruh `66` file migration source terdeteksi
- seluruh `66` migration berstatus `Ran` di local database yang aktif

Makna praktis:
- untuk development backend lokal, schema source dan local DB saat ini sinkron
- bug yang muncul di local tidak boleh langsung diasumsikan karena migration tertinggal

---

## 5. Production Schema Verdict

Verdict: `PASS WITH SAMPLE-BASED LIVE EVIDENCE`

Alasan yang mendukung sinkron:
- route production penting hidup
- profile production authenticated pernah terbaca
- community dan media pipeline production hidup
- personal access token table jelas berfungsi
- Today, Study Paths, VerseHub, dan Community surfaces berjalan di runtime nyata
- migration tail sesudah deploy menunjukkan entry terbaru tetap `Ran`

Kenapa belum diberi PASS penuh:
- dump penuh `migrate:status` production dalam satu pass stabil belum tertangkap
- belum ada dump `information_schema` production
- belum ada diff tabel/kolom per-domain terhadap local

---

## 6. Risiko Schema yang Masih Harus Diperhatikan

### A. Drift yang belum terlihat dari route/API
Route production bisa hidup walau:
- ada kolom baru yang belum termigrasi
- ada index yang belum terpasang
- ada nullable/default mismatch

### B. Filament admin surface
Karena admin memakai tabel user/security dan content management:
- mismatch schema kecil bisa muncul duluan di admin
- sementara public route masih terlihat normal

### C. Media and profile bugs
Bug avatar atau community upload bisa disalahbaca sebagai bug storage, padahal:
- schema field bisa mismatch
- serializer bisa mismatch
- migration baru mungkin belum applied

---

## 7. Recommended Production Schema Verification

Begitu SSH cPanel stabil, jalankan ini:

```bash
cd /home/thechoosentalks/deploy/apps/thechoosentalks/current
php artisan migrate:status --no-ansi
```

Untuk diff yang lebih dalam:

```bash
php artisan tinker --execute="print_r(\Illuminate\Support\Facades\Schema::getTableListing());"
```

Dan bila operator memang ingin audit MySQL secara eksplisit:

```bash
php artisan tinker --execute="echo DB::selectOne('select database() as db')->db.PHP_EOL;"
```

Lalu lanjutkan dengan audit `information_schema` dari koneksi DB aktif.

---

## 8. Final Conclusion

Status schema parity saat ini:
- source migration parity: `PASS`
- local DB parity: `PASS`
- production DB parity: `PASS with sampled live verification`

Cara membaca hasil ini:
- untuk coding dan bug cleanup lokal, schema basis sudah sehat
- untuk production-risk decisions, idealnya tetap ambil dump penuh `migrate:status` dan `information_schema`
- jangan menulis `full MySQL parity closed` sebelum verification DB production lebih dalam selesai
