# Implementation Log: Hook Card System

## Actions Taken
- Pembuatan struktur `src/components/cards/HookCard.tsx`.
- Definisi `VariantStyles` *highlight/subtle/urgent*.
- Injeksi prop ikon lucide (seperti *Flame* atau *Pray* symbol) statis pada file.

## Risks/Decisions
- Komponen agnostik dari segala pemanggilan data API sehingga menjadi murni *UI representational element*. Tujuannya agar reusabilitas tak dihalangi efek *hooks* React `UseEffect`.
