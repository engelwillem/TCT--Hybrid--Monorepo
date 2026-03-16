# Rekam Master Migrasi & Arsitektur

Berikut adalah rekaman sentral dari inisiasi migrasi sistem hibrida (Laravel 11 Backend + Next.js App Router).

## Domain Parity Tracker (Legacy vs Hybrid)
Batas lingkup setiap domain yang telah diperoses:
1. **Profile Lifecycle** -> (`Otentikasi, Update Data, Avatar`)
2. **Community** -> (`Composer, Feed Rendering, Interaction Reactions/Comment`)
3. **Inbox** -> (`Read/Unread Parity, Broadcast Notification`)

## Experience Layer Tracker (Spiritual Relevance Engine)
Sistem pengalaman yang membungkus antarmuka monorepo:
1. **The Anchor / Today Homepage Context** (`Contextual Rendering, StateChips`)
2. **Relevance Injectors** (`HookCard UI`)
3. **Response Terminal** (`Reflection Detail Template`)
4. **Learning & Retention Path** (`Spiritual Journeys`)

## Database & Models (Status Migrasi Backend)
Semua entitas data bertumpu pada arsitektur bawaan (`MemberPost`, `Comment`, `Reaction`). Perluasan metadata ditangani melalui ekstraksi *JSON array payload* (`metadata: { 'source_ref': 'xyz' }`) alih-alih merilis *migrations* relasional SQL yang mahal dan berisiko merusak struktur *Production*.
