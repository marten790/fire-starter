import { useEffect, useMemo, useState } from 'react'
import { Button } from './Button'
import { Toggle } from './Toggle'
import { checklistFor, firingTypeLabel } from '../lib/checklist'
import type { FiringType, PreStartChecklistItem } from '../types/firing'
import './ConfirmDialog.css'
import './PreStartChecklist.css'

type Props = {
  open: boolean
  type: FiringType | null
  onCancel: () => void
  onConfirm: (items: PreStartChecklistItem[]) => void
}

export function PreStartChecklist({ open, type, onCancel, onConfirm }: Props) {
  const defs = useMemo(() => (type ? checklistFor(type) : []), [type])
  const [checked, setChecked] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (!open || !type) return
    const initial: Record<string, boolean> = {}
    for (const item of checklistFor(type)) initial[item.key] = false
    setChecked(initial)
  }, [open, type])

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onCancel])

  if (!open || !type) return null

  const allDone = defs.every((item) => checked[item.key])
  const doneCount = defs.filter((item) => checked[item.key]).length

  function toggle(key: string, on: boolean) {
    setChecked((prev) => ({ ...prev, [key]: on }))
  }

  function confirm() {
    if (!allDone) return
    onConfirm(
      defs.map((item) => ({
        key: item.key,
        label: item.label,
        checked: true,
      })),
    )
  }

  return (
    <div className="confirm-dialog" role="presentation">
      <button
        type="button"
        className="confirm-dialog__backdrop"
        aria-label="Cancel"
        onClick={onCancel}
      />
      <div
        className="confirm-dialog__panel prestart-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="prestart-title"
        aria-describedby="prestart-lead"
      >
        <p className="prestart-eyebrow">Before you start</p>
        <h2 id="prestart-title">{firingTypeLabel(type)}</h2>
        <p id="prestart-lead" className="prestart-lead">
          Check each item at the kiln. Timer starts when everything is ready.
        </p>
        <p className="prestart-progress" aria-live="polite">
          {doneCount} of {defs.length} ready
        </p>

        <div className="prestart-list">
          {defs.map((item) => (
            <Toggle
              key={item.key}
              label={item.label}
              hint={item.hint}
              checked={Boolean(checked[item.key])}
              onChange={(e) => toggle(item.key, e.target.checked)}
            />
          ))}
        </div>

        <div className="prestart-actions">
          <Button className="fs-btn--grow" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            className="fs-btn--grow"
            variant="primary"
            disabled={!allDone}
            onClick={confirm}
          >
            Start firing
          </Button>
        </div>
      </div>
    </div>
  )
}
