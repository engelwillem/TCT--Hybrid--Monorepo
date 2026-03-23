# UI/UX Roadmap V1 -> V2

## Purpose
Roadmap ini menerjemahkan audit UI/UX menjadi urutan kerja yang praktis dan bisa dieksekusi. Fokusnya bukan menambah fitur sebanyak mungkin, tetapi menyatukan produk menjadi satu pengalaman yang jelas.

## Product Target
Target akhir yang dituju:

`TheChosenTalks menjadi spiritual companion web app yang tenang, fokus, dan membimbing langkah harian user.`

## Working Rules
- Kerjakan berurutan.
- Jangan buka fase berikutnya jika fase sekarang belum `PASS`, `BLOCKED`, atau `ACCEPTED`.
- Setiap fase wajib update `docs/09-handover/*`, `docs/08-changelog/daily/*`, dan dokumen feature/domain terkait.

## V1 Outcome
Pada akhir V1, user harus merasakan:
- produk punya 1 arah yang jelas
- Today menjadi layar pembuka utama
- VerseHub menjadi alat baca inti
- Community menjadi ruang respons yang kontekstual
- Paths menjadi loop pertumbuhan yang nyata

## V2 Outcome
Pada akhir V2, user harus merasakan:
- pengalaman harian makin personal dan cerdas
- flow antar surface terasa otomatis dan halus
- brand terasa utuh dari landing sampai area aplikasi

---

## Phase 0 - Lock Product Identity

### Goal
Mengunci identitas produk agar semua keputusan UI berikutnya konsisten.

### Actions
1. Jadikan `docs/03-architecture/product/future-ux-direction.md` sebagai arah resmi UI/UX.
2. Sinkronkan istilah inti:
   - `Today`
   - `VerseHub`
   - `Paths`
   - `Community`
   - `Profile`
3. Bekukan keputusan bahwa route lain adalah:
   - transitional
   - deprecated
   - archived

### Done When
- tidak ada drift istilah besar di docs aktif
- semua handover menyebut 5 pilar produk yang sama

---

## Phase 1 - Information Architecture Cleanup

### Goal
Mengurangi kebingungan arsitektur agar user tidak melihat produk sebagai kumpulan modul acak.

### Actions
1. Tetapkan 5 primary surfaces:
   - `/today`
   - `/versehub`
   - `/paths`
   - `/community`
   - `/profile`
2. Tetapkan secondary surfaces:
   - `/inbox`
   - composer / focus flows
   - reader subviews
   - auth
3. Turunkan status route lama:
   - `/channels` -> transitional/merge
   - `/reflections` -> merge target
   - `/library` -> remove candidate
   - `/visitors` -> remove candidate
   - `/gate-updates` -> park candidate
4. Audit nav, shortcut, CTA, dan landing agar tidak terus mempromosikan route yang seharusnya dipensiunkan.

### Primary Deliverables
- nav map final V1
- daftar route yang aktif vs transitional
- daftar CTA yang harus diganti

### Done When
- semua entry points utama mengarah ke 5 pilar produk
- route lama tidak lagi muncul sebagai wajah utama produk

---

## Phase 2 - Landing To App Alignment

### Goal
Menyatukan kesan brand antara landing page dan area aplikasi.

### Actions
1. Putuskan posisi landing:
   - bukan katalog fitur
   - bukan dashboard publik
   - harus menjadi cerita perjalanan produk
2. Ubah landing agar menjelaskan loop utama:
   - grounding
   - reading
   - reflection
   - community
   - growth
3. Samakan bahasa visual landing dengan Dawn direction:
   - tetap boleh lebih ekspresif
   - tetapi harus terasa satu brand dengan app
4. Kurangi istilah yang terlalu tech/demo seperti:
   - module stack
   - ecosystem cards yang terlalu terpisah

### Primary Deliverables
- landing narrative structure
- CTA matrix landing
- style reconciliation guide

### Done When
- landing menjelaskan satu perjalanan user, bukan daftar fitur
- user paham apa yang terjadi setelah login

---

## Phase 3 - Today As Daily Command Center

### Goal
Menjadikan `/today` sebagai pusat keputusan harian.

### Actions
1. Pertegas satu prioritas utama per state.
2. Kurangi rasa "stack of cards"; naikkan rasa "what should I do next today?".
3. Tampilkan hubungan antar state, reading, prayer, and progress.
4. Pastikan CTA dari Today selalu mengantar ke:
   - VerseHub
   - Community
   - Paths
5. Audit ulang empty/loading/error state agar tetap tenang dan premium.

### Primary Deliverables
- Today hierarchy revision
- state-based CTA behavior matrix
- Today content priority rules

### Done When
- Today terasa seperti command center, bukan feed cantik
- user selalu punya next step yang jelas

