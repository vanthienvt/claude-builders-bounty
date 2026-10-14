# CLAUDE.md — Next.js 15 (App Router) + SQLite SaaS Architecture Guide

> Drop-in architecture & coding constitution for greenfield and production Next.js 15 + SQLite (`better-sqlite3` / Drizzle) SaaS applications.

## 1. Stack & Exact Versions
- **Runtime:** Node.js `>=22.12.0` (LTS)
- **Framework:** Next.js `15.2.x` (App Router ONLY, React 19 Server Components by default)
- **Database:** SQLite via `better-sqlite3` (local/single-node VPS with `WAL` mode) + Drizzle ORM `^0.39.0`
- **Validation:** `zod` `^3.24.0` at every Server Action & Route Handler boundary
- **Styling:** Tailwind CSS v4 + Radix Primitives

## 2. Opinionated Folder Structure
```text
src/
├── app/
│   ├── (marketing)/          # Public SSR pages
│   ├── (dashboard)/          # Authenticated tenant routes
│   └── api/webhooks/         # Stripe/external webhooks ONLY (no internal REST endpoints)
├── db/
│   ├── index.ts              # Singleton WAL-enabled SQLite connection
│   ├── schema.ts             # Single source of truth Drizzle schema
│   └── migrations/           # Numbered SQL migrations (0001_init.sql)
├── modules/                  # Deep domain modules (billing, auth, projects)
│   └── <domain>/
│       ├── actions.ts        # "use server" mutations validated with Zod
│       ├── queries.ts        # Read-only prepared statements
│       └── components/       # Domain-scoped UI components
└── lib/                      # Pure stateless utilities
```

## 3. SQLite & Migration Conventions (Every Rule Has a Reason)
1. **Mandatory Pragmas on Startup (`src/db/index.ts`):**
   ```sql
   PRAGMA journal_mode = WAL;
   PRAGMA busy_timeout = 5000;
   PRAGMA synchronous = NORMAL;
   PRAGMA foreign_keys = ON;
   ```
   *Why:* Without `WAL` and `busy_timeout`, concurrent Next.js Server Actions will throw `SQLITE_BUSY` under load.
2. **Forward-Only Numbered Migrations:**
   - Never edit an existing migration file in `src/db/migrations/`.
   - Store timestamps as Unix epoch milliseconds (`INTEGER NOT NULL`) or ISO-8601 UTC strings, never locale strings.
   - Store money in integer cents (`amount_cents INTEGER NOT NULL`), NEVER `REAL` or `FLOAT`.

## 4. Component & Data Fetching Patterns
- **Server Components Default:** Every component is a Server Component unless it uses browser DOM APIs or event listeners. Place `"use client"` at the lowest leaf component.
- **No Internal `/api` Fetching:** Server Components call `src/modules/<domain>/queries.ts` directly. Mutations use Server Actions (`actions.ts`).
- **Next.js 15 Async Request APIs:** Always `await params`, `await searchParams`, `await cookies()`, and `await headers()`.

## 5. Development Commands
```bash
npm run dev          # Start Next.js 15 Turbopack dev server
npm run db:generate  # Generate SQL migration from src/db/schema.ts
npm run db:migrate   # Apply pending SQLite migrations
npm run typecheck    # tsc --noEmit
npm test             # Run Vitest against in-memory SQLite (:memory:)
```

## 6. What We DO NOT Do (And Why)
- **NO Prisma on SQLite:** Prisma spawns a heavy Rust query engine binary; `better-sqlite3` + Drizzle executes synchronous prepared statements in-process 10x faster.
- **NO `useEffect` for Data Fetching:** Causes client waterfalls and layout shift; fetch in Server Components.
- **NO `SELECT *` in Queries:** Always project explicit columns so schema additions never leak sensitive fields to serialized RSC payloads.
