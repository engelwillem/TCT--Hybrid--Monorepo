# WA Reminder Phone Owner Lock - Final Spec

## Objective
Mencegah salah kirim akibat human error copy-paste pada Google Sheet ketika:
- `Nomor WA` sama
- `Nama pelanggan` berbeda

Aturan bisnis final:
- Sistem hanya boleh kirim ke **nama pemilik lock** untuk nomor tersebut.
- Jika nama beda pada nomor yang sama, row harus **Skip**.

## Core Rule (Exact)
1. Owner lock disimpan per tenant (`wa_client_id`) + `phone`.
2. Owner lock bersumber dari **pengiriman sukses pertama** (`status = Terkirim`) ke nomor itu.
3. Row baru dengan nomor yang sama:
- Jika nama cocok dengan owner lock => boleh diproses normal.
- Jika nama berbeda => `Skip` dengan reason `conflict_phone_owner`.
4. Sistem tetap mengirim untuk row owner yang valid, dan menolak row konflik.

## Data Model (Option B)
Table: `wa_phone_owners`
- `wa_client_id`
- `phone`
- `canonical_name`
- `canonical_name_normalized`
- `first_seen_at`
- `last_seen_at`
- `confidence`

Unique key:
- `wa_client_id + phone`

## Name Matching Policy
Nama dibandingkan dengan normalisasi:
- trim
- lowercase
- collapse multiple spaces menjadi single space

Contoh:
- `Pak  Edi` == `pak edi` => match
- `Pak Edi` != `Yesi` => conflict

## Processing Points
1. `sync-reminders`:
- Validasi owner lock sebelum row dibuat/di-update.
- Jika conflict => row `Skip` (tidak jadi `Pending`).
2. `wa:process-due-reminders`:
- Fail-safe check sebelum kirim.
- Jika conflict ditemukan di tahap kirim => status `Skip`.
3. Setelah kirim sukses:
- Upsert owner lock pada `wa_phone_owners`.
- Update `last_seen_at` dan `confidence`.

## Expected Scenarios
### PASS
Row A:
- Nama: `Pak Edi`
- Nomor: `628xxx18`
- Sukses terkirim pertama kali

Row berikutnya:
- Nama: `Pak Edi`
- Nomor: `628xxx18`
- Hasil: boleh kirim

### FAIL (must skip)
Row B (human error copy-paste):
- Nama: `Yesi`
- Nomor: `628xxx18` (milik Pak Edi)
- Hasil: `Skip`
- Reason: `conflict_phone_owner: nomor 628xxx18 milik Pak Edi`

## Operational Guarantees
Dengan spec ini:
- Ubah jadwal di row yang sama tetap didukung.
- Nomor WA tidak akan terkirim ke identitas nama yang berbeda.
- Risiko salah kirim massal akibat copy-paste turun signifikan.
