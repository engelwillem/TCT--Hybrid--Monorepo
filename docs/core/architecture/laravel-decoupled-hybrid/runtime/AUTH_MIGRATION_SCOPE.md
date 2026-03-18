# Taktikal Scope Sempit: Migrasi Auth & Reset Sandi 🔐

**Fokus Domain (Satu Gap Paling Kritis):**  
Authentication & Lupa Kata Sandi (*Login/Reset Password Flow*) menuju Next.js Front-end.

**Status Saat Ini (Legacy):**  
Aplikasi Next.js Hybrid masih menggunakan _redirect_ ke `http://localhost:8000/login` dan `/today`, diserang kontrol monolith *Session/Cookie*. _Flow Forgot Password_ berjalan secara penuh HTML Laravel.  
Targetnya adalah memindahkan kendali antarmuka (*UI form*) menjadi Next.js (SPA), menyambung via API Sanctum (*Stateless Token/Cookie Auth*).

---

## 1. Goal (Target Selesai)
1. Terbangunnya halaman SPA `src/app/login/page.tsx` (yang menggantikan Laravel Blade `auth.login`).
2. Terbangunnya halaman SPA `src/app/forgot-password/page.tsx` (yang menggantikan `auth.forgot-password`).
3. Endpoint API Laravel di `routes/api.php` merespons *request* SPA (Sanctum CSRF Cookie) dengan benar, melepaskan sesi masuk yang valid.
4. *Legacy Routes* di `routes/auth.php` di-stubbing sehingga pengguna yang membidik URL kuno otomatis diterbangkan ke Next.js (`NEXT_PUBLIC_APP_URL/login`).

---

## 2. Parameter Pembatas File (Sangat Ketat)

### ✅ **File Yang BOLEH Diubah / Dibuat:**
1. `src/app/login/page.tsx` (Bikin/Update)
2. `src/app/forgot-password/page.tsx` (Bikin/Update)
3. `src/components/auth/*` (Pembuatan elemen Input, Label, Error State)
4. `backend-api/routes/api.php` (Penyesuaian respons login Sanctum)
5. `backend-api/app/Http/Controllers/Api/V1/AuthController.php` (Buat Controller Login/Reset baru jika default Laravel Fortify tak cocok)
6. `backend-api/routes/auth.php` (Meredirect rute lama ke front-end Next.js)

### ⛔ **File Yang TIDAK BOLEH Diubah (Dilindungi):**
1. Data Model `User.php`.
2. Middleware *Session/Cookies* utama (`Kernel.php`).
3. `routes/web.php` (Domain ekosistem lain aman).
4. Konten `auth.blade.php` (Biarkan membusuk tanpa disentuh sebelum dihapus pada gelombang pemusnahan mutlak).
5. Konfigurasi `config/cors.php` atau `config/sanctum.php` (Selama API request bisa lolos di Postman/Fetch Next).

---

## 3. Spesifikasi API Berbasis REST/Sanctum (Kontrak Komunikasi)

### Endpoint (POST `/api/v1/login`):
*   **Request JSON Payload:**
    ```json
    {
      "email": "user@domain.com",
      "password": "my_super_password",
      "remember": true
    }
    ```
*   **Response Sukses (200 OK):**
    ```json
    {
      "status": "success",
      "user": {
        "id": 1,
        "name": "Alex",
        "email": "user@domain.com"
      },
      "redirect_to": "/today"
    }
    ```
*   **Response Gagal (422 Unprocessable Entity):**
    ```json
    {
      "message": "Kredensial yang diberikan salah.",
      "errors": { "email": ["Data ini tidak cocok dengan rekaman kami."] }
    }
    ```

---

## 4. Warisan Legacy yang Wajib Ditiru (*Behavior Parity*)
*   Validasi `throttle` gagal login pada Laravel tetap harus dikomunikasikan di Next.js (pesan: "Terlalu banyak mencoba, tunggu 60 detik").
*   Saat reset kata sandi, Laravel harus tetap mengirimkan Email Asli via antrean (Mailable), namun *Link URL CTA Reset* di badan pesan surelnya dikonfigurasi menunjuk balik ke alamat Front-end Next.js, bukan halaman blade jadul.
*   Token `X-XSRF-TOKEN` dan *Session cookies* harus diatur setuju (*Credentials = Include*) lewat Next.js `fetch()`/Axios HTTP client untuk mempertahankan sesi Laravel di Hybrid Web.

---

## 5. Checklist Verifikasi Final Kelayakan Parity
- [ ] Formulir di `http://localhost:9002/login` dapat melempar _error_ berwarna merah saat diisikan sembarang `email` dan `password`.
- [ ] Pengguna yang berhasil login di `9002/login` otomatis dilempar mendarat tanpa interupsi layar putih ke `9002/today` melalui validasi komponen penjaga (_Route Guard / Middleware_).
- [ ] Mengakses `http://localhost:8000/login` sebagai pengelana *guest* memicu HTTP 301 ke arah `http://localhost:9002/login`.
- [ ] Mengajukan reset *password* (*Forget Password*) mendorong respons sukses dari Form SPA dan Email beneran tiba dengan rujukan ke arah Domain Hybrid 9002.
- [ ] Tidak merusak apalagi meruntuhkan fungsi _Firebase Sync_. (Murni mengonversi antarmuka masuk internal Laravel).
