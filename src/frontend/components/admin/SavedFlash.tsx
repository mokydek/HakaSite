import { Check } from 'lucide-react'

/** Small confirmation shown after a successful write. */
export function SavedFlash({ show }: { show: boolean }) {
  if (!show) return null
  return (
    <span className="inline-flex items-center gap-1 text-sm text-foreground">
      <Check size={16} strokeWidth={2} aria-hidden="true" />
      Saved
    </span>
  )
}
