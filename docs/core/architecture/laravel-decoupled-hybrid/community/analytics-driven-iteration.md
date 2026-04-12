# Analytics-Driven Iteration Framework: PostComposer

**Role**: Senior Product Strategist & Data-Driven UX Architect
**Status**: Production Strategy Spec
**Domain**: Community Experience / Growth & Iteration

---

## 1. Insight → Action Framework

Menerjemahkan data menjadi keputusan produk yang menjaga nada spiritual dan *premium* platform. Bukan untuk merekayasa adiksi, melainkan untuk melumerkan hambatan (friction) dalam berekspresi.

| Metric Signal | UX Interpretation | Product Action |
| :--- | :--- | :--- |
| **High `composer_open` + Low `typing_start`** | Pengguna penasaran, tapi terhalang oleh *blank page syndrome* atau kurangnya pemicu emosional. | Ubah tone placeholder (Prompt UX) menjadi lebih spesifik/reflektif sesuai waktu (pagi/malam). |
| **High `typing_start` + High Abandonment** | Keraguan untuk berbagi (kehilangan *confidence*) atau ketakutan akan penilaian. | Tambahkan *microcopy* jaminan privasi atau "Tidak ada cerita yang terlalu sederhana". |
| **High `draft_restore` + Low `submit_success`** | Niat kuat untuk menyelesaikan, tetapi ada friksi di tahap akhir (validasi atau teknis). | Evaluasi syarat minimum teks; sederhanakan error message submission. |
| **High Media Crop Cancels** | Editor carousel sulit digunakan atau performa lambat di *device* tertentu. | Kurangi default zoom, beri opsi *auto-fit* yang lebih jelas. |
| **Low Media Attachment in 'Testimony'** | Fungsi *Testimony* dirasa terlalu text-heavy; flow media tidak intuitif untuk tipe ini. | Berikan sugesti visual ("Sertakan momen yang menguatkan"). |
| **High Submit Failures (Validation)** | Pengguna sering membentur batasan karakter (terlalu pendek/panjang) tanpa peringatan awal. | Tambahkan indikator proaktif saat mendekati batas, hilangkan pesan error yang bersifat "menghukum". |
| **Repeat Draft Restores (Same User)** | Pengguna mencicil draf selama beberapa hari, komitmen tinggi tapi butuh waktu evaluasi. | Tambahkan flag *Slow Thinker*; sediakan mode "Simpan sebagai Jurnal Pribadi" jika enggan rilis publik. |
| **Sharp drop at `category_select`** | Kategori *default* tidak relevan, atau terlalu banyak pilihan yang membebani kognisi. | Pindahkan kategori paling relevan (berdasarkan waktu/konteks) ke urutan depan; amati konversi kategori. |
| **"Batal" Clicked immediately after Open** | Komposer tertekan (misclicked) atau *floating action button* terlalu agresif posisinya. | Evaluasi posisi pintu masuk `/community` di feed; pastikan bukan zona rawan salah sentuh. |
| **Short Time-to-Submit + Short Text** | Postingan impulsif atau *low-effort* (seperti platform X), bukan refleksi mendalam. | Kurangi dorongan kecepatan; pastikan UI mendorong ketenangan (*calm pace*). |

---

## 2. Prioritization System (ICE-S Model)

Setiap temuan analitik harus dinilai menggunakan sistem **ICE-S Modifikasi** agar eksperimen tetap ringan namun berdampak:

*   **Impact (1-5)**: Seberapa besar ini akan meningkatkan "Meaningful Activation Rate" (MAR)?
*   **Confidence (1-5)**: Seberapa yakin kita bahwa data ini bukan sekadar distorsi (*noise*)?
*   **Ease (1-5)**: Seberapa mudah ini diimplementasikan tanpa merusak arsitektur PostComposer saat ini?
*   **Spirit Alignment (Pass/Fail)**: Apakah solusi ini menghormati privasi, kedamaian, dan nilai spiritual platform? (Jika *Fail*, discard eksperimen).

*Prioritaskan eksperimen dengan skor total Tinggi & Spirit = Pass.*

---

## 3. Product Experiment Loop (Weekly Tempo)

Sistem literasi mingguan untuk tim fitur kecil:

1.  **Detect (Senin - Selasa)**: Tinjau funnel metrik di dasbor. Pilih 1 *bottleneck* utama (misal: Drop off dari *Typed* -> *Submit*).
2.  **Hypothesize (Rabu)**: Ajukan dugaan. "Pengguna ragu karena tombol 'Posting' terasa terlalu permanen."
3.  **Design Patch (Rabu)**: Rancang perubahan minor. "Ubah microcopy tombol dari 'Posting' menjadi 'Bagikan'."
4.  **Ship (Kamis)**: Rilis *hot-patch* ke env staging/produksi dengan *Feature Toggle* ringan.
5.  **Measure (Jumat - Minggu)**: Amati perubahan pada conversion rate di segmen tersebut membandingkannya dengan rerata masa lalu.

---

## 4. Targeted Product Improvements (Hypotheses Pipeline)

