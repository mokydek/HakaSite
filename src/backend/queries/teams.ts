import { supabase } from '../supabase/client'
import type { Profile, Team, TeamMember } from '../types'

export type TeamMemberProfile = Pick<Profile, 'id' | 'full_name' | 'country'>

export interface TeamMemberWithProfile extends TeamMember {
  profile: TeamMemberProfile | null
}

export interface TeamWithMembers extends Team {
  members: TeamMemberWithProfile[]
}

/**
 * The current user team for a hackathon with its members and their names, or
 * null when the user has no team yet. Uses flat selects so the typed client
 * stays fully typed, then stitches member profiles together in memory.
 */
export async function getMyTeam(hackathonId: string): Promise<TeamWithMembers | null> {
  const { data: sessionData } = await supabase.auth.getSession()
  const userId = sessionData.session?.user?.id
  if (!userId) return null

  const { data: membership, error: membershipError } = await supabase
    .from('team_members')
    .select('team_id')
    .eq('hackathon_id', hackathonId)
    .eq('profile_id', userId)
    .maybeSingle()
  if (membershipError) throw membershipError
  if (!membership) return null

  const { data: team, error: teamError } = await supabase
    .from('teams')
    .select('*')
    .eq('id', membership.team_id)
    .maybeSingle()
  if (teamError) throw teamError
  if (!team) return null

  const { data: memberRows, error: membersError } = await supabase
    .from('team_members')
    .select('*')
    .eq('team_id', team.id)
    .order('joined_at', { ascending: true })
  if (membersError) throw membersError

  const members = memberRows ?? []
  const profileIds = members.map((member) => member.profile_id)

  let profilesById = new Map<string, TeamMemberProfile>()
  if (profileIds.length > 0) {
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, country')
      .in('id', profileIds)
    if (profilesError) throw profilesError
    profilesById = new Map(
      (profiles ?? []).map((profile): [string, TeamMemberProfile] => [profile.id, profile]),
    )
  }

  return {
    ...team,
    members: members.map((member) => ({
      ...member,
      profile: profilesById.get(member.profile_id) ?? null,
    })),
  }
}

export interface OpenTeam {
  id: string
  name: string
  member_count: number
  looking_for_members: boolean
}

/**
 * Thin wrappers over the SECURITY DEFINER team functions. Every mutation goes
 * through an RPC, whose raised message is surfaced to the caller. The only
 * direct write is updateTeam, allowed by the owner update policy.
 */

export async function createTeam(hackathonId: string, name: string): Promise<Team> {
  const { data, error } = await supabase.rpc('create_team', {
    p_hackathon_id: hackathonId,
    p_name: name,
  })
  if (error) throw new Error(error.message)
  return data
}

export async function joinTeamByCode(code: string): Promise<Team> {
  const { data, error } = await supabase.rpc('join_team_by_code', { p_code: code })
  if (error) throw new Error(error.message)
  return data
}

export async function joinTeamById(teamId: string): Promise<Team> {
  const { data, error } = await supabase.rpc('join_team_by_id', { p_team_id: teamId })
  if (error) throw new Error(error.message)
  return data
}

export async function leaveTeam(teamId: string): Promise<void> {
  const { error } = await supabase.rpc('leave_team', { p_team_id: teamId })
  if (error) throw new Error(error.message)
}

export async function deleteTeam(teamId: string): Promise<void> {
  const { error } = await supabase.rpc('delete_team', { p_team_id: teamId })
  if (error) throw new Error(error.message)
}

export async function removeMember(teamId: string, profileId: string): Promise<void> {
  const { error } = await supabase.rpc('remove_member', {
    p_team_id: teamId,
    p_profile_id: profileId,
  })
  if (error) throw new Error(error.message)
}

export async function getOpenTeams(hackathonId: string): Promise<OpenTeam[]> {
  const { data, error } = await supabase.rpc('get_open_teams', { p_hackathon_id: hackathonId })
  if (error) throw new Error(error.message)
  return data ?? []
}

/** Owner only rename and looking_for_members toggle via a normal update. */
export async function updateTeam(
  teamId: string,
  fields: { name?: string; looking_for_members?: boolean },
): Promise<Team> {
  const { data, error } = await supabase
    .from('teams')
    .update(fields)
    .eq('id', teamId)
    .select('*')
    .single()
  if (error) throw new Error(error.message)
  return data
}
