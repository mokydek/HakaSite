-- Team management: tighten team privacy and add safe SECURITY DEFINER
-- functions for every team mutation. Run once in the Supabase SQL editor.
--
-- Note: numbered 0003 because 0002_enable_realtime.sql already exists. The
-- prompt referred to this file as 0002; renamed to avoid a collision.

-- ---------------------------------------------------------------------------
-- 1. Tighten the select policies so invite codes and rosters stay private.
--    Browsing open teams goes through get_open_teams below, never a raw select.
-- ---------------------------------------------------------------------------

drop policy if exists teams_select on public.teams;
create policy teams_select on public.teams
  for select using (
    public.is_team_member(id) or owner_id = auth.uid() or public.is_organizer()
  );

drop policy if exists team_members_select on public.team_members;
create policy team_members_select on public.team_members
  for select using (
    public.is_team_member(team_id) or public.is_organizer()
  );

-- ---------------------------------------------------------------------------
-- Helper: a random invite code from an unambiguous alphabet (no 0 O 1 I L).
-- ---------------------------------------------------------------------------

create or replace function public.generate_invite_code(p_length int)
returns text
language plpgsql
volatile
set search_path = public
as $$
declare
  v_alphabet text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  v_result text := '';
  i int;
begin
  for i in 1..p_length loop
    v_result := v_result || substr(v_alphabet, 1 + floor(random() * length(v_alphabet))::int, 1);
  end loop;
  return v_result;
end;
$$;

-- ---------------------------------------------------------------------------
-- 2. Mutations. All SECURITY DEFINER, all doing their own auth.uid() checks,
--    each raising a clear message the client surfaces to the user.
-- ---------------------------------------------------------------------------

create or replace function public.create_team(p_hackathon_id uuid, p_name text)
returns public.teams
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_code text;
  v_team public.teams;
  v_attempts int := 0;
begin
  if v_uid is null then
    raise exception 'You must be signed in';
  end if;

  if p_name is null or length(trim(p_name)) = 0 then
    raise exception 'Enter a team name';
  end if;

  if not exists (
    select 1 from public.registrations
    where hackathon_id = p_hackathon_id and profile_id = v_uid
  ) then
    raise exception 'You must register for the hackathon before creating a team';
  end if;

  if exists (
    select 1 from public.team_members
    where hackathon_id = p_hackathon_id and profile_id = v_uid
  ) then
    raise exception 'You are already in a team for this hackathon';
  end if;

  loop
    v_attempts := v_attempts + 1;
    v_code := public.generate_invite_code(8);
    exit when not exists (select 1 from public.teams where invite_code = v_code);
    if v_attempts > 20 then
      raise exception 'Could not generate an invite code, please try again';
    end if;
  end loop;

  insert into public.teams (hackathon_id, name, invite_code, owner_id, looking_for_members)
  values (p_hackathon_id, trim(p_name), v_code, v_uid, true)
  returning * into v_team;

  insert into public.team_members (team_id, hackathon_id, profile_id, role)
  values (v_team.id, p_hackathon_id, v_uid, 'owner');

  update public.registrations
  set team_id = v_team.id
  where hackathon_id = p_hackathon_id and profile_id = v_uid;

  return v_team;
end;
$$;

create or replace function public.join_team_by_code(p_code text)
returns public.teams
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_team public.teams;
begin
  if v_uid is null then
    raise exception 'You must be signed in';
  end if;

  select * into v_team from public.teams
  where upper(invite_code) = upper(trim(p_code));

  if v_team.id is null then
    raise exception 'No team found for that invite code';
  end if;

  if not exists (
    select 1 from public.registrations
    where hackathon_id = v_team.hackathon_id and profile_id = v_uid
  ) then
    raise exception 'You must register for the hackathon before joining a team';
  end if;

  if exists (
    select 1 from public.team_members
    where hackathon_id = v_team.hackathon_id and profile_id = v_uid
  ) then
    raise exception 'You are already in a team for this hackathon';
  end if;

  insert into public.team_members (team_id, hackathon_id, profile_id, role)
  values (v_team.id, v_team.hackathon_id, v_uid, 'member');

  update public.registrations
  set team_id = v_team.id
  where hackathon_id = v_team.hackathon_id and profile_id = v_uid;

  return v_team;
