-- HakaSite data layer, initial migration.
-- Schema, row level security, triggers, and seed for a global hackathon
-- platform. Runnable top to bottom in the Supabase SQL editor. Written to be
-- idempotent where reasonable (create if not exists, create or replace,
-- drop policy if exists, on conflict do nothing on the seed).
--
-- Participation model: submissions are always owned by a team. A solo
-- participant competes as a team of one. See the README for the rationale.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Tables, in dependency order.
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  country text,
  bio text,
  role text not null default 'participant'
    check (role in ('participant', 'organizer', 'judge')),
  created_at timestamptz not null default now()
);

create table if not exists public.hackathons (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text,
  long_description text,
  cover_url text,
  rules text,
  prizes text,
  status text not null default 'draft'
    check (status in ('draft', 'published', 'live', 'ended')),
  registration_deadline timestamptz,
  cases_reveal_at timestamptz,
  submission_deadline timestamptz,
  start_at timestamptz,
  end_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  hackathon_id uuid not null references public.hackathons (id) on delete cascade,
  name text not null,
  invite_code text unique not null,
  owner_id uuid not null references public.profiles (id) on delete cascade,
  looking_for_members boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams (id) on delete cascade,
  hackathon_id uuid not null references public.hackathons (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'member')),
  joined_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (team_id, profile_id),
  unique (hackathon_id, profile_id)
);

create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  hackathon_id uuid not null references public.hackathons (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  team_id uuid references public.teams (id) on delete set null,
  created_at timestamptz not null default now(),
  unique (hackathon_id, profile_id)
);

