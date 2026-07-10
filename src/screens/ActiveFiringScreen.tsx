import { useEffect, useMemo, useState } from 'react'
import { Button } from '../components/Button'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { EndOfFireForm } from '../components/EndOfFireForm'
import { FiringDetails } from '../components/FiringDetails'
import { ReminderControls } from '../components/ReminderControls'
import { TempChart } from '../components/TempChart'
import { Toggle } from '../components/Toggle'
import { formatElapsed, DEFAULT_COOLING_LOG, nowClock } from '../lib/firings'
import type { ReminderSettings } from '../lib/reminders'
import type { ConeEvent, FiringSession, FiringType, HeatingLogEntry } from '../types/firing'
import './ActiveFiringScreen.css'

type Props = {
  firing: FiringSession
  reminders: ReminderSettings
  onRemindersChange: (next: ReminderSettings) => void
  onLoggedReading: () => void
  onChange: (firing: FiringSession) => void
  onEnd: () => void
  onDelete: () => void
  onBackToDashboard: () => void
}

type ConeToggleDef = {
  key: string
  label: string
  hint?: string
}

function coneTogglesFor(type: FiringType): ConeToggleDef[] {
  if (type === 'bisque') {
    return [
      { key: '07-started', label: 'Cone 07 started' },
      { key: '07-down', label: 'Cone 07 down' },
      { key: '06-started', label: 'Cone 06 started' },
      { key: '06-down', label: 'Cone 06 down', hint: 'Target — shut off when bent' },
    ]
  }
  return [
    { key: '4-started', label: 'Cone 4 started' },
    { key: '4-down', label: 'Cone 4 down' },
    { key: '5-started', label: 'Cone 5 started' },
    { key: '5-down', label: 'Cone 5 down' },
    { key: '6-started', label: 'Cone 6 started', hint: 'Begin soak' },
    { key: '6-down', label: 'Cone 6 down' },
    { key: '7-started', label: 'Cone 7 started' },
    { key: '7-down', label: 'Cone 7 down', hint: 'Guard cone' },
  ]
}

