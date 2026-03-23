# Visual System & Content Framework (The Dawn Theme)

## Warna & Bayangan (Colors & Shadows)
1. Permukaan (`surface`): Beralih dari kekosongan statis putih penuh menuju spektrum kelabu ultra cerah/dingin `slate-50` (`hsl(210 20% 98%)`) di mode reguler (`The Dawn Theme`). Kegelapan murni hanya dipakai di mode gelap malam (`The Twilight Theme`).
2. Bayangan Premium (`shadow-soft`, `shadow-premium`, `shadow-glass`): Ilusi melayang transparan (blur 32px - 64px) yang menghilangkan _border_ kasar dengan menggantikannya lewat pendaran bayangan ultra-lembut (*drop shadow*).
3. Efek Kaca (`glass-card` & `glass-nav`): Berlapis penyaring kabur transparan tebal (`backdrop-filter: blur(24px)`) untuk interaksi _scroll-overlay_ layaknya elemen _Native Mobile App_ iOS. 

## Tipografi & Ruang (Typography & Spacing)
1. Pemulihan *Whitespace*: Pad `tct-card-pad` ditingkatkan ke `p-6` hingga `p-8` demi merebut ruang nafas.
2. Tajuk (*Headings*): Font-weight ditarik hingga kelas `font-bold` namun diseimbangkan oleh pemaksaan minus-tracking ekstrim kompresonal (`tracking-[-0.03em]`).
3. Badan (*Body*): Leading `[1.7]` dengan positif tracking `[0.01em]` diresmikan demi kelancaran laju baca literatur perenungan Alkitab.
4. Lencana (*Chips*) dan Info Kecil (*Kickers*): Dijepit memakai pemodifikasi tebal huruf besar mutlak `uppercase tracking-widest text-[10px]` selaku sentuhan keperibadian *bold* minimalis.

## Komponen Reusable
- **Tombol**: Tidak statis. Pemencetan melantik animasi balasan `.tct-pressable` dari Framer Motion.
- **Bingkai Bundar**: Sudut ditarik maksimal (`rounded-[32px]` hingga `rounded-[40px]`). Meniadakan sensasi kaku "kotak kardus" warisan era web lama.
