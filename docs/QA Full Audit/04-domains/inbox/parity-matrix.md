# Parity Matrix: Inbox / DM

Dokumen yang menyeleraskan fitur Pesan dan Pemberitahuan (Notifikasi/Inbox).

## Modul Pesan & Notifikasi
| Fitur / Skope | Legacy (Blade) | Hybrid (Next.js) | Status | Catatan |
| ------------- | -------------- | ---------------- | ------ | ------- |
| Receive Alert | Sidebar Icon | AppShell Header | `PASS` | Red Dot Indicator aktif saat unread count > 0.
| Direct Message| Laravel Chat | Inbox Component | `PASS` | Sinkron dengan model/relasi DB asli.
| Mark as Read | Single/Batch | API Action | `PASS` | Write-flow action sukses pada `read-path/write-path` smoke test.
| Render Format | Simple List | UI Cards List | `PASS` | Format balasan komentar / broadcast dirancang setara.
