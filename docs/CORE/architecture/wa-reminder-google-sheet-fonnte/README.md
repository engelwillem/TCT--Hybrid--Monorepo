# Auto WhatsApp Reminder (Google Sheet + Laravel + Fonnte)

## Single Source of Truth (Tim Operasional)
- [Implementation Status (Latest)](./implementation-status-latest.md)
- [Operational Flow (Live)](./operational-flow-live.md)
- [Go Live Checklist](./go-live-checklist.md)
- [Phone Owner Lock - Final Spec](./phone-owner-lock-spec-final.md)
- [Hybrid Mode Repo + CI/CD Plan](./hybrid-mode-repo-cicd-plan.md)
- [Workflow Rollout Execution Log (2026-04-29)](./workflow-rollout-execution-log-2026-04-29.md)

## Ringkasan
Dokumen ini menjelaskan arsitektur fitur Auto WhatsApp Reminder dengan prinsip:
- Google Sheet hanya menjadi input data + bridge Apps Script tipis.
- Seluruh logic bisnis dan token Fonnte disimpan di Laravel backend.

Endpoint utama:
- `POST /api/v1/wa/send-reminder`

## Tujuan Arsitektur
- Mencegah token Fonnte terekspos di sisi client.
- Menjaga logic inti (validasi, schedule, template, logging) tetap di server.
- Memudahkan audit seluruh percobaan kirim via tabel log.

## Komponen
- Google Sheet: sumber data reminder.
- Apps Script: mengirim payload `client_key` + `rows` ke backend.
- Laravel API: validasi, proses rule, kirim ke Fonnte, simpan log.
- Fonnte API: provider pengiriman WhatsApp.
- Database:
- `wa_clients`: mapping `client_key` -> `fonnte_token`, status client.
- `wa_logs`: audit setiap baris yang diproses (skip/terkirim/gagal).

## Alur Singkat
1. Apps Script kirim payload ke endpoint Laravel.
2. Laravel validasi request dan verifikasi `client_key`.
3. Laravel proses setiap row (skip header, cek rule tanggal/jam/status/id kirim).
4. Jika lolos, Laravel normalisasi nomor dan replace template pesan.
5. Laravel kirim ke Fonnte (`https://api.fonnte.com/send`) pakai token dari DB.
6. Laravel simpan hasil per row ke `wa_logs`.
7. Laravel return hasil per row untuk di-update kembali ke Sheet.

## File Implementasi Backend
- Route:
- `/backend-api/routes/api.php`
- Controller:
- `/backend-api/app/Http/Controllers/Api/V1/WaReminderController.php`
- Models:
- `/backend-api/app/Models/WaClient.php`
- `/backend-api/app/Models/WaLog.php`
- Migrations:
- `/backend-api/database/migrations/2026_04_27_000001_create_wa_clients_table.php`
- `/backend-api/database/migrations/2026_04_27_000002_create_wa_logs_table.php`

## Dokumen Terkait
- [API Contract](./api-contract.md)
- [Google Apps Script Bridge](./google-apps-script-bridge.md)
- [Operations Runbook](./operations-runbook.md)