end;
$$;

create or replace function public.join_team_by_id(p_team_id uuid)
returns public.teams
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_team public.teams;
begin
  if v_uid is null then
    raise exception 'You must be signed in';
  end if;

  select * into v_team from public.teams where id = p_team_id;

  if v_team.id is null then
    raise exception 'Team not found';
  end if;

  if not v_team.looking_for_members then
    raise exception 'This team is not looking for members';
  end if;

  if not exists (
    select 1 from public.registrations
    where hackathon_id = v_team.hackathon_id and profile_id = v_uid
  ) then
    raise exception 'You must register for the hackathon before joining a team';
  end if;

  if exists (
    select 1 from public.team_members
    where hackathon_id = v_team.hackathon_id and profile_id = v_uid
  ) then
    raise exception 'You are already in a team for this hackathon';
  end if;

  insert into public.team_members (team_id, hackathon_id, profile_id, role)
  values (v_team.id, v_team.hackathon_id, v_uid, 'member');

  update public.registrations
  set team_id = v_team.id
  where hackathon_id = v_team.hackathon_id and profile_id = v_uid;

  return v_team;
end;
$$;

create or replace function public.leave_team(p_team_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_hackathon uuid;
  v_owner uuid;
begin
  if v_uid is null then
    raise exception 'You must be signed in';
  end if;

  select hackathon_id, owner_id into v_hackathon, v_owner
  from public.teams where id = p_team_id;

  if v_hackathon is null then
    raise exception 'Team not found';
  end if;

  if v_owner = v_uid then
    raise exception 'You own this team. Delete it instead of leaving';
  end if;

  if not exists (
    select 1 from public.team_members where team_id = p_team_id and profile_id = v_uid
  ) then
    raise exception 'You are not a member of this team';
  end if;

  delete from public.team_members where team_id = p_team_id and profile_id = v_uid;

  update public.registrations
  set team_id = null
  where hackathon_id = v_hackathon and profile_id = v_uid;
end;
$$;

create or replace function public.delete_team(p_team_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_owner uuid;
  v_hackathon uuid;
begin
  if v_uid is null then
    raise exception 'You must be signed in';
  end if;

  select owner_id, hackathon_id into v_owner, v_hackathon
  from public.teams where id = p_team_id;

  if v_owner is null then
    raise exception 'Team not found';
  end if;

  if v_owner <> v_uid then
    raise exception 'Only the team owner can delete the team';
  end if;

  update public.registrations
  set team_id = null
  where hackathon_id = v_hackathon and team_id = p_team_id;

  delete from public.teams where id = p_team_id;
end;
$$;

create or replace function public.remove_member(p_team_id uuid, p_profile_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_owner uuid;
  v_hackathon uuid;
begin
  if v_uid is null then
    raise exception 'You must be signed in';
  end if;

  select owner_id, hackathon_id into v_owner, v_hackathon
  from public.teams where id = p_team_id;

  if v_owner is null then
    raise exception 'Team not found';
  end if;

  if v_owner <> v_uid then
    raise exception 'Only the team owner can remove members';
  end if;

  if p_profile_id = v_owner then
    raise exception 'The owner cannot be removed';
  end if;

  if not exists (
    select 1 from public.team_members where team_id = p_team_id and profile_id = p_profile_id
  ) then
    raise exception 'That person is not a member of this team';
  end if;

  delete from public.team_members where team_id = p_team_id and profile_id = p_profile_id;

  update public.registrations
  set team_id = null
  where hackathon_id = v_hackathon and profile_id = p_profile_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- Browse open teams. Never exposes invite_code. Excludes teams the caller is
-- already in.
-- ---------------------------------------------------------------------------

create or replace function public.get_open_teams(p_hackathon_id uuid)
returns table (id uuid, name text, member_count bigint, looking_for_members boolean)
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'You must be signed in';
  end if;

  return query
    select
      t.id,
      t.name,
      (select count(*) from public.team_members m where m.team_id = t.id) as member_count,
      t.looking_for_members
    from public.teams t
    where t.hackathon_id = p_hackathon_id
      and t.looking_for_members = true
      and not exists (
        select 1 from public.team_members me
        where me.team_id = t.id and me.profile_id = auth.uid()
      )
    order by t.name;
end;
$$;
