import type { HTMLAttributes } from 'react'
import { cn } from './cn'

export type BadgeVariant = 'surface' | 'outline'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

const variantClasses: Record<BadgeVariant, string> = {
  surface: 'bg-surface text-foreground',
  outline: 'border border-border bg-background text-foreground',
}

/** Small uppercase status label. */
export function Badge({ variant = 'surface', className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold uppercase tracking-wide',
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  )
}
