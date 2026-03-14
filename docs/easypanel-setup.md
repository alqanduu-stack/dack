# Easypanel Setup

## First deploy

1. Push this repo to GitHub.
2. In Easypanel, create a new app from the GitHub repository.
3. Use the included `Dockerfile`.
4. Add these environment variables:

```env
DATABASE_URL=postgres://dackpostgres:894776aeea273d3f83c3@dack_dackdb:5432/dackdb?sslmode=disable
NEXT_PUBLIC_APP_NAME=DACK Reporting Platform
NEXT_PUBLIC_APP_ENV=development
APP_URL=https://your-app-domain
STORAGE_MODE=local
UPLOAD_DIR=./uploads
```

## Recommended services

- `dack-web`: Next.js web app
- `dack-postgres`: already created
- `dack-storage`: persistent volume or object storage
- `dack-worker`: parsing and report generation
- `dack-redis`: optional queue

## Immediate follow-up after first deploy

1. Rotate the database password before production.
2. Add a persistent volume for uploads and generated outputs.
3. Run `pnpm prisma:generate` and `pnpm prisma:migrate` during the first full app setup.
4. Add a worker service once we implement ingestion jobs.

## Notes

- Keep raw client files out of the public repository.
- For Phase 1, do not block on AnythingLLM.
- The first goal is one clean MWBE and EEO reporting pipeline.