export function ActiveFiringScreen({
  firing,
  reminders,
  onRemindersChange,
  onLoggedReading,
  onChange,
  onEnd,
  onDelete,
  onBackToDashboard,
}: Props) {
  const isRunning = firing.status === 'running'
  const [elapsedSec, setElapsedSec] = useState(() =>
    Math.floor(((firing.endedAt ?? Date.now()) - firing.startedAt) / 1000),
  )
  const [dial, setDial] = useState(firing.dial)
  const [tempC, setTempC] = useState('')
  const [kWh, setKWh] = useState('')
  const [notes, setNotes] = useState('')
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)

  useEffect(() => {
    if (!isRunning) {
      setElapsedSec(Math.floor(((firing.endedAt ?? Date.now()) - firing.startedAt) / 1000))
      if (!firing.coolingLog || firing.coolingLog.length === 0) {
        onChange({
          ...firing,
          coolingLog: DEFAULT_COOLING_LOG.map((row) => ({ ...row })),
          results: firing.results ?? {},
        })
      }
      return
    }
    const id = window.setInterval(() => {
      setElapsedSec(Math.floor((Date.now() - firing.startedAt) / 1000))
    }, 1000)
    return () => window.clearInterval(id)
  }, [firing.startedAt, firing.endedAt, isRunning])

  const lastTemp = firing.entries.at(-1)?.tempC
  const label = firing.type === 'bisque' ? 'Bisque · Cone 06' : 'Glaze · Cone 6 / 7'
  const coneToggles = useMemo(() => coneTogglesFor(firing.type), [firing.type])

  const canLog = useMemo(() => {
    const t = Number(tempC)
    return isRunning && Number.isFinite(t) && t > 0
  }, [tempC, isRunning])

  function logReading() {
    if (!canLog) return
    const entry: HeatingLogEntry = {
      id: crypto.randomUUID(),
      elapsedMinutes: Math.floor(elapsedSec / 60),
      elapsedSeconds: elapsedSec,
      clockTime: nowClock(),
      dial,
      tempC: Number(tempC),
      kWh: kWh === '' ? undefined : Number(kWh),
      notes: notes.trim() || undefined,
    }
    onChange({
      ...firing,
      dial,
      entries: [...firing.entries, entry],
    })
    onLoggedReading()
    setTempC('')
    setNotes('')
  }

  function updateDial(next: number) {
    setDial(next)
    onChange({ ...firing, dial: next })
  }

  function isConeOn(key: string) {
    return (firing.coneEvents ?? []).some((event) => event.key === key)
  }

  function toggleCone(def: ConeToggleDef, on: boolean) {
    const existing = firing.coneEvents ?? []
    if (on) {
      if (existing.some((event) => event.key === def.key)) return
      const event: ConeEvent = {
        key: def.key,
        clockTime: nowClock(),
        tempC: lastTemp ?? (Number(tempC) || 0),
        note: def.label,
      }
      onChange({
        ...firing,
        coneEvents: [...existing, event],
      })
      return
    }
    onChange({
      ...firing,
      coneEvents: existing.filter((event) => event.key !== def.key),
    })
  }

  return (
    <main className="app-shell active">
      <ConfirmDialog
        open={confirmDeleteOpen}
        title="Delete firing?"
        message={`Delete “${firing.name}”? This removes the log, graph, and notes permanently.`}
        confirmLabel="Delete"
        cancelLabel="Keep it"
        onConfirm={() => {
          setConfirmDeleteOpen(false)
          onDelete()
        }}
        onCancel={() => setConfirmDeleteOpen(false)}
      />

      <header className="active-header">
        <div className="active-nav">
          <button type="button" className="active-back" onClick={onBackToDashboard}>
            ← Back to dashboard
          </button>
          {!isRunning && <span className="active-status">Cooling / results</span>}
        </div>
        <p className="app-brand">Fire Starter</p>
        <p className="active-type">{label}</p>
        <p className="active-name">{firing.name}</p>
        <p className="active-timer" aria-live="polite">
          {formatElapsed(elapsedSec)}
        </p>
        <p className="active-last">
          Last reading:{' '}
          {lastTemp != null ? <strong>{lastTemp}°C</strong> : '—'}
        </p>
      </header>

      {isRunning && (
        <section className="active-form" aria-label="Log reading">
          <label className="field">
            <span>Dial (1–6)</span>
            <input
              type="number"
              min={1}
              max={6}
              step={0.5}
              value={dial}
              onChange={(e) => updateDial(Number(e.target.value))}
            />
          </label>
          <label className="field">
            <span>Temperature °C</span>
            <input
              inputMode="decimal"
              placeholder="e.g. 360"
              value={tempC}
              onChange={(e) => setTempC(e.target.value)}
            />
          </label>
          <label className="field">
            <span>Electric units (kWh)</span>
            <input
              inputMode="decimal"
              placeholder="optional"
              value={kWh}
              onChange={(e) => setKWh(e.target.value)}
            />
          </label>
          <label className="field">
            <span>Notes</span>
            <input
              placeholder="Door ajar, cone started…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </label>

          <div className="active-actions">
            <Button className="fs-btn--grow" variant="aux" disabled={!canLog} onClick={logReading}>
              Log reading
            </Button>
            <Button className="fs-btn--grow" variant="outline" onClick={onBackToDashboard}>
              Save & leave
            </Button>
          </div>

          <div className="cone-toggles">
            <h3>Cone events</h3>
            <p className="cone-toggles__hint">
              Flip on when it happens — time and last temp are saved. Flip off to undo.
            </p>
            <div className="cone-toggles__list">
              {coneToggles.map((def) => {
                const on = isConeOn(def.key)
                const event = (firing.coneEvents ?? []).find((e) => e.key === def.key)
                return (
                  <Toggle
                    key={def.key}
                    label={def.label}
                    hint={
                      on && event
                        ? `${event.clockTime ?? ''} · ${event.tempC}°C`
                        : def.hint
                    }
                    checked={on}
                    onChange={(e) => toggleCone(def, e.target.checked)}
                  />
                )
              })}
            </div>
          </div>

          <ReminderControls settings={reminders} onChange={onRemindersChange} />

          <div className="active-actions">
            <Button className="fs-btn--grow" variant="ghost" onClick={onEnd}>
              End firing → cooling
            </Button>
            <Button
              className="fs-btn--grow"
              variant="danger"
              onClick={() => setConfirmDeleteOpen(true)}
            >
              Delete firing
            </Button>
          </div>
        </section>
      )}

      {!isRunning && (
        <>
          <p className="wrap-up-lead">
            Kiln is off. Log cooling checks and results below — same as your paper cooling sheet.
            Come back anytime from History.
          </p>
          <EndOfFireForm firing={firing} onChange={onChange} />
          <div className="active-actions active-actions--solo">
            <Button className="fs-btn--grow" variant="primary" onClick={onBackToDashboard}>
              Done — dashboard
            </Button>
            <Button
              className="fs-btn--grow"
              variant="danger"
              onClick={() => setConfirmDeleteOpen(true)}
            >
              Delete firing
            </Button>
          </div>
        </>
      )}

      {firing.entries.length > 0 && (
        <section className="active-log" aria-label="Heating log">
          <h2>Heating log</h2>
          <ul>
            {firing.entries
              .slice()
              .reverse()
              .map((e) => (
                <li key={e.id}>
                  <span>
                    {e.clockTime} · dial {e.dial}
                  </span>
                  <strong>{e.tempC}°C</strong>
                  {e.kWh != null && <span>{e.kWh} kWh</span>}
                  {e.notes && <em>{e.notes}</em>}
                </li>
              ))}
          </ul>
        </section>
      )}

      {firing.entries.length > 0 && <TempChart entries={firing.entries} />}

      {isRunning && <FiringDetails firing={firing} />}
    </main>
  )
}
