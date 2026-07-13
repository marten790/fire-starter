import type {
  FiringSession,
  FiringStatus,
  FiringType,
  HeatingLogEntry,
  FiringResults,
} from '../types/firing'

export type ImportResult = {
  firings: FiringSession[]
  errors: string[]
}

function parseCsvLine(line: string): string[] {
  const cells: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          current += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        current += ch
      }
      continue
    }
    if (ch === '"') {
      inQuotes = true
      continue
    }
    if (ch === ',') {
      cells.push(current)
      current = ''
      continue
    }
    current += ch
  }
  cells.push(current)
  return cells
}

function splitCsvRows(text: string): string[] {
  return text
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .map((l) => l.trimEnd())
    .filter((l) => l.length > 0)
}

function num(value: string | undefined): number | undefined {
  if (value == null || value.trim() === '') return undefined
  const n = Number(value)
  return Number.isFinite(n) ? n : undefined
}

function ms(value: string | undefined): number | undefined {
  if (value == null || value.trim() === '') return undefined
  const t = Date.parse(value)
  return Number.isFinite(t) ? t : undefined
}

function asType(value: string | undefined): FiringType | null {
  if (value === 'bisque' || value === 'glaze') return value
  return null
}

function asStatus(value: string | undefined): FiringStatus {
  return value === 'running' ? 'running' : 'completed'
}

/** Parse Firestarter heating CSV (same columns as export). */
export function parseHeatingCsv(text: string): ImportResult {
  const errors: string[] = []
  const rows = splitCsvRows(text)
  if (rows.length < 2) {
    return { firings: [], errors: ['CSV has no data rows.'] }
  }

  const header = parseCsvLine(rows[0]).map((h) => h.trim())
  const idx = (name: string) => header.indexOf(name)
  const required = ['firingId', 'firingName', 'type', 'startedAt']
  for (const col of required) {
    if (idx(col) < 0) {
      return {
        firings: [],
        errors: [`Missing column “${col}”. Use a CSV exported from Firestarter.`],
      }
    }
  }

  type Acc = {
    firing: FiringSession
    entryIds: Set<string>
  }
  const byId = new Map<string, Acc>()

  for (let r = 1; r < rows.length; r++) {
    const cells = parseCsvLine(rows[r])
    const get = (name: string) => {
      const i = idx(name)
      return i >= 0 ? (cells[i] ?? '').trim() : ''
    }

    const type = asType(get('type'))
    if (!type) {
      errors.push(`Row ${r + 1}: unknown type “${get('type')}”.`)
      continue
    }

    const firingId = get('firingId') || crypto.randomUUID()
    const startedAt = ms(get('startedAt')) ?? Date.now()
    const endedAt = ms(get('endedAt'))
    const status = asStatus(get('status'))

    let acc = byId.get(firingId)
    if (!acc) {
      const results: FiringResults = {}
      const coneBottom = get('resultsConeBottom')
      const coneMid = get('resultsConeMid')
      const coneTop = get('resultsConeTop')
      const coneCombined = get('resultsConeBottomMidTop')
      const clayOutcome = get('clayOutcome')
      const glazeOutcome = get('glazeOutcome')
      const defects = get('defects')
      const adjustments = get('adjustments')
      const resultsNotes = get('resultsNotes')
      const rating = num(get('rating'))
      if (coneBottom) results.coneBottom = coneBottom
      if (coneMid) results.coneMid = coneMid
      if (coneTop) results.coneTop = coneTop
      if (coneCombined) results.coneBottomMidTop = coneCombined
      if (clayOutcome) results.clayOutcome = clayOutcome
      if (glazeOutcome) results.glazeOutcome = glazeOutcome
      if (defects) results.defects = defects
      if (adjustments) results.adjustments = adjustments
      if (resultsNotes) results.notes = resultsNotes
      if (rating != null) results.rating = rating

      const hasResults = Object.keys(results).length > 0
      acc = {
        entryIds: new Set(),
        firing: {
          id: firingId,
          type,
          status: status === 'running' ? 'completed' : status,
          name: get('firingName') || `${new Date(startedAt).toLocaleDateString()} · ${type}`,
          startedAt,
          endedAt: endedAt ?? (status === 'running' ? undefined : startedAt),
          entries: [],
          dial: 1,
          loadedBy: get('loadedBy') || undefined,
          coneTarget:
            get('coneTarget') || (type === 'bisque' ? 'Cone 06' : 'Cone 6/7'),
          weatherNote: get('weatherNote') || undefined,
          topTempC: num(get('topTempC')),
          results: hasResults ? results : undefined,
          source: 'csv-import',
        },
      }
      byId.set(firingId, acc)
    }

    const tempC = num(get('tempC'))
    const entryId = get('entryId')
    if (tempC != null && tempC > 0) {
      const id = entryId || crypto.randomUUID()
      if (!acc.entryIds.has(id)) {
        acc.entryIds.add(id)
        const elapsedSeconds =
          num(get('elapsedSeconds')) ??
          (num(get('elapsedMinutes')) != null
            ? Math.round(num(get('elapsedMinutes'))! * 60)
            : 0)
        const entry: HeatingLogEntry = {
          id,
          clockTime: get('clockTime') || '—',
          elapsedMinutes: num(get('elapsedMinutes')) ?? Math.floor(elapsedSeconds / 60),
          elapsedSeconds,
          dial: num(get('dial')) ?? 1,
          tempC,
          kWh: num(get('kWh')),
          witnessCone: get('witnessCone') || undefined,
          notes: get('notes') || undefined,
        }
        acc.firing.entries.push(entry)
        acc.firing.dial = entry.dial
      }
    }
  }

  const firings = [...byId.values()].map((a) => {
    a.firing.entries.sort((x, y) => x.elapsedSeconds - y.elapsedSeconds)
    if (a.firing.topTempC == null && a.firing.entries.length > 0) {
      a.firing.topTempC = Math.max(...a.firing.entries.map((e) => e.tempC))
    }
    // Imported history should not become the active running fire
    if (a.firing.status === 'running') {
      a.firing.status = 'completed'
      a.firing.endedAt = a.firing.endedAt ?? Date.now()
    }
    return a.firing
  })

  firings.sort((a, b) => b.startedAt - a.startedAt)
  return { firings, errors }
}

