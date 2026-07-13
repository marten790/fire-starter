import { useEffect, useState } from 'react'
import { BrandMark } from '../components/BrandMark'
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
import './DashboardScreen.css'

type Props = {
  running?: FiringSession
  allFirings: FiringSession[]
  reminderNextDueAt?: number | null
  onStartFiring: (type: FiringType, checklist: PreStartChecklistItem[]) => void
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

export function DashboardScreen({
  running,
  allFirings,
  reminderNextDueAt = null,
  onStartFiring,
  onOpenFiring,
  onDeleteFiring,
}: Props) {
  const liveElapsed = useLiveElapsed(running?.startedAt, Boolean(running))
  const last = running?.entries.at(-1)
  const [pendingDelete, setPendingDelete] = useState<FiringSession | null>(null)
  const [checklistType, setChecklistType] = useState<FiringType | null>(null)
  const [now, setNow] = useState(Date.now())
  const [exportNote, setExportNote] = useState<string | null>(null)

  useEffect(() => {
    if (reminderNextDueAt == null) return
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [reminderNextDueAt])

  async function exportCsv() {
    setExportNote(null)
    try {
      const result = await shareOrDownloadFile(
        exportFilename('heating'),
        firingsToHeatingCsv(allFirings),
        'text/csv;charset=utf-8',
        'Firestarter CSV',
      )
      setExportNote(
        result === 'shared'
          ? 'CSV ready — pick WhatsApp in the share sheet.'
          : 'CSV downloaded. Share it from Files.',
      )
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return
      setExportNote('Could not export CSV. Try again.')
    }
  }

  async function exportBackup() {
    setExportNote(null)
    try {
      const result = await shareOrDownloadFile(
        exportFilename('backup'),
        firingsToJsonBackup(allFirings),
        'application/json',
        'Firestarter backup',
      )
      setExportNote(
        result === 'shared'
          ? 'Full backup ready — share via WhatsApp.'
          : 'Backup downloaded. Keep the .json file safe.',
      )
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return
      setExportNote('Could not export backup. Try again.')
    }
  }

  return (
    <main className="app-shell dash">
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
        onConfirm={() => {
          if (pendingDelete) onDeleteFiring(pendingDelete.id)
          setPendingDelete(null)
        }}
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

      <BrandMark />

      <section className="dash-block" aria-label="Current firing">
        <h2>Current firing</h2>
        {running ? (
          <div className="current-card current-card--active">
            <div className="current-card__top">
              <span className="status-pill status-pill--live">In Progress</span>
              <span className="current-card__type">{typeLabel(running.type)}</span>
            </div>
            <strong className="current-card__name">{running.name}</strong>
            <p className="current-card__timer" aria-live="polite">
              {formatElapsed(liveElapsed)}
            </p>
            <p className="current-card__hint">
              Leave and return as often as you need — the timer keeps running. Reminders nudge you
              while Firestarter is open.
            </p>
            <div className="current-card__meta">
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
              <span>Peak: {peakTemp(running) != null ? `${peakTemp(running)}°C` : '—'}</span>
              <span>
                {running.entries.length} log{running.entries.length === 1 ? '' : 's'}
              </span>
              {reminderNextDueAt != null && (
                <span>
                  Next check: <strong>{formatReminderCountdown(reminderNextDueAt, now)}</strong>
                </span>
              )}
            </div>
            <div className="current-card__actions">
              <Button className="fs-btn--grow" variant="aux" onClick={() => onOpenFiring(running.id)}>
                Enter reading / open firing
              </Button>
              <Button
                className="fs-btn--sm"
                variant="danger"
                onClick={() => setPendingDelete(running)}
              >
                Delete
              </Button>
            </div>
          </div>
        ) : (
          <div className="empty-card">
            <div className="empty-card__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                <path d="M12 22c4-4.5 6-8 6-11a6 6 0 1 0-12 0c0 3 2 6.5 6 11Z" />
              </svg>
            </div>
            <div>
              <p className="empty-card__title">No firing in progress</p>
              <p className="empty-card__sub">Start a firing or glaze bake whenever you&apos;re ready.</p>
            </div>
          </div>
        )}
      </section>

      <hr className="dash-rule" />

      <section className="dash-block" aria-label="Start a firing">
        <h2>Start a firing</h2>
        {running ? (
          <p className="dash-hint">
            A firing is already running. Open it above, or end it before starting another.
          </p>
        ) : (
          <div className="start-grid">
            <button
              type="button"
              className="start-card start-card--primary"
              onClick={() => setChecklistType('bisque')}
            >
              <span className="start-card__play" aria-hidden="true">
                ▶
              </span>
              <span className="start-card__copy">
                <strong>Start bisque - Cone 06</strong>
                <em>Common bisque firing</em>
              </span>
            </button>
            <button
              type="button"
              className="start-card start-card--outline"
              onClick={() => setChecklistType('glaze')}
            >
              <span className="start-card__play" aria-hidden="true">
                ▶
              </span>
              <span className="start-card__copy">
                <strong>Start glaze - Cone 6 / 7</strong>
                <em>Glaze firing</em>
              </span>
            </button>
          </div>
        )}
      </section>

      <hr className="dash-rule" />

      <section className="export-card" aria-label="Export data">
        <div className="export-card__head">
          <div className="export-card__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
              <path
                d="M12 3v10m0 0 4-4m-4 4-4-4M5 15v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div>
            <h2>Export</h2>
            <p>Save a copy to WhatsApp before updates.</p>
          </div>
        </div>
        <div className="export-card__actions">
          <Button
            className="fs-btn--grow"
            variant="primary"
            disabled={allFirings.length === 0}
            onClick={() => void exportCsv()}
          >
            Export CSV
          </Button>
          <Button
            className="fs-btn--grow"
            variant="outline"
            disabled={allFirings.length === 0}
            onClick={() => void exportBackup()}
          >
            Full backup
          </Button>
        </div>
        {exportNote && <p className="export-card__note">{exportNote}</p>}
      </section>
    </main>
  )
}
