# Runtime Route Inventory (Port 9002)

**Tanggal Audit:** 2026-03-14  
**Environment:** Next.js Dev Server (Turbopack)  
**Port:** 9002  
**Baseline Session:** Guest Session (guest@example.com)

---

## 1. Inventarisasi Route Utama

| Route | Source Entry Point | Status | Temuan Singkat | Prioritas |
| :--- | :--- | :--- | :--- | :--- |
| `/` | Browser Native | **OK** | Landing page premium. CTA "Mulai Journey" mengarah ke `/today`. | P2 |
| `/today` | Landing / Bottom Nav | **OK** | Feed harian. Menampilkan Ayat Hari Ini (Mazmur 23:1). Render stabil. | P1 |
| `/community` | Bottom Nav (Community) | **OK** | Feed aktivitas. Card interaksi muncul. Terdapat placeholder kosong pada post tertentu. | P2 |
| `/versehub/id` | Bottom Nav (Bible) | **OK** | Bible Index. Menampilkan "Kejadian 1" dan "Matius 1". Picker modal berfungsi. | P1 |
| `/versehub/id/[slug]` | Community / VerseHub Index | **BROKEN** | Halaman detail ayat (misal: `/versehub/id/mzm-23-1`) terjebak loading spinner abadi. | **P0** |
| `/channels` | Bottom Nav (Channels) | **WARNING** | Halaman memuat dengan skeleton yang cukup lama. Menampilkan empty state. | P1 |
| `/inbox` | Bottom Nav (Pesanan/Inbox) | **OK** | Messaging hub. Tab Primary/General/Requests berfungsi. | P2 |
| `/profile` | Bottom Nav (Profile) | **OK** | Menampilkan Guest User. Akordeon pengaturan (Security/2FA) merender dengan benar. | P2 |

---

## 2. Analisis Runtime & Observasi

### A. Isu Kritis (Blockers)
1. **P0 - Verse Detail Infinity Loading**: Halaman `/versehub/id/[slug]` tidak dapat merender konten ayat. Observasi menunjukkan spinner yang tidak pernah hilang, menandakan kegagalan pada siklus fetch data atau state hydration di runtime. Hal ini kontras dengan laporan paritas sebelumnya yang menyatakan "PASS".

### B. Perilaku Navigasi & Auth
1. **Guest Mode Hook**: Aplikasi saat ini secara otomatis masuk ke sesi Guest. Hal ini memudahkan eksplorasi namun menutupi jalur login/signup yang sebenarnya.
2. **Bottom Nav Consistency**: Navigasi bawah konsisten di semua route utama, memberikan nuansa Native App yang kuat.
3. **Hidden Routes**: 
   - `/auth/login` mengembalikan 404. Kemungkinan mekanisme auth terintegrasi secara dinamis di `/today` atau via modal.

### C. Paritas Visual & Mock Detection
1. **Mock Data**: Angka interaksi pada Community (124 likes, 37 bookmarks) terlihat identik di semua pengetesan, mengonfirmasi status "Fixed Baseline" dari laporan sebelumnya.
2. **Skeleton Dev**: Route `/channels` menggunakan skeleton loader yang sangat terlihat, sinkron dengan status migrasi yang masih berjalan.

---

## 3. Kesimpulan Verifikasi
Runtime aplikasi pada port 9002 secara umum stabil untuk navigasi tingkat atas, namun memiliki **kegagalan fungsional berat (P0)** pada halaman detail ayat. Migrasi domain VerseHub memerlukan audit mendalam pada sisi client-side fetching logic untuk memastikan data mengalir ke UI tanpa hambatan.

*Audit Runtime Selesai.*
