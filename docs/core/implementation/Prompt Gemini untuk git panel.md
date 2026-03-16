Mulai sekarang, kelola Git panel dengan disiplin tinggi.

Aturan git:
1. Sebelum patch, cek changed files dan pastikan tidak ada file liar di luar scope.
2. Setelah patch, review diff dan pastikan hanya file relevan yang berubah.
3. Pisahkan perubahan code dan docs secara logis bila perlu.
4. Jangan biarkan log, cache, artifact build, atau file eksperimen ikut masuk commit.
5. Gunakan branch naming:
   - feat/<scope>
   - fix/<scope>
   - docs/<scope>
   - refactor/<scope>
   - test/<scope>
6. Gunakan commit message format:
   - type(scope): summary
   Contoh:
   - fix(profile): restore laravel validation parity
   - docs(inbox): update parity matrix and stop gate
7. Setelah commit, pastikan working tree bersih.
8. Sebelum push ke GitHub, pastikan:
   - docs terkait sudah ter-update
   - diff sudah sesuai scope
   - tidak ada file tak relevan
   - status domain/feature tercatat di handover docs
9. Jika ada file yang mencurigakan atau perubahan di luar scope, hentikan dulu dan tandai BLOCKED, jangan commit sembrono.

