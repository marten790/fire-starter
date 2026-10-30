import type { FiringType } from '../types/firing'
import { PAPER_FIRINGS } from './paperFirings'

export type ReferencePoint = {
  elapsedSeconds: number
  tempC: number
}

export type ReferenceCurve = {
  id: string
  type: FiringType
  label: string
  hint: string
  points: ReferencePoint[]
}

function clockToElapsedSeconds(startedAt: number, clockTime: string): number {
  const start = new Date(startedAt)
  const [hours, minutes] = clockTime.split(':').map(Number)
  const atClock = new Date(start)
  atClock.setHours(hours, minutes, 0, 0)
  if (atClock.getTime() < startedAt) atClock.setDate(atClock.getDate() + 1)
  return Math.round((atClock.getTime() - startedAt) / 1000)
}

function curveFromPaper(id: string, label: string, hint: string): ReferenceCurve {
  const firing = PAPER_FIRINGS.find((session) => session.id === id)
  if (!firing) {
    throw new Error(`Missing paper firing ${id}`)
  }

  const points: ReferencePoint[] = firing.entries.map((entry) => ({
    elapsedSeconds: clockToElapsedSeconds(firing.startedAt, entry.clockTime),
    tempC: entry.tempC,
  }))

  const soakTemp = firing.soakEnd?.tempC
  const soakClock = firing.soakEnd?.clockTime
  if (soakTemp != null && soakClock) {
    const elapsedSeconds = clockToElapsedSeconds(firing.startedAt, soakClock)
    const last = points.at(-1)
    if (!last || elapsedSeconds > last.elapsedSeconds + 60) {
      points.push({ elapsedSeconds, tempC: soakTemp })
    }
  }

  return { id, type: firing.type, label, hint, points }
}

/** Paper logs used as the on-screen comparison curves. */
export const REFERENCE_CURVES: Record<FiringType, ReferenceCurve> = {
  glaze: curveFromPaper(
    'paper-glaze-2025-11-19',
    '19 Nov glaze',
    'Colder day · cone 6/7',
  ),
  bisque: curveFromPaper(
    'paper-bisque-2024-03-30',
    '30 Mar bisque',
    'Cone 06 · door ajar first hours',
  ),
}

export function referenceCurveFor(type: FiringType): ReferenceCurve {
  return REFERENCE_CURVES[type]
}
