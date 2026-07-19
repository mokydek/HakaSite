import type { HTMLAttributes } from 'react'
import { cn } from './cn'

export type ContainerProps = HTMLAttributes<HTMLDivElement>

/** Max width page wrapper with consistent horizontal padding. */
export function Container({ className, ...props }: ContainerProps) {
  return <div className={cn('mx-auto w-full max-w-5xl px-6', className)} {...props} />
}
