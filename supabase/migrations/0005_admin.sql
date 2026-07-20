-- Organizer admin reads that need to cross into auth.users. Run once in the
-- Supabase SQL editor.
--
-- Note: numbered 0005 because 0004_submissions.sql already exists. The prompt
-- referred to this file as 0004; renamed to avoid a collision.
--
-- Both functions are SECURITY DEFINER and first check is_organizer(). This is
-- the only safe way to read participant emails, which live in auth.users.

create or replace function public.get_registrations(p_hackathon_id uuid)
returns table (
  profile_id uuid,
  full_name text,
  country text,
  email text,
  team_name text,
  registered_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_organizer() then
    raise exception 'Only organizers can view registrations';
  end if;

  return query
    select
      r.profile_id,
      p.full_name,
      p.country,
      u.email::text,
      t.name as team_name,
      r.created_at as registered_at
    from public.registrations r
    join public.profiles p on p.id = r.profile_id
    join auth.users u on u.id = r.profile_id
    left join public.teams t on t.id = r.team_id
    where r.hackathon_id = p_hackathon_id
    order by r.created_at asc;
end;
$$;

create or replace function public.get_submissions(p_hackathon_id uuid)
returns table (
  team_name text,
  case_title text,
  repo_url text,
  demo_url text,
  description text,
  files jsonb,
  submitted_by_name text,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_organizer() then
    raise exception 'Only organizers can view submissions';
  end if;

  return query
    select
      t.name as team_name,
      c.title as case_title,
      s.repo_url,
      s.demo_url,
      s.description,
      s.files,
      p.full_name as submitted_by_name,
      s.updated_at
    from public.submissions s
    join public.teams t on t.id = s.team_id
    left join public.cases c on c.id = s.case_id
    left join public.profiles p on p.id = s.submitted_by
    where s.hackathon_id = p_hackathon_id
    order by s.updated_at desc;
end;
$$;
