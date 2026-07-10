import { useEffect, useMemo, useState } from 'react'
import { Button } from '../components/Button'
import { FiringDetails } from '../components/FiringDetails'
import { TempChart } from '../components/TempChart'
import { formatElapsed } from '../lib/firings'
import type { FiringSession, HeatingLogEntry } from '../types/firing'
import './ActiveFiringScreen.css'

type Props = {
  firing: FiringSession
  onChange: (firing: FiringSession) => void
  onEnd: () => void
  onDelete: () => void
  onBackToDashboard: () => void
}

function nowClock() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
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

  useEffect(() => {
    if (!isRunning) {
      setElapsedSec(Math.floor(((firing.endedAt ?? Date.now()) - firing.startedAt) / 1000))
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

  function handleDelete() {
    if (!window.confirm(`Delete “${firing.name}”? This cannot be undone.`)) return
    onDelete()
  }

  return (
    <main className="app-shell active">
      <header className="active-header">
        <div className="active-nav">
          <button type="button" className="active-back" onClick={onBackToDashboard}>
            ← Back to dashboard
          </button>
          {!isRunning && <span className="active-status">Completed</span>}
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
          <Button className="fs-btn--block" variant="ghost" onClick={onEnd}>
            End firing
          </Button>
          <Button className="fs-btn--block" variant="danger" onClick={handleDelete}>
            Delete firing
          </Button>
        </section>
      )}

      {!isRunning && (
        <div className="active-actions active-actions--solo active-actions--stack">
          <Button className="fs-btn--block" variant="primary" onClick={onBackToDashboard}>
            Back to dashboard
          </Button>
          <Button className="fs-btn--block" variant="danger" onClick={handleDelete}>
            Delete firing
          </Button>
        </div>
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

      <FiringDetails firing={firing} />
    </main>
  )
}
