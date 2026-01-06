# AI-Powered Job Prep

AI-assisted interview prep platform with job info workspaces, question
generation + feedback, resume analysis, and mock interview coaching.

## Features
- Clerk authentication with onboarding flow and protected workspace routes
- Job info workspaces with interviews, questions, and resume analysis
- AI-powered question generation and feedback (Google Gemini via AI SDK)
- Resume analysis with structured scoring and feedback
- Hume empathic voice interview feedback
- Arcjet protection and bot detection in middleware

## Tech stack
- Next.js App Router (Next 15 canary) + React 19
- TypeScript
- Tailwind CSS v4 + shadcn/ui components
- Clerk for auth, Arcjet for protection
- Drizzle ORM + Postgres
- AI SDK (Google Gemini) + Hume API

## Requirements
- Node.js 18.17+ (or 20+) and npm
- Postgres database (local or hosted)
- API keys for Clerk, Arcjet, Hume, and Google Gemini

## Quick start
1) Install dependencies:
   ```bash
   npm install
   ```
2) Configure environment variables (see below).
3) Start a local database (optional):
   ```bash
   docker compose up -d
   ```
4) Push schema or run migrations:
   ```bash
   npm run db:push
   # or
   npm run db:migrate
   ```
5) Start the dev server:
   ```bash
   npm run dev
   ```
6) Open http://localhost:3000

## Environment variables
Create a `.env` or `.env.local` file. This project validates env via
`src/data/env/server.ts` and `src/data/env/client.ts`.

```bash
# Clerk (client)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/app
NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL=/onboarding
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key

# Clerk (server)
CLERK_SECRET_KEY=sk_test_your_key
# Optional: only required if enabling Clerk webhooks
CLERK_WEBHOOK_SECRET=whsec_your_secret

# Hume
NEXT_PUBLIC_HUME_CONFIG_ID=your_hume_config_id
HUME_API_KEY=your_hume_api_key
HUME_SECRET_KEY=your_hume_secret_key

# AI (Google Gemini)
GEMINI_API_KEY=your_gemini_api_key

# Arcjet
ARCJET_KEY=ajkey_your_arcjet_key

# Database (used to build DATABASE_URL)
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=ai_job_prep
```

Notes:
- `DATABASE_URL` is built from `DB_*` in `src/data/env/server.ts`.
- `NEXT_PUBLIC_*` variables are exposed to the client.

## Database and migrations
- Schema definitions live in `src/drizzle/schema`.
- Migrations output to `src/drizzle/migrations`.
- Common commands:
  - `npm run db:generate` - generate migrations from schema changes.
  - `npm run db:migrate` - apply migrations to the DB.
  - `npm run db:push` - push schema directly (good for local dev).
  - `npm run db:studio` - open Drizzle Studio.

## Scripts
- `npm run dev` - Next.js dev server with Turbopack
- `npm run build` - production build
- `npm run start` - run production server
- `npm run lint` - lint
- `npm run db:generate` - generate Drizzle migrations
- `npm run db:migrate` - apply migrations
- `npm run db:push` - push schema to DB
- `npm run db:studio` - open Drizzle Studio

## Project structure
```
src/
  app/                 App Router routes and layouts
    app/               Authenticated workspace routes
    api/               API routes (AI + webhooks)
    onboarding/        New user onboarding flow
    sign-in/           Clerk sign-in routes
  components/          Shared UI components (shadcn/ui in components/ui)
  data/env/            Typed env validation (server + client)
  drizzle/             DB schema + migrations
  features/            Domain logic (jobInfos, interviews, questions, users)
  lib/                 Shared utilities (cache tags, helpers)
  services/            External integrations (ai, clerk, hume)
public/                Static assets
```

## Routes
- `/` - marketing landing page
- `/sign-in` - Clerk sign-in
- `/onboarding` - new user onboarding
- `/app` - main workspace
- `/app/job-infos/*` - job info, questions, resumes, interviews

## API endpoints
- `POST /api/ai/questions/generate-question` - generate a question
- `POST /api/ai/questions/generate-feedback` - evaluate an answer
- `POST /api/ai/resumes/analyze` - resume analysis (PDF/DOC/DOCX/TXT, max 10MB)
- `POST /api/webhooks/clerk` - Clerk webhook handler

## Auth and middleware
- Clerk protects routes by default; public routes are defined in
  `src/middleware.ts`.
- Arcjet runs in middleware for bot detection and request shielding.

## Webhooks
The Clerk webhook route currently short-circuits with a 204 response in
`src/app/api/webhooks/clerk/route.ts`. Remove the early return if you want to
process webhook events and sync users via Clerk webhooks.

## Deployment
1) Set production env variables (same keys as above).
2) Build and run:
   ```bash
   npm run build
   npm run start
   ```
