import type { FiringSession, FiringType } from '../types/firing'

const STORAGE_KEY = 'fire-starter.firings.v1'

function dateName(type: FiringType, when = new Date()) {
  const date = when.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
  const label = type === 'bisque' ? 'Bisque' : 'Glaze'
  return `${date} · ${label}`
}

export function loadFirings(): FiringSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as FiringSession[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveFirings(firings: FiringSession[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(firings))
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

export function peakTemp(firing: FiringSession) {
  if (firing.entries.length === 0) return null
  return Math.max(...firing.entries.map((e) => e.tempC))
}
