# Repo Cleanup Report

Generated: 2026-04-20 22:43:32 +07:00

## Completed
- Generated website ZIP from whitelist.
- Tightened .gitignore policy for local artifacts, docs, and generated files.
- Tightened .gitattributes export-ignore policy for non-runtime assets.
- Updated scripts/main-website-zip.whitelist.json to a cleaner runtime-focused whitelist.
- Moved root non-runtime artifacts into docs/archive/local-root-sweep/2026-04-20/.

## Root Files After Cleanup
- .dockerignore
- .env
- .env.docker
- .env.docker.example
- .env.docker.local
- .env.example
- .env.local
- .gitattributes
- .gitignore
- .npmrc
- apphosting.yaml
- components.json
- docker-compose.yml
- firestore.rules
- Jenkinsfile
- LICENSE
- next-env.d.ts
- next.config.ts
- package-lock.json
- package.json
- playwright.config.ts
- postcss.config.mjs
- README.md
- tailwind.config.ts
- tsconfig.json
- vitest.config.ts
- vitest.docker.config.mjs

## Moved Root Artifacts
- .codex-devstudio.err
- .codex-devstudio.log
- .codex-devturbo.err
- .codex-devturbo.log
- .codex-globals.css.bak
- .codex-layout.tsx.bak
- .codex-next-dev.err.log
- .codex-next-dev.out.log
- .codex-page.tsx.bak
- .tmp-dev-err.log
- .tmp-dev-out.log
- .tmp-mail-fix.sh
- .tmp-mail-local-fix.sh
- .tmp-mail-url-fix.sh
- .tmp-mail-vars.env
- .tmp-next-dev-err.log
- .tmp-next-dev-out.log
- .tmp-renungan-dev-err.log
- .tmp-renungan-dev-out.log
- build_audit.log
- compose-resolved.yml
- installed_software.txt
- tmp_versehub_local_after.html
- tmp_versehub_local_latest.html
- tmp_versehub_local.html
- tmp-backend-build.err.log
- tmp-backend-build.out.log
- tmp-backend.err
- tmp-backend.log
- tmp-build.err.log
- tmp-build.out.log
- tmp-next.err
- tmp-next.log
- tmp-renungan-dev.err
- tmp-renungan-dev.log

## Intentional Local-Runtime Exceptions in Root
- .env, .env.local, .env.docker, .env.docker.local are kept for local runtime and already ignored by Git.

## Clean Whitelist Source
- scripts/main-website-zip.whitelist.json

## Latest ZIP
- deliverables/website-main-20260420-224152.zip
