Lanjutkan dari implementasi `/today-v2` yang terbaru.

Jangan tambah fitur baru di luar flow utama, jangan sentuh auth, jangan sentuh analytics, jangan sentuh global navigation, jangan ubah visual hierarchy inti, dan jangan pindah ke backend persistence dulu.

Fokus tahap ini hanya pada:
**menyempurnakan UX untuk same-day re-entry**, yaitu saat user membuka kembali `/today-v2` di hari yang sama setelah progress ritual sudah tersimpan.

Konteks:
- sekarang progress ritual sudah persisted secara lokal
- state bisa dipulihkan saat reload / kembali lagi di hari yang sama
- tetapi belum tentu pengalaman re-entry terasa premium
- saya ingin re-entry state terasa intentional, calm, dan iOS-native
- goal-nya: app tidak sekadar “ingat data”, tetapi juga “ingat konteks emosional user”

Tugas Anda:
Audit UX saat ini untuk skenario berikut:
1. user kembali saat belum menulis apa-apa
2. user kembali saat sudah menulis reflection tapi belum menekan Aminkan
3. user kembali saat reflection sudah selesai tapi prayer belum selesai
4. user kembali saat ritual hari ini sudah selesai sepenuhnya

Lalu revisi implementasi agar:
1. setiap same-day re-entry state terasa jelas dan elegan
2. screen tidak terasa seperti “mengulang dari awal” jika progress sudah ada
3. jika ritual sudah selesai, user mendapat re-entry experience yang tenang dan pantas, bukan langsung dilempar ke form awal lagi
4. jika ritual masih setengah jalan, user diarahkan lembut ke langkah berikutnya
5. tidak ada kesan seperti productivity app, wizard, atau onboarding flow
6. UX tetap subtle dan premium

Saya ingin Anda mempertimbangkan hal-hal berikut:
- apakah perlu auto-scroll halus ke langkah aktif saat restore state
- apakah perlu “resume cue” yang sangat halus
- bagaimana menangani re-entry jika reflection text ada tapi belum sealed
- bagaimana first fold harus berperilaku jika ritual sudah complete
- apakah section yang sudah selesai perlu tampak berbeda saat re-entry
- bagaimana menjaga agar semuanya tetap tenang, bukan terlalu pintar atau terlalu sibuk

Silakan pilih pendekatan paling sederhana dan elegan.

Jangan lakukan ini:
- jangan tambah notifikasi
- jangan tambah backend sync
- jangan tambah fitur journaling baru
- jangan tambah CTA ramai
- jangan ubah struktur utama Receive → Reflect → Pray → Complete
- jangan menyebarkan logic re-entry ke banyak komponen tanpa alasan
- jangan membuat UX jadi terlalu eksplisit atau terlalu “task-oriented”

Saya ingin output berupa:
1. Re-entry UX Audit
2. Problems with Current Re-entry Experience
3. Recommended Re-entry Strategy
4. Step-by-Step Behavior per State
5. Full Revised Code
6. Why This Feels More Premium and Retentive
7. Deferred Again

Aturan penting:
- tetap simple
- tetap calm
- tetap iOS-native in feel
- re-entry harus terasa seperti pendamping yang bijaksana, bukan sistem yang cerewet
- prioritaskan emotional continuity, bukan sekadar technical restoration

Format jawaban:
1. Re-entry UX Audit
2. Problems with Current Re-entry Experience
3. Recommended Re-entry Strategy
4. Step-by-Step Behavior per State
5. Full Revised Code
6. Why This Feels More Premium and Retentive
7. Deferred Again