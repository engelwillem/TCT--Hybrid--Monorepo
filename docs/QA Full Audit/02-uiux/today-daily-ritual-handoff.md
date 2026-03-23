# Design Handoff: The `/today` Daily Spiritual Companion

## 1. Product Intent
Mentransformasi halaman `/today` dari sekadar dashboard informasi menjadi **"Digital Sanctuary"**. Ini adalah ruang teduh personal bagi user Kristen untuk memulai hari dengan ketenangan, refleksi mendalam, dan doa yang fokus.

## 2. Experience Goal
- **Atmosphere:** Calm, Premium, Intimate, Spiritually Grounded.
- **Visual Feel:** iOS Native (Apple Journal/Meditation App style).
- **Core Metric:** High Daily Retention melalui ritual penyelesaian (*Completion Ritual*).

## 3. Primary User Journey (The 5-Minute Bread Cycle)
1. **Receive:** Membuka aplikasi dan menerima Firman hari ini (Reading).
2. **Reflect:** Merespons secara aktif melalui satu pertanyaan introspeksi (Input).
3. **Pray:** Masuk ke dalam momen doa singkat yang tenang (Action).
4. **Complete:** Menutup ritual dengan rasa damai dan siap menghadapi hari (Closure).

## 4. Exact Page Layout & Section Purpose
*Struktur kolom tunggal (Single Column Stack) dengan snap-to-section.*

| Section | Visual Type | Purpose | Content |
| :--- | :--- | :--- | :--- |
| **0. Header** | Minimal Nav | Personalization | Greeting & Avatar (Sticky Blur on Scroll). |
| **1. Verse** | Full-screen Card | Receive | Daily Verse (High Contrast Serif). |
| **2. Prompt** | Soft Surface Card | Reflect | One personal question + Text Input Field. |
| **3. Prayer** | Glassmorphism | Pray | Short curated prayer with Wide Line-spacing. |
| **4. Finish** | Clean Center Space | Closure | Completion Affirmation + Next Action Hint. |

## 5. Final Recommended Copy (English/Indonesian Mixed per Context)
- **Header:** "Selamat pagi, [Name]. Mari teduh sejenak."
- **Verse Intro:** "Suara yang menuntun langkahmu."
- **Reflection Prompt:** "Jika engkau memejamkan mata, beban apa yang ingin kau serahkan?"
- **Prayer Intro:** "Mari bicara dengan Bapa sejenak."
- **Completion Label:** "Melangkah dalam Damai."

## 6. Final Recommended Microcopy (iOS-Style)
- **Primary CTA:** "Mulai Teduh Sejenak"
- **Save/Confirm Button:** "Aminkan"
- **Placeholder:** "Tuliskan isi hatimu..."
- **Error State:** "Tenang, sedang diperbaiki"
- **Empty State:** "Menanti Firman Baru"
- **Soft Progress Label:** "Langkah Bertumbuh"

## 7. Interaction Flow (Motion Principles)
- **The Wave Entrance:** Elemen muncul secara bertahap (*staggered*) dari bawah saat seksi masuk ke viewport.
- **Haptic Feedback:** Getaran mikro (*light impact*) saat menekan tombol "Aminkan".
- **Natural Scrolling:** Gunakan *inertia scrolling* iOS. Hindari tombol "Next" yang kaku; biarkan scroll yang membimbing.
- **Closure Animation:** Saat selesai, berikan animasi partikel halus (*shimmer*) pada lingkaran progress.

## 8. Visual Direction (Design System Props)
- **Typography:** 
    - *Scripture:* `DM Serif Display` (32px+, Line-height 1.1)
    - *UI/Body:* `Plus Jakarta Sans` (Tracking -0.02em)
- **Color Palette:** Crystal Blue (#EAF1F9) to White Gradient.
- **Card Style:** Radius `rounded-[40px]`, `ring-1 ring-black/[0.03]`, Deep Soft Shadow.
- **Texture:** 2% Micro-grain overlay (Premium Paper feel).

## 9. iOS Native Feel Principles (Luxury Indicators)
- **Negative Space is Luxury:** Minimalisir elemen. White space adalah ruang bernapas.
- **Typography over Imagery:** Biarkan desain huruf yang memberikan "berat" spiritual, bukan foto stok murah.
- **Progressive Disclosure:** Hanya tampilkan informasi yang dibutuhkan di tahap tersebut. Sembunyikan navigasi sekunder (Links, Search, Community) di bawah ritual.

## 10. Retention Loop Logic (The Habit Hook)
- **Dopamine of Completion:** Memberikan rasa "selesai" yang memuaskan secara visual.
- **Micro-Journaling:** Menyimpan refleksi user ke dalam jurnal harian yang bisa dibaca ulang (Self-Reflect Growth).
- **Curiosity for Tomorrow:** Memberikan judul *teaser* pendek untuk hari esok sebelum user menutup aplikasi.

## 11. What Must Be Avoided (The Noise Red Flags)
- ❌ **Aggressive Streaks:** Jangan menghukum ketidakhadiran; sambut kembali dengan hangat.
- ❌ **Hard Borders:** Hindari garis tepi yang tebal dan warna hitam solid.
- ❌ **Choice Overload:** Jangan tunjukkan lebih dari satu aksi utama di satu layar.
- ❌ **Marketing Jargon:** Gunakan bahasa "Pendamping Dewasa", bukan bahasa sales atau khotbah agresif.

---
**Status:** ✅ **READY FOR IMPLEMENTATION**
*Handoff ini adalah pedoman tunggal untuk desain visual oleh Designer dan implementasi teknis oleh Codex.*
