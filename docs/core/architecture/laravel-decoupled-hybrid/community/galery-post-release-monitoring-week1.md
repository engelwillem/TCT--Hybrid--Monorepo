# GALERY Post-Release Monitoring Package (Week 1)

**Scope**: `/community` tab `GALERY` + flow `Repost ke Talks`  
**Status**: Operational Checklist (Week 1)  
**Date**: 13 April 2026  
**Timezone Operasional**: WIB (`Asia/Jakarta`)

---

## 1. Tujuan Minggu Pertama
- memastikan flow repost stabil setelah rilis,
- mendeteksi dini stale state (GALERY/Talks tidak sinkron),
- memantau adopsi awal (`Repost ke Talks`) dengan metrik minimum yang benar-benar actionable.

---

## 2. Data Source yang Dipakai (Saat Ini)
- `landing_click_events` (event analytics listener `community_repost_success`)
- `member_posts` (source of truth lifecycle: `status`, `activated_at`, `repost_count`, `last_reposted_by`)
- `failed_jobs` (gagal listener async)
- Redis cache bust marker:
  - `community:cache:bust:feed`
  - `community:cache:bust:gallery`

Catatan:
- Event `already_active` **tidak** didispatch sebagai repost baru (sesuai guardrail anti-bias).

---

## 3. Checklist Operasional Week 1

## 3.1 Cadence
- H0-H1 (24 jam pertama): cek tiap 2 jam.
- H2-H3: cek 2x per hari (`10:00`, `18:00` WIB).
- H4-H7: cek 1x per hari (`10:00` WIB).

## 3.2 Checklist Inti per Run
1. Health endpoint frontend `/community` tetap `200`.
2. Volume `community_repost_success` tidak drop ke 0 secara tidak wajar.
3. Listener queue tidak menumpuk (`failed_jobs` tidak naik tajam).
4. Cache bust marker terus bergerak saat ada repost.
5. Sampel manual 1 flow:
   - repost dari GALERY,
   - post hilang dari GALERY,
   - post muncul di Talks,
   - reload tetap konsisten.

---

## 4. Minimum Event Dashboard (Week 1)

## 4.1 Widget A - Repost Success (Hourly)
Tujuan: deteksi drop traffic atau event ingestion mati.

```sql
SELECT
  DATE_FORMAT(created_at, '%Y-%m-%d %H:00:00') AS hour_bucket,
  COUNT(*) AS repost_success
FROM landing_click_events
WHERE event_name = 'community_repost_success'
  AND created_at >= NOW() - INTERVAL 72 HOUR
GROUP BY 1
ORDER BY 1 DESC;
```

## 4.2 Widget B - Unique Reposter (Daily)
Tujuan: cek breadth adopsi, bukan hanya volume klik.

```sql
SELECT
  DATE(created_at) AS event_date,
  COUNT(DISTINCT user_id) AS unique_reposters
FROM landing_click_events
WHERE event_name = 'community_repost_success'
  AND created_at >= NOW() - INTERVAL 14 DAY
GROUP BY 1
ORDER BY 1 DESC;
```

## 4.3 Widget C - Repost by Source Surface
Tujuan: validasi source surface tetap dominan dari GALERY.

```sql
SELECT
  COALESCE(
    JSON_UNQUOTE(JSON_EXTRACT(meta, '$.payload_meta.source_surface')),
    'unknown'
  ) AS source_surface,
  COUNT(*) AS total
FROM landing_click_events
WHERE event_name = 'community_repost_success'
  AND created_at >= NOW() - INTERVAL 7 DAY
GROUP BY 1
ORDER BY total DESC;
```

## 4.4 Widget D - Repost by Post Category
Tujuan: lihat kategori mana paling sering diaktifkan kembali.

```sql
SELECT
  mp.type AS post_type,
  COUNT(*) AS repost_total
FROM landing_click_events e
JOIN member_posts mp
  ON mp.id = CAST(JSON_UNQUOTE(JSON_EXTRACT(e.meta, '$.payload_meta.post_id')) AS UNSIGNED)
WHERE e.event_name = 'community_repost_success'
  AND e.created_at >= NOW() - INTERVAL 7 DAY
GROUP BY mp.type
ORDER BY repost_total DESC;
```

