import { supabase } from '../supabase/client'
import type { Case } from '../types'

/**
 * Published cases for a hackathon, ordered by order_index. Row level security
 * is the gate: this returns an empty array before the reveal time and the real
 * rows once the server clock passes reveal_at, with no client side logic.
 */
export async function getCases(hackathonId: string): Promise<Case[]> {
  const { data, error } = await supabase
    .from('cases')
    .select('*')
    .eq('hackathon_id', hackathonId)
    .order('order_index', { ascending: true })
  if (error) throw error
  return data ?? []
}

/** A single case by id, or null when it is not revealed yet or does not exist. */
export async function getCaseById(caseId: string): Promise<Case | null> {
  const { data, error } = await supabase
    .from('cases')
    .select('*')
    .eq('id', caseId)
    .maybeSingle()
  if (error) throw error
  return data
}