### A. Draft UX
*   **Problem**: Tingkat perombakan (*abandon*) draf yang dipulihkan tinggi.
*   **Hypothesis**: Pengguna lupa konteks emosional asli mengapa mereka mulai menulis draf tersebut.
*   **Proposed Solution**: Tambahkan meta-tag diam-diam di draf (misal: *"Dimulai saat membaca Renungan Pagi"*). Saat di-restore, tampilkan "Melanjutkan refleksi Renungan Pagi Anda...".
*   **Metric Tgt**: Peningkatan *Draft-to-Submit Conversion*.

### B. Prompt UX
*   **Problem**: High open rate, zero typing rate (Blank Page).
*   **Hypothesis**: Prompt statis gagal memicu empati.
*   **Proposed Solution**: Kontekstualisasi prompt berdasarkan waktu. (Malam: "Apa yang Anda syukuri hari ini?"; Pagi: "Langkah iman apa yang akan Anda ambil hari ini?").
*   **Metric Tgt**: Peningkatan *Open-to-Typing Rate*.

### C. Submit Flow
*   **Problem**: Friksi/Ragu saat menekan *Submit*.
*   **Hypothesis**: Tidak ada transisi "bernafas" (breathing room) sebelum rilis publik, memicu *anxiety*.
*   **Proposed Solution**: Ubah *state* tombol saat teks selesai namun belum diklik dari sekadar "AKTIF" menjadi sesuatu yang lebih hangat (e.g. Animasi fade-in halus). Pastikan *loading bar* tidak agresif.
*   **Metric Tgt**: Penurunan *Abandonment Rate* paska-pengetikan.

### D. Media Flow
*   **Problem**: Dropout setelah mencoba lampirkan gambar.
*   **Hypothesis**: Dialog Crop terlalu "pro" (slider zoom) untuk *quick share*.
*   **Proposed Solution**: Sediakan "Smart Fit" default di mana pengguna tidak perlu menyentuh *crop dial* kecuali diinginkan.
*   **Metric Tgt**: Penurunan *Crop Cancellations* dan peningkatan *Media Success Rate*.

---

## 5. Event → Product Feedback Hooks

Injeksi *gentle adjustments* berdasarkan sinyal pengguna *real-time*:

1.  **Sinyal**: 3x membatalkan postingan dalam 1 jam (Ragu-ragu).
    *   **Hook**: Secara halus ubah teks *helper* di bawah input: *"Setiap tulisan adalah proses, tidak harus sempurna."*
2.  **Sinyal**: Sering melakukan "Draft Restore" tapi tidak pernah *"Submit"*.
    *   **Hook**: Tawarkan opsi visibilitas secara asinkron : *"Ingin menyimpan ini sebagai catatan pribadi sementara?"* (Catatan: Butuh dukungan backend kelak).
3.  **Sinyal**: Proses mengetik sangat panjang (>5 menit) tapi belum dikirim.
    *   **Hook**: Munculkan toast halus *“Draf Anda secara otomatis diamankan.”* (Memberikan jaminan teknis).

*Aturan Emas: Hooks ini tidak boleh muncul menutupi area konten.*

---

## 6. Dashboard → Action Layer

Evolusi dasbor analitik dari *Descriptive* (Apa yang terjadi?) menjadi *Prescriptive* (Apa yang harus dilakukan?):

*   **Insight Banners**: Alih-alih hanya menampilkan grafik *Open Rate*, tampilkan banner otomatis: `⚠️ Penurunan 15% dari Typing ke Submit pada kategori 'Kesaksian'. Rekomendasi: Audit validation form untuk kategori ini.`
*   **Anomaly Highlighting**: Grafik otomatis mewarnai merah rentang waktu di mana *Network Errors* spiking pada fungsi `submit_attempt`.

---

## 7. Implementation Handoff for Codex

### Arsitektur yang Direkomendasikan
Gunakan desain modular yang tidak mengikat erat analitik dengan komposer fisik.

**`src/features/community/hooks/useComposerInsights.ts`**
Sebuah *hook* yang memantau interaksi *real-time* via *analytics provider* dan memicu mutasi lokal.
```tsx
// Konsep:
const { promptVariant } = useComposerInsights({ 
   abandonCount: recentAbandons,
   isNightTime: checkDayNightConfig() 
});
```

**Pemisahan**: 
*   Komposer UI hanya menerima `promptVariant` atau `helperText`.
*   Analitik mendengarkan aksi dari Komposer UI.
*   `useComposerInsights` membaca tren lokal (via IndexedDB/Context) dan memanipulasi *props* yang akan di-feed ke UI.

---

## 8. MVP vs Advanced Implementation

### MVP (Go To Market)
*   **Contextual Prompts**: Ubah placeholder berdasar pagi/siang/malam dan status draf persis seperti spec Draf UX.
*   **Insight Gathering**: Aktifkan Funnel Metrik (Open -> Typing -> Submit). Lakukan review manual tiap hari Senin.

### Advanced (Deferred)
*   **Feedback Hooks Real-time**: Memonitor kebiasaan ragu (abandonment) secara lokal lalu merespons dengan *smart helper text*. Tunda hingga ada volume data yang substansial (e.g., >1k submissions/week).
*   **Automated Action Dashboard**: Melatih alert bot untuk memberikan notifikasi slack/email bila MAR drop drastis di luar pola reguler.

---

*Architected by Antigravity Senior Product Strategist*
