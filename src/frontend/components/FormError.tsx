export interface FormErrorProps {
  message: string
}

/**
 * Monochrome inline error. Bold foreground text inside a 1px border, no second
 * color, matching the design system rule for errors and warnings.
 */
export function FormError({ message }: FormErrorProps) {
  return (
    <div
      role="alert"
      className="rounded border border-foreground bg-surface px-3 py-2 text-sm font-semibold text-foreground"
    >
      {message}
    </div>
  )
}
