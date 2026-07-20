import { supabase } from '../supabase/client'
import type { Json, Submission } from '../types'

/** The team submission for a hackathon, or null when none exists yet. */
export async function getMyTeamSubmission(
  hackathonId: string,
  teamId: string,
): Promise<Submission | null> {
  const { data, error } = await supabase
    .from('submissions')
    .select('*')
    .eq('hackathon_id', hackathonId)
    .eq('team_id', teamId)
    .maybeSingle()
  if (error) throw error
  return data
}

export interface SubmissionInput {
  hackathon_id: string
  team_id: string
  case_id: string | null
  repo_url: string | null
  demo_url: string | null
  description: string | null
  files: Json
}

/**
 * Inserts or updates the team submission, keyed on (hackathon_id, team_id).
 * submitted_by is stamped with the current user. Row level security is the
 * real gate: a write after the submission_deadline is rejected with code 42501,
 * which is surfaced as a clear deadline message.
 */
export async function upsertSubmission(payload: SubmissionInput): Promise<Submission> {
  const { data: sessionData } = await supabase.auth.getSession()
  const userId = sessionData.session?.user?.id
  if (!userId) throw new Error('You must be signed in to submit')

  const { data, error } = await supabase
    .from('submissions')
    .upsert({ ...payload, submitted_by: userId }, { onConflict: 'hackathon_id,team_id' })
    .select('*')
    .single()

  if (error) {
    if (error.code === '42501') {
      throw new Error('The submission deadline has passed, this submission can no longer be changed')
    }
    throw new Error(error.message)
  }
  return data
}
