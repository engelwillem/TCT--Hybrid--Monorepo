# Mentor Data Reality Audit (Scripture Guide)

**Tanggal Audit:** 2026-03-13  
**Status Parity:** IN PROGRESS (Schema aligned, Data source is template-limited)

---

## 1. Current Mentor Data Flows

| UI Component | Service/Client | Proxy (Next.js) | Backend Endpoint | Source of Truth |
|---|---|---|---|---|
| **MentorPanel.tsx** | `fetch()` native | `/api/versehub/[lang]/[ref]/mentor` | `VerseHubController@mentorInsights` | `VerseHubMentorService` |
| **Ask the Bible** | `fetch()` POST | `/api/versehub/[lang]/[ref]/mentor/ask` | `VerseHubController@mentorAsk` | `MentorDriverInterface` |
| **Study Path Integration** | `getActiveStudyPaths` | Included in Mentor Payload | N/A (Internal Service Call) | `StudyPath` Model |

---

## 2. Source of Truth mapping

- **Logic Owner**: `backend-api/app/Services/VerseHubMentorService.php`
- **Data Drivers**: 
    - `TemplateMentorDriver.php`: (Current) Menyediakan respon berbasis kata kunci (MOCK-LIKE).
    - `OpenAIMentorDriver.php`: (Future) Target untuk parity AI yang sesungguhnya.
- **Relational Data**: Database MySQL (`verse_relationships`, `verse_theme_mappings`).

---

## 3. Contract Comparison: Legacy vs Hybrid

| Field | Legacy (Blade/Inertia) | Hybrid (JSON API) | Parity Status |
|---|---|---|---|
| **Reflection Questions** | Array of strings | `insights.reflection_questions` | **DONE** |
| **Theme Connections** | List of names | `insights.theme_connections` | **DONE** |
| **Historical Context** | String/Null | `insights.historical_context` | **DONE** |
| **Relationships** | N/A (Web Only) | `relationships` (Array of objects) | **IMPROVED** |
| **Ask Result** | Text Response | `answer`, `interpretation`, `study_guidance` | **DONE** |
| **Scripture Basis** | Partial | `scripture_basis` (Full anchor + refs) | **DONE** |

---

## 4. Parity Gaps & Implementation Findings

### A. Template-Based Limitations (The "Hidden Mock")
- **Findings**: `TemplateMentorDriver.php` hanya mengenal beberapa kata kunci (kasih, takut, pertobatan). Jika user bertanya di luar itu, responnya sangat generik.
- **Legacy Parity**: Legacy memiliki ekspektasi "Smart Mentor". Versi hybrid saat ini secara teknis *persistent* tapi datanya masih bersifat "palsu" karena tidak dinamis per ayat.

### B. CSRF and Auth Collision
- **Findings**: `MentorPanel.tsx` mencoba mengambil CSRF token dari meta tag untuk request `POST /ask`.
- **Gap**: Di arsitektur decoupled, Next.js proxy tidak memerlukan CSRF Laravel (karena sudah diproteksi Sanctum Bearer Token). Penggunaan meta tag CSRF di Next.js adalah sisa-sisa pola legacy yang tidak relevan.

### C. Denominational Context
- **Findings**: Backend memiliki logic `getDenominationalContext` untuk ayat sensitif (Yoh 6:53, Rom 9:18).
- **Gap**: Data ini **BELUM** diekspos ke API `mentorInsights`, sehingga informasi teologis mendalam yang ada di backend tidak tampil di UI Next.js.

### D. Study Path Deep-Linking
- **Findings**: Payload `active_study_paths` sudah dikirim, namun `MentorPanel.tsx` baru menampilkan nama jalurnya saja, belum mengarahkan user ke langkah spesifik di dalam jalur tersebut.

---

## 5. Files Requiring Hardening (Batch 0: Mentor)

### Backend (Laravel)
- `app/Http/Controllers/VerseHubController.php`: Tambahkan `denominational_context` ke payload JSON.
- `app/Services/VerseHubMentorService.php`: Integrasikan `relationships` dan `themes` lebih erat ke dalam `getGuidedInsights`.

### Frontend (Next.js)
- `src/components/versehub/MentorPanel.tsx`: 
    - Hapus ketergantungan pada CSRF meta tag.
    - Implementasikan UI untuk `denominational_context` (Tab baru atau section di Context).
    - Hardening tampilan `askResult.related_refs` agar bisa diklik tanpa me-reload seluruh page.

---

## 6. Execution Priority (Batch 0: Mentor)

1.  **P0: Denominational Context Bridge**: Ekspos data tradisi teologis ke API (Gap terbesar di sisi kedalaman konten).
2.  **P0: Auth Request Hardening**: Ganti CSRF logic dengan Bearer Token di `MentorPanel.tsx`.
3.  **P1: Related Refs Navigation**: Pastikan navigasi antar ayat di dalam panel mentor tidak merusak state pembaca.

---
*Audit Mentor Data selesai. Siap untuk masuk ke fase penutupan gap data teologis.*
