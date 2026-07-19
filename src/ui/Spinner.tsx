import { cn } from './cn'

export interface SpinnerProps {
  /** Diameter in pixels. Defaults to 16. */
  size?: number
  className?: string
  /** Accessible label announced to assistive technology. Defaults to Loading. */
  label?: string
}

/**
 * Minimal monochrome loading indicator. Uses currentColor so it adapts to the
 * surrounding text color, white on a primary button and foreground elsewhere.
 */
export function Spinner({ size = 16, className, label = 'Loading' }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label}
      style={{ width: size, height: size }}
      className={cn(
        'inline-block animate-spin rounded-full border-2 border-current border-r-transparent align-[-0.125em]',
        className,
      )}
    />
  )
}
