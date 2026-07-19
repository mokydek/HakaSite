# Hackathon platform

A global hackathon platform built with React, TypeScript, and Supabase, deployed to Vercel.

## Folder mapping

The source is organized by responsibility. `src/landing` holds the public landing pages shown to visitors. `src/frontend` holds the authenticated application: `pages` for routed screens, `components` for shared interface pieces, and `hooks` for React hooks. `src/backend` holds the data layer: `supabase` for the client, `queries` for data access, and `auth` for authentication helpers. `src/ui` holds shared design system primitives and `src/styles` holds global styles. SQL migrations live in `supabase/migrations` at the repository root.

## Scripts

- `npm run dev` starts the development server.
- `npm run build` type checks and builds for production.
- `npm run preview` serves the production build locally.
- `npm run typecheck` runs the TypeScript compiler with no emit.
