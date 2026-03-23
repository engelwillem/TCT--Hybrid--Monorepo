# Architecture: Spiritual Relevance Engine

## Core Concept: Context Continuation
Perjalanan spiritual tidak terkotak-kotak, sehingga state pengguna di satu fitur secara otomatis memengaruhi apa yang disajikan di fitur lainnya. 

## Architectural Principles
1. **State-Driven Presentation**: Rendering urutan halaman di klien diatur oleh *Spiritual State* (niat, riwayat bacaan, metrik interaksi, kondisi hati), bukan murni proporsi dari server.
2. **Action-Oriented Nodes**: Tidak ada layar buntu (*dead ends*). Setiap konten (reading/video) adalah gerbang menuju respons (Refleksi, Doa, Bagikan) lewat komponen Hook Card.
3. **Decoupled but Contextually Aware**: Backend Laravel entitas terpisah (Post, Verse, Lesson), sedangkan Frontend Next.js merajut benang merah lewat State Provider.

## Domain Repositioning
- **Today**: Context Router - algoritma sorting layar berdasar prioritas/state rohani terkini.
- **VerseHub & Channels**: Immersion Hub - mesin produksi konteks dan membaca.
- **Community**: Spiritual Response Layer - tempat curah buah pikir dan doa bersumber dari VerseHub/Channels.
- **Inbox**: Support Ladder - dialog 1-on-1 mendalam pemicu eskalasi komentar.
- **Paths (Journeys)**: Fondasi *retention loop* untuk pembelajaran harian.
