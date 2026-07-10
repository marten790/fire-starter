export type FiringType = 'bisque' | 'glaze'
export type FiringStatus = 'running' | 'completed'

export type HeatingLogEntry = {
  id: string
  elapsedMinutes: number
  /** Precise elapsed time for graphing */
  elapsedSeconds: number
  clockTime: string
  dial: number
  tempC: number
  kWh?: number
  witnessCone?: string
  notes?: string
}

export type FiringSession = {
  id: string
  type: FiringType
  status: FiringStatus
  /** Date-based display name, e.g. "10 Jul 2026 · Bisque" */
  name: string
  startedAt: number
  endedAt?: number
  entries: HeatingLogEntry[]
  dial: number
}
