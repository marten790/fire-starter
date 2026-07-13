import { useMemo, useRef, useState } from 'react'
import { BrandMark } from '../components/BrandMark'
import { Button } from '../components/Button'
import { ConfirmDialog } from '../components/ConfirmDialog'
import {
  exportFilename,
  firingsToHeatingCsv,
  shareOrDownloadFile,
} from '../lib/exportData'
import { formatElapsed, peakTemp } from '../lib/firings'
import {
  parseHeatingCsv,
  parseJsonBackup,
  readFileAsText,
} from '../lib/importData'
import type { FiringSession, FiringType } from '../types/firing'
import './HistoryScreen.css'

type Props = {
  history: FiringSession[]
  allFirings: FiringSession[]
  onOpenFiring: (id: string) => void
  onDeleteFiring: (id: string) => void
  onImportFirings: (firings: FiringSession[]) => { added: number; skipped: number }
}

type TypeFilter = 'all' | FiringType

function typeLabel(type: FiringSession['type']) {
  return type === 'bisque' ? 'Bisque · Cone 06' : 'Glaze · Cone 6 / 7'
}

function coneShort(type: FiringSession['type']) {
  return type === 'bisque' ? 'Cone 06' : 'Cone 6/7'
}

function toLocalDateKey(timestamp: number) {
  const d = new Date(timestamp)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function elapsedForCompleted(firing: FiringSession) {
  const end = firing.endedAt ?? firing.startedAt
  return Math.floor((end - firing.startedAt) / 1000)
}

export function HistoryScreen({
  history,
  allFirings,
  onOpenFiring,
  onDeleteFiring,
  onImportFirings,
}: Props) {
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [dateFilter, setDateFilter] = useState('')
  const [pendingDelete, setPendingDelete] = useState<FiringSession | null>(null)
  const [exportNote, setExportNote] = useState<string | null>(null)
  const [importNote, setImportNote] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const filteredHistory = useMemo(() => {
    return history.filter((firing) => {
      if (typeFilter !== 'all' && firing.type !== typeFilter) return false
      if (dateFilter && toLocalDateKey(firing.startedAt) !== dateFilter) return false
      return true
    })
  }, [history, typeFilter, dateFilter])

  const filtersActive = typeFilter !== 'all' || dateFilter !== ''

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
          : 'CSV downloaded.',
      )
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return
      setExportNote('Could not export CSV.')
    }
  }

  async function handleImportFile(file: File) {
    setImportNote(null)
    try {
      const text = await readFileAsText(file)
      const lower = file.name.toLowerCase()
      const parsed = lower.endsWith('.json')
        ? parseJsonBackup(text)
        : parseHeatingCsv(text)

      if (parsed.firings.length === 0) {
        setImportNote(
          parsed.errors[0] ?? 'No firings found in that file. Use a Firestarter CSV or JSON backup.',
        )
        return
      }

      const { added, skipped } = onImportFirings(parsed.firings)
      const warn =
        parsed.errors.length > 0 ? ` (${parsed.errors.length} row warning${parsed.errors.length === 1 ? '' : 's'})` : ''
      if (added === 0) {
        setImportNote(
          skipped > 0
            ? `Nothing new — ${skipped} firing${skipped === 1 ? '' : 's'} already in History.${warn}`
            : `Nothing imported.${warn}`,
        )
      } else {
        setImportNote(
          `Imported ${added} firing${added === 1 ? '' : 's'}${
            skipped > 0 ? ` · skipped ${skipped} duplicate${skipped === 1 ? '' : 's'}` : ''
          }.${warn}`,
        )
      }
    } catch {
      setImportNote('Could not read that file.')
    } finally {
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <main className="app-shell history-page">
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

      <input
        ref={fileRef}
        type="file"
        accept=".csv,.json,text/csv,application/json"
        className="history-file-input"
        aria-hidden="true"
        tabIndex={-1}
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) void handleImportFile(file)
        }}
      />

      <BrandMark
        compact
        title="History"
        subtitle="Jump into a past firing anytime to review readings, then come back here."
      />

      <section className="import-card" aria-label="Import firings">
        <div className="import-card__head">
          <div className="import-card__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
              <path
                d="M12 21V11m0 0 4 4m-4-4-4 4M5 9V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div>
            <h2>Import</h2>
            <p>
              Bring back a Firestarter CSV or JSON backup into History. Duplicates (same id) are
              skipped.
            </p>
          </div>
        </div>
        <div className="import-card__actions">
          <Button
            className="fs-btn--grow"
            variant="primary"
            onClick={() => fileRef.current?.click()}
          >
            Import CSV / backup
          </Button>
        </div>
        {importNote && <p className="history-note">{importNote}</p>}
      </section>

      <div className="history-toolbar">
        <label className="history-field">
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
        <label className="history-field">
          <span>Date</span>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </label>
        <Button
          className="history-export"
          variant="outline"
          disabled={allFirings.length === 0}
          onClick={() => void exportCsv()}
        >
          Export CSV
        </Button>
      </div>
      {filtersActive && (
        <button
          type="button"
          className="history-clear"
          onClick={() => {
            setTypeFilter('all')
            setDateFilter('')
          }}
        >
          Show all
        </button>
      )}
      {exportNote && <p className="history-note">{exportNote}</p>}

      {history.length === 0 ? (
        <p className="history-empty">No completed firings yet. Import a CSV backup above, or finish a fire.</p>
      ) : filteredHistory.length === 0 ? (
        <p className="history-empty">No firings match these filters.</p>
      ) : (
        <ul className="history-list">
          {filteredHistory.map((firing) => {
            const peak = peakTemp(firing)
            return (
              <li key={firing.id} className="history-row">
                <div className="history-row__badge">
                  <strong>{peak != null ? `${peak}°C` : '—'}</strong>
                  <span>{coneShort(firing.type)}</span>
                </div>
                <button
                  type="button"
                  className="history-row__body"
                  onClick={() => onOpenFiring(firing.id)}
                >
                  <strong>{firing.name}</strong>
                  <span>
                    {formatElapsed(elapsedForCompleted(firing))}
                    {peak != null ? ` · ${peak}°C peak` : ''} · {typeLabel(firing.type)}
                  </span>
                  <em>View details →</em>
                </button>
                <Button
                  className="fs-btn--sm"
                  variant="danger"
                  onClick={() => setPendingDelete(firing)}
                >
                  Delete
                </Button>
              </li>
            )
          })}
        </ul>
      )}
    </main>
  )
}
