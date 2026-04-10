# Target Architecture: Personalized Share Platform

Strategi untuk menyatukan seluruh mekanisme sharing menjadi satu platform universal yang mendukung personalisasi dan snapshotting.

## 1. Core Vision: Universal Share Bridge

Saat ini, logic share tersebar di per-fitur. Targetnya adalah menggunakan **Direct Data Passing** (DDP) dan **Snapshotting** untuk setiap konten yang bisa dibagikan.

### Konsep Payload Kontrak (`SharePayload`)
Setiap domain (Verse, Community, Renungan) harus mengonversi datanya ke dalam format universal sebelum dikirim ke Share Controller:
```typescript
type SharePayload = {
  kind: 'media' | 'scripture' | 'snapshot';
  title: string;
  body: string;
  meta: string; // e.g., "Mzm 23:1 • Member Name"
  imageUrl?: string;
  eyebrow?: string;
  actionUrl: string;
}
```

## 2. Public vs Personalized Snapshot

| Type | Data Source | Metadata | Example |
| :--- | :--- | :--- | :--- |
| **Public Deterministic** | API (Id-based) | Static OG | "Link ke Ayat Yohanes 3:16" |
| **Personalized Snapshot** | User State (Client) | Dynamic OG (Rendered) | "Ayat Yohanes 3:16 + Highlight Kuning + Catatan User" |

## 3. Privacy-First Protocol

Mekanisme share harus menghormati flag privasi:
1.  **Private Content**: Tombol share disembunyikan atau di-disable.
2.  **Shared-as-Image**: Jika konten sensitif tapi user ingin berbagi perenungan, sistem menawarkan "Export as Image" tanpa link publik (Snapshot only).

## 4. OG Generation Model

Menggunakan **Next.js Edge Runtime** dengan `@vercel/og` (satori):
*   **Pattern**: `/api/og/[domain]/[id]?params...`
*   Setiap domain memiliki template visual yang konsisten (consistent branding).
*   Mendukung parameter dinamis seperti `theme=dark` atau `textSize=large`.

## 5. Route Conventions

Standarisasi routing share:
*   Share Page (Web View): `/[domain]/share/[slug-or-token]`
*   API Image: `/api/og/[domain]/[id]`
*   API Metadata: `/api/v1/[domain]/share-metadata/[id]` (Laravel side)

## 6. Analytics & Fallback
*   Setiap kali `navigator.share` dipicu, kirim event ke analytics.
*   Jika `SharePage` mengembalikan 404 (konten dihapus), tampilkan "Floating Card" yang mengajak user kembali ke Home, bukan sekadar halaman kosong.

---
*Architectural Blueprint 2026*
