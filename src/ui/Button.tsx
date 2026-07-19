import type { ButtonHTMLAttributes } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Spinner } from './Spinner'
import { cn } from './cn'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost'
export type ButtonSize = 'sm' | 'md'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  /** Optional leading icon from lucide react. */
  icon?: LucideIcon
  /** Shows a spinner and blocks interaction while true. */
  loading?: boolean
}

const baseClasses =
  'inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded border font-medium transition-colors disabled:pointer-events-none disabled:opacity-50'

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'border-transparent bg-accent text-accent-foreground hover:opacity-90',
  secondary: 'border-border bg-background text-foreground hover:border-foreground',
  ghost: 'border-transparent bg-transparent text-foreground hover:bg-surface',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
}

export function Button({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  loading = false,
  disabled,
  type = 'button',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
    >
      {loading ? (
        <Spinner size={16} />
      ) : Icon ? (
        <Icon size={16} strokeWidth={2} aria-hidden="true" />
      ) : null}
      {children}
    </button>
  )
}
