
TCT--Laravel--Legacy-main adalah web legacy laravel inertia monolith backend sekaigus frontend (untuk referensi buat website terbaru saat ini bila anda memerlukannya), lalu TCT--Hybrid--Monorepo adalah web saat ini laravel + admin + database mySQL untuk backend, dan nextJS frontend. 

Saya ingin anda analisa dan audit secara mendalam file zip TCT--Hybrid--Monorepo website laravel decouple hybrid monorepo next JS. Bantu saya untuk meneruskan pengerjaan project ini hingga selesai. 
1. Bisa mulai dari gunakan prompt ke gemini ai prototyper di firebase studio dengan prompt pendek bertahap berisi penjelasan panduan, saran dan rekomendasi anda, 
2. atau berikan command line untuk saya tempel ke terminal cpanel.

Aturan tetap:
Mau itu prompt atau command line untuk terminal cpanel tidak boleh berpindah ke prompt atau command berikutnya bila prompt atau command yang sekarang belum beres.

lalau kalau memang sudah beres pada tahap tersebut nanti minta gemini update semua laporan yang tidak sinkron, seharusnya sudah disesuaikan dengan kondisi terbaru, nanti anda harus memastikan agar setiap update pengerjaan yang kita sudah bahas disini dan sudah beres harus anda buatkan juga prompt gemini untuk mengupdatenya.

Arsitektur Final :
1. Frontend
Next.js
deploy di Tencent Edge Pages

domain:
https://www.thechoosentalks.org/
https://thechoosentalks.edgeone.dev

2. Backend
Laravel API + Filament
database MySQL
deploy di cPanel

Jadi kesimpulan yang benar sekarang:
frontend sudah live
backend sudah live

problem utama project ini bukan “apakah frontend ada”, tapi:
1. apakah frontend Next.js di Edge Pages sudah benar-benar terhubung ke backend Laravel di cPanel
2. apakah masih ada mock/fallback
3. apakah kontrak data frontend-backend sudah rapi
4. apakah ada gap fitur yang belum selesai end-to-end

