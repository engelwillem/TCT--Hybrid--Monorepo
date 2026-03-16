# Database Schema Diff Log

## Purpose
Melacak pergeseran schema database `Local (MySQL/SQLite)` dengan `Production cPanel (MySQL/MariaDB)` sebelum deklarasi penyelesaian parity (*Schema Drift*).

## Log Entri

### 1. Parity Migration (TCT Legacy Monolithic)
- **Local Expected**: Skema sudah setara dengan `tct-db` eksisting. Migration files laravel terkunci.
- **Production Risk**: Eksekusi artisan migration `php artisan migrate` di sistem legacy cPanel mungkin memecahkan tabel aktif jika struktur `User` berubah agresif.
- **Status Verifikasi**: **PASS / PROTECTED** (Rencana *Experience Engine* sejauh ini berjalan independen dan tidak mengobrak-abrik database lawas).

### 2. Parity Spiritual Journeys
- **Local Expected**: Progres journey ditampung menggunakan *Browser Local Storage* sementara (*MVP*).
- **Production Risk**: Jika *Sync API* dibangun esok hari ke cPanel, harus dieksekusi tabel baru *(User_Journey/Path)*.
- **Status Verifikasi**: **PENDING** (Menunggu integrasi ke backend nyata).
