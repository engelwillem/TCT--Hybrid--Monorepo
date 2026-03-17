# Interface Architecture & Navigation

## Core Navigation (The "Bottom Bar")
Untuk mempertahankan fokus aplikasi dan mencegah fragmentasi (_cognitive overload_), struktur navigasi utama disederhanakan menjadi 5 pilar utama:

1. **Today (`/today`)**
   - Beranda personal (Context Router). Menyesuaikan diri dengan _Spiritual State_ pengguna hari ini.
2. **VerseHub (`/versehub`)**
   - Pusat interaksi Alkitab, perenungan (Refleksi), dan dialog bersama instruktur AI (Mentor).
3. **Paths (`/paths`)**
   - Mengelola rute perjalanan spiritual (Spiritual Journeys) dan progres belajar.
4. **Community (`/community`)**
   - Ruang komunal untuk _prayer requests_, kesaksian, dan interaksi sesama.
5. **Profile (`/profile`)**
   - Manajemen akun, preferensi, dan akses menuju Inbox/DMs.

## Route Simplification (Deprecation List)
Rute-rute berikut dilebur (merged) atau dihapus untuk menjaga pengalaman tetap terpusat:
- `/library` ➔ Dihapus. Pencarian diletakkan di dalam VerseHub.
- `/visitors` ➔ Dihapus. Beririsan misi dengan Community. Konten acara/iklan selayaknya menjadi tag/kategori di Community.
- `/channels` ➔ Dilebur. Program pembelajaran berkelompok (*Sabbath School*) akan dirangkul ke dalam infrastruktur `/paths` atau `/versehub`.
- `/reflections` ➔ Dilebur ke alur aksi VerseHub / Community.
