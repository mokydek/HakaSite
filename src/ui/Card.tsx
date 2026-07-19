import type { HTMLAttributes } from 'react'
import { cn } from './cn'

export type CardProps = HTMLAttributes<HTMLDivElement>

/** White surface with a 1px border, square corners, padding, and no shadow. */
export function Card({ className, ...props }: CardProps) {
  return (
    <div className={cn('rounded border border-border bg-background p-6', className)} {...props} />
  )
}