create table if not exists public.cases (
  id uuid primary key default gen_random_uuid(),
  hackathon_id uuid not null references public.hackathons (id) on delete cascade,
  title text not null,
  summary text,
  full_description text,
  attachments jsonb not null default '[]'::jsonb,
  order_index int not null default 0,
  reveal_at timestamptz,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  hackathon_id uuid not null references public.hackathons (id) on delete cascade,
  case_id uuid references public.cases (id) on delete set null,
  team_id uuid not null references public.teams (id) on delete cascade,
  repo_url text,
  demo_url text,
  description text,
  files jsonb not null default '[]'::jsonb,
  submitted_by uuid not null references public.profiles (id) on delete cascade,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  hackathon_id uuid not null references public.hackathons (id) on delete cascade,
  title text not null,
  body text,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.schedule_items (
  id uuid primary key default gen_random_uuid(),
  hackathon_id uuid not null references public.hackathons (id) on delete cascade,
  title text not null,
  description text,
  starts_at timestamptz,
  ends_at timestamptz,
  order_index int not null default 0,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- New user trigger. Creates a profiles row for every new auth user.
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Helper functions. Security definer so they read the underlying tables
-- without triggering the policies defined below, which avoids RLS recursion.
-- ---------------------------------------------------------------------------

create or replace function public.is_organizer()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'organizer'
  );
$$;

create or replace function public.is_registered(h uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.registrations
    where hackathon_id = h and profile_id = auth.uid()
  );
$$;

create or replace function public.is_team_member(t uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.team_members
    where team_id = t and profile_id = auth.uid()
  );
$$;

-- ---------------------------------------------------------------------------
-- Role escalation guard. Blocks a non organizer from changing any role.
-- When auth.uid() is null (the service role in the SQL editor) the change is
-- allowed, so the manual promotion at the end of this file still works.
-- ---------------------------------------------------------------------------

create or replace function public.prevent_role_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role
    and auth.uid() is not null
    and not public.is_organizer() then
    raise exception 'Only organizers can change a profile role';
  end if;
  return new;
end;
$$;

drop trigger if exists guard_profile_role on public.profiles;
create trigger guard_profile_role
  before update on public.profiles
  for each row execute function public.prevent_role_change();

-- ---------------------------------------------------------------------------
-- Keep submissions.updated_at fresh on every update.
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_submissions_updated_at on public.submissions;
create trigger set_submissions_updated_at
  before update on public.submissions
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row level security. Enable on every table, then define policies.
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.hackathons enable row level security;
alter table public.teams enable row level security;
alter table public.team_members enable row level security;
alter table public.registrations enable row level security;
alter table public.cases enable row level security;
alter table public.submissions enable row level security;
alter table public.announcements enable row level security;
alter table public.schedule_items enable row level security;

-- profiles -------------------------------------------------------------------
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select using (auth.uid() is not null);

drop policy if exists profiles_insert on public.profiles;
create policy profiles_insert on public.profiles
  for insert with check (id = auth.uid());

drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles
  for update
  using (id = auth.uid() or public.is_organizer())
  with check (id = auth.uid() or public.is_organizer());

-- hackathons -----------------------------------------------------------------
drop policy if exists hackathons_select on public.hackathons;
create policy hackathons_select on public.hackathons
  for select using (status = 'published' or public.is_organizer());

drop policy if exists hackathons_insert on public.hackathons;
create policy hackathons_insert on public.hackathons
  for insert with check (public.is_organizer());

drop policy if exists hackathons_update on public.hackathons;
create policy hackathons_update on public.hackathons
  for update using (public.is_organizer()) with check (public.is_organizer());

drop policy if exists hackathons_delete on public.hackathons;
create policy hackathons_delete on public.hackathons
  for delete using (public.is_organizer());

-- registrations --------------------------------------------------------------
drop policy if exists registrations_select on public.registrations;
create policy registrations_select on public.registrations
  for select using (profile_id = auth.uid() or public.is_organizer());

drop policy if exists registrations_insert on public.registrations;
create policy registrations_insert on public.registrations
  for insert with check (profile_id = auth.uid());

drop policy if exists registrations_update on public.registrations;
create policy registrations_update on public.registrations
  for update using (profile_id = auth.uid() or public.is_organizer());

drop policy if exists registrations_delete on public.registrations;
create policy registrations_delete on public.registrations
  for delete using (profile_id = auth.uid() or public.is_organizer());

-- teams ----------------------------------------------------------------------
drop policy if exists teams_select on public.teams;
create policy teams_select on public.teams
  for select using (public.is_registered(hackathon_id) or public.is_organizer());

drop policy if exists teams_insert on public.teams;
create policy teams_insert on public.teams
  for insert with check (owner_id = auth.uid() and public.is_registered(hackathon_id));

drop policy if exists teams_update on public.teams;
create policy teams_update on public.teams
  for update using (owner_id = auth.uid() or public.is_organizer());

drop policy if exists teams_delete on public.teams;
create policy teams_delete on public.teams
  for delete using (owner_id = auth.uid() or public.is_organizer());

-- team_members ---------------------------------------------------------------
drop policy if exists team_members_select on public.team_members;
create policy team_members_select on public.team_members
  for select using (public.is_registered(hackathon_id) or public.is_organizer());

drop policy if exists team_members_insert on public.team_members;
create policy team_members_insert on public.team_members
  for insert with check (profile_id = auth.uid() and public.is_registered(hackathon_id));

drop policy if exists team_members_delete on public.team_members;
create policy team_members_delete on public.team_members
  for delete using (
    profile_id = auth.uid()
    or public.is_organizer()
    or exists (
      select 1 from public.teams t
      where t.id = team_id and t.owner_id = auth.uid()
    )
  );

-- cases. THE KEY POLICY. A case is visible to a registered participant only
-- when it is published and its reveal_at has passed. When reveal_at is null
-- the comparison is null, so the row stays hidden, the safe default.
-- Organizers always see every case.
drop policy if exists cases_select on public.cases;
create policy cases_select on public.cases
  for select using (
    (is_published and reveal_at <= now() and public.is_registered(hackathon_id))
    or public.is_organizer()
  );

drop policy if exists cases_insert on public.cases;
create policy cases_insert on public.cases
  for insert with check (public.is_organizer());

drop policy if exists cases_update on public.cases;
create policy cases_update on public.cases
  for update using (public.is_organizer()) with check (public.is_organizer());

drop policy if exists cases_delete on public.cases;
create policy cases_delete on public.cases
  for delete using (public.is_organizer());

-- submissions ----------------------------------------------------------------
drop policy if exists submissions_select on public.submissions;
create policy submissions_select on public.submissions
  for select using (public.is_team_member(team_id) or public.is_organizer());

drop policy if exists submissions_insert on public.submissions;
create policy submissions_insert on public.submissions
  for insert with check (
    public.is_team_member(team_id)
    and submitted_by = auth.uid()
    and coalesce(
      now() < (select h.submission_deadline from public.hackathons h where h.id = hackathon_id),
      true
    )
  );

drop policy if exists submissions_update on public.submissions;
create policy submissions_update on public.submissions
  for update
  using (public.is_team_member(team_id))
  with check (
    public.is_team_member(team_id)
    and coalesce(
      now() < (select h.submission_deadline from public.hackathons h where h.id = hackathon_id),
      true
    )
  );

drop policy if exists submissions_delete on public.submissions;
create policy submissions_delete on public.submissions
  for delete using (public.is_team_member(team_id) or public.is_organizer());

-- announcements --------------------------------------------------------------
drop policy if exists announcements_select on public.announcements;
create policy announcements_select on public.announcements
  for select using (
    (is_published and public.is_registered(hackathon_id)) or public.is_organizer()
  );

drop policy if exists announcements_insert on public.announcements;
create policy announcements_insert on public.announcements
  for insert with check (public.is_organizer());

drop policy if exists announcements_update on public.announcements;
create policy announcements_update on public.announcements
  for update using (public.is_organizer()) with check (public.is_organizer());

drop policy if exists announcements_delete on public.announcements;
create policy announcements_delete on public.announcements
  for delete using (public.is_organizer());

-- schedule_items -------------------------------------------------------------
drop policy if exists schedule_items_select on public.schedule_items;
create policy schedule_items_select on public.schedule_items
  for select using (public.is_registered(hackathon_id) or public.is_organizer());

drop policy if exists schedule_items_insert on public.schedule_items;
create policy schedule_items_insert on public.schedule_items
  for insert with check (public.is_organizer());

drop policy if exists schedule_items_update on public.schedule_items;
create policy schedule_items_update on public.schedule_items
  for update using (public.is_organizer()) with check (public.is_organizer());

drop policy if exists schedule_items_delete on public.schedule_items;
create policy schedule_items_delete on public.schedule_items
  for delete using (public.is_organizer());

-- ---------------------------------------------------------------------------
-- Indexes on foreign keys and common lookups. Postgres does not create these
-- automatically for foreign keys, and the policies above filter on them.
-- ---------------------------------------------------------------------------

create index if not exists idx_teams_hackathon on public.teams (hackathon_id);
create index if not exists idx_teams_owner on public.teams (owner_id);
create index if not exists idx_team_members_team on public.team_members (team_id);
create index if not exists idx_team_members_profile on public.team_members (profile_id);
create index if not exists idx_team_members_hackathon on public.team_members (hackathon_id);
create index if not exists idx_registrations_hackathon on public.registrations (hackathon_id);
create index if not exists idx_registrations_profile on public.registrations (profile_id);
create index if not exists idx_cases_hackathon on public.cases (hackathon_id);
create index if not exists idx_submissions_hackathon on public.submissions (hackathon_id);
create index if not exists idx_submissions_team on public.submissions (team_id);
create index if not exists idx_submissions_case on public.submissions (case_id);
create index if not exists idx_announcements_hackathon on public.announcements (hackathon_id);
create index if not exists idx_schedule_items_hackathon on public.schedule_items (hackathon_id);

-- ---------------------------------------------------------------------------
-- Seed data. A single published hackathon with a fixed id so child rows can
-- reference it, two cases that reveal in two days, three schedule items, and
-- one announcement. All placeholder copy, no emojis and no dashes.
-- ---------------------------------------------------------------------------

insert into public.hackathons (
  id, slug, title, description, long_description, rules, prizes, status,
  registration_deadline, cases_reveal_at, submission_deadline, start_at, end_at
) values (
  '00000000-0000-0000-0000-000000000001',
  'main',
  'Global Build Weekend',
  'A worldwide online hackathon where teams ship a working product in one weekend.',
  'Placeholder long description. Teams form, register, wait for the case reveal, then build and submit a working product before the deadline. Full details will be published by the organizers.',
  'Placeholder rules. One account per person. Submissions must be original work created during the event. Be respectful and build in good faith.',
  'Placeholder prizes. First place ten thousand dollars. Second place five thousand dollars. Third place two thousand dollars.',
  'published',
  now() + interval '2 days',
  now() + interval '2 days',
  now() + interval '3 days',
  now(),
  now() + interval '3 days'
)
on conflict (id) do nothing;

insert into public.cases (
  id, hackathon_id, title, summary, full_description, order_index, reveal_at, is_published
) values
  (
    '00000000-0000-0000-0000-0000000000c1',
    '00000000-0000-0000-0000-000000000001',
    'Case one placeholder title',
    'Short summary for the first case.',
    'Placeholder full description for the first case. The real prompt appears when the cases are revealed.',
    1,
    now() + interval '2 days',
    true
  ),
  (
    '00000000-0000-0000-0000-0000000000c2',
    '00000000-0000-0000-0000-000000000001',
    'Case two placeholder title',
    'Short summary for the second case.',
    'Placeholder full description for the second case. The real prompt appears when the cases are revealed.',
    2,
    now() + interval '2 days',
    true
  )
on conflict (id) do nothing;

insert into public.schedule_items (
  id, hackathon_id, title, description, starts_at, ends_at, order_index
) values
  (
    '00000000-0000-0000-0000-0000000000d1',
    '00000000-0000-0000-0000-000000000001',
    'Opening ceremony',
    'Kickoff and welcome from the organizers.',
    now(),
    now() + interval '1 hour',
    1
  ),
  (
    '00000000-0000-0000-0000-0000000000d2',
    '00000000-0000-0000-0000-000000000001',
    'Case reveal',
    'The challenge prompts become available to registered teams.',
    now() + interval '2 days',
    now() + interval '2 days' + interval '1 hour',
    2
  ),
  (
    '00000000-0000-0000-0000-0000000000d3',
    '00000000-0000-0000-0000-000000000001',
    'Submissions close',
    'Final deadline to submit your project.',
    now() + interval '3 days',
    now() + interval '3 days',
    3
  )
on conflict (id) do nothing;

insert into public.announcements (
  id, hackathon_id, title, body, is_published
) values (
  '00000000-0000-0000-0000-0000000000a1',
  '00000000-0000-0000-0000-000000000001',
  'Welcome to the hackathon',
  'Registration is open. Form a team or join as a solo participant, then get ready for the case reveal.',
  true
)
on conflict (id) do nothing;

-- After you sign up in the running app, find your user id in the Supabase
-- dashboard (Authentication, Users) and promote yourself to organizer by
-- running the line below with your id. auth.uid() is null in the SQL editor,
-- so the role guard allows this change.
-- update public.profiles set role = 'organizer' where id = 'YOUR_USER_ID';
