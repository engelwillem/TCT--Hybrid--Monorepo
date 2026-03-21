# PROMPT

Anda adalah senior frontend engineer dan iOS-minded product implementer.

Saya sudah memiliki design handoff final untuk halaman `/today` di produk The Chosen Talks. Sekarang saya ingin Anda mengimplementasikan versi pertama yang fokus pada **layout dasar, hierarchy visual, dan struktur komponen**, belum ke animasi kompleks atau backend logic.

Konteks produk:
- `/today` adalah pusat pengalaman utama
- positioning: “Digital Sanctuary”
- flow utama: Receive → Reflect → Pray → Complete
- feel: iOS native premium, tenang, mahal, minimal, refined
- mobile-first, terutama harus terasa sangat baik di iPhone
- jangan terasa seperti landing page, dashboard, blog, atau portal konten

Tugas Anda:
Implementasikan halaman `/today` versi 1 dengan fokus pada:
1. struktur halaman lengkap
2. section hierarchy yang benar
3. spacing yang premium
4. typography hierarchy yang kuat
5. card layout yang tenang dan tidak noisy
6. komponen reusable yang rapi

Scope implementasi SAAT INI:
- buat page `/today`
- buat struktur komponen yang modular
- implementasikan 4 section utama:
  - Receive
  - Reflect
  - Pray
  - Complete
- gunakan dummy content statis dulu
- gunakan gaya visual mendekati iOS premium
- gunakan responsive mobile-first layout
- siapkan fondasi yang mudah dikembangkan nanti

Jangan lakukan ini dulu:
- jangan implementasi backend
- jangan implementasi database
- jangan implementasi auth logic
- jangan implementasi analytics
- jangan implementasi notification
- jangan implementasi animasi kompleks
- jangan implementasi audio
- jangan implementasi state management yang rumit
- jangan menambah fitur di luar `/today`

Saya ingin output Anda berupa:
1. penjelasan singkat struktur file yang Anda buat
2. komponen apa saja yang dibuat
3. kode implementasi lengkap
4. alasan keputusan layout utama
5. catatan bagian mana yang sengaja dibuat sederhana dulu untuk tahap berikutnya

Aturan implementasi:
- prioritaskan readability dan elegance
- gunakan spacing lega
- gunakan border radius besar
- hindari visual clutter
- jangan terlalu banyak tombol
- hanya 1 primary CTA yang benar-benar dominan
- jangan terlalu banyak warna
- jangan gunakan stock-image
- jika perlu gunakan serif untuk verse dan sans-serif untuk UI text
- hasil akhir harus terasa seperti layar utama app premium, bukan website biasa

Kalau stack belum pasti, asumsikan:
- Next.js App Router
- React
- Tailwind CSS
- Framer Motion tersedia tapi belum perlu dipakai banyak
- TypeScript

Format jawaban yang saya inginkan:
1. File Structure
2. Component Breakdown
3. Full Code
4. Layout Rationale
5. Deferred for Next Step

Penting:
Jangan lompat ke tahap animasi detail atau polish lanjutan.
Selesaikan dulu fondasi layout `/today` yang bersih, premium, dan sesuai handoff.