# DACK Reporting Platform

Internal platform for DACK's MWBE, SDVOB, and EEO reporting workflows.

## Phase 1 goal

Build a production-ready reporting engine for the current manual workflow:

1. Upload source files for a project and reporting period.
2. Normalize utilization and workforce data into a canonical schema.
3. Apply deterministic compliance rules like the 60 percent supplier credit.
4. Review and correct flagged items before approval.
5. Generate chart-ready data and export a polished PDF report.

## Planned architecture

- `web`: Next.js internal app for uploads, review, and report generation
- `postgres`: source-of-truth database for projects, imports, rules, and report runs
- `storage`: uploaded source files and generated outputs
- `worker`: background jobs for parsing, normalization, and PDF generation
- `redis`: optional queue/cache for async work
- `anythingllm`: optional Phase 2 service for proposal and RFP retrieval workflows

## Current scaffold

This repository currently includes:

- initial Next.js app structure
- Prisma schema draft for the Phase 1 data model
- environment variable template
- Dockerfile for container deployment
- Easypanel setup guide

## Local development

Install dependencies:

```bash
pnpm install
```

Start the app:

```bash
pnpm dev
```

Open `http://localhost:3000`.

## Database setup

Generate the Prisma client:

```bash
pnpm prisma:generate
```

Run the first migration after the database env is in place:

```bash
pnpm prisma:migrate
```

## Environment

Copy `.env.example` to `.env.local` and update values after the first GitHub push.

## Easypanel rollout

1. Push this repository to GitHub.
2. Create the app in Easypanel from the GitHub repo.
3. Add the environment variables from `.env.example`.
4. Deploy the web service.
5. Add storage and worker services next.

Detailed setup lives in [`docs/easypanel-setup.md`](/root/dack/docs/easypanel-setup.md).
