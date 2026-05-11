Jalankan ini
```bash
cd /home/thechoosentalks/deploy/apps/thechoosentalks
RUN_MIGRATIONS=true HEALTHCHECK_BASE_URL=https://api.thechoosentalks.org ./deploy.sh
```

Setelah deploy sukses Cek cron Laravel jalan:
```bash
cd /home/thechoosentalks/deploy/apps/thechoosentalks/current
php artisan wa:process-due-reminders
```

Target output: Processed 1 reminder(s).

Lalu cek di phpMyAdmin:
```sql
SELECT id, status, fonnte_message_id, sent_at, last_error
FROM wa_reminders
ORDER BY id DESC
LIMIT 5;
```

Jalankan:
```sql
SELECT id, status, phone, tanggal, jam, zona_waktu, timezone, scheduled_at, source_hashFROM wa_remindersORDER BY id DESCLIMIT 10;
```

Yang perlu kita lihat:
* scheduled_at isinya tanggal/jam berapa
* Apakah scheduled_at masih future
* Apakah timezone-nya benar
* Apakah semua status memang Pending


Lalu jalankan juga di SSH:

```bash
cd /home/thechoosentalks/deploy/apps/thechoosentalks/currentphp artisan tinker --execute="echo now()->utc()->format('Y-m-d H:i:s');"
```


`* * * * * ...` hanya valid di file **crontab**. Pakai ini:

1. Buka crontab:
```bash
crontab -e
```

2. Tambahkan 1 baris ini:
```cron
* * * * * cd /home/thechoosentalks/deploy/apps/thechoosentalks/current && php artisan schedule:run >> /home/thechoosentalks/wa-cron.log 2>&1
```

3. Simpan, lalu cek:
```bash
crontab -l
tail -n 50 /home/thechoosentalks/wa-cron.log
```

Opsional lebih aman (tanpa `cd`):
```cron
* * * * * php /home/thechoosentalks/deploy/apps/thechoosentalks/current/artisan schedule:run >> /home/thechoosentalks/wa-cron.log 2>&1
```