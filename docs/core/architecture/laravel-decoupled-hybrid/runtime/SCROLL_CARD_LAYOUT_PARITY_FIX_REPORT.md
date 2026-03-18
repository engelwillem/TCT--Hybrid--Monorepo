# Scroll Card Layout Parity Fix Report 📜

**Tanggal:** 2026-03-15  
**Fokus:** Perbaikan Mekanika Transisi Scroll (Parity Re-alignment)   
**Baseline:** Legacy Monolith (Port 8000)

---

## 1. File yang Diubah
- `src/app/page.tsx`

## 2. Properti Motion & Layout yang Diubah

| Properti | Perubahan | Tujuan Parity |
| :--- | :--- | :--- |
| **Physics** | Menghapus `useSpring` pada progres scroll. | Menghilangkan "bouncing feel" yang tidak ada di legacy. Gerakan kini 1:1 linear dengan scroll. |
| **Filter** | Menghapus `blur()` dan `brightness()` mapping. | Menghilangkan efek kedalaman optik (Depth of Field) yang dianggap sebagai improvisasi yang mengganggu paritas. |
| **Y Offset (Entry)** | Mengubah entry translateY dari `80px` ke `120px`. | Memberikan sensasi kemunculan kartu dari bawah yang lebih tegas dan sinkron dengan timing legacy. |
| **Stack Spacing** | Menyesuaikan interval translateY tumpukan menjadi kelipatan `-20px`. | Menyamakan jarak antar bibir atas kartu saat menumpuk di puncak layar. |
| **Opacity** | Menghapus fade-out pada kartu yang sudah tertumpuk. | Menjaga integritas tumpukan agar tetap terlihat solid di belakang (sesuai behavior legacy). |

## 3. Before vs After

- **Before**: Transisi menggunakan inersia pegas (spring), memiliki efek blur pada kartu belakang, dan warna redup saat tertindih.
- **After**: Transisi bersifat linear statis (natural scroll), kartu tetap tajam saat tertumpuk, dan jarak antar tumpukan presisi.

## 4. Apa yang Disamakan dari Legacy
- Mekanika "Sticky Stack" yang murni mengikuti gesekan scroll tanpa tambahan akselerasi virtual.
- Skala penyusutan kartu yang flat (1.0 -> 0.95 -> 0.90).
- Penumpukan kartu di puncak layar dengan offset statis yang bersih.

## 5. Apa yang Sengaja Tetap Beda (Theme Next.js)
- **Visual Tokens**: Skema warna tetap Dark Mode (Slate-950) dengan aksen Cyan/Blue khas implementasi Next.js.
- **Card Content**: Struktur internal kartu (icon positioning, typography Inter) tetap mengikuti desain premium Next.js.

## 6. Langkah Verifikasi Manual 
1. Jalankan `npm run dev` pada port 9002.
2. Scroll perlahan pada bagian "Ecosystem Modules".
3. Pastikan kartu bergerak sinkron tanpa efek "mental" (No Spring).
4. Pastikan kartu yang tertumpuk tetap terbaca jelas (No Blur).
5. Bandingkan tumpukan di atas dengan legacy (Port 8000), pastikan gap vertikalnya identik.

---
**Verdict: READY FOR VALIDATION** ✅
