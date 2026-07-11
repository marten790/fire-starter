import { useEffect, useMemo, useState } from 'react'
import { Button } from '../components/Button'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { PreStartChecklist } from '../components/PreStartChecklist'
import {
  exportFilename,
  firingsToHeatingCsv,
  firingsToJsonBackup,
  shareOrDownloadFile,
} from '../lib/exportData'
import { formatElapsed, peakTemp } from '../lib/firings'
import { formatReminderCountdown } from '../lib/reminders'
import type { FiringSession, FiringType, PreStartChecklistItem } from '../types/firing'
import './HomeScreen.css'

type Props = {
  running?: FiringSession
  history: FiringSession[]
  /** All firings for export (running + completed) */
  allFirings: FiringSession[]
  reminderNextDueAt?: number | null
  onStartFiring: (type: FiringType, checklist: PreStartChecklistItem[]) => void
  onOpenFiring: (id: string) => void
  onDeleteFiring: (id: string) => void
}

type TypeFilter = 'all' | FiringType

function typeLabel(type: FiringSession['type']) {
  return type === 'bisque' ? 'Bisque · Cone 06' : 'Glaze · Cone 6 / 7'
}

function toLocalDateKey(timestamp: number) {
  const d = new Date(timestamp)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
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

export function HomeScreen({
  running,
  history,
  allFirings,
  reminderNextDueAt = null,
  onStartFiring,
  onOpenFiring,
  onDeleteFiring,
}: Props) {
  const liveElapsed = useLiveElapsed(running?.startedAt, Boolean(running))
  const last = running?.entries.at(-1)
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [dateFilter, setDateFilter] = useState('')
  const [pendingDelete, setPendingDelete] = useState<FiringSession | null>(null)
  const [checklistType, setChecklistType] = useState<FiringType | null>(null)
  const [now, setNow] = useState(Date.now())
  const [exportNote, setExportNote] = useState<string | null>(null)

  useEffect(() => {
    if (reminderNextDueAt == null) return
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [reminderNextDueAt])

  const filteredHistory = useMemo(() => {
    return history.filter((firing) => {
      if (typeFilter !== 'all' && firing.type !== typeFilter) return false
      if (dateFilter && toLocalDateKey(firing.startedAt) !== dateFilter) return false
      return true
    })
  }, [history, typeFilter, dateFilter])

  const filtersActive = typeFilter !== 'all' || dateFilter !== ''

  function clearFilters() {
    setTypeFilter('all')
    setDateFilter('')
  }

  function confirmPendingDelete() {
    if (!pendingDelete) return
    onDeleteFiring(pendingDelete.id)
    setPendingDelete(null)
  }

  async function exportCsv() {
    setExportNote(null)
    try {
      const result = await shareOrDownloadFile(
        exportFilename('heating'),
        firingsToHeatingCsv(allFirings),
        'text/csv;charset=utf-8',
        'Fire Starter CSV',
      )
      setExportNote(
        result === 'shared'
          ? 'CSV ready — pick WhatsApp (or Files) in the share sheet.'
          : 'CSV downloaded. Open Files / Downloads and send it on WhatsApp.',
      )
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return
      setExportNote('Could not export CSV. Try again, or use Safari → Share.')
    }
  }

  async function exportBackup() {
    setExportNote(null)
    try {
      const result = await shareOrDownloadFile(
        exportFilename('backup'),
        firingsToJsonBackup(allFirings),
        'application/json',
        'Fire Starter backup',
      )
      setExportNote(
        result === 'shared'
          ? 'Full backup ready — share via WhatsApp to keep a copy.'
          : 'Backup downloaded. Keep the .json file somewhere safe.',
      )
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return
      setExportNote('Could not export backup. Try again.')
    }
  }

  return (
    <main className="app-shell home">
      <ConfirmDialog
        open={pendingDelete != null}
        title="Delete firing?"
        message={
          pendingDelete
            ? `Delete “${pendingDelete.name}”? This removes the log, graph, and notes permanently.`
            : ''
        }
        confirmLabel="Delete"
        cancelLabel="Keep it"
        onConfirm={confirmPendingDelete}
        onCancel={() => setPendingDelete(null)}
      />

      <PreStartChecklist
        open={checklistType != null}
        type={checklistType}
        onCancel={() => setChecklistType(null)}
        onConfirm={(items) => {
          if (!checklistType) return
          const type = checklistType
          setChecklistType(null)
          onStartFiring(type, items)
        }}
      />

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
              <span>
                {running.entries.length} log{running.entries.length === 1 ? '' : 's'}
              </span>
              {reminderNextDueAt != null && (
                <span>
                  Next check:{' '}
                  <strong>{formatReminderCountdown(reminderNextDueAt, now)}</strong>
                </span>
              )}
            </div>
            <p className="current-panel__hint">
              Leave and return as often as you need — the timer keeps running. Reminders nudge you
              while Fire Starter is open.
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
                onClick={() => setPendingDelete(running)}
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
            <Button
              className="fs-btn--block"
              variant="primary"
              onClick={() => setChecklistType('bisque')}
            >
              Start bisque · Cone 06
            </Button>
            <Button
              className="fs-btn--block"
              variant="outline"
              onClick={() => setChecklistType('glaze')}
            >
              Start glaze · Cone 6 / 7
            </Button>
          </div>
        )}
      </section>

      <section className="dash-section" aria-label="Firing history">
        <h2>History</h2>

        {history.length > 0 && (
          <div className="history-filters">
            <label className="history-filters__field">
              <span>Type</span>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
              >
                <option value="all">All types</option>
                <option value="bisque">Bisque</option>
                <option value="glaze">Glaze</option>
              </select>
            </label>
            <label className="history-filters__field">
              <span>Date</span>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </label>
            {filtersActive && (
              <button type="button" className="history-filters__clear" onClick={clearFilters}>
                Show all
              </button>
            )}
          </div>
        )}

        {history.length === 0 ? (
          <p className="home-hint">No completed firings yet. Finished runs will show up here.</p>
        ) : filteredHistory.length === 0 ? (
          <p className="home-hint">
            No firings match these filters.{' '}
            <button type="button" className="history-filters__link" onClick={clearFilters}>
              Show all
            </button>
          </p>
        ) : (
          <ul className="history-list">
            {filteredHistory.map((firing) => (
              <li key={firing.id} className="firing-card history-card">
                <div className="history-card__header">
                  <div className="firing-card__top">
                    <span className="firing-card__badge firing-card__badge--done">Done</span>
                    <span>{typeLabel(firing.type)}</span>
                  </div>
                  <button
                    type="button"
                    className="history-card__delete"
                    onClick={() => setPendingDelete(firing)}
                    aria-label={`Delete ${firing.name}`}
                  >
                    Delete
                  </button>
                </div>
                <button
                  type="button"
                  className="history-card__body"
                  onClick={() => onOpenFiring(firing.id)}
                >
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
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="dash-section" aria-label="Export data">
        <h2>Export / backup</h2>
        <p className="home-hint">
          Save a copy before updating the app, or send it to yourself on WhatsApp. Data stays on
          this iPad unless you clear Safari site data — export is the safe copy.
        </p>
        <div className="app-actions">
          <Button
            className="fs-btn--block"
            variant="outline"
            disabled={allFirings.length === 0}
            onClick={() => void exportCsv()}
          >
            Export CSV (readings)
          </Button>
          <Button
            className="fs-btn--block"
            variant="ghost"
            disabled={allFirings.length === 0}
            onClick={() => void exportBackup()}
          >
            Export full backup (JSON)
          </Button>
        </div>
        {exportNote && <p className="export-note">{exportNote}</p>}
      </section>

      <section className="app-meta" aria-label="Kiln summary">
        <p>Elements: ~7 firings since replacement</p>
        <p>Meter: thermocouple °C · Dial: 1–6</p>
      </section>
    </main>
  )
}
