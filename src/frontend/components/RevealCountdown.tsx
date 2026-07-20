import { Countdown } from '../../ui'

interface RevealCountdownProps {
  target: string
  onComplete: () => void
}

/** The visual centerpiece. A large countdown to the cases reveal time. */
export function RevealCountdown({ target, onComplete }: RevealCountdownProps) {
  return (
    <div className="flex flex-col items-center gap-6 rounded border border-border bg-surface px-6 py-10 text-center">
      <p className="font-mono text-xs uppercase tracking-widest text-muted">Cases unlock in</p>
      <Countdown target={target} onComplete={onComplete} />
    </div>
  )
}
