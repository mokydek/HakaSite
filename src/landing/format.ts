/** Date formatting for the public landing. Output is hyphen free by design. */

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return 'To be announced'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return 'To be announced'
  return date.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
}

export function formatDateShort(iso: string | null | undefined): string {
  if (!iso) return 'Dates to be announced'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return 'Dates to be announced'
  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function isFuture(iso: string | null | undefined): boolean {
  if (!iso) return false
  const date = new Date(iso)
  return !Number.isNaN(date.getTime()) && date.getTime() > Date.now()
}
