# Self-hosting Guide

`Micro-Team-Backend` is designed to run as a portable headless CMS. Vercel is optional. GitHub is optional. The backend can run on Docker, VPS, or traditional Node hosting.

## Production goals
- keep content and admin in one backend service
- use PostgreSQL-compatible storage
- expose stable APIs for one or more frontend applications
- keep extensions isolated from the framework core
- keep storage providers replaceable through adapters
- keep scheduled automation callable from external cron instead of one specific CI vendor

## Required environment variables
At minimum:
```env
DATABASE_URL=postgresql://user:password@host:5432/database?schema=public
APP_ENCRYPTION_KEY=replace-with-a-long-random-secret
EXTENSIONS_WRITE_ENABLED=false
STORAGE_DRIVER=local
LOCAL_UPLOAD_URL_BASE=/uploads
```

Optional S3 / R2 storage:
```env
STORAGE_DRIVER=r2
S3_ENDPOINT=https://<account>.r2.cloudflarestorage.com
S3_REGION=auto
S3_BUCKET=your-bucket
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...
S3_PUBLIC_URL_BASE=https://cdn.example.com
S3_FORCE_PATH_STYLE=false
```

Optional automation runner protection:
```env
AUTOMATION_CRON_SECRET=change-this-if-you-trigger-cron-remotely
```

Recommended:
```env
NODE_ENV=production
PORT=3000
```

## First-install standard flow
1. Set `DATABASE_URL` in the host environment.
2. Run `npx prisma db push` or `npx prisma migrate deploy`.
3. Open `/setup`.
4. Verify bootstrap status.
5. Create the first admin account.

The CMS intentionally does not treat database credentials as admin-editable content. In most real deployments, those values belong to the host, container, or secrets manager layer.

## Option 1: Docker Compose
1. Review `docker-compose.yml`
2. Change the default PostgreSQL password
3. Start the stack:
```bash
docker compose up -d --build
```
4. Apply schema:
```bash
docker compose exec app npx prisma db push
```
5. Open:
```text
http://localhost:3000/setup
```

Notes:
- the compose file uses local PostgreSQL for simple self-host installs
- the `extensions` directory is persisted as a Docker volume
- ZIP extension upload stays disabled by default
- the local storage adapter writes into `public/uploads` by default

## Option 2: Existing PostgreSQL + Node server
1. Install dependencies:
```bash
npm install
```
2. Configure production `.env.local`
3. Sync schema:
```bash
npx prisma db push
npx prisma generate
```
4. Build:
```bash
npm run build
```
5. Start:
```bash
npm run start
```

Recommended runtime setup:
- reverse proxy with Nginx, Caddy, or Traefik
- process manager such as systemd or PM2
- external PostgreSQL or managed PostgreSQL
- persistent filesystem or mounted volume for `extensions/`, `tmp/`, and media uploads when using local storage

## Storage and portability notes
This backend currently ships with:
- PostgreSQL-compatible database access through Prisma
- a local filesystem storage adapter for media
- an S3-compatible adapter that also works for Cloudflare R2 through endpoint configuration

When the content library grows, these are the pressure points:
- database size grows from structured content, logs, and metadata
- local disk grows from media uploads if `STORAGE_DRIVER=local`
- object storage costs grow when you move to S3 or R2

Best practice:
- keep structured data in PostgreSQL
- keep media in object storage once traffic or file volume grows
- do not store large binaries in the database

## AI automation notes
The AI Auto Post module:
- stores the user API key encrypted with `APP_ENCRYPTION_KEY`
- creates new `Page` entries on a schedule
- can run manually from the admin UI
- can run from external cron via `POST /api/admin/automation/cron`
- should be triggered by platform cron, server cron, or an external scheduler instead of depending on GitHub Actions

## Extension strategy in production
For stable self-host deployments:
- prefer manual extension installation into `extensions/`
- keep `EXTENSIONS_WRITE_ENABLED=false`
- review extension packages before placing them on disk
- avoid letting uploaded packages mutate the core application tree
- use admin lifecycle controls to validate and disable packages before removal

## Operational checklist
- set a real database password
- set `APP_ENCRYPTION_KEY`
- back up PostgreSQL regularly
- persist the `extensions/` directory
- persist your media upload directory or use S3/R2
- review installed extensions manually
- keep ZIP install disabled unless you explicitly trust the runtime and workflow
