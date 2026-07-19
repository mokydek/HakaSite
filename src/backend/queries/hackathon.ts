import { supabase } from '../supabase/client'
import type { Hackathon } from '../types'

/**
 * Returns the current published hackathon, the seeded one with slug 'main', or
 * null when none is published. Row level security also hides unpublished
 * hackathons from non organizers.
 */
export async function getPublishedHackathon(): Promise<Hackathon | null> {
  const { data, error } = await supabase
    .from('hackathons')
    .select('*')
    .eq('slug', 'main')
    .eq('status', 'published')
    .maybeSingle()
  if (error) throw error
  return data
}
