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
