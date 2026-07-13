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
  title?: string
  hint?: string
}

const INTERVALS: ReminderInterval[] = [15, 30, 60]

export function ReminderControls({
  settings,
  onChange,
  title = 'Check reminders',
  hint = 'Sends a notification with sound when it’s time to check the kiln. Add Firestarter to your Home Screen and allow notifications. Keep the app open (or the screen awake) for the most reliable alerts.',
}: Props) {
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
        setPermNote(
          'Notifications blocked in Settings — in-app chime still works while Firestarter is open.',
        )
      } else if (perm === 'granted') {
        setPermNote('Notifications on — you’ll get an alert with sound when a check is due.')
      } else if (perm === 'unsupported') {
        setPermNote('This browser can’t show notifications — in-app chime only.')
      } else {
        setPermNote('Allow notifications when prompted so alerts can sound in the background.')
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
    <section className="reminder-controls" aria-label={title}>
      <h3>{title}</h3>
      <p className="reminder-controls__hint">{hint}</p>

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