## 4.5 Widget E - Self vs Non-self Repost
Tujuan: bedakan reaktivasi oleh author vs oleh user lain.

```sql
SELECT
  CASE
    WHEN JSON_UNQUOTE(JSON_EXTRACT(meta, '$.payload_meta.author_id'))
       = JSON_UNQUOTE(JSON_EXTRACT(meta, '$.payload_meta.reposted_by'))
    THEN 'self_repost'
    ELSE 'non_self_repost'
  END AS repost_mode,
  COUNT(*) AS total
FROM landing_click_events
WHERE event_name = 'community_repost_success'
  AND created_at >= NOW() - INTERVAL 7 DAY
GROUP BY repost_mode;
```

## 4.6 Widget F - Async Listener Failure (Critical)
Tujuan: deteksi analytics/cache invalidation listener gagal.

```sql
SELECT
  DATE(created_at) AS event_date,
  COUNT(*) AS failed_jobs
FROM failed_jobs
WHERE created_at >= NOW() - INTERVAL 7 DAY
  AND (
    payload LIKE '%RecordPostRepostedAnalytics%'
    OR payload LIKE '%InvalidateCommunityPostCaches%'
    OR payload LIKE '%PostRepostedToTalks%'
  )
GROUP BY 1
ORDER BY 1 DESC;
```

---

## 5. Guardrail Threshold (Week 1)

1. `Repost Success Hourly`:
   - Alert jika `0` selama 6 jam berturut-turut pada jam aktif (`07:00-22:00 WIB`), kecuali ada campaign freeze.
2. `Failed Listener Jobs`:
   - Alert jika > `5`/jam atau tren naik 3 window berturut.
3. `Source Surface`:
   - Alert investigasi jika `source_surface=gallery` turun < `80%` mendadak.
4. `Self vs Non-self`:
   - Alert investigasi jika `non_self_repost` melonjak abnormal (indikasi misuse/automation).

---

## 6. Runtime Health Commands (Copy/Paste)

## 6.1 Frontend + Endpoint
```powershell
docker compose ps
try { (Invoke-WebRequest 'http://127.0.0.1:9002/community' -UseBasicParsing -TimeoutSec 30).StatusCode } catch { 'COMMUNITY_FAIL' }
```

## 6.2 Backend Queue Failure (Laravel)
```powershell
docker exec tct-backend php artisan queue:failed --queue=default
```

## 6.3 Cache Bust Marker (Redis)
```powershell
docker exec tct-redis redis-cli GET community:cache:bust:feed
docker exec tct-redis redis-cli GET community:cache:bust:gallery
```

---

## 7. Incident Playbook Singkat

## 7.1 Gejala: Repost sukses toast, tapi GALERY tidak update
1. cek `failed_jobs` listener invalidasi cache,
2. cek marker `community:cache:bust:*` bertambah atau tidak,
3. lakukan replay job queue bila perlu,
4. verifikasi ulang flow repost 1 sampel end-to-end.

## 7.2 Gejala: Repost volume drop mendadak
1. cek endpoint `/community` dan API repost,
2. cek backlog queue listener analytics,
3. cek perubahan deploy 24 jam terakhir,
4. validasi SQL event ingestion (Widget A) apakah nol total atau hanya menurun.

## 7.3 Gejala: Data dashboard bias
1. pastikan event `already_active` tidak ikut dihitung repost sukses,
2. audit duplikasi `session_id/request_id`,
3. sampling 20 event terbaru dan cocokan dengan `member_posts.repost_count`.

---

## 8. Deliverable Monitoring Minggu Pertama

Setiap hari kirim ringkasan singkat:
1. total repost success (24 jam),
2. unique reposters,
3. top 3 kategori paling sering direpost,
4. jumlah failed listener jobs,
5. status health `/community` (200/failed),
6. aksi korektif jika ada anomali.

---

## 9. Catatan Iterasi Week 2 (Opsional)
- Tambah metric eksplisit `community.repost.already_active.count` (separate channel, bukan success).
- Tambah p95 latency repost endpoint di telemetry backend.
- Tambah panel conversion GALERY impression -> repost click jika event impression/card_open tersedia.

