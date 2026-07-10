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

export type PhaseReading = {
  clockTime?: string
  dial?: number
  tempC?: number
  kWh?: number
  witnessCone?: string
  notes?: string
}

export type ConeEvent = {
  /** Stable id for toggle state, e.g. "06-down" */
  key?: string
  clockTime?: string
  tempC: number
  note: string
}

export type CoolingLogEntry = {
  label: string
  clockTime?: string
  tempC?: number
  notes?: string
}

export type FiringResults = {
  coneBottom?: string
  coneMid?: string
  coneTop?: string
  /** Combined string used by imported paper logs */
  coneBottomMidTop?: string
  clayOutcome?: string
  glazeOutcome?: string
  defects?: string
  adjustments?: string
  notes?: string
  rating?: number
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
  loadedBy?: string
  coneTarget?: string
  weatherNote?: string
  topTempC?: number
  soakStart?: PhaseReading
  soakEnd?: PhaseReading
  switchOff?: PhaseReading
  coneEvents?: ConeEvent[]
  coolingLog?: CoolingLogEntry[]
  results?: FiringResults
  source?: 'paper-import' | 'app'
}
