# UI/UX Audit: PostComposer Community

**Role**: AI End-to-End Product Architect
**Status**: Initial Audit / Recommendations
**Context**: TCT Community Feedback Hub (/community)

---

## 1. Key Findings

The current `PostComposer` is a high-quality, feature-rich component. It provides sophisticated image cropping, multiple aspect ratios, and category selection. Namun, dibandingkan dengan **Native Apps** modern (Instagram, X, Threads, atau aplikasi spiritual terspesialisasi), komponen ini saat ini terasa seperti "Formulir Web" daripada sebuah "Pengalaman Interaktif."

### Strengths
- **Functional Depth**: Editor Carousel-nya sangat kuat dan menangani transformasi media yang kompleks dengan baik.
- **Visual Polish**: Menggunakan token premium (`backdrop-blur`, `shadow-premium`, `rounded-[30px]`).
- **Context Awareness**: Melebar (expand) saat fokus dan memberikan feedback yang jelas untuk berbagai state (submitting, error).

### Blind Spots (The "Non-Native" Feel)
- **Identity Gap**: Avatar pengguna tidak muncul di state composing. Aplikasi native selalu menempatkan composer dengan identitas "Me" sebagai jangkar.
- **Friction in Discovery**: Pengunggahan gambar dan pemilihan kategori tersembunyi di balik "Toggle Panels." Ini menambah jumlah ketuk (taps) dan beban kognitif.
- **Form-First Hierarchy**: Dropdown `<select>` untuk kategori adalah elemen yang paling terasa "web-like" dan memutus alur dari feed modern.
- **Static Transition**: Ekspansi dari kondisi "collapsed" ke "expanded" sudah fungsional namun kurang memiliki "physics" yang cair (fluid) seperti pada composer native.

---

## 2. UI/UX Friction & Weaknesses

| Fitur | Kondisi Saat Ini | Titik Friksi |
| :--- | :--- | :--- |
| **Identitas** | Tidak ada avatar yang ditampilkan | Kurang koneksi personal; terasa seperti formulir generik. |
| **Tambah Media** | Tombol → Panel → Tombol Upload | Terlalu banyak ketukan untuk mencapai galeri. |
| **Preview Media** | Editor "Posisi" terpisah | Ada keterputusan antara feed dan editor. |
| **Kategori** | Native HTML Select | Sulit diketuk, lambat dibaca, terasa "legacy." |
| **Sticky Bar** | Di dalam card | Bisa terasa sesak di viewport mobile. |

---

## 3. Recommended Fixes (Native-App Direction)

### Goal: Transisi dari "Form" ke "Fluid Action"

### A. Integrasi Identitas Penulis
- **Tambahkan Avatar Pengguna**: Tempatkan `currentUser.avatarUrl` di sebelah kiri textarea.
- **Rasional**: Memberikan jangkar pada post ke pengguna, meniru tata letak post yang sudah jadi (konsistensi).

### B. Fluid Category Chips (Horizontal Scroll)
- **Ganti `<select>`**: Gunakan daftar chip (kapsul) yang dapat digeser secara horizontal.
- **Rasional**: Kategori terlihat sekilas. Seleksi dengan satu ketukan. Terasa jauh lebih seperti aplikasi native.

### C. Progressive Media Bar
- **Toolbar Akses Cepat**: Selalu tampilkan set ikon (Gambar, Link, dll.) di bawah input teks bahkan sebelum panel "Media" dibuka.
- **Rasional**: Mengurangi jarak ke "Aksi Utama."

### D. "Ghost" Preview
- **Preview Awal**: Saat gambar ditambahkan, tampilkan segera sebagai thumbnail kecil dengan tombol "Plus" di akhir reel horizontal.
- **Rasional**: Menjaga pengguna tetap dalam "Flow" daripada memaksa mereka masuk ke editor modal segera.

---

## 4. Proposed Strategic Improvements

### 1. Konsep "Floating" Compose (Fokus Mobile)
Pada perangkat mobile, daripada card yang ikut tergulung dengan feed, pertimbangkan **Sticky Input Bar** di bagian bawah (seperti Threads/iMessage) yang melebar menjadi sheet setinggi layar saat difokuskan.

### 2. Auto-Expanding Haptic Textarea
Implementasikan textarea yang tumbuh mulus seiring bertambahnya konten tanpa muncul scrollbar di dalam kotak hingga ketinggian maksimal tertentu.

### 3. "Snappy" Haptic Motion
Gunakan prop `layout` dari Framer Motion untuk menganimasikan transisi antara kategori dan state media. Toggle panel saat ini (`AnimatePresence`) sudah bagus, namun konten yang "meluncur" atau "bergeser" di dalam kontainer yang sama terasa lebih kokoh.

---

## 5. Quick Wins (Low Effort / High Impact)

1. **Inklusi Avatar**: Tambahkan avatar lingkaran kecil di kiri atas input.
2. **Chip Kategori**: Tukar `<select>` dengan daftar horizontal berbasis `Badge` atau `Button`.
3. **Textarea Autofocus**: Pastikan kursor siap dan keyboard terpicu secara haptik di mobile.
4. **Subtle Scale**: Tambahkan `whileTap={{ scale: 0.98 }}` pada tombol Posting.

---

## 6. Next Steps & Risks

### Risks
- **Screen Real Estate**: Menambahkan terlalu banyak fitur inline mungkin membuat viewport mobile yang kecil menjadi berantakan.
- **Performance**: Animasi high-fidelity harus dioptimalkan untuk menghindari frame drop pada perangkat mobile kelas menengah bawah yang menggunakan PWA/Browser.

### Proposed Action Item
Saya menyarankan kita mulai dengan **"Pembaruan Identitas & Kategori"** (Avatar + Chips) karena ini segera mengubah persepsi komponen dengan risiko arsitektural yang minimal.

---

*Audit dilakukan oleh Antigravity (End-to-End Product Architect)*
