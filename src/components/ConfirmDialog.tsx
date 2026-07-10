import { useEffect } from 'react'
import { Button } from './Button'
import './ConfirmDialog.css'

type Props = {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}: Props) {
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onCancel])

  if (!open) return null

  return (
    <div className="confirm-dialog" role="presentation">
      <button
        type="button"
        className="confirm-dialog__backdrop"
        aria-label="Close"
        onClick={onCancel}
      />
      <div
        className="confirm-dialog__panel"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
      >
        <h2 id="confirm-dialog-title">{title}</h2>
        <p id="confirm-dialog-message">{message}</p>
        <div className="confirm-dialog__actions">
          <Button className="fs-btn--grow" variant="outline" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button className="fs-btn--grow" variant="danger" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
