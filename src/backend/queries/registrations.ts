import { supabase } from '../supabase/client'
import type { Registration } from '../types'

async function currentUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getSession()
  return data.session?.user?.id ?? null
}

/** The current user registration for a hackathon, or null. */
export async function getMyRegistration(hackathonId: string): Promise<Registration | null> {
  const userId = await currentUserId()
  if (!userId) return null
  const { data, error } = await supabase
    .from('registrations')
    .select('*')
    .eq('hackathon_id', hackathonId)
    .eq('profile_id', userId)
    .maybeSingle()
  if (error) throw error
  return data
}

/** Registers the current user for a hackathon and returns the new row. */
export async function registerForHackathon(hackathonId: string): Promise<Registration> {
  const userId = await currentUserId()
  if (!userId) throw new Error('You must be signed in to register')
  const { data, error } = await supabase
    .from('registrations')
    .insert({ hackathon_id: hackathonId, profile_id: userId })
    .select('*')
    .single()
  if (error) throw error
  return data
}

/** Removes the current user registration for a hackathon. */
export async function unregister(hackathonId: string): Promise<void> {
  const userId = await currentUserId()
  if (!userId) throw new Error('You must be signed in')
  const { error } = await supabase
    .from('registrations')
    .delete()
    .eq('hackathon_id', hackathonId)
    .eq('profile_id', userId)
  if (error) throw error
}
