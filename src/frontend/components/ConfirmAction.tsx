import { useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Button } from '../../ui'

interface ConfirmActionProps {
  label: string
  confirmLabel: string
  message?: string
  icon?: LucideIcon
  onConfirm: () => Promise<void> | void
  triggerVariant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md'
}

/**
 * Inline confirmation for destructive actions. The trigger reveals a confirm
 * and cancel pair in place, no browser dialog or window.confirm.
 */
export function ConfirmAction({
  label,
  confirmLabel,
  message,
  icon,
  onConfirm,
  triggerVariant = 'secondary',
  size = 'sm',
}: ConfirmActionProps) {
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)

  if (!confirming) {
    return (
      <Button variant={triggerVariant} size={size} icon={icon} onClick={() => setConfirming(true)}>
        {label}
      </Button>
    )
  }

  async function handleConfirm() {
    setBusy(true)
    try {
      await onConfirm()
    } finally {
      setBusy(false)
      setConfirming(false)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {message ? <span className="text-sm font-medium text-foreground">{message}</span> : null}
      <Button variant="primary" size={size} loading={busy} onClick={() => void handleConfirm()}>
        {confirmLabel}
      </Button>
      <Button variant="ghost" size={size} onClick={() => setConfirming(false)} disabled={busy}>
        Cancel
      </Button>
    </div>
  )
}
