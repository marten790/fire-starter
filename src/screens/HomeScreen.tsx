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
}

function typeLabel(type: FiringSession['type']) {
  return type === 'bisque' ? 'Bisque · Cone 06' : 'Glaze · Cone 6 / 7'
}

function elapsedFor(firing: FiringSession) {
  const end = firing.endedAt ?? Date.now()
  return Math.floor((end - firing.startedAt) / 1000)
}

export function HomeScreen({
  running,
  history,
  onStartBisque,
  onStartGlaze,
  onOpenFiring,
}: Props) {
  return (
    <main className="app-shell home">
      <header className="app-header">
        <p className="app-brand">Fire Starter</p>
        <p className="app-kiln">Kiln · Delores</p>
        <h1 className="home-title">Dashboard</h1>
        <p className="home-lead">
          Current firing, history of past runs, and start a new fire.
        </p>
      </header>

      {running && (
        <section className="dash-section" aria-label="Current firing">
          <h2>Currently running</h2>
          <button
            type="button"
            className="firing-card firing-card--live"
            onClick={() => onOpenFiring(running.id)}
          >
            <div className="firing-card__top">
              <span className="firing-card__badge">Live</span>
              <span>{typeLabel(running.type)}</span>
            </div>
            <strong className="firing-card__name">{running.name}</strong>
            <div className="firing-card__meta">
              <span>{formatElapsed(elapsedFor(running))}</span>
              <span>
                {peakTemp(running) != null ? `${peakTemp(running)}°C peak` : 'No readings yet'}
              </span>
              <span>{running.entries.length} logs</span>
            </div>
            <span className="firing-card__cta">Continue firing →</span>
          </button>
        </section>
      )}

      <section className="dash-section" aria-label="Start firing">
        <h2>{running ? 'New firing' : 'Ready to fire?'}</h2>
        {running ? (
          <p className="home-hint">End the current firing before starting another.</p>
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
              <li key={firing.id}>
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
                    <span>{formatElapsed(elapsedFor(firing))}</span>
                    <span>
                      {peakTemp(firing) != null ? `${peakTemp(firing)}°C peak` : 'No readings'}
                    </span>
                    <span>{firing.entries.length} logs</span>
                  </div>
                </button>
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
