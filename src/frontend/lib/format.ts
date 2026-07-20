/** Shared date formatting for the dashboard. Output is hyphen free by design. */
export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return 'To be announced'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return 'To be announced'
  return date.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
}
