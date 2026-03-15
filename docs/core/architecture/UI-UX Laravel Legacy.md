# Analisis UI/UX (landing page) Laravel Legacy
Berdasarkan analisis mendalam terhadap kode sumber backend-api/resources/js/Pages/Auth/Welcome.tsx, berikut adalah deskripsi detail mengenai struktur, visual, dan mekanika halaman landas (landing page) Laravel Legacy tersebut:

# Tema "Deep Space": 
Menggunakan latar belakang gradien yang sangat gelap (slate-950 ke teal-950) untuk menciptakan kesan kedalaman ruang angkasa.

# Efek Partikel & Tekstur: 
Terdapat tekstur "grain" (bintik halus) dan pola titik-titik radial yang berkedip (twinkle) secara halus di seluruh layar.

# Glowing Orbs: 
Memanfaatkan elemen dekoratif berupa lingkaran cahaya besar yang melayang (floating) dengan warna cyan, blue, dan teal yang memiliki opasitas rendah (sekitar 8%) dan efek blur yang sangat tinggi untuk memberikan kesan mistis dan premium.

# Identitas Brand: 
Teks "TheChoosen" berwarna putih disandingkan dengan "Talks" yang menggunakan gradien warna cyan ke blue.

# Aksi Cepat:
1. Terdapat tombol Login (khusus Admin) yang mengarah ke /admintalk/login.

2. Terdapat tombol Daftar yang secara sengaja dinonaktifkan (disabled) dengan pesan "Pendaftaran sementara dinonaktifkan".

3. Tombol Explore yang tersembunyi di perangkat seluler namun terlihat di desktop.

# Glassmorphism Card: 
Konten utama dibungkus dalam kartu besar transparan dengan radius sudut sangat bulat (rounded-[44px]), efek backdrop-blur yang kuat, dan bingkai tipis berwarna putih dengan opasitas rendah.

# Konten Dinamis: 
Menggunakan sistem A/B testing sederhana (heroVariant) yang mengubah teks judul dan subjudul secara acak saat pertama kali dimuat.

# Call to Action (CTA): 
Satu tombol utama yang sangat mencolok dengan gradien warna cyan-blue bertuliskan "Buka Channels".

# Petunjuk Gulir: 
Sebuah elemen visual di bagian bawah kartu yang menampilkan animasi panah ke bawah dengan teks "Scroll to explore" untuk memberi tahu pengguna bahwa ada konten di bawah.
- Ini adalah fitur paling kompleks di halaman ini, yang terletak di bagian tengah:

## Layout Dua Kolom (Desktop):
Sisi kiri menampilkan judul statis "Satu Platform, Banyak Cara Bertumbuh", sementara sisi kanan adalah panggung untuk kartu-kartu fitur.

## Kartu Fitur:
Ada 4 kartu utama: Channels, Bible, Community, dan Mentor.
Animasi Tumpukan: Kartu-kartu ini menggunakan mekanika Sticky Stacking. Saat pengguna menggulir, kartu-kartu akan menumpuk satu sama lain di puncak layar.

## Transformasi Kartu:
Saat sebuah kartu tertutup oleh kartu berikutnya, ia akan menyusut secara linear (skala 1.0 ke 0.90) dan bergeser naik sedikit untuk menciptakan efek tumpukan fisik. Setiap kartu memiliki warna aksen yang berbeda (violet, blue, emerald, cyan).

# Trusted Ecosystem:
Sebuah bagian yang menegaskan keamanan dan privasi aplikasi dengan lencana "Trusted Ecosystem".

# Footer Sederhana:
Berisi tautan kebijakan privasi, syarat ketentuan, dan tautan Instagram, dengan atribusi hak cipta kepada "WillBerth Channel".

# Floating Button (akses cepat main apps):
Di bagian paling bawah layar, terdapat tombol melayang (floating button) berbentuk bulat dengan ikon plus (+). Jika diketuk, ia akan memunculkan menu akses cepat berbentuk grid untuk menuju langsung ke fitur "Channels" atau "Bible".

# Catatan
Halaman ini didesain sepenuhnya untuk memberikan impresi aplikasi seluler yang canggih (Native App Feel) di dalam peramban web, dengan penggunaan transisi spring dan opacity yang sangat halus.