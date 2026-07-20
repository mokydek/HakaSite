import { supabase } from '../supabase/client'
import type { ScheduleItem } from '../types'

/** Schedule items for a hackathon, ordered by order_index then start time. */
export async function getScheduleItems(hackathonId: string): Promise<ScheduleItem[]> {
  const { data, error } = await supabase
    .from('schedule_items')
    .select('*')
    .eq('hackathon_id', hackathonId)
    .order('order_index', { ascending: true })
    .order('starts_at', { ascending: true, nullsFirst: false })
  if (error) throw error
  return data ?? []
}
