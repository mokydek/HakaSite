/**
 * Helpers to move between the timestamptz stored in UTC and the value a
 * datetime-local input expects, which is wall clock time in the organizer
 * local zone. Read converts UTC to local for display, write converts local
 * back to ISO UTC. The cases unlock time drives the whole reveal, so the round
 * trip must be exact.
 */

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

/** ISO UTC string to a datetime-local value in the organizer local time. */
export function isoToLocalInput(iso: string | null | undefined): string {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`
}

/** A datetime-local value in local time back to an ISO UTC string, or null. */
export function localInputToIso(value: string): string | null {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toISOString()
}

/** The organizer local timezone name, for example Europe Kyiv. */
export function localTimezoneLabel(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'local time'
  } catch {
    return 'local time'
  }
}
