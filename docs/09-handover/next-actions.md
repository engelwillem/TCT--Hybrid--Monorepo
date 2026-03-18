# Next Actions

## Prioritas Eksekusi Frontend (V1)

1. Stabilisasi route inti agar tidak ada CTA yang kembali ke route legacy.
2. Perkuat alur `Today -> Paths -> Community` dengan copy yang konsisten di semua surface aktif.
3. Audit komponen reusable yang masih membawa label/navigation lama lalu samakan dengan IA inti.
4. Rapikan empty/loading/error state untuk halaman inti agar UX lebih tenang dan jelas.
5. Finalisasi acceptance checklist parity local vs production untuk route inti.

## Definisi Selesai Batch Ini

- Tidak ada CTA aktif yang mendorong user ke `library`, `visitors`, `gate-updates`, atau `reflections` lama.
- Semua shortcut primer pada surface aktif selaras ke pilar inti: Today, VerseHub, Paths, Community.
- Dokumentasi status dan changelog harian mencerminkan perubahan aktual yang sudah live di codebase.

## Risiko yang Perlu Dijaga

- Drift copy pada komponen lama yang masih dipakai lintas halaman.
- Redirect berlapis (route config + page redirect) yang bisa menambah kompleksitas bila tidak dipantau.
- QA visual mobile jika ada surface lawas yang belum disentuh tetapi masih bisa diakses dari deep link.
