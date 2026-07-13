import { useEffect, useRef, useState } from 'react'
import { Button } from './Button'
import { ReminderControls } from './ReminderControls'
import { Toggle } from './Toggle'
import {
  CANDLING_DOOR_MINUTES,
  PEEPHOLE_CLOSE_TEMP_C,
  doorCloseDueAt,
  formatCandlingCountdown,
  shouldPromptCloseDoor,
  shouldPromptClosePeephole,
} from '../lib/candling'
import { nowClock } from '../lib/firings'
import {
  buzzDevice,
  playReminderChime,
  showBrowserNotification,
  type ReminderSettings,
} from '../lib/reminders'
import type { CandlingState, FiringSession, PhaseReading } from '../types/firing'
import './BisqueSection.css'

type Props = {
  firing: FiringSession
  reminders: ReminderSettings
  onRemindersChange: (next: ReminderSettings) => void
  onChange: (firing: FiringSession) => void
  lastTempC?: number
}

export function BisqueSection({
  firing,
  reminders,
  onRemindersChange,
  onChange,
  lastTempC,
}: Props) {
  const candling = firing.candling ?? {}
  const [now, setNow] = useState(Date.now())
  const [doorPromptOpen, setDoorPromptOpen] = useState(false)
  const [peepholePromptOpen, setPeepholePromptOpen] = useState(false)
  const doorAlerted = useRef(false)
  const peepholeAlerted = useRef(false)

  const dueAt = doorCloseDueAt(firing.startedAt)
  const doorDone = Boolean(candling.doorClosed)
  const peepholeDone = Boolean(candling.peepholeClosed)
  const doorDue = shouldPromptCloseDoor(candling, firing.startedAt, now)
  const peepholeDue = shouldPromptClosePeephole(candling, lastTempC)

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    if (doorDone) {
      doorAlerted.current = false
      setDoorPromptOpen(false)
      return
    }
    if (!doorDue || doorAlerted.current) return
    doorAlerted.current = true
    setDoorPromptOpen(true)
    playReminderChime()
    buzzDevice()
    void showBrowserNotification(
      'Close the kiln door',
      `Candling hour is up — close Delores’s door.`,
    )
  }, [doorDue, doorDone])

  useEffect(() => {
    if (peepholeDone) {
      peepholeAlerted.current = false
      setPeepholePromptOpen(false)
      return
    }
    if (!peepholeDue || peepholeAlerted.current) return
    peepholeAlerted.current = true
    setPeepholePromptOpen(true)
    playReminderChime()
    buzzDevice()
    void showBrowserNotification(
      'Close the peephole',
      `Kiln is at ${lastTempC}°C — close the peephole.`,
    )
  }, [peepholeDue, peepholeDone, lastTempC])

  function patchCandling(next: CandlingState) {
    onChange({ ...firing, candling: next })
  }

  function markDoorClosed(on: boolean) {
    if (!on) {
      const { doorClosed: _removed, ...rest } = candling
      patchCandling(rest)
      return
    }
    const reading: PhaseReading = {
      clockTime: nowClock(),
      tempC: lastTempC,
      notes: 'Door closed after candling',
    }
    patchCandling({ ...candling, doorClosed: reading })
    setDoorPromptOpen(false)
  }

  function markPeepholeClosed(on: boolean) {
    if (!on) {
      const { peepholeClosed: _removed, ...rest } = candling
      patchCandling(rest)
      return
    }
    const reading: PhaseReading = {
      clockTime: nowClock(),
      tempC: lastTempC,
      notes: 'Peephole closed',
    }
    patchCandling({ ...candling, peepholeClosed: reading })
    setPeepholePromptOpen(false)
  }

  return (
    <section className="bisque-section" aria-label="Bisque candling and reminders">
      {(doorPromptOpen || peepholePromptOpen) && (
        <div className="bisque-section__alerts" role="status">
          {doorPromptOpen && (
            <div className="bisque-section__alert">
              <strong>Close the door</strong>
              <p>
                First hour of candling is done. Close the door, then keep checking on the usual
                interval.
              </p>
              <div className="bisque-section__alert-actions">
                <Button variant="primary" onClick={() => markDoorClosed(true)}>
                  Door closed
                </Button>
                <Button variant="ghost" onClick={() => setDoorPromptOpen(false)}>
                  Dismiss
                </Button>
              </div>
            </div>
          )}
          {peepholePromptOpen && (
            <div className="bisque-section__alert">
              <strong>Close the peephole</strong>
              <p>
                Last reading is {lastTempC}°C (at or above {PEEPHOLE_CLOSE_TEMP_C}°C). Plug the
                peephole now.
              </p>
              <div className="bisque-section__alert-actions">
                <Button variant="primary" onClick={() => markPeepholeClosed(true)}>
                  Peephole closed
                </Button>
                <Button variant="ghost" onClick={() => setPeepholePromptOpen(false)}>
                  Dismiss
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      <h3>Bisque · Candling</h3>
      <p className="bisque-section__hint">
        Door ajar for the first hour, then close it. Close the peephole once you hit about{' '}
        {PEEPHOLE_CLOSE_TEMP_C}°C.
      </p>

      <div className="bisque-section__status">
        {!doorDone ? (
          <p>
            {doorDue ? (
              <>
                Door close <strong>due now</strong>
              </>
            ) : (
              <>
                Close door in{' '}
                <strong>{formatCandlingCountdown(dueAt, now)}</strong>
                <span className="bisque-section__muted">
                  {' '}
                  · {CANDLING_DOOR_MINUTES} min candling
                </span>
              </>
            )}
          </p>
        ) : (
          <p>
            Door closed
            {candling.doorClosed?.clockTime ? ` · ${candling.doorClosed.clockTime}` : ''}
            {candling.doorClosed?.tempC != null ? ` · ${candling.doorClosed.tempC}°C` : ''}
          </p>
        )}
        {!peepholeDone ? (
          <p>
            {peepholeDue ? (
              <>
                Peephole close <strong>due now</strong>
                {lastTempC != null ? ` · ${lastTempC}°C` : ''}
              </>
            ) : (
              <>
                Peephole still open
                <span className="bisque-section__muted">
                  {' '}
                  · close at ~{PEEPHOLE_CLOSE_TEMP_C}°C
                </span>
              </>
            )}
          </p>
        ) : (
          <p>
            Peephole closed
            {candling.peepholeClosed?.clockTime
              ? ` · ${candling.peepholeClosed.clockTime}`
              : ''}
            {candling.peepholeClosed?.tempC != null
              ? ` · ${candling.peepholeClosed.tempC}°C`
              : ''}
          </p>
        )}
      </div>

      <div className="bisque-section__toggles">
        <Toggle
          label="Door closed after candling"
          hint={doorDone ? undefined : 'Flip on when you shut the door'}
          checked={doorDone}
          onChange={(e) => markDoorClosed(e.target.checked)}
        />
        <Toggle
          label="Peephole closed"
          hint={peepholeDone ? undefined : `Flip on around ${PEEPHOLE_CLOSE_TEMP_C}°C`}
          checked={peepholeDone}
          onChange={(e) => markPeepholeClosed(e.target.checked)}
        />
      </div>

      <ReminderControls
        settings={reminders}
        onChange={onRemindersChange}
        title="Bisque check reminders"
        hint="Sends a notification with sound when it’s time to check. Allow notifications, keep Firestarter on the Home Screen, and leave the screen on for the most reliable alerts."
      />
    </section>
  )
}
