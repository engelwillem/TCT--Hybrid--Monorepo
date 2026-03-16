# Open Blockers

### Medium Priority
- **Persistensi State Jauh:** Modul `/paths` sekarang memakai sistem memori browser (`localStorage`). Untuk pengalaman lintas platform yang seragam, `tct_journey_[slug]` kelak butuh migrasi menjadi model entitas Pivot/Relational (e.g., `User_Journey`) di backend laravel jika user menekan tombol pindah handphone.

### Low Priority
- **Composer Hook Vulnerability:** `Component` buatan *Community System* belum memiliki parameter penangkap (`useSearchParams()`) untuk mengisolasi *post_editor* menjadi jenis "Renungan" ketika dilempar parameter dari URL. Berisiko *user* salah menaruh subjek jika UI membiarkannya standar saat pendaratan dari *Paths/Reflection*.
- **Desain Ulang Bottom Nav (`FloatingBottomNav`):** Ikonografi serta navigasi belum mencerminkan fungsi baru (`Paths`/`Spiritual Journeys`), mungkin kelak meretas *layout.tsx* utama.
