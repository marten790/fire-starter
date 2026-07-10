import type { FiringType } from '../types/firing'

export type ChecklistItemDef = {
  key: string
  label: string
  hint?: string
}

const SHARED: ChecklistItemDef[] = [
  {
    key: 'loaded',
    label: 'Kiln loaded',
    hint: 'Shelves set, ware clear of elements',
  },
  {
    key: 'meter',
    label: 'Meter connected',
    hint: 'Thermocouple in and reading °C',
  },
  {
    key: 'power',
    label: 'Power ON',
    hint: 'Wall isolator switched on',
  },
]

const BISQUE: ChecklistItemDef[] = [
  {
    key: 'cones',
    label: 'Cone 06 placed',
    hint: 'Witness cone where you can see it',
  },
  {
    key: 'peephole',
    label: 'Peephole open',
    hint: 'Close once the kiln reaches ~100°C',
  },
  {
    key: 'door',
    label: 'Door ajar for candling',
    hint: 'First hour — then close the door',
  },
  {
    key: 'dial',
    label: 'Dial on low start',
    hint: 'Ready to candle slowly',
  },
]

const GLAZE: ChecklistItemDef[] = [
  {
    key: 'cones',
    label: 'Cones placed',
    hint: '5 bottom · 5/6/7 mid · 7 top',
  },
  {
    key: 'peephole',
    label: 'Peephole ready',
    hint: 'Clear view of mid cones',
  },
  {
    key: 'door',
    label: 'Door closed',
    hint: 'Sealed for the glaze fire',
  },
  {
    key: 'dial',
    label: 'Dial ready to start',
    hint: 'Start setting chosen',
  },
]

export function checklistFor(type: FiringType): ChecklistItemDef[] {
  const typeItems = type === 'bisque' ? BISQUE : GLAZE
  // Shared first (load / meter / power), then type-specific
  return [...SHARED, ...typeItems]
}

export function firingTypeLabel(type: FiringType) {
  return type === 'bisque' ? 'Bisque · Cone 06' : 'Glaze · Cone 6 / 7'
}
