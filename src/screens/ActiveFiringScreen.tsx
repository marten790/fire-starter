import { useEffect, useMemo, useState } from 'react'
import { Button } from '../components/Button'
import { TempChart } from '../components/TempChart'
import type { FiringType, HeatingLogEntry } from '../types/firing'
import './ActiveFiringScreen.css'

type Props = {
  firingType: FiringType
  onEnd: () => void
}

function formatElapsed(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function nowClock() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
}

export function ActiveFiringScreen({ firingType, onEnd }: Props) {
  const [startedAt] = useState(() => Date.now())
  const [elapsedSec, setElapsedSec] = useState(0)
  const [dial, setDial] = useState(1)
  const [tempC, setTempC] = useState('')
  const [kWh, setKWh] = useState('')
  const [notes, setNotes] = useState('')
  const [entries, setEntries] = useState<HeatingLogEntry[]>([])

  useEffect(() => {
    const id = window.setInterval(() => {
      setElapsedSec(Math.floor((Date.now() - startedAt) / 1000))
    }, 1000)
    return () => window.clearInterval(id)
  }, [startedAt])

  const lastTemp = entries.at(-1)?.tempC
  const label = firingType === 'bisque' ? 'Bisque · Cone 06' : 'Glaze · Cone 6 / 7'

  const canLog = useMemo(() => {
    const t = Number(tempC)
    return Number.isFinite(t) && t > 0
  }, [tempC])

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
    setEntries((prev) => [...prev, entry])
    setTempC('')
    setNotes('')
  }

  return (
    <main className="app-shell active">
      <header className="active-header">
        <p className="app-brand">Fire Starter</p>
        <p className="active-type">{label}</p>
        <p className="active-timer" aria-live="polite">
          {formatElapsed(elapsedSec)}
        </p>
        <p className="active-last">
          Last reading:{' '}
          {lastTemp != null ? <strong>{lastTemp}°C</strong> : '—'}
        </p>
      </header>

      <section className="active-form" aria-label="Log reading">
        <label className="field">
          <span>Dial (1–6)</span>
          <input
            type="number"
            min={1}
            max={6}
            step={0.5}
            value={dial}
            onChange={(e) => setDial(Number(e.target.value))}
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

        <Button className="fs-btn--block" variant="aux" disabled={!canLog} onClick={logReading}>
          Log reading
        </Button>
      </section>

      {entries.length > 0 && (
        <section className="active-log" aria-label="Heating log">
          <h2>Heating log</h2>
          <ul>
            {entries
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

      {entries.length > 0 && <TempChart entries={entries} />}

      <div className="active-footer">
        <Button className="fs-btn--block" variant="ghost" onClick={onEnd}>
          End firing (draft)
        </Button>
      </div>
    </main>
  )
}
