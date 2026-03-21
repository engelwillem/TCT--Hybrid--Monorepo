Lanjutkan dari implementasi `/today-v2` yang terbaru.

Jangan tambah fitur baru di luar flow utama, jangan sentuh auth, jangan sentuh analytics, jangan sentuh global navigation, dan jangan ubah visual hierarchy utama.

Fokus tahap ini hanya pada:
**menambahkan persistence lokal untuk progress ritual hari ini**, agar `/today-v2` mengingat status user saat reload atau kembali lagi di hari yang sama.

Konteks:
- saat ini flow utama sudah baik: Receive → Reflect → Pray → Complete
- UI dan data-loading boundary sudah cukup matang
- tetapi state ritual masih ephemeral di memory komponen
- saya ingin pengalaman terasa lebih nyata: jika user sudah menulis refleksi atau sudah menyelesaikan doa hari ini, screen tetap mengingatnya saat dibuka lagi di hari yang sama

Tugas Anda:
Audit state saat ini, lalu refactor agar:
1. progress ritual hari ini tersimpan secara lokal di browser/device
2. state yang relevan bisa dipulihkan saat page dibuka ulang di hari yang sama
3. persistence di-reset otomatis saat hari berganti
4. hanya state yang pantas disimpan yang dipersist
5. UX tetap tenang dan tidak terasa seperti productivity app
6. implementasi tetap sederhana dan aman

Saya ingin minimal state berikut dipertimbangkan:
- reflection text
- reflect completed or not
- prayer completed or not
- completion reached or not (jika memang terpisah)
- date key / daily identity agar reset harian jelas

Silakan pilih pendekatan paling sederhana dan aman, misalnya:
- localStorage
- session/local persistence helper
- small hook untuk hydration/persistence
tetapi jangan over-engineered.

Saya juga ingin Anda memutuskan dengan kritis:
- state mana yang layak dipersist
- state mana yang tidak perlu
- bagaimana menghindari hydration flicker atau mismatch
- bagaimana reset harian sebaiknya dilakukan
- apakah kunci harian sebaiknya berdasarkan tanggal Asia/Jakarta

Jangan lakukan ini:
- jangan tambah backend
- jangan tambah database
- jangan tambah auth
- jangan tambah sync antar device
- jangan tambah fitur journaling baru
- jangan ubah flow utama
- jangan menyebarkan localStorage logic ke banyak komponen
- jangan merusak feel premium yang sudah ada

Saya ingin output berupa:
1. Persistence Audit
2. Problems with Current Ephemeral State
3. Recommended Persistence Strategy
4. Daily Reset Strategy
5. Full Revised Code
6. Why This Improves Retention and UX
7. Deferred Again

Aturan penting:
- tetap simple
- tetap iOS-native in feel
- persistence harus mendukung ritual, bukan membuat app terasa seperti task manager
- hindari flicker saat hydrate state tersimpan
- simpan hanya yang benar-benar berguna

Format jawaban:
1. Persistence Audit
2. Problems with Current Ephemeral State
3. Recommended Persistence Strategy
4. Daily Reset Strategy
5. Full Revised Code
6. Why This Improves Retention and UX
7. Deferred Again