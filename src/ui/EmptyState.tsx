import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from './cn'

export interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  /** Optional action, for example a button. */
  action?: ReactNode
  className?: string
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded border border-border bg-background px-6 py-12 text-center',
        className,
      )}
    >
      <Icon size={20} strokeWidth={2} aria-hidden="true" className="text-muted" />
      <div className="flex flex-col gap-1">
        <p className="font-display text-base font-medium text-foreground">{title}</p>
        {description ? <p className="max-w-sm text-sm text-muted">{description}</p> : null}
      </div>
      {action ? <div className="pt-1">{action}</div> : null}
    </div>
  )
}
