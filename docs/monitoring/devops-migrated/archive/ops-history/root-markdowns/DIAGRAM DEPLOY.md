1️⃣ Arsitektur CI/CD → Server Deploy

┌──────────────────────┐
│     Developer        │
│   Git push commit    │
└──────────┬───────────┘
           │
           ▼
┌────────────────────────────┐
│       GitHub Repository    │
│      TCT--Laravel repo     │
└──────────┬─────────────────┘
           │
           ▼
┌───────────────────────────────────────┐
│         GitHub Actions CI/CD          │
│                                       │
│ 1. composer install                   │
│ 2. npm ci                             │
│ 3. npm run build (Vite)               │
│ 4. php artisan test                   │
│ 5. create build artifact              │
│                                       │
│ artifact: build.tar.gz                │
└──────────┬────────────────────────────┘
           │
           ▼
┌────────────────────────────┐
│        Deploy Server       │
│     (cPanel shared host)   │
└──────────┬─────────────────┘
           │
           ▼
     deploy.sh execution


2️⃣ Struktur Deploy di Server
# /home/thechoosentalks

home
 └── thechoosentalks
      │
      ├── repositories
      │     └── TCT--Laravel
      │
      ├── deploy
      │     └── apps
      │          └── thechoosentalks
      │
      │               ├── build.tar.gz
      │               ├── deploy.sh
      │               ├── healthcheck.sh
      │               ├── rollback.sh
      │               │
      │               ├── shared
      │               │     ├── .env
      │               │     └── storage
      │               │
      │               ├── releases
      │               │     ├── 20260308114212
      │               │     ├── 20260308122810
      │               │     ├── 20260308133751
      │               │     └── 20260308154950
      │               │
      │               └── current  ──────┐
      │                                  │
      │                                  ▼
      │                         active release
      │
      └── public_html
             │
             ├── index.php
             │
             └── assets (rsync from release/public)


3️⃣ Runtime Request Flow
# Ketika user membuka website:

Browser
   │
   ▼
LiteSpeed / Apache
   │
   ▼
public_html/index.php
   │
   ▼
../deploy/apps/thechoosentalks/current/public/index.php
   │
   ▼
Laravel bootstrap
   │
   ▼
Application response


Artinya:
public_html
     │
     ▼
current symlink
     │
     ▼
active release

Deploy hanya mengganti:
current -> releases/<timestamp>
Ini membuat deploy atomic (tidak ada downtime).

4️⃣ Alur Deploy Script

deploy.sh
   │
   ├─ validate artifact
   │
   ├─ create release directory
   │
   ├─ extract build.tar.gz
   │
   ├─ link shared resources
   │
   ├─ run migrations
   │
   ├─ pre-healthcheck
   │
   ├─ switch symlink
   │      current -> new release
   │
   ├─ publish assets
   │
   ├─ post-healthcheck
   │
   └─ cleanup old releases

5️⃣ Atomic Deploy Mechanism
releases/
   │
   ├── 20260308114212
   ├── 20260308122810
   ├── 20260308133751
   └── 20260308154950
           ▲
           │
           │
       current

Deploy baru:

releases/
   ├── old release
   ├── old release
   └── NEW_RELEASE
            ▲
            │
current ────┘

Switch hanya 1 operasi symlink:

ln -sfn NEW_RELEASE current

Itu sebabnya deploy tidak menyebabkan downtime.

6️⃣ Safety Mechanisms yang Sekarang Ada

Deploy Anda sekarang memiliki:

SECURITY
✓ safe rm
✓ tar validation
✓ artifact validation

RELIABILITY
✓ atomic release
✓ rollback
✓ healthcheck

OBSERVABILITY
✓ deploy logs
✓ deploy history

SELF HEALING
✓ deploy state
✓ interrupted deploy recovery

Ini sudah jauh lebih kuat dari kebanyakan deploy script di shared hosting.

7️⃣ Risiko Terbesar yang Masih Tersisa (Bukan di Script)

Bukan di deploy script, tapi di environment:

1. shared hosting isolation
2. disk space exhaustion
3. MySQL connection limit
4. slow rsync asset publish

Ini normal untuk cPanel.

