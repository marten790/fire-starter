export type FiringType = 'bisque' | 'glaze'

export type HeatingLogEntry = {
  id: string
  elapsedMinutes: number
  clockTime: string
  dial: number
  tempC: number
  kWh?: number
  witnessCone?: string
  notes?: string
}
