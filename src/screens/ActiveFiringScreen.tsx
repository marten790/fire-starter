import { useEffect, useMemo, useState } from 'react'
import { Button } from '../components/Button'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { EndOfFireForm } from '../components/EndOfFireForm'
import { FiringDetails } from '../components/FiringDetails'
import { TempChart } from '../components/TempChart'
import { formatElapsed, DEFAULT_COOLING_LOG, nowClock } from '../lib/firings'
import type { ConeEvent, FiringSession, HeatingLogEntry } from '../types/firing'
import './ActiveFiringScreen.css'

type Props = {
  firing: FiringSession
  onChange: (firing: FiringSession) => void
  onEnd: () => void
  onDelete: () => void
  onBackToDashboard: () => void
}

export function ActiveFiringScreen({
  firing,
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
  const [coneNote, setConeNote] = useState('')
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
    setTempC('')
    setNotes('')
  }

  function updateDial(next: number) {
    setDial(next)
    onChange({ ...firing, dial: next })
  }

  function addConeEvent(preset?: string) {
    const note = (preset ?? coneNote).trim()
    if (!note) return
    const event: ConeEvent = {
      clockTime: nowClock(),
      tempC: lastTemp ?? (Number(tempC) || 0),
      note,
    }
    onChange({
      ...firing,
      coneEvents: [...(firing.coneEvents ?? []), event],
    })
    setConeNote('')
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

          <div className="cone-quick">
            <h3>Cone events</h3>
            <div className="cone-quick__presets">
              <button type="button" onClick={() => addConeEvent('Cone started to fall')}>
                Started
              </button>
              <button type="button" onClick={() => addConeEvent('Cone down')}>
                Down
              </button>
              {firing.type === 'glaze' && (
                <button type="button" onClick={() => addConeEvent('Cone 6 started — begin soak')}>
                  Cone 6 → soak
                </button>
              )}
            </div>
            <div className="cone-quick__custom">
              <input
                placeholder="Custom cone note"
                value={coneNote}
                onChange={(e) => setConeNote(e.target.value)}
              />
              <Button variant="outline" disabled={!coneNote.trim()} onClick={() => addConeEvent()}>
                Add
              </Button>
            </div>
          </div>

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

      {(firing.coneEvents?.length ?? 0) > 0 && isRunning && (
        <section className="active-log" aria-label="Cone events">
          <h2>Cone events</h2>
          <ul>
            {[...(firing.coneEvents ?? [])].reverse().map((event, i) => (
              <li key={`${event.note}-${i}`}>
                <span>
                  {event.clockTime} · {event.tempC}°C
                </span>
                <strong>{event.note}</strong>
              </li>
            ))}
          </ul>
        </section>
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
