# Roomie

> Roomie is a modern monorepo for a roommate discovery and management platform. It includes a production-ready Next.js app, an admin interface, a web client, shared UI components, and database/package utilities — designed for discoverability, onboarding, and matching roommates based on preferences and compatibility.

## Key Features
- Fast, SEO-friendly frontend built with Next.js (multiple apps in the monorepo)
- Admin dashboard for management and moderation
- Onboarding flows with profile verification and preference capture
- Discover & compatibility matching between profiles
- Reusable UI components in `packages/ui`
- Database helpers and queries in `packages/db`
- Supabase config and SQL migrations for local dev

## Repository layout (high level)
- `apps/` — Next.js applications (app, admin, web)
- `packages/` — shared packages (ui, db, config, types, etc.)
- `supabase/` — Supabase config, migrations, seed data
- `implementationRoomie.md` — project implementation notes

For details see the actual folder contents in the repo.

## Tech stack
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Supabase (Postgres + auth) and SQL migrations
- Monorepo toolchain (node package manager of choice: pnpm/yarn/npm)

## Prerequisites
- Node.js 18+ (or later LTS)
- A package manager: `pnpm` recommended, `npm` or `yarn` will work
- Supabase CLI (optional) if you want to run a local Supabase instance

## Quickstart (local development)
1. Install dependencies at the repo root:

```bash
pnpm install
# or
npm install
```

2. Create environment files for each app you plan to run (example: `apps/app/.env.local`, `apps/web/.env.local`, `apps/admin/.env.local`) and add any required variables (Supabase URL/KEY, NEXTAUTH settings, etc.).

3. Run the development servers (from repo root or inside an app folder):

```bash
pnpm dev
# or
npm run dev
```

4. If using Supabase locally, apply migrations and seed data:

```bash
supabase db reset # or use your workflow to apply migrations in supabase/migrations
```

Notes
- This repository is a monorepo with multiple apps; run the specific app's dev server from its folder if needed.

## Build & Production
Build the apps (run from repo root or inside the specific app):

```bash
pnpm build
# or
npm run build
```

Then start the production server for the target app:

```bash
pnpm start
# or
npm start
```

## Testing
- Check each app/package for tests. Run the monorepo test command if available:

```bash
pnpm test
# or
npm run test
```

## Environment & Secrets
- Store secrets in `.env.local` files per Next.js best practices. Do not commit secrets to version control.
- Typical environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXTAUTH_URL`, OAuth client IDs/secrets.

## Database & Migrations
- Supabase configuration and SQL migration files are under `supabase/`.
- Use your preferred workflow or the Supabase CLI to run migrations and seed the database.

## Contributing
- Please open issues or PRs for bugs, feature requests, or documentation fixes.
- Follow the code style already present in the repository and run lint/formatting where applicable.

## Where to look next
- App entry points: `apps/*/app/` (layouts, pages, routes)
- Shared UI: `packages/ui/src`
- Database queries/types: `packages/db/src`
- Supabase migrations: `supabase/migrations`

## Contact
If you want help adapting the README for a specific deployment (Vercel, AWS, Dockerized Supabase, etc.), tell me which platform and I’ll add platform-specific steps.

---
Generated and added to the project root. If you want the file renamed to `READMME.md` exactly, or expanded with CI/deployment steps, say which CI or host to target.
