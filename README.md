# Hackathon platform

A global hackathon platform built with React, TypeScript, and Supabase, deployed to Vercel. Participants register, form a team, wait for the case reveal, then build and submit a working product. Organizers run the event from an admin panel.

This guide takes you from nothing to a running copy, one step at a time. No prior Supabase experience is assumed.

## Prerequisites

- A recent Node.js, version 20.19 or newer, and npm. Check with `node --version`.
- A free Supabase account from supabase.com.
- A code editor and a terminal.
- Git, if you plan to clone the repository.

## 1. Get the code and install

1. Clone or download this repository.
2. Open a terminal in the project folder.
3. Run `npm install` to install the dependencies.

## 2. Create a Supabase project

1. Sign in at supabase.com and create a new project.
2. Pick a name, a strong database password, and a region close to your users.
3. Wait for the project to finish provisioning. This takes a couple of minutes.

## 3. Set the two environment variables

The app reads two values from a local `.env` file.

1. In the Supabase dashboard open Project Settings.
2. On the Data API page copy the Project URL.
3. On the API Keys page copy the anon public key.
4. In the project folder copy `.env.example` to a new file named `.env`.
5. Paste the two values:
   - `VITE_SUPABASE_URL` is the Project URL.
   - `VITE_SUPABASE_ANON_KEY` is the anon public key.

The anon public key is meant for the browser. Row level security governs every table, so the key alone grants no unauthorized access. The service role key is different. It bypasses row level security and must never appear in the frontend, in a committed `.env`, or anywhere in the repository. Keep it on the server only. The `.env` file is already ignored by git, and only `.env.example` is committed.

## 4. Run the migrations in order

Open the SQL editor in the Supabase dashboard. For each file below, paste its full contents and run it, in this exact order. Each migration is safe to run once.

1. `supabase/migrations/0001_init.sql` creates every table, enables row level security, installs the policies and triggers, adds the helper functions, and seeds one published hackathon with sample cases, schedule items, and an announcement.
2. `supabase/migrations/0002_enable_realtime.sql` turns on realtime for the cases and announcements tables so the dashboard updates live during the event.
3. `supabase/migrations/0003_team_functions.sql` adds the team functions and tightens team privacy so invite codes and rosters stay private.
4. `supabase/migrations/0004_submissions.sql` adds the one submission per team rule that backs saving a submission.
5. `supabase/migrations/0005_admin.sql` adds the organizer only functions that read registrations and submissions for the admin panel.

Run all five even if you only want to try part of the app. Teams, submissions, the timed case reveal, and the admin panel each depend on a later migration.

## 5. Confirm realtime is on

Migration 0002 already enables realtime. To verify, open Database, then Replication, and confirm the cases and announcements tables are part of the realtime publication. Without this, the case reveal and announcements will still work but will not update until the visitor reloads.

## 6. Choose an email confirmation mode

By default Supabase asks new users to confirm their email before they can sign in.

- For quick local testing, open Authentication, then Providers, then Email, and turn Confirm email off. New accounts can sign in immediately.
- For a real event, leave Confirm email on so addresses are verified. The sign up screen already handles both modes and tells the user to check their inbox when confirmation is required.

## 7. Promote yourself to organizer

The admin panel is visible only to organizers.

1. Start the app and sign up once so a profile row is created for you.
2. In the dashboard open Authentication, then Users, and copy your user id.
3. Open the SQL editor and run the promotion statement from the bottom of `0001_init.sql`, replacing the placeholder with your user id. It sets your profile role to organizer.
4. Reload the app. The admin route is now available.

## 8. Run the app

- `npm run dev` starts the development server and prints a local address to open.
- `npm run build` type checks and builds for production.
- `npm run preview` serves the production build locally.
- `npm run typecheck` runs the TypeScript compiler with no emit.
- `npm run lint` runs the linter.

## Deploy to Vercel

Import the repository into Vercel, keep the default Vite settings, and set the same two environment variables, `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. After the first deploy, add the deployment URL to the Supabase Auth allowed redirect URLs so sign in works in production.

## Project structure

- `src/landing` is the public landing page and its section components.
- `src/frontend/pages` holds the routed screens.
- `src/frontend/components` holds shared interface pieces, including the admin panel tabs.
- `src/frontend/hooks` holds React hooks, such as the realtime refetch hook and the document title hook.
- `src/frontend/lib` and `src/frontend/data` hold small helpers and static data.
- `src/backend/supabase` holds the typed Supabase client.
- `src/backend/queries` is the single place the app reads and writes data. Every database call goes through here.
- `src/backend/auth` holds the authentication provider and the route guards.
- `src/backend/realtime.ts` is the one place realtime channels are wired.
- `src/ui` holds the design system primitives, such as Button, Input, and Countdown.
- `src/styles` holds global styles and the accent variable.
- `supabase/migrations` holds the SQL migrations at the repository root.

## Design system

The interface follows a strict, minimal system.

- Light theme only, on a pure white background. There is no dark mode.
- Monochrome by default with a single accent, a calm blue, used only on primary actions. The accent is defined once in `src/styles/index.css` and mapped through `tailwind.config.ts`, so you can rebrand the whole app by changing one value.
- No gradients and no heavy shadows.
- Sharp corners. The largest corner radius is two pixels.
- Typography uses Space Grotesk for headings, Manrope for body text, and JetBrains Mono for times and codes.
- Icons come from lucide-react only. There are no emojis.
- Interface copy avoids hyphens and dashes.
- Every interactive element shows a sharp accent focus ring for keyboard users.

## Participation model

Participation is open to teams and to individuals. To keep the schema simple, a submission is always owned by a team, and a solo participant competes as a team of one. This gives a single ownership path for submissions and team membership rather than two parallel code paths, and a solo entrant can later invite members without changing how anything is stored. The schema supports many hackathons through the `hackathons` table even though only one is seeded today.