---

## Phase 4 - VerseHub As Signature Experience

### Goal
Menjadikan VerseHub sebagai permukaan paling khas dan paling polished.

### Actions
1. Haluskan reader experience:
   - tipografi
   - spacing
   - tool hierarchy
   - interaction calmness
2. Pastikan mentor touchpoints terasa membantu, bukan berisik.
3. Pastikan chapter-end reflection dan handoff ke Community terasa natural.
4. Rapikan naming:
   - hindari drift `Bible` vs `VerseHub` jika tidak ada alasan strategis kuat
5. Audit share/bookmark/comment actions dari perspektif spiritual utility, bukan hanya social utility.

### Primary Deliverables
- VerseHub interaction principles
- reader polish checklist
- mentor UX rules

### Done When
- VerseHub terasa sebagai ikon pengalaman produk
- handoff dari baca ke respons terasa mulus

---

## Phase 5 - Community As Response Layer

### Goal
Mengubah Community dari feed yang baik menjadi ruang respons yang bermakna.

### Actions
1. Tonjolkan konteks asal post:
   - dari VerseHub
   - dari Today
   - dari Paths
2. Prioritaskan composer yang kontekstual.
3. Jaga agar feed tidak terasa seperti social app generik.
4. Rapikan archive/bookmark/discussion hierarchy agar yang paling penting tetap diskusi aktif dan respons nyata.

### Primary Deliverables
- community content hierarchy
- composer context system
- response-layer visual cues

### Done When
- Community terasa sebagai jawaban atas perjalanan user
- user paham kenapa ia sampai di composer/feed ini

---

## Phase 6 - Paths As Growth Loop

### Goal
Menjadikan `/paths` sebagai mesin pertumbuhan, bukan katalog lesson.

### Actions
1. Perkuat hubungan antara path progress dengan Today.
2. Hubungkan lebih jelas detail day dengan:
   - verse context
   - reflection
   - community handoff
3. Rapikan completion moment agar terasa rewarding namun tetap tenang.
4. Ganti CTA yang masih membawa user ke pola lama jika sudah tidak sesuai arsitektur baru.

### Primary Deliverables
- path progress model
- completion / continuation UX rules
- Paths to Today / Community integration map

### Done When
- Paths terasa seperti ongoing journey
- bukan sekadar daftar materi dan status selesai

---

## Phase 7 - Profile / Inbox As Secondary Utility

### Goal
Menjaga utility privat tetap berguna tanpa mengganggu fokus produk utama.

### Actions
1. Posisikan Profile sebagai context/settings surface.
2. Posisikan Inbox sebagai private loop, bukan nav pillar utama.
3. Rapikan notifikasi dan shortcut agar masuk akal dari flow harian.

### Done When
- Profile dan Inbox terasa penting, tapi tidak merebut perhatian dari permukaan inti

---

## Phase 8 - V1 Consolidation

### Goal
Menutup V1 dengan produk yang rapi, fokus, dan cukup stabil untuk dibaca user sebagai satu sistem.

### Actions
1. Tutup route lama yang memang sudah tidak diperlukan.
2. Bersihkan CTA, shortcut, dan copy yang masih mengacu ke arsitektur lama.
3. Final audit lintas surface.
4. Release readiness report khusus UX/UI.

### Done When
- user-facing route utama sudah bersih
- tidak ada kontradiksi besar antara docs dan UI nyata
- brand terasa satu bahasa

---

## Phase 9 - V2 Intelligence Layer

### Goal
Masuk ke V2 dengan peningkatan personalisasi dan kualitas loop, bukan sekadar penambahan layar.

### Candidate Focus
1. relevance yang lebih nyata dari sekadar heuristik client-side
2. mentor touchpoints yang lebih presisi
3. smarter community prompts
4. progress loops yang lebih hidup lintas Today, Paths, dan VerseHub
5. richer private support flows bila memang terbukti dibutuhkan

### Rule
V2 tidak boleh dibuka sebelum V1 benar-benar terasa utuh.

---

## Execution Order Summary
1. Phase 0 - Lock Product Identity
2. Phase 1 - IA Cleanup
3. Phase 2 - Landing To App Alignment
4. Phase 3 - Today
5. Phase 4 - VerseHub
6. Phase 5 - Community
7. Phase 6 - Paths
8. Phase 7 - Profile / Inbox
9. Phase 8 - V1 Consolidation
10. Phase 9 - V2 Intelligence Layer

## What To Do Right After This Roadmap
Langkah paling sehat setelah roadmap ini adalah membuat:

`surface-by-surface execution checklist`

dimulai dari:
1. Today
2. VerseHub
3. Community
4. Paths

Supaya roadmap ini langsung turun menjadi daftar kerja yang bisa dikerjakan sprint per sprint.
