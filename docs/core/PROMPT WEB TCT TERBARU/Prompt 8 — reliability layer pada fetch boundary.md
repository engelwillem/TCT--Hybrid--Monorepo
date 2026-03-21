Lanjutkan dari implementasi `/today-v2` yang terbaru.

Jangan tambah fitur baru, jangan sentuh visual hierarchy utama, jangan ubah flow Receive → Reflect → Pray → Complete, jangan sentuh auth, jangan sentuh analytics, dan jangan pindah ke global navigation.

Fokus tahap ini hanya pada:
**membuat fetch/data-loading boundary `/today-v2` lebih reliable untuk production**, terutama saat nanti terhubung ke Laravel/CMS sungguhan.

Konteks:
- sekarang sudah ada source -> mapper -> loader -> UI
- mapper sudah lebih resilient dengan fallback per-field
- tetapi network/data access layer masih terlalu tipis untuk kondisi production nyata
- saya ingin boundary ini tahan terhadap timeout, respons lambat, respons non-200, JSON rusak, dan kondisi endpoint yang kadang tidak stabil

Tugas Anda:
Audit data-loading boundary saat ini, lalu refactor agar:
1. fetch ke external source punya timeout yang jelas
2. error handling lebih eksplisit tetapi tetap sederhana
3. JSON parse failure tertangani aman
4. ada guard untuk memastikan payload object benar-benar object sebelum dipetakan
5. loader tetap mengembalikan `TodaySessionContent` final yang usable
6. tidak ada network/fetch logic yang bocor ke UI layer
7. tetap sederhana, tidak over-engineered

Saya juga ingin Anda mempertimbangkan hal-hal berikut:
- apakah `force-dynamic` masih tepat, atau perlu pendekatan yang lebih baik
- apakah perlu `revalidate` atau `cache: 'no-store'` tetap cukup untuk konteks `/today`
- bagaimana membuat fetch helper yang nanti mudah dipakai saat endpoint Laravel final aktif
- bagaimana menjaga agar fallback tidak menyembunyikan masalah terlalu diam-diam

Silakan pilih pendekatan paling sederhana dan aman untuk Next.js App Router.

Anda boleh menambahkan hal-hal seperti:
- small fetch helper
- timeout wrapper via AbortController
- runtime guards
- lightweight error metadata/logging di server layer
tetapi jangan membuat sistem logging enterprise yang berlebihan.

Jangan lakukan ini:
- jangan tambah auth
- jangan tambah database
- jangan tambah analytics
- jangan tambah state global
- jangan pindahkan fallback ke komponen UI
- jangan tambah fitur baru di `/today-v2`
- jangan membuat abstraction layer berlebihan

Saya ingin output berupa:
1. Reliability Audit
2. Risks in Current Fetch Boundary
3. Revised Reliability Strategy
4. Recommended Caching / Dynamic Approach
5. Full Revised Code
6. Why This Is Safer in Production
7. Deferred Again

Aturan penting:
- tetap clean dan minimal
- fokus hanya pada reliability fetch boundary
- pertahankan loader contract yang sederhana
- jangan merusak boundary yang sudah bersih
- jangan jadikan arsitektur terlalu berat

Format jawaban:
1. Reliability Audit
2. Risks in Current Fetch Boundary
3. Revised Reliability Strategy
4. Recommended Caching / Dynamic Approach
5. Full Revised Code
6. Why This Is Safer in Production
7. Deferred Again