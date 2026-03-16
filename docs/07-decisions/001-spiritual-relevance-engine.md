# ADR 001: Pivot ke Spiritual Relevance Engine

## Konteks & Problem Statement
Sistem *hybrid monorepo* (Laravel + Next.js) memproses data secara silo di tiap rute (`/today`, `/versehub`, `/channels`). Hal ini menyebabkan User Interface menjadi pasif—berfungsi layaknya *dashboard* bacaan statis (perpustakaan) alih-alih alat bertumbuh rohani terarah.

## Pilihan Diskusi
- Membangun Recommender Engine AI murni di Backend. (Terlalu mahal, over-engineering)
- *Refactoring* besar *Database Tables* (Membakar stabilitas *legacy app* sekarang).
- *Client-Side Navigation Architecture* (Pilihan yang Diambil).

## Keputusan Final
- **Relevance Over Abstraction**: Ekstensi relasi *Spiritual States* di *Frontend Next.js* (Context Provider, URL Query Parity).
- **Handoff System**: Menyemai `<HookCard>` di tepi batas setiap *long read* *(Verse/Channel)* ke fitur *community text fields* (`intent` props injection). Backend hanya secara pasif menyerap `"source_ref": "mzm-23"` di array json (tidak mengubah tabel/relasi Eloquent).

## Konsekuensi Positif (Dampak UX)
- Domain terhubung secara alami (Reading -> Reflection -> Action).
- Tampilan `Today` bereaksi cepat tanpa manipulasi performansi backend/SQL (client filtering array).

## Konsekuensi Negatif
- Fragmentasi Memori Lokal (*LocalStorage/Client Session*) per piranti (*Device*). Logika *rendering client-heavy* wajib dimoderasi.
