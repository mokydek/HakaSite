# Hackathon platform

A global hackathon platform built with React, TypeScript, and Supabase, deployed to Vercel.

## Folder mapping

The source is organized by responsibility. `src/landing` holds the public landing pages shown to visitors. `src/frontend` holds the authenticated application: `pages` for routed screens, `components` for shared interface pieces, and `hooks` for React hooks. `src/backend` holds the data layer: `supabase` for the client, `queries` for data access, and `auth` for authentication helpers. `src/ui` holds shared design system primitives and `src/styles` holds global styles. SQL migrations live in `supabase/migrations` at the repository root.

## Scripts

- `npm run dev` starts the development server.
- `npm run build` type checks and builds for production.
- `npm run preview` serves the production build locally.
- `npm run typecheck` runs the TypeScript compiler with no emit.

## Supabase setup

The data layer lives in Supabase. To connect a project:

1. Create a project at supabase.com and wait for it to finish provisioning.
2. In the dashboard open Project Settings. Copy the Project URL from the Data API page and the anon public key from the API Keys page.
3. Copy `.env.example` to `.env` and paste those two values into `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
4. Open the SQL editor, paste the contents of `supabase/migrations/0001_init.sql`, and run it. This creates every table, enables row level security, installs the policies and triggers, and seeds one published hackathon.
5. Sign up once inside the running app so a profile row is created for you. To gain organizer access, find your user id under Authentication, Users, then run the commented promotion statement at the bottom of the migration with your id.

The anon public key is safe to ship in the browser because row level security governs every table. The `service_role` key bypasses row level security and must never appear in the frontend, in `.env` files that reach the client, or in the repository. Keep it on the server only.

## Participation model

Participation is open to teams and to individuals. To keep the schema simple, a submission is always owned by a team, and a solo participant competes as a team of one. This means there is a single ownership path for submissions and team membership rather than two parallel code paths, and a solo entrant can later invite members without changing how anything is stored. The schema supports many hackathons through the `hackathons` table even though only one is seeded today.
