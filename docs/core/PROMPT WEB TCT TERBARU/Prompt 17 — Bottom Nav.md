bottom nav tidak boleh kehilangan sifat sticky/floating di main app surfaces.
Kalau user masuk dari landing page ke main apps lalu nav hilang atau terlalu menyatu dengan layout, perpindahan route jadi lebih berat. Itu bertentangan dengan target:

low friction
high retention
app-like feel

Jadi kita koreksi arah:

landing page / boleh bersih tanpa bottom nav
tapi begitu user masuk ke main app (/today, /today-v2, /paths, /community, /profile, /versehub)
bottom nav harus kembali menjadi anchor navigasi yang jelas, sticky, dan mudah dijangkau ibu jari

Berikut 1 prompt koreksi saja.

Prompt koreksi — Kembalikan bottom nav menjadi sticky floating anchor

Lanjutkan pekerjaan frontend The Chosen Talks.

Ada regresi UX yang harus diperbaiki sekarang:
**bottom nav tidak lagi terasa sticky/floating di main app surfaces**, sehingga setelah user masuk dari landing page ke main apps, perpindahan navigasi terasa sulit.

Jangan bahas teori. Langsung audit dan perbaiki.

## Objective
Pulihkan bottom navigation agar kembali menjadi:
- sticky / floating
- mudah dijangkau
- jelas sebagai anchor navigasi utama
- tetap calm, premium, dan tidak noisy

## Aturan utama
- Homepage `/` tetap boleh tanpa bottom nav
- Tetapi untuk main apps, bottom nav harus hadir dan mudah dipakai:
  - `/today`
  - `/today-v2`
  - `/paths`
  - `/community`
  - `/profile`
  - `/versehub`

## Yang harus Anda kerjakan SEKARANG

### 1. Audit bottom nav behavior
Periksa:
- apakah bottom nav masih fixed/sticky di viewport mobile
- apakah nav terlalu menyatu dengan flow content
- apakah nav hilang atau tenggelam setelah masuk dari landing page
- apakah safe-area bottom sudah benar
- apakah nav overlap dengan content atau justru terlalu jauh dari thumb zone

### 2. Kembalikan floating sticky behavior
Saya ingin bottom nav:
- fixed di bawah viewport mobile
- punya floating feel yang halus
- tetap premium dan ringan
- tidak terlalu besar
- tidak terlalu decorative
- tidak mengganggu `/today-v2`, tapi tetap tersedia di main app surfaces jika memang itu aturan shell

Gunakan pendekatan paling masuk akal:
- fixed bottom
- safe area aware
- centered max width
- subtle floating surface
- active state jelas tapi tenang

### 3. Pisahkan landing vs main app behavior dengan benar
Saya ingin:
- `/` = tidak perlu bottom nav
- main app routes = bottom nav hadir
- jangan sampai logika full-bleed `/today-v2` membuat nav sepenuhnya hilang jika seharusnya tetap ada
- kalau `/today-v2` sengaja tanpa nav karena fokus ritual, pastikan route transisi ke halaman lain tetap mudah dan keputusan ini benar-benar disengaja

Anda harus audit ini secara kritis dan pilih implementasi yang paling usable.

### 4. Rapikan spacing content terhadap bottom nav
Pastikan:
- content tidak tertutup nav
- ada bottom padding yang cukup
- tidak ada double safe-area
- halaman seperti `/paths`, `/community`, `/profile`, `/versehub` tetap nyaman discroll sampai bawah

### 5. Jangan redesign nav besar
Jangan buat nav baru total.
Jangan ubah info architecture.
Jangan tambah item baru.
Fokus hanya pada:
- posisi
- floating behavior
- spacing
- usability
- consistency

## Output yang saya inginkan
1. Bottom Nav Regression Audit
2. Root Cause
3. What You Changed
4. File Structure Changes
5. Full Revised Code
6. Which Routes Now Have Floating Bottom Nav
7. What Is Intentionally Excluded

## Standar hasil
Setelah ini:
- user masuk dari landing page ke main app tidak kehilangan anchor navigasi
- mobile navigation terasa enak lagi
- bottom nav kembali terasa seperti app navigation, bukan footer biasa
- hasil siap dicek ulang di preview

Langsung perbaiki bottom nav sticky/floating regression ini.


