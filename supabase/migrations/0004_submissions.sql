-- Submissions: one submission per team. Run once in the Supabase SQL editor.
--
-- Note: numbered 0004 because 0003_team_functions.sql already exists. The
-- prompt referred to this file as 0003; renamed to avoid a collision.
--
-- The Phase 3 (0001_init.sql) RLS policies on submissions are the real deadline
-- gate: team members can insert and update their own submission only while
-- now() is before the hackathon submission_deadline. Those policies are left
-- unchanged. This migration only adds the one submission per team constraint,
-- which also backs the upsert onConflict target (hackathon_id, team_id).

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'submissions_hackathon_team_unique'
  ) then
    alter table public.submissions
      add constraint submissions_hackathon_team_unique unique (hackathon_id, team_id);
  end if;
end
$$;
