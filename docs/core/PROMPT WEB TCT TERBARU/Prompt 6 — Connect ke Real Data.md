Lanjutkan dari implementasi `/today-v2` yang terbaru.

Jangan tambah fitur baru, jangan sentuh tab bar, jangan sentuh auth, jangan sentuh analytics, dan jangan ubah visual hierarchy utama.

Fokus tahap ini hanya pada:
**menghubungkan `/today-v2` ke data nyata melalui satu data-loading boundary yang bersih, sambil tetap mempertahankan fallback mock agar UI tetap stabil.**

Konteks:
- `/today-v2` sudah content-driven
- komponen presentational sudah cukup bersih
- sekarang saya ingin menyiapkan jalur integrasi nyata tanpa merusak UX dan tanpa menyebarkan logic fetch ke banyak komponen
- saya ingin nanti mudah mengganti dari mock ke CMS/API/Laravel source

Tugas Anda:
Audit struktur saat ini, lalu refactor agar:
1. ada satu loader / mapper / adapter untuk mengambil data sesi `/today`
2. `page.tsx` tidak lagi mengimpor mock secara langsung kalau itu bisa dihindari
3. ada fallback yang aman ke mock content jika fetch gagal atau data belum siap
4. data eksternal dipetakan ke `TodaySessionContent` sebelum masuk ke UI
5. komponen presentational tetap tidak tahu sumber data
6. integrasi ini tetap sederhana, tidak over-engineered

Saya ingin pendekatan yang cocok untuk Next.js App Router.

Silakan pilih pendekatan terbaik yang sederhana dan aman, misalnya:
- server-side loader function
- local service / adapter
- mapper function
- normalizer
tetapi jangan terlalu enterprise dan jangan membuat arsitektur berlapis-lapis yang berlebihan.

Asumsikan nanti sumber nyata bisa berasal dari endpoint Laravel / CMS, tetapi untuk tahap ini:
- Anda boleh buat stub/fake fetch function dulu
- atau buat interface source yang mudah diganti
- atau langsung siapkan adapter dengan fallback mock

Yang saya butuhkan:
1. struktur file yang direkomendasikan
2. loader / service / adapter yang mengambil raw data lalu memetakannya ke `TodaySessionContent`
3. fallback strategy jika data gagal
4. revisi `page.tsx` agar menerima data dari boundary tersebut
5. full revised code
6. alasan kenapa struktur ini aman untuk integrasi tahap berikutnya

Jangan lakukan ini:
- jangan implementasi auth
- jangan implementasi database
- jangan implementasi analytics
- jangan tambah state global
- jangan ubah flow Receive → Reflect → Pray → Complete
- jangan pindahkan logic presentational ke service layer
- jangan membuat schema terlalu abstrak

Aturan penting:
- pertahankan UX dan feel yang sekarang
- tetap mobile-first
- fokus hanya pada data-loading boundary
- clean, minimal, maintainable
- fallback mock harus benar-benar usable

Format jawaban:
1. Data Integration Audit
2. Recommended File Structure
3. Loader / Adapter Strategy
4. Full Revised Code
5. Why This Integration Path Is Safe
6. Deferred Again