# Roomie

> Roomie is a modern monorepo for a roommate discovery and management platform built for the Nigerian market. It includes a Next.js consumer app, an admin dashboard, a marketing website, a NestJS API, shared UI components, and database utilities — designed for discoverability, trust, and matching roommates based on compatibility.

---

## 🚦 Current State of the Project

| Area | Status | Notes |
|---|---|---|
| **Consumer App** (`apps/app`) | 🟢 Active Development | Core features live — feed, discover, chat, connections, splits, housing, profile, notifications, settings, privacy/terms. Identity verification (KYC) flow in progress. |
| **Admin Dashboard** (`apps/admin`) | 🟢 Active Development | Login, registration, dashboard, pending reviews, super-admin panel. |
| **Marketing Website** (`apps/web`) | 🟡 Under Construction | Displays an "Under Construction" landing page with an email notification form. 
| **API** (`apps/api`) | 🟢 Active Development | NestJS backend with Prisma ORM. Handles server-side business logic. |
| **Shared Packages** | 🟢 Stable | `packages/ui` (component library), `packages/db` (Supabase queries & types), `packages/config`, `packages/animations`, `packages/eslint-config`, `packages/typescript-config`. |
| **Database** | 🟢 40 Migrations Applied | Supabase (Postgres + Auth).


## Repository Layout
```
apps/
  app/       → Next.js consumer app (App Router)
  admin/     → Next.js admin dashboard
  web/       → Next.js marketing website (currently under construction)
  api/       → NestJS API server (Prisma ORM)
packages/
  ui/        → Shared React component library
  db/        → Supabase queries, types, and helpers
  config/    → Shared configuration
  animations/→ Shared animation assets
  eslint-config/       → Shared ESLint configuration
  typescript-config/   → Shared TypeScript configuration
supabase/
  migrations/  → 40 SQL migration files (0001–0040)
```

## Tech Stack
- **Frontend:** Next.js 16 (App Router), TypeScript, Tailwind CSS, Framer Motion
- **Backend API:** NestJS, Prisma ORM
- **Database & Auth:** Supabase (Postgres + Auth)
- **Monorepo Tooling:** Turborepo
- **Identity Verification:** Dojah (NIN + Face Liveness)

## Prerequisites
- Node.js 18+ (or later LTS)
- A package manager: `npm` (used in lockfile), `pnpm` or `yarn` also work
- Supabase CLI (optional) for running a local Supabase instance

## Quickstart (Local Development)

1. **Install dependencies** at the repo root:
   ```bash
   npm install
   ```

2. **Create environment files** for each app (`apps/app/.env.local`, `apps/web/.env.local`, `apps/admin/.env.local`, `apps/api/.env`) and add required variables (Supabase URL/KEY, Dojah credentials, etc.). See `.env.example` for reference.

3. **Run development servers** (from repo root):
   ```bash
   # All apps
   npm run dev

   # Individual apps
   npm run dev:web    # Marketing website only
   npm run dev:app    # Consumer app only
   npm run dev:admin  # Admin dashboard only
   ```

4. **Apply database migrations** (if using Supabase locally):
   ```bash
   supabase db reset
   ```

## Build & Production

```bash
npm run build   # Build all apps
npm start       # Start production server
```

## Environment & Secrets
- Store secrets in `.env.local` files per Next.js best practices. Do not commit secrets to version control.
- Typical variables: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXTAUTH_URL`, `DOJAH_APP_ID`, `DOJAH_SECRET_KEY`, OAuth client IDs/secrets.

## Database & Migrations
- Supabase configuration and 40 SQL migration files live under `supabase/migrations/`.
- Use the Supabase CLI or your preferred workflow to run migrations and seed the database.

## Contributing
- Please open issues or PRs for bugs, feature requests, or documentation fixes.
- Follow the code style already present in the repository and run lint/formatting where applicable.

## Where to Look Next
- App entry points: `apps/*/app/` (layouts, pages, routes)
- Shared UI: `packages/ui/src`
- Database queries/types: `packages/db/src`
- API modules: `apps/api/src`
- Supabase migrations: `supabase/migrations`

---

*Last updated: October 2026*
