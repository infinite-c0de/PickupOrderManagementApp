#!/usr/bin/env bash
set -euo pipefail

# One-shot bootstrap for Layver FE monorepo on Ubuntu/DigitalOcean.
# Usage example:
#   ./deploy/scripts/bootstrap-digitalocean.sh \
#     --root-domain layverhq.com \
#     --admin-domain admin.layverhq.com \
#     --user-domain app.layverhq.com \
#     --partner-domain partner.layverhq.com \
#     --public-port 3000 \
#     --certbot-email you@example.com

ROOT_DOMAIN="layverhq.com"
ADMIN_DOMAIN="admin.layverhq.com"
USER_DOMAIN="app.layverhq.com"
PARTNER_DOMAIN="partner.layverhq.com"
PUBLIC_PORT="3000"
CERTBOT_EMAIL=""
SKIP_CERTBOT="false"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --root-domain)
      ROOT_DOMAIN="$2"
      shift 2
      ;;
    --admin-domain)
      ADMIN_DOMAIN="$2"
      shift 2
      ;;
    --user-domain)
      USER_DOMAIN="$2"
      shift 2
      ;;
    --partner-domain)
      PARTNER_DOMAIN="$2"
      shift 2
      ;;
    --public-port)
      PUBLIC_PORT="$2"
      shift 2
      ;;
    --certbot-email)
      CERTBOT_EMAIL="$2"
      shift 2
      ;;
    --skip-certbot)
      SKIP_CERTBOT="true"
      shift 1
      ;;
    *)
      echo "Unknown argument: $1"
      exit 1
      ;;
  esac
done

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is required but not installed."
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "npm is required but not installed."
  exit 1
fi

if [[ "$SKIP_CERTBOT" != "true" ]] && [[ -z "$CERTBOT_EMAIL" ]]; then
  echo "Missing --certbot-email (or use --skip-certbot)."
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

echo "==> Installing system packages (nginx, certbot)"
sudo apt-get update
sudo apt-get install -y nginx certbot python3-certbot-nginx

echo "==> Ensuring PM2 is installed"
if ! command -v pm2 >/dev/null 2>&1; then
  sudo npm install -g pm2
fi

echo "==> Installing node dependencies"
cd "$REPO_ROOT"
npm ci

echo "==> Building all frontend apps"
npm run build

echo "==> Starting PM2 processes"
pm2 start deploy/pm2/ecosystem.config.cjs || pm2 restart deploy/pm2/ecosystem.config.cjs
pm2 save

echo "==> Enabling PM2 startup"
pm2 startup systemd -u "$USER" --hp "$HOME" >/tmp/pm2-startup-layver.txt
STARTUP_CMD="$(awk '/sudo/ { cmd=$0 } END { print cmd }' /tmp/pm2-startup-layver.txt)"
if [[ -n "$STARTUP_CMD" ]]; then
  eval "$STARTUP_CMD"
fi

echo "==> Writing nginx subdomain config"
NGINX_TEMPLATE="$REPO_ROOT/deploy/nginx/layver-fe-subdomains.conf"
NGINX_RENDERED="/tmp/layver-fe-subdomains.conf"

cp "$NGINX_TEMPLATE" "$NGINX_RENDERED"
sed -i "s/admin\.layverhq\.com/${ADMIN_DOMAIN}/g" "$NGINX_RENDERED"
sed -i "s/app\.layverhq\.com/${USER_DOMAIN}/g" "$NGINX_RENDERED"
sed -i "s/partner\.layverhq\.com/${PARTNER_DOMAIN}/g" "$NGINX_RENDERED"
sed -i "s/127\.0\.0\.1:3000/127.0.0.1:${PUBLIC_PORT}/g" "$NGINX_RENDERED"
sed -i "s/layverhq\.com/${ROOT_DOMAIN}/g" "$NGINX_RENDERED"

sudo cp "$NGINX_RENDERED" /etc/nginx/sites-available/layver-fe-subdomains.conf
if [[ ! -L /etc/nginx/sites-enabled/layver-fe-subdomains.conf ]]; then
  sudo ln -s /etc/nginx/sites-available/layver-fe-subdomains.conf /etc/nginx/sites-enabled/layver-fe-subdomains.conf
fi
sudo nginx -t
sudo systemctl reload nginx

if [[ "$SKIP_CERTBOT" != "true" ]]; then
  echo "==> Issuing SSL certificates via certbot"
  sudo certbot --nginx \
    -d "$ROOT_DOMAIN" \
    -d "www.$ROOT_DOMAIN" \
    -d "$ADMIN_DOMAIN" \
    -d "$USER_DOMAIN" \
    -d "$PARTNER_DOMAIN" \
    --non-interactive \
    --agree-tos \
    -m "$CERTBOT_EMAIL" \
    --redirect
fi

echo "==> Bootstrap finished"
echo "Expected root/public+auth app upstream: 127.0.0.1:${PUBLIC_PORT} (layver-web)"
echo "Remember to create:"
echo "  apps/web/.env.production"
echo "  apps/admin/.env.production"
echo "  apps/user/.env.production"
echo "  apps/partner/.env.production"
echo "then restart apps:"
echo "  pm2 restart layver-web layver-admin layver-user layver-partner"
