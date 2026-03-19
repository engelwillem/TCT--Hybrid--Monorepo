# manual pull deploy dari cPanel terminal.
Jalankan command ini saja setiap kali backend berubah, lalu kirim output kalau ada gagal:
```bash
bash /home/thechoosentalks/deploy/apps/thechoosentalks/deploy.sh
```

Kalau Anda ingin lebih aman dan eksplisit memakai base URL healthcheck:
```bash
HEALTHCHECK_BASE_URL="https://api.thechoosentalks.org" bash /home/thechoosentalks/deploy/apps/thechoosentalks/deploy.sh
```
Jangan lanjut ubah workflow GitHub Actions dulu sebelum command ini benar-benar konsisten sukses dari terminal.