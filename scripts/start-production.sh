#!/bin/sh
set -eu

if [ -z "${DATABASE_URL:-}" ]; then
  echo "DATABASE_URL is required; refusing to start without persistent lead storage." >&2
  exit 1
fi
if [ -z "${AUTH_SECRET:-}" ]; then
  echo "AUTH_SECRET is required; refusing to start with an insecure authentication configuration." >&2
  exit 1
fi

npm run db:migrate:deploy
if [ -n "${CRM_ADMIN_EMAIL:-}" ] && [ -n "${CRM_ADMIN_PASSWORD:-}" ]; then
  npm run db:seed-admin
fi
exec node server.js
