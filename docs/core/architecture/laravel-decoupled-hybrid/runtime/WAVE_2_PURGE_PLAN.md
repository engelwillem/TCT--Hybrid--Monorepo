# Controlled Legacy Purge Plan (Wave 2) 🌪️

**Fase Operasi:** *Decoupled Migration (Finalization Phase)*  
**Context:** Wave 2 bertujuan memusnahkan (*Purge*) halaman sisa yang diberi label `KEEP TEMPORARILY` pada saat *Wave 1*. Target utama pembasmian adalah rute dan aset _Auth, Profile, & Inbox_ pada monolith Inertia, setelah kita memastikan frontend Next.js baru siap mengemban operasi penuh.

---

## 1. Wave 2 Purge Scope (Target Penghancuran ☠️)

### Aset Frontend Laravel (React/Inertia)
Hapus direktori dan seluruh isinya secara permanen:
- `backend-api/resources/js/Pages/Auth/*` *(Login, Register, Password Reset)*
- `backend-api/resources/js/Pages/Inbox/*` *(Direct Messages, Threads)*
- `backend-api/resources/js/Pages/Profile/*` *(Settings, Edit Account)*
- `backend-api/resources/js/Components/Profile/*` *(Jika ada)*
- `backend-api/resources/js/Components/Forms/*` *(Khusus sisa Auth Forms)*

### Pengalihan (Redirect) Backend Web Route (`routes/web.php`)
- Pangkas total controller Inertia dari rute `/profile`, `/inbox`, `/login`, `/register`.
- Konversi seluruh web route peninggalan tersebut menjadi fungsi *Hard Redirect (301/302)* menuju ke `NEXT_PUBLIC_APP_URL` Next.js di luar area middleware (Identik mekanik seperti halnya redirect `/community`).
- **Pengecualian Khusus:** Jaga ketat autentikasi spesifik Panel Admin (`/admintalk/login` atau fallback otentikasi *Filament* Admin Dashboard). 

---

## 2. Prasyarat Kelayakan Eksekusi (Do NOT Purge Until:) 🚫

Wave 2 *TIDAK BOLEH* dilaksanakan sebelum Next.js membuktikan kapasitas operasionalnya pada domain-domain tersebut:

1. **Next.js Auth System Siap:**  
   Penerapan integrasi Auth Sanctum yang *flawless* / migrasi ke provider baru pada frontend Next.js. *Login Server-side Auth Guard* atau middleware route Next.js harus 100% operasional.
2. **Next.js Profile Page Siap (P3):**  
   Halaman akun/setelan di port `9002` telah melayani pergantian fitur *Follow*, *Dashboard Kinerja*, dan Update Profil sepenuhnya dengan status _Read & Write_ melalui endpoint API.
3. **Next.js Inbox Penuh (P3):**  
   Interaksi inbox bukan sebatas status "Guest View" tiruan lagi, tetapi Direct Message yang bisa diketik-dibalas dari klien dan diproses oleh Backend *API Controllers* Laravel (`App\Http\Controllers\DirectMessageController`). 

---

## 3. Rollback Strategy & Risk Assessment

- **Strategi Rollback:** Lakukan operasi pembuatan *Branch git baru* (Misalnya: `chore/legacy-purge-phase-2`). Bila rute Backend API (seperti inbox JSON) mati tanpa *resources/js* Inertia-nya, kita bisa langsung `git abort` tanpa mengorbankan _uptime_ Live Server (Production).
- **Extreme High Risk:** Operasi _Wave 2_ akan mengangkat akar-akar Otentikasi bawaan "Laravel Breeze/Fortify" yang membungkus Inertia. Ada resiko *Session Cookie* atau mekanisme autentikasi *Sanctum-SPA* ikut remuk bila komponen otentikasi salah dihapus (terutama di _LoginController_). Pastikan fungsionalitas murni Controller Endpoint (/api/login dsb) _TIDAK_ disentuh, hanya balutan rendering UI yang dihancurkan.

---

## 4. Smoke Test Wajib Pasca-Purge (Wave 2)

Setelah kode berhasil dihapus dan compiler Vite (`npm run build`) berjalan santun, QA/Automation harus melakukan _Mock Authentication_:

1. **Uji Auth Bypass:** Masuk ke `https://<LARAVEL_HOST>/login` atau `/register` -> harus dipaksa lompat ke `https://<NEXT_HOST>/login`.
2. **Bypass Inbox:** Buka link email (notification) pesan lama `https://<LARAVEL_HOST>/inbox/123`. Ia wajib ter-_redirect_ utuh tanpa intervensi.
3. **Uji API Sandbox:** Walau React Inertia Inbox hangus, POST endpoint backend API Inbox Laravel harus melayani order XHR Next.js dengan status `201 Created` layaknya API Data Murnia (Stateless/Sanctum Guarded).

---
Bila target di atas diketik statusnya `PURGE READY`, _Wave 2 Legacy Purge_ diizinkan melibas sisa-sisa Inertia seutuhnya dari peradaban *ChoosenTalks*!
