Lanjutkan dari implementasi `/today` yang terbaru.

Jangan tambah fitur baru, jangan sentuh visual hierarchy utama, jangan sentuh tab bar, jangan sentuh auth, dan jangan pindah ke analytics.

Fokus tahap ini hanya pada:
**membuat data pipeline `/today` lebih production-safe terhadap payload eksternal yang parsial, tidak konsisten, atau belum lengkap, tanpa merusak UX.**

Konteks:
- saat ini sudah ada source -> mapper -> loader -> UI
- tetapi mapper masih cenderung all-or-nothing
- saya tidak ingin satu field kosong dari CMS membuat seluruh screen jatuh ke full mock
- saya ingin fallback yang lebih halus: field yang valid dari data nyata tetap dipakai, field yang hilang diisi dari mock/default

Tugas Anda:
Audit pipeline saat ini, lalu refactor agar:
1. data eksternal bisa di-merge secara aman dengan mock/default content
2. fallback bekerja per-field, bukan hanya full-object
3. mapper lebih toleran terhadap partial payload
4. field yang sebaiknya tidak berasal dari CMS bisa diturunkan secara lokal jika perlu (misalnya greeting/dateLabel bila masuk akal)
5. UI tetap selalu menerima `TodaySessionContent` final yang lengkap
6. arsitektur tetap sederhana dan tidak over-engineered

Saya ingin Anda mempertimbangkan pendekatan seperti:
- base mock as defaults
- partial override from external payload
- normalization helper per section
- final sanitization sebelum masuk UI

Silakan pilih pendekatan paling sederhana dan aman.

Penting:
- jangan membuat validasi jadi terlalu enterprise
- jangan membuat schema system berlapis-lapis berlebihan
- jangan menyebarkan fallback logic ke komponen UI
- jangan ubah flow utama Receive → Reflect → Pray → Complete
- jangan merusak feel yang sudah jadi

Saya juga ingin Anda mengevaluasi:
- field mana yang wajib dari source eksternal
- field mana yang lebih aman punya default lokal
- apakah `greeting`, `dateLabel`, atau `avatarInitial` lebih baik diturunkan lokal bila source tidak memberi

Saya ingin output berupa:
1. Resilience Audit
2. Problems with Current All-or-Nothing Mapping
3. Revised Fallback Strategy
4. Proposed Merge / Normalize Approach
5. Full Revised Code
6. Why This Is Safer for Real CMS/Laravel Payloads
7. Deferred Again

Aturan penting:
- hasil akhir harus tetap simple
- UI contract tetap `TodaySessionContent`
- data loader harus lebih tahan terhadap payload buruk
- prefer graceful degradation daripada hard failure
- jangan sampai fallback logic mengacaukan boundary yang sudah bersih

Format jawaban:
1. Resilience Audit
2. Problems with Current All-or-Nothing Mapping
3. Revised Fallback Strategy
4. Proposed Merge / Normalize Approach
5. Full Revised Code
6. Why This Is Safer for Real CMS/Laravel Payloads
7. Deferred Again
