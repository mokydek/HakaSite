import { Lock, Unlock } from 'lucide-react'
import { formatDateTime } from '../lib/format'

interface CasesShellProps {
  revealed: boolean
  revealAt: string | null
}

/**
 * Shell for the cases area. Phase 8 replaces the revealed placeholder with the
 * real cases list and links. The locked state shows when the cases unlock, the
 * live ticking countdown is the centerpiece directly above this block.
 */
export function CasesShell({ revealed, revealAt }: CasesShellProps) {
  if (!revealed) {
    return (
      <div className="flex flex-col items-center gap-3 rounded border border-border bg-background px-6 py-12 text-center">
        <Lock size={20} strokeWidth={2} aria-hidden="true" className="text-muted" />
        <h2 className="font-display text-lg font-semibold text-foreground">Cases unlock soon</h2>
        <p className="max-w-sm text-sm text-muted">
          The challenge prompts appear when the countdown reaches zero.
        </p>
        <p className="font-mono text-sm text-foreground">Unlocks {formatDateTime(revealAt)}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 rounded border border-border bg-background p-6">
      <div className="flex items-center gap-2">
        <Unlock size={20} strokeWidth={2} aria-hidden="true" className="text-foreground" />
        <h2 className="font-display text-lg font-semibold text-foreground">Cases are live</h2>
      </div>
      <p className="text-sm text-muted">The challenge prompts are now available.</p>
      {/* Phase 8: the real cases list and links to each case detail render here. */}
      <div className="rounded border border-dashed border-border px-6 py-10 text-center">
        <p className="text-sm text-muted">The cases list arrives in the next phase.</p>
      </div>
    </div>
  )
}
