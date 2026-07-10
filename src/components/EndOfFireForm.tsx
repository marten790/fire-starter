import { Button } from './Button'
import { nowClock } from '../lib/firings'
import type {
  CoolingLogEntry,
  FiringResults,
  FiringSession,
  PhaseReading,
} from '../types/firing'
import './EndOfFireForm.css'

type Props = {
  firing: FiringSession
  onChange: (firing: FiringSession) => void
}

export function EndOfFireForm({ firing, onChange }: Props) {
  const lastTemp = firing.entries.at(-1)?.tempC
  const results = firing.results ?? {}
  const cooling = firing.coolingLog ?? []

  function patch(partial: Partial<FiringSession>) {
    onChange({ ...firing, ...partial })
  }

  function markPhase(key: 'soakStart' | 'soakEnd' | 'switchOff') {
    const existing = firing[key]
    patch({
      [key]: {
        clockTime: nowClock(),
        dial: existing?.dial ?? firing.dial,
        tempC: existing?.tempC ?? lastTemp,
        notes: existing?.notes,
        kWh: existing?.kWh,
        witnessCone: existing?.witnessCone,
      },
      ...(key === 'switchOff'
        ? { topTempC: firing.topTempC ?? lastTemp }
        : {}),
    })
  }

  function updatePhase(
    key: 'soakStart' | 'soakEnd' | 'switchOff',
    field: keyof PhaseReading,
    value: string,
  ) {
    const current = firing[key] ?? {}
    const next: PhaseReading = { ...current }
    if (field === 'clockTime' || field === 'notes' || field === 'witnessCone') {
      next[field] = value
    } else if (field === 'dial' || field === 'tempC' || field === 'kWh') {
      next[field] = value === '' ? undefined : Number(value)
    }
    patch({ [key]: next })
  }

  function updateCooling(index: number, field: keyof CoolingLogEntry, value: string) {
    const next = cooling.map((row, i) => {
      if (i !== index) return row
      if (field === 'tempC') {
        return { ...row, tempC: value === '' ? undefined : Number(value) }
      }
      return { ...row, [field]: value }
    })
    patch({ coolingLog: next })
  }

  function updateResults(field: keyof FiringResults, value: string) {
    patch({
      results: {
        ...results,
        [field]: value,
      },
    })
  }

  return (
    <section className="end-fire" aria-label="End of firing">
      <div className="end-fire__block">
        <h2>Peak & soak</h2>
        <p className="end-fire__hint">
          Mark soak when cone 6 starts bending (glaze). Bisque usually skips soak.
        </p>

        <div className="end-fire__phase-actions">
          <Button variant="outline" onClick={() => markPhase('soakStart')}>
            {firing.soakStart ? 'Update soak start' : 'Soak start'}
          </Button>
          <Button variant="outline" onClick={() => markPhase('soakEnd')}>
            {firing.soakEnd ? 'Update soak end' : 'Soak end'}
          </Button>
          <Button variant="aux" onClick={() => markPhase('switchOff')}>
            {firing.switchOff ? 'Update switch off' : 'Switch off'}
          </Button>
        </div>

        <label className="field">
          <span>Top temp °C</span>
          <input
            inputMode="decimal"
            value={firing.topTempC ?? ''}
            onChange={(e) =>
              patch({
                topTempC: e.target.value === '' ? undefined : Number(e.target.value),
              })
            }
          />
        </label>

        {(['soakStart', 'soakEnd', 'switchOff'] as const).map((key) => {
          const phase = firing[key]
          if (!phase) return null
          const title =
            key === 'soakStart' ? 'Soak start' : key === 'soakEnd' ? 'Soak end' : 'Switch off'
          return (
            <div key={key} className="end-fire__phase">
              <h3>{title}</h3>
              <div className="end-fire__row">
                <label className="field">
                  <span>Time</span>
                  <input
                    value={phase.clockTime ?? ''}
                    onChange={(e) => updatePhase(key, 'clockTime', e.target.value)}
                  />
                </label>
                <label className="field">
                  <span>Dial</span>
                  <input
                    type="number"
                    min={1}
                    max={6}
                    step={0.5}
                    value={phase.dial ?? ''}
                    onChange={(e) => updatePhase(key, 'dial', e.target.value)}
                  />
                </label>
                <label className="field">
                  <span>°C</span>
                  <input
                    inputMode="decimal"
                    value={phase.tempC ?? ''}
                    onChange={(e) => updatePhase(key, 'tempC', e.target.value)}
                  />
                </label>
              </div>
            </div>
          )
        })}
      </div>

      <div className="end-fire__block">
        <h2>Cooling log</h2>
        <p className="end-fire__hint">Open kiln around 150°C. Fill rows as you check.</p>
        <ul className="end-fire__cooling">
          {cooling.map((row, index) => (
            <li key={row.label}>
              <strong>{row.label}</strong>
              <div className="end-fire__row">
                <label className="field">
                  <span>Time</span>
                  <div className="end-fire__time-row">
                    <input
                      value={row.clockTime ?? ''}
                      onChange={(e) => updateCooling(index, 'clockTime', e.target.value)}
                      placeholder="hh:mm"
                    />
                    <button
                      type="button"
                      className="end-fire__now"
                      onClick={() => updateCooling(index, 'clockTime', nowClock())}
                    >
                      Now
                    </button>
                  </div>
                </label>
                <label className="field">
                  <span>°C</span>
                  <input
                    inputMode="decimal"
                    value={row.tempC ?? ''}
                    onChange={(e) => updateCooling(index, 'tempC', e.target.value)}
                  />
                </label>
              </div>
              <label className="field">
                <span>Notes</span>
                <input
                  value={row.notes ?? ''}
                  onChange={(e) => updateCooling(index, 'notes', e.target.value)}
                />
              </label>
            </li>
          ))}
        </ul>
      </div>

      <div className="end-fire__block">
        <h2>Results</h2>
        <div className="end-fire__row end-fire__row--cones">
          <label className="field">
            <span>Cone bottom</span>
            <input
              value={results.coneBottom ?? ''}
              onChange={(e) => updateResults('coneBottom', e.target.value)}
              placeholder="e.g. 5"
            />
          </label>
          <label className="field">
            <span>Cone mid</span>
            <input
              value={results.coneMid ?? ''}
              onChange={(e) => updateResults('coneMid', e.target.value)}
              placeholder="e.g. 6+7"
            />
          </label>
          <label className="field">
            <span>Cone top</span>
            <input
              value={results.coneTop ?? ''}
              onChange={(e) => updateResults('coneTop', e.target.value)}
              placeholder="e.g. 7"
            />
          </label>
        </div>
        <label className="field">
          <span>Clay body outcome</span>
          <input
            value={results.clayOutcome ?? ''}
            onChange={(e) => updateResults('clayOutcome', e.target.value)}
            placeholder="GOOD"
          />
        </label>
        <label className="field">
          <span>Glaze outcome</span>
          <input
            value={results.glazeOutcome ?? ''}
            onChange={(e) => updateResults('glazeOutcome', e.target.value)}
            placeholder="GOOD / pinholes…"
          />
        </label>
        <label className="field">
          <span>Defects / notes</span>
          <input
            value={results.defects ?? ''}
            onChange={(e) => updateResults('defects', e.target.value)}
          />
        </label>
        <label className="field">
          <span>Adjustments for next firing</span>
          <textarea
            rows={3}
            value={results.adjustments ?? ''}
            onChange={(e) => updateResults('adjustments', e.target.value)}
            placeholder="Extra shelf at bottom, longer soak…"
          />
        </label>
        <label className="field">
          <span>Notes</span>
          <textarea
            rows={3}
            value={results.notes ?? ''}
            onChange={(e) => updateResults('notes', e.target.value)}
          />
        </label>
      </div>
    </section>
  )
}
