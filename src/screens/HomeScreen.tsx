import { useEffect, useState } from 'react'
import { Button } from '../components/Button'
import { formatElapsed, peakTemp } from '../lib/firings'
import type { FiringSession } from '../types/firing'
import './HomeScreen.css'

type Props = {
  running?: FiringSession
  history: FiringSession[]
  onStartBisque: () => void
  onStartGlaze: () => void
  onOpenFiring: (id: string) => void
  onDeleteFiring: (id: string) => void
}

function typeLabel(type: FiringSession['type']) {
  return type === 'bisque' ? 'Bisque · Cone 06' : 'Glaze · Cone 6 / 7'
}

function useLiveElapsed(startedAt?: number, active = false) {
  const [elapsed, setElapsed] = useState(() =>
    startedAt ? Math.floor((Date.now() - startedAt) / 1000) : 0,
  )

  useEffect(() => {
    if (!active || !startedAt) return
    const tick = () => setElapsed(Math.floor((Date.now() - startedAt) / 1000))
    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [startedAt, active])

  return elapsed
}

function elapsedForCompleted(firing: FiringSession) {
  const end = firing.endedAt ?? firing.startedAt
  return Math.floor((end - firing.startedAt) / 1000)
}

function confirmDelete(name: string) {
  return window.confirm(
    `Delete “${name}”? This cannot be undone.`,
  )
}

export function HomeScreen({
  running,
  history,
  onStartBisque,
  onStartGlaze,
  onOpenFiring,
  onDeleteFiring,
}: Props) {
  const liveElapsed = useLiveElapsed(running?.startedAt, Boolean(running))
  const last = running?.entries.at(-1)

  function handleDelete(firing: FiringSession) {
    if (!confirmDelete(firing.name)) return
    onDeleteFiring(firing.id)
  }

  return (
    <main className="app-shell home">
      <header className="app-header">
        <p className="app-brand">Fire Starter</p>
        <p className="app-kiln">Kiln · Delores</p>
        <h1 className="home-title">Dashboard</h1>
        <p className="home-lead">
          Jump into the current firing anytime to log readings, then come back here.
        </p>
      </header>

      <section className="dash-section current-firing" aria-label="Current firing">
        <h2>Current firing</h2>

        {running ? (
          <div className="current-panel">
            <div className="current-panel__status">
              <span className="firing-card__badge">In progress</span>
              <span>{typeLabel(running.type)}</span>
            </div>
            <strong className="current-panel__name">{running.name}</strong>
            <p className="current-panel__timer" aria-live="polite">
              {formatElapsed(liveElapsed)}
            </p>
            <div className="current-panel__meta">
              <span>
                Last:{' '}
                {last ? (
                  <strong>
                    {last.tempC}°C · dial {last.dial}
                  </strong>
                ) : (
                  'no readings yet'
                )}
              </span>
              <span>
                Peak:{' '}
                {peakTemp(running) != null ? `${peakTemp(running)}°C` : '—'}
              </span>
              <span>{running.entries.length} log{running.entries.length === 1 ? '' : 's'}</span>
            </div>
            <p className="current-panel__hint">
              Leave and return as often as you need — the timer keeps running.
            </p>
            <div className="current-panel__actions">
              <Button
                className="fs-btn--grow"
                variant="aux"
                onClick={() => onOpenFiring(running.id)}
              >
                Enter reading / open firing
              </Button>
              <Button
                className="fs-btn--grow"
                variant="danger"
                onClick={() => handleDelete(running)}
              >
                Delete
              </Button>
            </div>
          </div>
        ) : (
          <div className="current-panel current-panel--empty">
            <p className="home-hint">No firing in progress.</p>
            <p className="home-hint">Start a bisque or glaze below when you&apos;re ready.</p>
          </div>
        )}
      </section>

      <section className="dash-section" aria-label="Start firing">
        <h2>Start a firing</h2>
        {running ? (
          <p className="home-hint">
            A firing is already running. Open it above to log info, or end it from inside the
            firing screen before starting another.
          </p>
        ) : (
          <div className="app-actions">
            <Button className="fs-btn--block" variant="primary" onClick={onStartBisque}>
              Start bisque · Cone 06
            </Button>
            <Button className="fs-btn--block" variant="outline" onClick={onStartGlaze}>
              Start glaze · Cone 6 / 7
            </Button>
          </div>
        )}
      </section>

      <section className="dash-section" aria-label="Firing history">
        <h2>History</h2>
        {history.length === 0 ? (
          <p className="home-hint">No completed firings yet. Finished runs will show up here.</p>
        ) : (
          <ul className="history-list">
            {history.map((firing) => (
              <li key={firing.id} className="history-item">
                <button
                  type="button"
                  className="firing-card"
                  onClick={() => onOpenFiring(firing.id)}
                >
                  <div className="firing-card__top">
                    <span className="firing-card__badge firing-card__badge--done">Done</span>
                    <span>{typeLabel(firing.type)}</span>
                  </div>
                  <strong className="firing-card__name">{firing.name}</strong>
                  <div className="firing-card__meta">
                    <span>{formatElapsed(elapsedForCompleted(firing))}</span>
                    <span>
                      {peakTemp(firing) != null ? `${peakTemp(firing)}°C peak` : 'No readings'}
                    </span>
                    <span>{firing.entries.length} logs</span>
                  </div>
                  <span className="firing-card__cta">View details →</span>
                </button>
                <Button
                  className="history-item__delete"
                  variant="danger"
                  onClick={() => handleDelete(firing)}
                >
                  Delete
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="app-meta" aria-label="Kiln summary">
        <p>Elements: ~7 firings since replacement</p>
        <p>Meter: thermocouple °C · Dial: 1–6</p>
      </section>
    </main>
  )
}
