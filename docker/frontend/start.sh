#!/usr/bin/env bash
set -euo pipefail

cd /workspace

if [ ! -d node_modules ] || [ -z "$(ls -A node_modules 2>/dev/null)" ] || [ ! -d node_modules/typescript ]; then
  npm ci --include=dev
fi

if [ ! -f node_modules/@next/swc-linux-x64-gnu/next-swc.linux-x64-gnu.node ]; then
  next_version="$(node -p "require('./node_modules/next/package.json').version")"
  npm install --no-save "@next/swc-linux-x64-gnu@${next_version}"
fi

frontend_runtime="${FRONTEND_RUNTIME:-development}"
frontend_use_turbopack="${FRONTEND_USE_TURBOPACK:-0}"

if [ "$frontend_runtime" = "development" ]; then
  if [ "${FRONTEND_RESET_CACHE:-0}" = "1" ]; then
    rm -rf .next/*
  fi

  if [ "$frontend_use_turbopack" = "1" ]; then
    exec env NODE_ENV=development npm run dev:tailscale
  fi

  exec env NODE_ENV=development npx next dev -H 0.0.0.0 -p 9002
fi

needs_build=1

if [ -f .next/BUILD_ID ]; then
  needs_build=0

  for path in \
    package.json \
    package-lock.json \
    next.config.ts \
    next.config.js \
    tsconfig.json \
    postcss.config.js \
    postcss.config.mjs \
    tailwind.config.js \
    tailwind.config.ts \
    src \
    public \
    app \
    components \
    lib \
    .env.local \
    .env; do
    if [ ! -e "$path" ]; then
      continue
    fi

    if [ -f "$path" ] && [ "$path" -nt .next/BUILD_ID ]; then
      needs_build=1
      break
    fi

    if [ -d "$path" ] && find "$path" -type f -newer .next/BUILD_ID -print -quit 2>/dev/null | grep -q .; then
      needs_build=1
      break
    fi
  done
fi

if [ "$needs_build" -eq 1 ]; then
  rm -rf .next/*
  npx next build
fi

if [ -f .next/standalone/server.js ]; then
  mkdir -p .next/standalone/.next/static

  if [ -d public ]; then
    rm -rf .next/standalone/public
    cp -R public .next/standalone/public
  fi

  rm -rf .next/standalone/.next/static/*
  cp -R .next/static/. .next/standalone/.next/static/

  cd .next/standalone
  exec env NODE_ENV=production HOSTNAME=0.0.0.0 PORT=9002 node server.js
fi

exec env NODE_ENV=production npx next start -H 0.0.0.0 -p 9002
