import { useEffect, useRef } from 'react'
import { removeRealtimeChannel, subscribeToTableChanges } from '../../backend/realtime'

interface UseRealtimeRefetchOptions {
  /** The public table to watch, for example cases or announcements. */
  table: string
  /** Optional postgres filter, for example `hackathon_id=eq.<id>`. */
  filter?: string
  /** Called on any insert, update, or delete. Usually a refetch. */
  onChange: () => void
  /** Set false to skip subscribing. Defaults to true. */
  enabled?: boolean
}

/**
 * Subscribes to realtime changes on a table on mount and unsubscribes on
 * unmount. Reusable, wired for cases now and ready for announcements later.
 */
export function useRealtimeRefetch({
  table,
  filter,
  onChange,
  enabled = true,
}: UseRealtimeRefetchOptions): void {
  const onChangeRef = useRef(onChange)
  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  useEffect(() => {
    if (!enabled) return
    const channel = subscribeToTableChanges(table, filter, () => onChangeRef.current())
    return () => removeRealtimeChannel(channel)
  }, [table, filter, enabled])
}
