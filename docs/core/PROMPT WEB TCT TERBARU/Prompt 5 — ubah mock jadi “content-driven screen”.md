Lanjutkan dari implementasi `/today` yang terbaru.

Jangan pindah ke backend penuh, API fetch nyata, auth, analytics, tab bar, atau sistem global dulu.

Fokus tahap ini hanya pada:
**mengubah `/today` dari static mock menjadi content-driven screen yang siap menerima data dinamis, tanpa merusak UX, visual hierarchy, dan iOS-native feel yang sudah berhasil.**

Konteks:
- `/today` sudah punya flow dan feel yang cukup baik
- struktur utama tetap: Receive → Reflect → Pray → Complete
- positioning tetap: Digital Sanctuary
- goal tahap ini: memisahkan content model dari presentational UI agar nanti mudah dihubungkan ke CMS / backend nyata

Tugas Anda:
Audit implementasi saat ini, lalu refactor agar:
1. semua copy dan content utama tidak hardcoded di dalam komponen presentational
2. ada content model yang jelas untuk satu sesi `/today`
3. page menerima data dari satu source terstruktur (mock data/local object dulu)
4. komponen tetap bersih, kecil, dan presentational
5. mudah nanti dihubungkan ke API/CMS tanpa rewrite besar
6. tidak merusak interaction states dan completion flow yang sudah bagus

Saya ingin Anda membuat struktur data yang mencakup minimal:
- greeting
- opening line
- verse label
- verse text
- verse reference
- reflection prompt
- reflection placeholder
- reflection sealed label
- prayer label
- prayer text
- prayer completion label
- completion title
- completion body
- soft progress label
- progress value
- tomorrow cue label
- tomorrow cue text

Kalau perlu, Anda boleh menambahkan field lain, tetapi tetap minimal dan elegan.

Jangan lakukan ini:
- jangan fetch dari API dulu
- jangan tambah database
- jangan tambah server actions
- jangan tambah state management kompleks
- jangan ubah flow utama
- jangan ubah visual direction besar
- jangan tambah fitur baru
- jangan campur content schema dengan styling logic

Saya ingin output Anda berupa:
1. Content Model Audit
2. Refactor Plan
3. Proposed Data Shape / TypeScript types
4. Full Revised Code
5. Why This Makes Future Integration Safer
6. Deferred Again

Aturan penting:
- pertahankan visual dan interaction quality
- refactor seperlunya, jangan over-engineer
- prioritaskan clean component boundaries
- data model harus mendukung UX, bukan sekadar lengkap secara teknis
- hindari schema yang terlalu enterprise atau terlalu abstrak

Format jawaban:
1. Content Model Audit
2. Refactor Plan
3. Proposed Data Shape / Types
4. Full Revised Code
5. Why This Makes Future Integration Safer
6. Deferred Again
