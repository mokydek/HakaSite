import { useEffect, useMemo, useRef, useState } from 'react'
import { cn } from './cn'

export interface CountdownProps {
  /** Target moment as an ISO date string. */
  target: string
  /** Called once when the countdown reaches zero. */
  onComplete?: () => void
  className?: string
}

interface Remaining {
  total: number
  days: number
  hours: number
  minutes: number
  seconds: number
}

function getRemaining(targetMs: number): Remaining {
  const total = Math.max(0, targetMs - Date.now())
  const totalSeconds = Math.floor(total / 1000)
  return {
    total,
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  }
}

/**
 * Counts down to a target date, updating once per second. Clears its interval
 * on unmount and calls onComplete a single time when it reaches zero. Reused
 * later for the case reveal.
 */
export function Countdown({ target, onComplete, className }: CountdownProps) {
  const targetMs = useMemo(() => new Date(target).getTime(), [target])
  const [remaining, setRemaining] = useState<Remaining>(() => getRemaining(targetMs))

  const onCompleteRef = useRef(onComplete)
  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  useEffect(() => {
    let completed = false
    setRemaining(getRemaining(targetMs))
    const intervalId = setInterval(() => {
      const next = getRemaining(targetMs)
      setRemaining(next)
      if (next.total <= 0 && !completed) {
        completed = true
        onCompleteRef.current?.()
        clearInterval(intervalId)
      }
    }, 1000)
    return () => clearInterval(intervalId)
  }, [targetMs])

  const units: Array<{ label: string; value: number }> = [
    { label: 'Days', value: remaining.days },
    { label: 'Hours', value: remaining.hours },
    { label: 'Minutes', value: remaining.minutes },
    { label: 'Seconds', value: remaining.seconds },
  ]

  return (
    <div className={cn('flex items-stretch gap-2', className)} role="timer" aria-live="off">
      {units.map((unit) => (
        <div
          key={unit.label}
          className="flex min-w-[68px] flex-col items-center gap-1 rounded border border-border bg-surface px-3 py-2"
        >
          <span className="font-mono text-2xl font-medium tabular-nums text-foreground">
            {String(unit.value).padStart(2, '0')}
          </span>
          <span className="text-xs uppercase tracking-wide text-muted">{unit.label}</span>
        </div>
      ))}
    </div>
  )
}
