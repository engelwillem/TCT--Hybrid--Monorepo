# Hook Cards (Relevance Injectors)

## Tujuan
Menghubungkan bacaan statis (pasif) dengan ruang respon interaktif (Community atau form private jurnal). Bertindak sebagai Action Loop.

## Properti Komponen (`HookCard.tsx`)
1. **HookText**: Kutipan provokatif mengacu pada ayat rujukan.
2. **VerseReference**: Label Alkitab sumber (metadata otoritas).
3. **RelevanceText**: Kalimat pengantar yang menyentuh masalah hidup ("Ada pergumulan?").
4. **PrimaryAction**: Tombol respons paling kuat berjenis (pray, reflect, discuss, save, share).

## Implementasi Visual
- Memakai lucide-react icons dengan `VARIANT_STYLES` (`subtle`, `highlight`, `urgent`).
- Card berbasis komponen `radix-ui` yang di-*wrap* Framer Motion bila dibutuhkan.

## Handoff & Integrasi
- Ketika ditekan, aksi merouting via URL query parameter ke laman komunitas (contoh: `/community?intent=pray&ref=mzm-34-19`).
