# Codex Handoff: PostComposer Refactor

**Objective**: Memandu implementasi teknis refaktor `PostComposer` menjadi sistem modular sesuai arsitektur produksi.

---

## 1. Mission for Codex
Transformasikan `PostComposer.tsx` (monolitik) menjadi struktur berbasis domain hooks. Gunakan desain UI "Native-App" yang telah diaudit (Avatar, Chips, Action Bar).

## 2. Files to Touch (Priority Order)
1. `src/features/community/pages/CommunityPage.tsx`: Sinkronisasi prop `currentUser`.
2. `src/features/community/components/PostComposer.tsx`: Pemecahan komponen dan integrasi hooks.
3. `src/features/community/hooks/useComposerMedia.ts`: Ekstraksi logika pemrosesan gambar.

## 3. Safe Refactor Sequence
1. **Setup Hooks**: Buat hooks kosong untuk setiap domain (`lifecycle`, `text`, `media`, `submit`).
2. **Identity Sync**: Implementasikan penggunaan `Avatar` dan `useCurrentUserAvatarStyle`.
3. **UI Migration (Non-Destructive)**: Ganti `<select>` dengan `ComposerTypeChips` tanpa menghapus fungsi `setType` asli.
4. **State Extraction**: Pindahkan state satu per satu dari komponen ke hooks yang relevan.
5. **Logic Cleanup**: Hapus fungsi pembantu (helpers) yang sudah berpindah ke hooks.

## 4. Contracts to Preserve
Pastikan `PostComposerProps` tetap kompatibel:
```typescript
interface PostComposerProps {
  onPost: (text: string, type: PostType, images?: File[], metadata?: PostComposerMetadata) => Promise<boolean | void>;
  currentUser?: CommunityUser;
  channels?: Array<{ id: string; slug: string; title: string }>;
  initialText?: string;
  initialType?: PostType;
  initialExpanded?: boolean;
}
```

## 5. Regression-Sensitive Areas
- **Crop Editor**: Pastikan pemanggilan `activeCropItem` tidak terputus saat state berpindah ke hook.
- **Image ID Consistency**: `buildImageId` harus konsisten agar preview tidak berkedip.
- **Async Collisions**: Pastikan `resetComposer` tidak dipanggil sebelum `onPost` benar-benar selesai memberikan hasil.

## 6. Type Safety Notes
- Gunakan tipe `CommunityComposerType` dari `@/features/community/categories`.
- Gunakan `MediaAspectRatio` untuk validasi metadata gambar.

## 7. Test Checklist
- [ ] Render awal tanpa `currentUser` (Guest mode).
- [ ] Ekspansi saat teks diketik pertama kali.
- [ ] Scroll horizontal pada chip kategori di resolusi mobile (360px).
- [ ] Pengunggahan 5 gambar sekaligus dan pengeditan rasio masing-masing.
- [ ] Pencegahan *double-submit* saat koneksi lambat.

---

*Handoff prepared by Antigravity Senior Product Engineer*
