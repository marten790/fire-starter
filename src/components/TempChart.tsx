import { useMemo } from 'react'
import { referenceCurveFor } from '../data/referenceCurves'
import type { FiringType, HeatingLogEntry } from '../types/firing'
import './TempChart.css'

type Props = {
  entries: HeatingLogEntry[]
  firingType: FiringType
}

type ChartPoint = {
  elapsedSeconds: number
  tempC: number
}

function formatAxisMinutes(minutes: number) {
  if (minutes < 60) return `${Math.round(minutes)}m`
  const h = Math.floor(minutes / 60)
  const m = Math.round(minutes % 60)
  return m === 0 ? `${h}h` : `${h}h${m}m`
}

function lineFromCoords(coords: { cx: number; cy: number }[]) {
  if (coords.length < 2) return ''
  return coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.cx} ${c.cy}`).join(' ')
}

export function TempChart({ entries, firingType }: Props) {
  const reference = referenceCurveFor(firingType)

  const chart = useMemo(() => {
    const current: ChartPoint[] = entries.map((entry) => ({
      elapsedSeconds: entry.elapsedSeconds,
      tempC: entry.tempC,
    }))
    const width = 640
    const height = 240
    const pad = { top: 20, right: 16, bottom: 36, left: 48 }
    const innerW = width - pad.left - pad.right
    const innerH = height - pad.top - pad.bottom

    const allPoints = [...reference.points, ...current]
    const maxX = Math.max(
      60,
      ...allPoints.map((point) => point.elapsedSeconds / 60),
    )
    const minY = 0
    const maxY = Math.max(100, ...allPoints.map((point) => point.tempC)) * 1.08

    const toX = (xMin: number) => pad.left + (xMin / maxX) * innerW
    const toY = (temp: number) =>
      pad.top + innerH - ((temp - minY) / (maxY - minY)) * innerH

    const mapSeries = (points: ChartPoint[]) =>
      points.map((point) => ({
        cx: toX(point.elapsedSeconds / 60),
        cy: toY(point.tempC),
        label: `${Math.round(point.tempC)}°C`,
      }))

    const refCoords = mapSeries(reference.points)
    const nowCoords = mapSeries(current)
    const nowLine = lineFromCoords(nowCoords)
    const nowArea =
      nowCoords.length > 1
        ? `${nowLine} L ${nowCoords[nowCoords.length - 1].cx} ${pad.top + innerH} L ${nowCoords[0].cx} ${pad.top + innerH} Z`
        : ''

    const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => {
      const value = minY + (maxY - minY) * t
      return { value, y: toY(value) }
    })

    const hourMax = Math.max(1, Math.ceil(maxX / 60))
    const step = hourMax > 8 ? 2 : 1
    const xTicks: { value: number; x: number }[] = []
    for (let hour = 0; hour <= hourMax; hour += step) {
      const value = hour * 60
      if (value <= maxX + 1) xTicks.push({ value, x: toX(value) })
    }

    return {
      width,
      height,
      pad,
      refCoords,
      refLine: lineFromCoords(refCoords),
      nowCoords,
      nowLine,
      nowArea,
      yTicks,
      xTicks,
      nowCount: current.length,
    }
  }, [entries, reference.points])

  return (
    <section className="temp-chart" aria-label="Temperature graph">
      <div className="temp-chart__header">
        <div>
          <h2>Temperature</h2>
          <p>
            This firing vs {reference.label}
            {chart.nowCount === 0 ? ' — log readings to overlay' : ''}
          </p>
        </div>
        <ul className="temp-chart__legend">
          <li>
            <span className="temp-chart__swatch temp-chart__swatch--ref" />
            {reference.label}
          </li>
          <li>
            <span className="temp-chart__swatch temp-chart__swatch--now" />
            This firing
          </li>
        </ul>
      </div>
      <svg
        className="temp-chart__svg"
        viewBox={`0 0 ${chart.width} ${chart.height}`}
        role="img"
        aria-label={`Temperature chart comparing this firing with ${reference.label}`}
      >
        {chart.yTicks.map((tick) => (
          <g key={`y-${tick.value}`}>
            <line
              x1={chart.pad.left}
              x2={chart.width - chart.pad.right}
              y1={tick.y}
              y2={tick.y}
              className="temp-chart__grid"
            />
            <text x={chart.pad.left - 8} y={tick.y + 4} className="temp-chart__axis" textAnchor="end">
              {Math.round(tick.value)}
            </text>
          </g>
        ))}

        {chart.xTicks.map((tick) => (
          <text
            key={`x-${tick.value}`}
            x={tick.x}
            y={chart.height - 10}
            className="temp-chart__axis"
            textAnchor="middle"
          >
            {formatAxisMinutes(tick.value)}
          </text>
        ))}

        {chart.refLine && <path d={chart.refLine} className="temp-chart__line temp-chart__line--ref" />}
        {chart.refCoords.map((coord, i) => (
          <circle
            key={`ref-${i}`}
            cx={coord.cx}
            cy={coord.cy}
            r={3.5}
            className="temp-chart__dot temp-chart__dot--ref"
          />
        ))}

        {chart.nowArea && <path d={chart.nowArea} className="temp-chart__area" />}
        {chart.nowLine && <path d={chart.nowLine} className="temp-chart__line" />}

        {chart.nowCoords.map((coord, i) => (
          <g key={entries[i]?.id ?? `now-${i}`}>
            <circle cx={coord.cx} cy={coord.cy} r={6} className="temp-chart__dot" />
            <text x={coord.cx} y={coord.cy - 12} className="temp-chart__dot-label" textAnchor="middle">
              {coord.label}
            </text>
          </g>
        ))}
      </svg>
    </section>
  )
}
