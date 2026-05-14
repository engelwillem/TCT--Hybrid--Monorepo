# VerseHub OG Brand Fonts

Folder ini dipakai oleh generator OG VerseHub agar tipografi konsisten di semua server/deploy.

## Font aktif default
- `VerseHubBrand-Regular.ttf`
- `VerseHubBrand-Mono.ttf`

## Override opsional via `.env`
Set variabel berikut bila ingin memaksa font tertentu:

```env
VERSEHUB_OG_FONT=resources/fonts/og/VerseHubBrand-Regular.ttf
```

Nilai path bersifat relatif terhadap root project.

## Catatan operasional
- Simpan font berlisensi yang legal untuk distribusi repository/deploy Anda.
- Jika Anda ingin style premium khusus brand, ganti file ini dengan font brand resmi Anda menggunakan nama file yang sama agar tidak perlu ubah kode.
