import type { FiringSession } from '../types/firing'
import './FiringDetails.css'

type Props = {
  firing: FiringSession
}

export function FiringDetails({ firing }: Props) {
  const hasPhases = firing.topTempC || firing.soakStart || firing.soakEnd || firing.switchOff
  const hasCones = (firing.coneEvents?.length ?? 0) > 0
  const hasCooling = (firing.coolingLog?.length ?? 0) > 0
  const hasResults =
    firing.results &&
    Object.values(firing.results).some((v) => v != null && String(v).trim() !== '')

  if (
    !hasPhases &&
    !hasCones &&
    !hasCooling &&
    !hasResults &&
    !firing.weatherNote &&
    !firing.preStartChecklist?.length &&
    !firing.candling?.doorClosed &&
    !firing.candling?.peepholeClosed
  ) {
    return null
  }

  return (
    <section className="firing-details" aria-label="Firing details from log sheet">
      {firing.weatherNote && (
        <div className="firing-details__block">
          <p>Note: {firing.weatherNote}</p>
        </div>
      )}

      {firing.preStartChecklist && firing.preStartChecklist.length > 0 && (
        <div className="firing-details__block">
          <h2>Pre-start checklist</h2>
          <ul>
            {firing.preStartChecklist.map((item) => (
              <li key={item.key}>
                {item.checked ? '✓' : '○'} {item.label}
              </li>
            ))}
          </ul>
        </div>
      )}

      {(firing.candling?.doorClosed || firing.candling?.peepholeClosed) && (
        <div className="firing-details__block">
          <h2>Candling</h2>
          <ul>
            {firing.candling.doorClosed && (
              <li>
                Door closed
                {firing.candling.doorClosed.clockTime
                  ? ` · ${firing.candling.doorClosed.clockTime}`
                  : ''}
                {firing.candling.doorClosed.tempC != null
                  ? ` · ${firing.candling.doorClosed.tempC}°C`
                  : ''}
              </li>
            )}
            {firing.candling.peepholeClosed && (
              <li>
                Peephole closed
                {firing.candling.peepholeClosed.clockTime
                  ? ` · ${firing.candling.peepholeClosed.clockTime}`
                  : ''}
                {firing.candling.peepholeClosed.tempC != null
                  ? ` · ${firing.candling.peepholeClosed.tempC}°C`
                  : ''}
              </li>
            )}
          </ul>
        </div>
      )}

      {hasPhases && (
        <div className="firing-details__block">
          <h2>Peak & soak</h2>
          <ul>
            {firing.topTempC != null && <li>Top temp: {firing.topTempC}°C</li>}
            {firing.soakStart && (
              <li>
                Soak start
                {firing.soakStart.clockTime ? ` ${firing.soakStart.clockTime}` : ''}
                {firing.soakStart.tempC != null ? ` · ${firing.soakStart.tempC}°C` : ''}
                {firing.soakStart.dial != null ? ` · dial ${firing.soakStart.dial}` : ''}
              </li>
            )}
            {firing.soakEnd && (
              <li>
                Soak end
                {firing.soakEnd.clockTime ? ` ${firing.soakEnd.clockTime}` : ''}
                {firing.soakEnd.tempC != null ? ` · ${firing.soakEnd.tempC}°C` : ''}
                {firing.soakEnd.notes ? ` · ${firing.soakEnd.notes}` : ''}
              </li>
            )}
            {firing.switchOff && (
              <li>
                Switch off
                {firing.switchOff.clockTime ? ` ${firing.switchOff.clockTime}` : ''}
                {firing.switchOff.tempC != null ? ` · ${firing.switchOff.tempC}°C` : ''}
              </li>
            )}
          </ul>
        </div>
      )}

      {hasCones && (
        <div className="firing-details__block">
          <h2>Cone events</h2>
          <ul>
            {firing.coneEvents!.map((event, i) => (
              <li key={`${event.note}-${i}`}>
                {event.clockTime ? `${event.clockTime} · ` : ''}
                {event.tempC}°C — {event.note}
              </li>
            ))}
          </ul>
        </div>
      )}

      {hasCooling && (
        <div className="firing-details__block">
          <h2>Cooling log</h2>
          <ul>
            {firing.coolingLog!.map((row) => (
              <li key={row.label}>
                <span>{row.label}</span>
                {row.clockTime && <span> · {row.clockTime}</span>}
                {row.tempC != null && <strong> · {row.tempC}°C</strong>}
                {row.notes && <em> · {row.notes}</em>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {hasResults && firing.results && (
        <div className="firing-details__block">
          <h2>Results</h2>
          <ul>
            {firing.results.coneBottomMidTop && (
              <li>Witness cones (bottom/mid/top): {firing.results.coneBottomMidTop}</li>
            )}
            {(firing.results.coneBottom ||
              firing.results.coneMid ||
              firing.results.coneTop) && (
              <li>
                Witness cones — bottom: {firing.results.coneBottom || '—'} · mid:{' '}
                {firing.results.coneMid || '—'} · top: {firing.results.coneTop || '—'}
              </li>
            )}
            {firing.results.clayOutcome && <li>Clay body: {firing.results.clayOutcome}</li>}
            {firing.results.glazeOutcome && <li>Glaze: {firing.results.glazeOutcome}</li>}
            {firing.results.defects && <li>Defects: {firing.results.defects}</li>}
            {firing.results.adjustments && (
              <li>Adjustments next time: {firing.results.adjustments}</li>
            )}
            {firing.results.notes && <li>Notes: {firing.results.notes}</li>}
          </ul>
        </div>
      )}
    </section>
  )
}
