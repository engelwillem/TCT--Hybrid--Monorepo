# CLEAN LOAD NEXT JS REPO
memuat ulang dengan environment Next.js yang 100% bersih dan menjalankan server Turbopack dengan lancar setelah repo github di update dengan file terbaru yang sudah diperbaiki.
```bash
git fetch origin
git reset --hard origin/main
npm cache clean --force
rm -rf .next
npm run dev
```

