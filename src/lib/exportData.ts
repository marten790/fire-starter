import type { FiringSession } from '../types/firing'

function csvEscape(value: string | number | boolean | null | undefined): string {
  if (value == null) return ''
  const s = String(value)
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

function iso(ms?: number) {
  if (ms == null) return ''
  return new Date(ms).toISOString()
}

function stamp() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${day}_${h}${min}`
}

/** One row per heating-log reading, with firing metadata repeated. */
export function firingsToHeatingCsv(firings: FiringSession[]): string {
  const header = [
    'firingId',
    'firingName',
    'type',
    'status',
    'startedAt',
    'endedAt',
    'coneTarget',
    'loadedBy',
    'weatherNote',
    'topTempC',
    'source',
    'entryId',
    'clockTime',
    'elapsedMinutes',
    'elapsedSeconds',
    'dial',
    'tempC',
    'kWh',
    'witnessCone',
    'notes',
    'resultsConeBottom',
    'resultsConeMid',
    'resultsConeTop',
    'resultsConeBottomMidTop',
    'clayOutcome',
    'glazeOutcome',
    'defects',
    'adjustments',
    'resultsNotes',
    'rating',
  ]

  const rows: string[] = [header.join(',')]

  for (const firing of firings) {
    const base = [
      firing.id,
      firing.name,
      firing.type,
      firing.status,
      iso(firing.startedAt),
      iso(firing.endedAt),
      firing.coneTarget ?? '',
      firing.loadedBy ?? '',
      firing.weatherNote ?? '',
      firing.topTempC ?? '',
      firing.source ?? '',
    ]

    const results = [
      firing.results?.coneBottom ?? '',
      firing.results?.coneMid ?? '',
      firing.results?.coneTop ?? '',
      firing.results?.coneBottomMidTop ?? '',
      firing.results?.clayOutcome ?? '',
      firing.results?.glazeOutcome ?? '',
      firing.results?.defects ?? '',
      firing.results?.adjustments ?? '',
      firing.results?.notes ?? '',
      firing.results?.rating ?? '',
    ]

    if (firing.entries.length === 0) {
      rows.push(
        [...base, '', '', '', '', '', '', '', '', '', ...results].map(csvEscape).join(','),
      )
      continue
    }

    for (const entry of firing.entries) {
      rows.push(
        [
          ...base,
          entry.id,
          entry.clockTime,
          entry.elapsedMinutes,
          entry.elapsedSeconds,
          entry.dial,
          entry.tempC,
          entry.kWh ?? '',
          entry.witnessCone ?? '',
          entry.notes ?? '',
          ...results,
        ]
          .map(csvEscape)
          .join(','),
      )
    }
  }

  return `${rows.join('\n')}\n`
}

/** Full database snapshot for restore / archive. */
export function firingsToJsonBackup(firings: FiringSession[]): string {
  return `${JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      app: 'fire-starter',
      version: 1,
      firings,
    },
    null,
    2,
  )}\n`
}

export async function shareOrDownloadFile(
  filename: string,
  contents: string,
  mimeType: string,
  title: string,
): Promise<'shared' | 'downloaded'> {
  const blob = new Blob([contents], { type: mimeType })
  const file = new File([blob], filename, { type: mimeType })

  try {
    if (typeof navigator !== 'undefined' && navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title, text: title })
      return 'shared'
    }
  } catch (err) {
    // User cancelled share — don't fall through to download
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw err
    }
  }

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 2000)
  return 'downloaded'
}

export function exportFilename(kind: 'heating' | 'backup') {
  const base = `fire-starter-${kind}-${stamp()}`
  return kind === 'heating' ? `${base}.csv` : `${base}.json`
}
