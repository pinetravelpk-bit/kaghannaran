#!/usr/bin/env bash
# Build and release the site on the VPS. Run as root:  bash deploy.sh [git-ref]
# Layout: /var/www/kaghannaran/{releases/<ts>, current -> releases/<ts>, shared/.env.production}
set -euo pipefail

APP=kaghannaran
REPO=https://github.com/pinetravelpk-bit/kaghannaran.git
REF=${1:-main}
BASE=/var/www/$APP
REL=$BASE/releases/$(date +%Y%m%d%H%M%S)

id "$APP" >/dev/null 2>&1 || useradd --system --home-dir "$BASE" --shell /usr/sbin/nologin "$APP"
mkdir -p "$BASE/releases" "$BASE/shared"
touch "$BASE/shared/.env.production"
chown -R "$APP:$APP" "$BASE/releases" "$BASE/shared"
chmod 600 "$BASE/shared/.env.production"

sudo -u "$APP" git clone --quiet --depth 1 --branch "$REF" "$REPO" "$REL"
# NEXT_PUBLIC_* values are baked in at build time, so the env file must be present for the build
sudo -u "$APP" cp "$BASE/shared/.env.production" "$REL/.env.production"
cd "$REL"
sudo -u "$APP" HOME="$BASE" npm ci --no-audit --no-fund
sudo -u "$APP" HOME="$BASE" NODE_OPTIONS=--max-old-space-size=1536 NEXT_TELEMETRY_DISABLED=1 npm run build

ln -sfn "$REL" "$BASE/current"
systemctl restart "$APP"

# keep the 3 newest releases
ls -1dt "$BASE"/releases/*/ | tail -n +4 | xargs -r rm -rf
echo "Released $REL"
