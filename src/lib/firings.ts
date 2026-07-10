import type {
  CoolingLogEntry,
  FiringSession,
  FiringType,
  PhaseReading,
} from '../types/firing'
import { PAPER_FIRINGS } from '../data/paperFirings'

const STORAGE_KEY = 'fire-starter.firings.v1'
const DELETED_PAPER_KEY = 'fire-starter.deleted-paper.v1'

export const DEFAULT_COOLING_LOG: CoolingLogEntry[] = [
  { label: '1 hr after off' },
  { label: '2 hrs' },
  { label: '4 hrs' },
  { label: '8 hrs' },
]

function dateName(type: FiringType, when = new Date()) {
  const date = when.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
  const label = type === 'bisque' ? 'Bisque' : 'Glaze'
  return `${date} · ${label}`
}

export function nowClock() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
}

function loadDeletedPaperIds(): Set<string> {
  try {
    const raw = localStorage.getItem(DELETED_PAPER_KEY)
    const parsed = raw ? (JSON.parse(raw) as string[]) : []
    return new Set(Array.isArray(parsed) ? parsed : [])
  } catch {
    return new Set()
  }
}

function saveDeletedPaperIds(ids: Set<string>) {
  localStorage.setItem(DELETED_PAPER_KEY, JSON.stringify([...ids]))
}

export function mergePaperLogs(existing: FiringSession[]): FiringSession[] {
  const deleted = loadDeletedPaperIds()
  const ids = new Set(existing.map((f) => f.id))
  const missing = PAPER_FIRINGS.filter((f) => !ids.has(f.id) && !deleted.has(f.id))
  if (missing.length === 0) return existing
  return [...existing, ...missing]
}

export function loadFirings(): FiringSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? (JSON.parse(raw) as FiringSession[]) : []
    const existing = Array.isArray(parsed) ? parsed : []
    const merged = mergePaperLogs(existing)
    if (merged.length !== existing.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
    }
    return merged
  } catch {
    return mergePaperLogs([])
  }
}

export function saveFirings(firings: FiringSession[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(firings))
}

export function rememberDeletedFiring(firingId: string) {
  if (!firingId.startsWith('paper-')) return
  const deleted = loadDeletedPaperIds()
  deleted.add(firingId)
  saveDeletedPaperIds(deleted)
}

export function createFiring(type: FiringType): FiringSession {
  const startedAt = Date.now()
  return {
    id: crypto.randomUUID(),
    type,
    status: 'running',
    name: dateName(type, new Date(startedAt)),
    startedAt,
    entries: [],
    dial: 1,
    loadedBy: 'LEA',
    coneTarget: type === 'bisque' ? 'Cone 06' : 'Cone 6/7',
    source: 'app',
  }
}

export function peakTemp(firing: FiringSession) {
  if (firing.entries.length === 0) return null
  return Math.max(...firing.entries.map((e) => e.tempC))
}

export function completeFiring(firing: FiringSession): FiringSession {
  const last = firing.entries.at(-1)
  const peak = peakTemp(firing) ?? undefined
  const switchOff: PhaseReading = firing.switchOff ?? {
    clockTime: nowClock(),
    dial: firing.dial,
    tempC: last?.tempC,
  }

  return {
    ...firing,
    status: 'completed',
    endedAt: firing.endedAt ?? Date.now(),
    topTempC: firing.topTempC ?? peak,
    switchOff,
    coolingLog:
      firing.coolingLog && firing.coolingLog.length > 0
        ? firing.coolingLog
        : DEFAULT_COOLING_LOG.map((row) => ({ ...row })),
    results: firing.results ?? {},
  }
}

export function getRunningFiring(firings: FiringSession[]) {
  return firings.find((f) => f.status === 'running')
}

export function getCompletedFirings(firings: FiringSession[]) {
  return firings
    .filter((f) => f.status === 'completed')
    .sort((a, b) => (b.endedAt ?? b.startedAt) - (a.endedAt ?? a.startedAt))
}

export function formatElapsed(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function paperLogCount() {
  return PAPER_FIRINGS.length
}