/** Parse Firestarter JSON backup (`{ firings: [...] }`). */
export function parseJsonBackup(text: string): ImportResult {
  try {
    const parsed = JSON.parse(text) as { firings?: unknown } | FiringSession[]
    const list = Array.isArray(parsed)
      ? parsed
      : Array.isArray(parsed.firings)
        ? parsed.firings
        : null
    if (!list) {
      return { firings: [], errors: ['JSON backup missing a firings array.'] }
    }

    const firings: FiringSession[] = []
    const errors: string[] = []
    for (const item of list) {
      if (!item || typeof item !== 'object') {
        errors.push('Skipped an invalid firing object.')
        continue
      }
      const f = item as FiringSession
      if (f.type !== 'bisque' && f.type !== 'glaze') {
        errors.push(`Skipped firing with unknown type.`)
        continue
      }
      if (typeof f.startedAt !== 'number' || !Array.isArray(f.entries)) {
        errors.push(`Skipped firing “${f.name ?? f.id}” — incomplete data.`)
        continue
      }
      firings.push({
        ...f,
        status: f.status === 'running' ? 'completed' : f.status ?? 'completed',
        endedAt: f.endedAt ?? (f.status === 'running' ? Date.now() : f.endedAt),
        dial: typeof f.dial === 'number' ? f.dial : 1,
        source: f.source ?? 'json-import',
      })
    }
    firings.sort((a, b) => b.startedAt - a.startedAt)
    return { firings, errors }
  } catch {
    return { firings: [], errors: ['Could not parse JSON backup.'] }
  }
}

export function mergeImportedFirings(
  existing: FiringSession[],
  incoming: FiringSession[],
): { next: FiringSession[]; added: number; skipped: number } {
  const ids = new Set(existing.map((f) => f.id))
  const toAdd: FiringSession[] = []
  let skipped = 0
  for (const firing of incoming) {
    if (ids.has(firing.id)) {
      skipped++
      continue
    }
    ids.add(firing.id)
    toAdd.push(firing)
  }
  return {
    next: [...toAdd, ...existing],
    added: toAdd.length,
    skipped,
  }
}

export async function readFileAsText(file: File): Promise<string> {
  return file.text()
}
