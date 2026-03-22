Lanjutkan dari baseline `/today` yang sudah terkunci.

Jangan tambah fitur baru, jangan sentuh auth, analytics, global navigation, cross-device sync, atau backend persistence.

Fokus tahap ini hanya pada:
**menyempurnakan state pengalaman saat loading, hydration, restore, dan fallback**, agar `/today` terasa premium dari detik pertama dibuka sampai state final tampil.

Konteks:
- arsitektur utama sudah benar
- data layer sudah resilient
- persistence lokal sudah ada
- visual direction sudah cukup matang
- tetapi saya ingin pengalaman state-nya juga terasa premium, bukan sekadar technically correct

Audit implementasi saat ini secara kritis, lalu revisi agar:
1. initial page load tidak terasa blank atau kasar
2. hydration dari local persistence tidak terasa seperti UI menghilang lalu muncul tiba-tiba
3. same-day restore terasa lembut dan intentional
4. fallback ke mock/default content tetap tenang dan usable
5. jika external source gagal, screen tidak terasa broken atau “cheap”
6. semua state ini tetap subtle, editorial, calm, dan iOS-native in feel

Saya ingin Anda mempertimbangkan secara kritis:
- apakah `opacity-0 -> opacity-100` masih terlalu kasar atau terlalu “web”
- apakah perlu skeleton, placeholder, atau ambient loading treatment yang lebih elegan
- bagaimana membedakan:
  - first load
  - restore from local persistence
  - fallback to mock/default content
- apakah user perlu tahu bahwa external source gagal, atau cukup diam-diam fallback
- kalau perlu ada cue, bagaimana membuatnya sangat halus dan tidak teknis
- bagaimana menjaga state transitions tetap tidak teatrikal

Silakan pilih pendekatan paling sederhana dan elegan.

Jangan lakukan ini:
- jangan tambah spinner generik
- jangan tambah banner error merah
- jangan tambah toast berisik
- jangan tambah empty-state marketing
- jangan merusak visual simplification yang sudah bagus
- jangan membuat state management berlebihan
- jangan ubah flow utama Receive → Reflect → Pray → Complete

Saya ingin output berupa:
1. State Experience Audit
2. Problems with Current Load / Hydration / Fallback Feel
3. Recommended State Polish Strategy
4. Revised Behavior for:
   - First Load
   - Local Restore
   - External Fallback
5. Full Revised Code
6. Why This Feels More Premium
7. Deferred Again

Aturan penting:
- tetap simple
- tetap calm
- tetap premium
- jangan terlalu banyak menjelaskan ke user
- prioritaskan experiential polish over technical visibility

Format jawaban:
1. State Experience Audit
2. Problems with Current Load / Hydration / Fallback Feel
3. Recommended State Polish Strategy
4. Revised Behavior for First Load / Local Restore / External Fallback
5. Full Revised Code
6. Why This Feels More Premium
7. Deferred Again
