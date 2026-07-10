import { useEffect, useState } from 'react'
import type { ReminderInterval, ReminderSettings } from '../lib/reminders'
import {
  ensureNotificationPermission,
  formatReminderCountdown,
} from '../lib/reminders'
import { Toggle } from './Toggle'
import './ReminderControls.css'

type Props = {
  settings: ReminderSettings
  onChange: (next: ReminderSettings) => void
}

const INTERVALS: ReminderInterval[] = [15, 30, 60]

export function ReminderControls({ settings, onChange }: Props) {
  const [now, setNow] = useState(Date.now())
  const [permNote, setPermNote] = useState<string | null>(null)

  useEffect(() => {
    if (!settings.enabled || settings.nextDueAt == null) return
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [settings.enabled, settings.nextDueAt])

  async function toggleEnabled(on: boolean) {
    if (on) {
      const perm = await ensureNotificationPermission()
      if (perm === 'denied') {
        setPermNote('Browser alerts blocked — in-app reminders still work while Fire Starter is open.')
      } else if (perm === 'granted') {
        setPermNote('Browser alerts on when the iPad allows them.')
      } else if (perm === 'unsupported') {
        setPermNote('In-app reminders only on this browser.')
      } else {
        setPermNote(null)
      }
    } else {
      setPermNote(null)
    }
    onChange({ ...settings, enabled: on })
  }

  function setIntervalMinutes(intervalMinutes: ReminderInterval) {
    const next = { ...settings, intervalMinutes }
    if (settings.enabled && settings.firingId && settings.nextDueAt != null) {
      const remaining = settings.nextDueAt - Date.now()
      const capped = Math.min(remaining, intervalMinutes * 60_000)
      next.nextDueAt = Date.now() + Math.max(60_000, capped)
    }
    onChange(next)
  }

  return (
    <section className="reminder-controls" aria-label="Check reminders">
      <h3>Check reminders</h3>
      <p className="reminder-controls__hint">
        Nudge you to peek at the kiln while a firing is running. Keep Fire Starter open (or on the
        Home Screen) for the most reliable alerts.
      </p>

      <Toggle
        label="Reminders on"
        hint={
          settings.enabled && settings.nextDueAt != null
            ? `Next in ${formatReminderCountdown(settings.nextDueAt, now)}`
            : settings.enabled
              ? 'Waiting for schedule'
              : 'Off for this device'
        }
        checked={settings.enabled}
        onChange={(e) => void toggleEnabled(e.target.checked)}
      />

      {settings.enabled && (
        <div className="reminder-controls__intervals" role="group" aria-label="Reminder interval">
          {INTERVALS.map((mins) => (
            <button
              key={mins}
              type="button"
              className={
                settings.intervalMinutes === mins
                  ? 'reminder-controls__chip is-active'
                  : 'reminder-controls__chip'
              }
              onClick={() => setIntervalMinutes(mins)}
            >
              {mins} min
            </button>
          ))}
        </div>
      )}

      {permNote && <p className="reminder-controls__note">{permNote}</p>}
    </section>
  )
}
