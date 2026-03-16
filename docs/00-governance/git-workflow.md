# Git Workflow

## Branch Naming
Gunakan pola:
- `feat/<scope>`
- `fix/<scope>`
- `docs/<scope>`
- `refactor/<scope>`
- `test/<scope>`

Contoh:
- `fix/profile-lifecycle-parity`
- `feat/relevance-homepage`
- `docs/community-audit-sync`
- `test/main-apps-smoke`

## Commit Format
Gunakan format:
`type(scope): summary`

Contoh:
- `fix(inbox): restore thread detail error parity`
- `docs(governance): establish repository rules`
- `test(e2e): add smoke matrix for main apps`

## Allowed Commit Types
- `feat`
- `fix`
- `docs`
- `refactor`
- `test`
- `chore`

## Working Tree Rules
1. Sebelum patch, cek changed files.
2. Jangan commit file di luar scope.
3. Jangan commit log, dump, cache, build artifact, atau file eksperimen.
4. Review diff sebelum commit.
5. Pastikan docs relevan ikut ter-update.
6. Setelah commit, working tree harus bersih.

## Scope Discipline
Satu commit harus merepresentasikan satu unit kerja yang masuk akal. Jangan campur banyak domain tanpa alasan jelas.
