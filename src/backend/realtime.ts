import type { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from './supabase/client'

/**
 * Subscribes to postgres changes on a table, optionally filtered, and calls
 * onChange for every insert, update, or delete. Returns the channel so the
 * caller can remove it on cleanup. This is the single place realtime is wired.
 */
export function subscribeToTableChanges(
  table: string,
  filter: string | undefined,
  onChange: () => void,
): RealtimeChannel {
  return supabase
    .channel(`realtime:${table}:${filter ?? 'all'}`)
    .on('postgres_changes', { event: '*', schema: 'public', table, filter }, () => {
      onChange()
    })
    .subscribe()
}

export function removeRealtimeChannel(channel: RealtimeChannel): void {
  void supabase.removeChannel(channel)
}
