# Draft UX Upgrade Specification: PostComposer

**Role**: Senior Product Designer & UX Strategist
**Status**: Production UX Spec for Implementation
**Design Principle**: Quiet Trust & Emotional Clarity

---

## 1. UX Strategy: "Quiet Trust"
PostComposer harus memberikan rasa aman kepada pengguna bahwa pikiran dan refleksi mereka tidak akan hilang karena gangguan teknis. Namun, konfirmasi ini harus dilakukan secara **subtle** (halus) agar tidak merusak suasana tenang dan meditatif platform.

---

## 2. Draft Visibility & Presence

### A. The Identity Mirror (Smart Prompt)
Sistem akan mengubah `placeholder` teks berdasarkan status draf:
- **Default**: "Apa yang Tuhan taruh di hati Anda?" (Mengundang)
- **Restored**: "Lanjutkan yang tadi Anda tulis..." (Personal & Melanjutkan)

### B. The Quiet Status (Action Bar)
Tambahkan indikator status kecil di dekat tombol "Bagikan":
- **State**: "Simpan..." (Saat menulis)
- **State**: "Tersimpan" (Setelah 2 detik berhenti mengetik)
- **Visual**: Teks kecil, `text-[10px]`, warna `muted-foreground`, muncul dengan animasi *fade-in/out*.

---

## 3. Restore & Stale Behavior

### Automatic Restore Flow
1.  Saat komponen dideteksi memiliki draf, draf **dipulihkan secara otomatis** ke dalam textarea.
2.  Tampilkan notifikasi inline (bukan modal) tepat di atas textarea:
    *   *“Kami memulihkan tulisan Anda sebelumnya.”*
    *   Aksi: `[Tetap Lanjutkan]` | `[Hapus]`

### Stale Draft Management
Jika draf berumur >48 jam:
- Tampilkan label usia: *"Draf dari 3 hari lalu"*.
- Mengapa? Memberikan ruang bagi pengguna untuk menilai apakah refleksi tersebut masih relevan atau ingin menulis yang baru.

---

## 4. Reset & Safety UX

### Discard Flow
Tombol "Batal" memiliki perilaku ganda saat draf aktif:
1.  **Klik Pertama**: Menutup composer (menyimpan draf).
2.  **Toggle Hapus**: Di dalam kondisi terbuka, tambahkan opsi "Hapus Draf" jika pengguna ingin membersihkan layar sepenuhnya.
3.  **Confirmation**: Hanya tanyakan "Hapus tulisan ini selamanya?" jika teks >100 karakter untuk mencegah kehilangan data yang berharga secara tidak sengaja.

### Shared Device Safety
- **TTL (Time To Live)**: Draf secara otomatis dihapus setelah 7 hari.
- **Privacy**: Konten draf di `localStorage` harus dienkripsi secara ringan atau diikat ke `currentUser.id` agar tidak muncul saat pengguna lain login di perangkat yang sama.

---

## 5. UX States Table

| State | Visual Signal | Action Bar Text | Interaction |
| :--- | :--- | :--- | :--- |
| **No Draft** | Default Placeholder | - | Standar penulisan. |
| **Typing** | Pulsing dot | *Simpan...* | Autosave aktif (debounced 1s). |
| **Restored** | Smart Placeholder | *Draf dipulihkan* | Muncul notifikasi inline "Hapus/Lanjut". |
| **Stale** | Age Label | *Draf (3 hari lalu)* | Menyarankan pengecekan relevansi. |
| **Cleared** | Empty Textarea | - | State kembali ke "No Draft". |

---

## 6. Architecture Integration (For Codex)

### Logic Distribution
- `useComposerDraft.ts`: Bertanggung jawab atas persistensi, TTL, dan enkripsi ringan.
- `useComposerPrompt.ts`: Menentukan teks placeholder dan notifikasi inline berdasarkan state dari `useComposerDraft`.
- `PostComposer.tsx`: Mengatur layout dan memicu `onDelete` saat draf dibuang.

---

## 7. Implementation Roadmap

### MVP (Implement Now)
- Autosave debounced ke `localStorage`.
- Smart Prompt ("Lanjutkan tulisan Anda").
- Tombol "Hapus Draf" di dalam menu `settings` kecil atau di samping "Batal".

### Later Improvements
- Cloud Sync: Sinkronisasi draf ke server agar bisa dilanjutkan di perangkat berbeda (requires API update).
- Versioning: Menyimpan 2-3 draf terakhir jika ada perubahan besar.

---

*Spec authored by Antigravity Senior Product Designer*
