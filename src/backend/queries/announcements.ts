import { supabase } from '../supabase/client'
import type { Announcement } from '../types'

/** Published announcements for a hackathon, newest first. */
export async function getAnnouncements(hackathonId: string): Promise<Announcement[]> {
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .eq('hackathon_id', hackathonId)
    .eq('is_published', true)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}
