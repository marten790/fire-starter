import type { FiringType } from '../types/firing'

export type ChecklistItemDef = {
  key: string
  label: string
  hint?: string
}

const BISQUE: ChecklistItemDef[] = [
  {
    key: 'loaded',
    label: 'Kiln loaded',
    hint: 'Shelves set, ware clear of elements',
  },
  {
    key: 'cones',
    label: 'Cone 06 placed',
    hint: 'Witness cone where you can see it',
  },
  {
    key: 'meter',
    label: 'Meter connected',
    hint: 'Thermocouple in and reading °C',
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
    label: 'Dial on 1',
    hint: 'Ready to candle slowly',
  },
  {
    key: 'power',
    label: 'Power ON',
    hint: 'Wall isolator switched on',
  },
]

const GLAZE: ChecklistItemDef[] = [
  {
    key: 'loaded',
    label: 'Kiln loaded',
    hint: 'Shelves set, ware clear of elements',
  },
  {
    key: 'cones',
    label: 'Cones placed',
    hint: '5 bottom · 5/6/7 mid · 7 top',
  },
  {
    key: 'meter',
    label: 'Meter connected',
    hint: 'Thermocouple in and reading °C',
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
    label: 'Dial on 1',
    hint: 'Start setting chosen',
  },
  {
    key: 'power',
    label: 'Power ON',
    hint: 'Wall isolator switched on',
  },
]

export function checklistFor(type: FiringType): ChecklistItemDef[] {
  return type === 'bisque' ? BISQUE : GLAZE
}

export function firingTypeLabel(type: FiringType) {
  return type === 'bisque' ? 'Bisque · Cone 06' : 'Glaze · Cone 6 / 7'
}
