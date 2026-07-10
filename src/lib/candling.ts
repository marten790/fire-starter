import type { CandlingState } from '../types/firing'

export const CANDLING_DOOR_MINUTES = 60
export const PEEPHOLE_CLOSE_TEMP_C = 100

export function doorCloseDueAt(startedAt: number) {
  return startedAt + CANDLING_DOOR_MINUTES * 60_000
}

export function formatCandlingCountdown(dueAt: number, now = Date.now()): string {
  const ms = Math.max(0, dueAt - now)
  const totalSec = Math.ceil(ms / 1000)
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export function shouldPromptCloseDoor(
  candling: CandlingState | undefined,
  startedAt: number,
  now = Date.now(),
) {
  if (candling?.doorClosed) return false
  return now >= doorCloseDueAt(startedAt)
}

export function shouldPromptClosePeephole(
  candling: CandlingState | undefined,
  lastTempC: number | undefined,
) {
  if (candling?.peepholeClosed) return false
  if (lastTempC == null) return false
  return lastTempC >= PEEPHOLE_CLOSE_TEMP_C
}
