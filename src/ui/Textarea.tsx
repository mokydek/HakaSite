import type { TextareaHTMLAttributes } from 'react'
import { useId } from 'react'
import { Label } from './Label'
import { cn } from './cn'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  /** Optional monochrome error message. Also darkens the border to foreground. */
  error?: string
}

const controlClasses =
  'min-h-[96px] w-full resize-y rounded border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted disabled:pointer-events-none disabled:opacity-50'

export function Textarea({ label, error, id, className, ...props }: TextareaProps) {
  const generatedId = useId()
  const fieldId = id ?? generatedId
  const errorId = error ? `${fieldId}-error` : undefined
  return (
    <div className="flex flex-col gap-1.5">
      {label ? <Label htmlFor={fieldId}>{label}</Label> : null}
      <textarea
        {...props}
        id={fieldId}
        aria-invalid={error ? true : undefined}
        aria-describedby={errorId}
        className={cn(controlClasses, error && 'border-foreground', className)}
      />
      {error ? (
        <p id={errorId} className="text-sm font-semibold text-foreground">
          {error}
        </p>
      ) : null}
    </div>
  )
}
