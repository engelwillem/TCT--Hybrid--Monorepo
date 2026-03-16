# Audit: Community Domain

## Domain Overview
Community bertindak sebagai *Response Layer* tempat segala buah bacaan (`Verse`/`Journeys`) dijatuhkan/ditulis oleh pengguna.

## Temuan Inti (Core Findings)
- Backend Laravel memiliki API Endpoint CRUD penuh.
- Flow input baru berbasis text (Composer) terpisah, dan tidak otomatis menangkap parameter/topik dari *URL Intent Bridge*.
- *Reaction / Likes* dan *Comment* thread masih berbalas-balasan sinkron, perombakan ke *optimistic update* di React dapat memperbaiki fluiditas ini.

## Target Parity
Mengesahkan form Komunitas merespons *Deep-Linking* (`?intent=verse_reflection&ref=xyz`) untuk mengunci *tagging* atau tema diskusi.
