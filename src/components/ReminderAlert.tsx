import { useEffect } from 'react'
import { Button } from './Button'
import './ConfirmDialog.css'
import './ReminderAlert.css'

type Props = {
  open: boolean
  intervalMinutes: number
  onGotIt: () => void
  onSnooze: () => void
  onOpenLog: () => void
}

export function ReminderAlert({
  open,
  intervalMinutes,
  onGotIt,
  onSnooze,
  onOpenLog,
}: Props) {
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onGotIt()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onGotIt])

  if (!open) return null

  return (
    <div className="confirm-dialog" role="presentation">
      <button
        type="button"
        className="confirm-dialog__backdrop"
        aria-label="Dismiss"
        onClick={onGotIt}
      />
      <div
        className="confirm-dialog__panel reminder-alert__panel"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="reminder-alert-title"
        aria-describedby="reminder-alert-message"
      >
        <p className="reminder-alert__eyebrow">Kiln check</p>
        <h2 id="reminder-alert-title">Time to check Delores</h2>
        <p id="reminder-alert-message">
          Your {intervalMinutes}-minute reminder. Peek at the dial, meter, and cones — then log a
          reading if anything changed.
        </p>
        <div className="reminder-alert__actions">
          <Button className="fs-btn--grow" variant="primary" onClick={onOpenLog}>
            Open log
          </Button>
          <Button className="fs-btn--grow" variant="outline" onClick={onSnooze}>
            Snooze 15 min
          </Button>
          <Button className="fs-btn--grow" variant="ghost" onClick={onGotIt}>
            Got it
          </Button>
        </div>
      </div>
    </div>
  )
}
