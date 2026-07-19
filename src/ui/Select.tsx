import type { SelectHTMLAttributes } from 'react'
import { useId } from 'react'
import { ChevronDown } from 'lucide-react'
import { Label } from './Label'
import { cn } from './cn'

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  /** Optional monochrome error message. Also darkens the border to foreground. */
  error?: string
}

const controlClasses =
  'h-10 w-full appearance-none rounded border border-border bg-background pl-3 pr-9 text-sm text-foreground disabled:pointer-events-none disabled:opacity-50'

export function Select({ label, error, id, className, children, ...props }: SelectProps) {
  const generatedId = useId()
  const fieldId = id ?? generatedId
  const errorId = error ? `${fieldId}-error` : undefined
  return (
    <div className="flex flex-col gap-1.5">
      {label ? <Label htmlFor={fieldId}>{label}</Label> : null}
      <div className="relative">
        <select
          {...props}
          id={fieldId}
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId}
          className={cn(controlClasses, error && 'border-foreground', className)}
        >
          {children}
        </select>
        <ChevronDown
          size={16}
          strokeWidth={2}
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
        />
      </div>
      {error ? (
        <p id={errorId} className="text-sm font-semibold text-foreground">
          {error}
        </p>
      ) : null}
    </div>
  )
}
