# Layver FE Monorepo (Option B)

This folder implements the Option B structure with isolated portal apps:

- `apps/web` -> `yoursite.com` (public + auth)
- `apps/admin` -> `admin.yoursite.com`
- `apps/user` -> `app.yoursite.com`
- `apps/partner` -> `partner.yoursite.com`

Shared logic lives in:

- `packages/ui`
- `packages/lib`
- `packages/hooks`

## Step-by-step migration status

1. ✅ Create monorepo structure and workspaces.
2. ✅ Create shared packages (`ui`, `lib`, `hooks`).
3. ✅ Create independent Next.js apps (`web`, `admin`, `user`, `partner`).
4. ✅ Completed admin migration phase: layout/auth gate + overview, buckets, goals, users, reservations, retailers, products (list/categories/create/edit), blog (list/categories/create/edit), reports, settings, timelines, and pricing moved to `apps/admin`.
5. ✅ Move existing user routes from legacy app to `apps/user` (dashboard, goals, goal detail, buckets, contributions, reservations, retailers, transactions, profile).
6. ✅ Move existing partner routes from legacy app to `apps/partner` (overview, products, product create/edit, partner profile).
7. ✅ Move public + auth routes into `apps/web` (home, marketplace, blog, legal pages, auth pages).
8. ✅ Deploy each app to its own domain/subdomain (`web` + `admin` + `user` + `partner`).

## Install and run

From `layver-fe/`:

```bash
npm install
npm run dev:web
npm run dev:admin
npm run dev:user
npm run dev:partner
```

Default ports:

- web: `http://localhost:3000`
- admin: `http://localhost:3001`
- user: `http://localhost:3002`
- partner: `http://localhost:3003`

## Build commands

```bash
npm run build:web
npm run build:admin
npm run build:user
npm run build:partner
```

## Production deployment (DigitalOcean)

This repo now includes deployment templates for subdomain hosting:

- PM2 process config: `deploy/pm2/ecosystem.config.cjs`
- Nginx vhost config: `deploy/nginx/layver-fe-subdomains.conf`
- One-shot bootstrap script: `deploy/scripts/bootstrap-digitalocean.sh`
- Per-app env templates:
  - `apps/web/.env.production.example`
  - `apps/admin/.env.production.example`
  - `apps/user/.env.production.example`
  - `apps/partner/.env.production.example`

### Quick one-command bootstrap

From `layver-fe/` on your droplet:

```bash
chmod +x deploy/scripts/bootstrap-digitalocean.sh
./deploy/scripts/bootstrap-digitalocean.sh \
  --root-domain layverhq.com \
  --admin-domain admin.layverhq.com \
  --user-domain app.layverhq.com \
  --partner-domain partner.layverhq.com \
  --public-port 3000 \
  --certbot-email you@example.com
```

If SSL is already managed separately, you can skip certbot:

```bash
./deploy/scripts/bootstrap-digitalocean.sh --skip-certbot
```

### 1) DNS setup (Squarespace)

Create `A` records pointing to your DigitalOcean droplet IP:

- `layverhq.com`
- `www.layverhq.com`
- `admin.layverhq.com`
- `app.layverhq.com`
- `partner.layverhq.com`

### 2) Build and run apps on server

From `layver-fe/` on the droplet:

```bash
npm ci
npm run build
pm2 start deploy/pm2/ecosystem.config.cjs
pm2 save
pm2 startup
```

This starts:

- web on port `3000`
- admin on port `3001`
- user on port `3002`
- partner on port `3003`

### 3) Configure Nginx

```bash
sudo cp deploy/nginx/layver-fe-subdomains.conf /etc/nginx/sites-available/layver-fe-subdomains.conf
sudo ln -s /etc/nginx/sites-available/layver-fe-subdomains.conf /etc/nginx/sites-enabled/layver-fe-subdomains.conf
sudo nginx -t
sudo systemctl reload nginx
```

### 4) SSL certificates

If you have not issued certificates yet:

```bash
sudo certbot --nginx -d admin.layverhq.com -d app.layverhq.com -d partner.layverhq.com
```

### 5) App env files

Create these on server (copy from `.env.production.example`):

- `apps/web/.env.production`
- `apps/admin/.env.production`
- `apps/user/.env.production`
- `apps/partner/.env.production`

Then restart PM2 apps:

```bash
pm2 restart layver-web layver-admin layver-user layver-partner
```
