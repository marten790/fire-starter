export type FiringType = 'bisque' | 'glaze'

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
