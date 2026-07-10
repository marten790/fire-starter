import { useMemo } from 'react'
import type { HeatingLogEntry } from '../types/firing'
import './TempChart.css'

type Props = {
  entries: HeatingLogEntry[]
}

function formatAxisMinutes(minutes: number) {
  if (minutes < 60) return `${Math.round(minutes)}m`
  const h = Math.floor(minutes / 60)
  const m = Math.round(minutes % 60)
  return m === 0 ? `${h}h` : `${h}h${m}m`
}

export function TempChart({ entries }: Props) {
  const chart = useMemo(() => {
    const width = 640
    const height = 220
    const pad = { top: 20, right: 16, bottom: 36, left: 48 }
    const innerW = width - pad.left - pad.right
    const innerH = height - pad.top - pad.bottom

    const points = entries.map((e) => ({
      xMin: e.elapsedSeconds / 60,
      y: e.tempC,
    }))

    const maxX = Math.max(1, ...points.map((p) => p.xMin))
    const minY = 0
    const maxY = Math.max(100, ...points.map((p) => p.y)) * 1.08

    const toX = (xMin: number) => pad.left + (xMin / maxX) * innerW
    const toY = (temp: number) =>
      pad.top + innerH - ((temp - minY) / (maxY - minY)) * innerH

    const coords = points.map((p) => ({
      cx: toX(p.xMin),
      cy: toY(p.y),
      label: `${Math.round(p.y)}°C`,
    }))

    const line =
      coords.length > 1
        ? coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.cx} ${c.cy}`).join(' ')
        : ''

    const area =
      coords.length > 1
        ? `${line} L ${coords[coords.length - 1].cx} ${pad.top + innerH} L ${coords[0].cx} ${pad.top + innerH} Z`
        : ''

    const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => {
      const value = minY + (maxY - minY) * t
      return { value, y: toY(value) }
    })

    const xTicks = [0, 0.5, 1].map((t) => {
      const value = maxX * t
      return { value, x: toX(value) }
    })

    return { width, height, pad, coords, line, area, yTicks, xTicks, innerH }
  }, [entries])

  if (entries.length === 0) return null

  return (
    <section className="temp-chart" aria-label="Temperature graph">
      <div className="temp-chart__header">
        <h2>Temperature</h2>
        <p>°C over elapsed time</p>
      </div>
      <svg
        className="temp-chart__svg"
        viewBox={`0 0 ${chart.width} ${chart.height}`}
        role="img"
        aria-label={`Temperature chart with ${entries.length} reading${entries.length === 1 ? '' : 's'}`}
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

        {chart.area && <path d={chart.area} className="temp-chart__area" />}
        {chart.line && <path d={chart.line} className="temp-chart__line" />}

        {chart.coords.map((c, i) => (
          <g key={entries[i].id}>
            <circle cx={c.cx} cy={c.cy} r={6} className="temp-chart__dot" />
            <text x={c.cx} y={c.cy - 12} className="temp-chart__dot-label" textAnchor="middle">
              {c.label}
            </text>
          </g>
        ))}
      </svg>
    </section>
  )
}
