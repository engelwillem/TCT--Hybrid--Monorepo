# Analytics Dashboard Specification: PostComposer

**Role**: Senior Product Analyst & Data Strategist
**Status**: Production Spec for Implementation
**Domain**: Community Experience / User Activation

---

## 1. North Star Metric
**"Meaningful Activation Rate" (MAR)**
*   **Definisi**: Persentase sesi pembukaan composer yang berakhir dengan postingan sukses yang berisi teks (>10 kata) atau media terlampir.
*   **Rasional**: PostComposer bukan sekadar alat input, melainkan pintu masuk ekspresi. MAR tinggi menunjukkan sistem yang efektif mengonversi "niat" (intent) menjadi "partisipasi" (participation) tanpa hambatan teknis atau kognitif.

---

## 2. Funnel Model

| Tahap | Event | Makna Drop-off | Sinyal "Buruk" |
| :--- | :--- | :--- | :--- |
| **Open** | `composer_open` | Penasaran tapi tidak punya ide. | CTR tinggi tapi aktivitas nol. |
| **Engage**| `composer_typing_start` | Mulai ekspresi tapi terhenti. | Hambatan kognitif / perfeksionisme. |
| **Prepare**| `composer_attach_media` | Ingin berbagi visual/memori. | Friksi pada galeri atau cropping. |
| **Attempt**| `composer_submit_attempt` | Ingin posting (Niat penuh). | Validasi gagal (teks pendek/error). |
| **Success**| `composer_submit_success` | Partisipasi berhasil. | <60% dari tahap Attempt. |

---

## 3. Key Dashboard Sections

### A. Performance & Discovery
- **Conversion Rate (Open-to-Success)**: Indikator kesehatan utama.
- **Average Time-to-Post**: Mengukur kelancaran UX (Ideal: <2 menit untuk refleksi singkat).

### B. Media Strategy
- **Media Attachment Rate**: % post yang menggunakan gambar.
- **Media vs Text Success**: Apakah post dengan media lebih sering berhasil diposting?
- **Crop Interaction Density**: Jumlah edit posisi sebelum akhirnya diposting.

### C. Draft & Continuity
- **Draft Restore Efficiency**: % sesi yang menggunakan kembali draf dari memori.
- **Abandoned Draft Ratio**: Jumlah draf yang tersimpan tapi tidak pernah diposting >48 jam.

### D. Friction & Error Analysis
- **Top Validation Failures**: Alasan paling umum gagal (teks terlalu pendek, gambar terlalu banyak).
- **Network Error Rate**: Sinyal gangguan pada proxy atau backend Laravel.

---

## 4. Data Contract
Setiap event harus menyertakan payload minimal sebagai berikut:

```typescript
interface ComposerAnalyticsPayload {
  sessionId: string;
  userId?: string; // Nullable for guests
  postType: 'quote' | 'reflection' | 'prayer_request' | 'testimony' | 'user_post';
  hasMedia: boolean;
  mediaCount: number;
  textLengthBucket: 'empty' | 'short' | 'medium' | 'long'; // e.g., <20, 20-100, >100 chars
  isDraftRestore: boolean;
  timeSpentMs: number;
  failureReason?: string; // Only for errors/failures
}
```

---

## 5. Implementation Roadmap (Codex Handoff)

### MVP (Implement Now)
- **Rute**: `src/features/community/pages/admin/ComposerAnalytics.tsx`.
- **Fetching**: Gunakan pola `SWR` atau `React Query` untuk memanggil `/api/analytics/community/composer`.
- **UI**: 3 kartu metrik utama + 1 Funnel Chart (menggunakan `recharts` atau `shadcn/chart`).

### Later Improvements
- Segmentasi berdasarkan platform (Mobile vs Desktop).
- Perbandingan performa antar kategori post (misal: Refleksi vs Kesaksian).
- Heatmap waktu penulisan paling aktif.

---

## 6. Actionable Insights & Alerts

1.  **Insight**: Drop-off tajam antara `Engage` -> `Attempt`.
    *   **Action**: Berikan prompt/inspirasi teks (suggestion) atau sederhanakan persyaratan teks minimal.
2.  **Insight**: High "Crop Failed" events.
    *   **Action**: Audit komponen Dialog Editor; periksa kompatibilitas format gambar di mobile.
3.  **Insight**: Low "Media Attach Rate" pada desktop.
    *   **Action**: Tambahkan fitur Drag & Drop yang lebih jelas pada area composer.
4.  **Insight**: High "Draft Restore" tapi rendah "Success".
    *   **Action**: Pengguna ingin posting tapi mungkin ada masalah autentikasi saat pengiriman. Periksa `AuthExecutionGate`.

---

*Spec authored by Antigravity Senior Product Analyst*
