Lanjutkan dari implementasi `/today-v2` yang terbaru.

Jangan pindah ke backend, blueprint dokumentasi, global system, atau fitur lain dulu.

Fokus tahap ini hanya pada:
**menyempurnakan interaction states, step progression, dan completion feeling** agar `/today-v2` benar-benar terasa sebagai ritual harian yang utuh dan memuaskan.

Konteks:
- flow utama tetap: Receive → Reflect → Pray → Complete
- positioning tetap: Digital Sanctuary
- feel tetap: iOS native premium, calm, intimate, refined
- tujuan utama tahap ini: membuat user merasa dibimbing dengan lembut sampai selesai, lalu punya alasan emosional untuk kembali besok

Audit implementasi saat ini secara kritis, lalu revisi agar:
1. perpindahan dari Reflect ke Pray terasa lebih intentional
2. perpindahan ke Complete terasa earned, bukan hanya conditionally rendered block
3. completion state terasa menenangkan dan memuaskan
4. user merasa ritual hari ini benar-benar selesai
5. ada soft return trigger untuk besok tanpa terasa gamified murahan
6. state “belum isi”, “sedang isi”, “sudah isi”, “sudah doa”, “selesai” semuanya punya kualitas UX yang jelas
7. interaction tetap subtle, tidak teatrikal

Fokus revisi pada:
- state hierarchy antar step
- tombol dan action labels bila perlu disesuaikan
- feedback setelah reflect submit
- feedback setelah prayer complete
- completion screen/copy/layout behavior
- soft progress cue
- tomorrow return cue
- bagaimana menjaga flow tetap tenang walau ada perubahan state
- bagaimana menghindari feel “form submit”
- bagaimana menghindari feel “wizard/productivity app”

Jangan lakukan ini:
- jangan tambah backend
- jangan tambah API
- jangan tambah auth
- jangan tambah tab bar
- jangan tambah fitur journaling besar
- jangan tambah gamification agresif
- jangan ubah struktur besar halaman
- jangan pindah ke arsitektur global
- jangan bikin pengalaman jadi terlalu ramai

Saya ingin output Anda berupa:
1. Interaction Audit
2. UX Problems in Current Step Progression
3. Revisions Applied
4. Full Revised Code
5. Why This Feels More Complete and Retentive
6. Deferred Again

Aturan penting:
- completion harus terasa halus, sakral, dan earned
- progress harus lembut, bukan kompetitif
- setiap state harus jelas tapi tidak berisik
- semakin sedikit elemen, semakin baik
- utamakan emotional UX daripada technical cleverness

Tolong kritis.
Kalau saat ini flow masih terasa seperti conditional rendering biasa, submit form biasa, atau reveal section biasa, perbaiki itu.

Format jawaban:
1. Interaction Audit
2. UX Problems in Current Step Progression
3. Revisions Applied
4. Full Revised Code
5. Why This Feels More Complete and Retentive
6. Deferred Again