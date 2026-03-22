# PROMPT

Lanjutkan dari implementasi `/today` yang sudah ada.

Sekarang saya tidak ingin Anda menyentuh backend, database, auth, analytics, atau fitur baru apa pun.

Fokus tahap ini hanya pada:
**meningkatkan fidelity agar `/today` terasa lebih seperti high-end iOS native screen, dan kurang terasa seperti website scroll sections.**

Konteks:
- Halaman ini adalah “Digital Sanctuary”
- Target feel: iPhone-native, premium, calm, intimate, refined
- Bukan landing page
- Bukan dashboard
- Bukan long-form website
- Harus terasa seperti app screen yang very intentional

Tugas Anda:
Audit implementasi `/today` yang sudah dibuat, lalu revisi kodenya agar:
1. spacing terasa lebih native iOS, bukan sekadar besar
2. top area mengikuti pola safe-area dan header behavior ala iPhone
3. hierarchy visual lebih halus dan lebih premium
4. section transitions terasa lebih menyatu sebagai satu pengalaman, bukan blok-blok terpisah
5. typography lebih refined
6. CTA dan input terasa lebih native
7. overall screen rhythm lebih tenang dan mahal

Fokus revisi pada hal-hal ini:
- safe-area top and bottom treatment
- header height, header spacing, dan visual weight
- vertical rhythm antar elemen
- card width, card padding, dan card elevation
- text width dan line length
- textarea / input visual treatment
- button proportions and placement
- scroll experience supaya terasa seperti app flow, bukan stacked webpage modules
- section container sizing yang terlalu “website-like” jika ada
- refine penggunaan blur / ring / shadow agar tidak berlebihan

Jangan lakukan ini:
- jangan tambah fitur baru
- jangan tambah tab bar
- jangan tambah bottom nav
- jangan tambah community/path/versehub access
- jangan tambah API integration
- jangan tambah state management kompleks
- jangan ubah konsep utama Receive → Reflect → Pray → Complete

Saya ingin output Anda berupa:
1. audit singkat: apa yang masih terasa “web”, bukan “native iOS”
2. daftar revisi yang Anda lakukan
3. kode final yang direvisi
4. penjelasan kenapa revisi ini membuat feel lebih premium dan lebih native
5. daftar hal yang masih sengaja ditunda

Aturan penting:
- lebih baik subtle daripada decorative
- lebih baik restrained daripada flashy
- kurangi kesan “sectioned landing page”
- pertahankan calmness
- prioritaskan iPhone screen composition
- gunakan bahasa desain Apple-like: precise, quiet, breathable

Tolong benar-benar kritis.
Kalau ada bagian implementasi sekarang yang terlalu besar, terlalu renggang, terlalu teatrikal, atau terlalu mirip website modern biasa, revisi itu.

Format jawaban:
1. Native Feel Audit
2. Revisions Applied
3. Full Revised Code
4. Why It Feels More iOS Native
5. Deferred Again
