export type ReminderInterval = 15 | 30 | 60

export type ReminderSettings = {
  enabled: boolean
  intervalMinutes: ReminderInterval
  /** When the next reminder should fire */
  nextDueAt: number | null
  /** Firing the schedule belongs to */
  firingId: string | null
}

const STORAGE_KEY = 'fire-starter-reminders'

const DEFAULT_SETTINGS: ReminderSettings = {
  enabled: true,
  intervalMinutes: 30,
  nextDueAt: null,
  firingId: null,
}

export function loadReminderSettings(): ReminderSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_SETTINGS }
    const parsed = JSON.parse(raw) as Partial<ReminderSettings>
    const interval = parsed.intervalMinutes
    return {
      enabled: parsed.enabled ?? true,
      intervalMinutes:
        interval === 15 || interval === 30 || interval === 60 ? interval : 30,
      nextDueAt: typeof parsed.nextDueAt === 'number' ? parsed.nextDueAt : null,
      firingId: typeof parsed.firingId === 'string' ? parsed.firingId : null,
    }
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
}

export function saveReminderSettings(settings: ReminderSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}

export function scheduleNextReminder(
  settings: ReminderSettings,
  firingId: string,
  fromMs = Date.now(),
): ReminderSettings {
  return {
    ...settings,
    firingId,
    nextDueAt: fromMs + settings.intervalMinutes * 60_000,
  }
}

export function clearReminderSchedule(settings: ReminderSettings): ReminderSettings {
  return {
    ...settings,
    nextDueAt: null,
    firingId: null,
  }
}

export function snoozeReminder(
  settings: ReminderSettings,
  minutes = 15,
): ReminderSettings {
  if (!settings.firingId) return settings
  return {
    ...settings,
    nextDueAt: Date.now() + minutes * 60_000,
  }
}

export async function ensureNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (typeof Notification === 'undefined') return 'unsupported'
  if (Notification.permission === 'granted' || Notification.permission === 'denied') {
    return Notification.permission
  }
  try {
    return await Notification.requestPermission()
  } catch {
    return Notification.permission
  }
}

/** System / push-style notification with sound (silent: false). Prefers the service worker. */
export async function showBrowserNotification(title: string, body: string) {
  if (typeof Notification === 'undefined') return
  if (Notification.permission !== 'granted') return

  const options: NotificationOptions = {
    body,
    icon: '/pwa-192.png',
    badge: '/pwa-192.png',
    tag: 'firestarter-reminder',
    requireInteraction: true,
    silent: false,
    // @ts-expect-error vibrate is widely supported but missing in some TS libs
    vibrate: [220, 100, 220, 100, 440],
    data: { url: '/' },
  }

  try {
    const reg = await navigator.serviceWorker?.ready
    if (reg?.showNotification) {
      await reg.showNotification(title, options)
      return
    }
  } catch {
    // fall through to page Notification
  }

  try {
    const n = new Notification(title, options)
    window.setTimeout(() => n.close(), 20_000)
  } catch {
    // iOS / locked-down browsers may reject Notification construction
  }
}

/** Louder multi-tone chime when the app is in the foreground */
export function playReminderChime() {
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!Ctx) return
    const ctx = new Ctx()
    if (ctx.state === 'suspended') void ctx.resume()
    const now = ctx.currentTime

    function tone(freq: number, start: number, dur: number, volume = 0.22) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0.0001, start)
      gain.gain.exponentialRampToValueAtTime(volume, start + 0.03)
      gain.gain.exponentialRampToValueAtTime(0.0001, start + dur)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(start)
      osc.stop(start + dur + 0.05)
    }

    tone(587, now, 0.2, 0.2)
    tone(784, now + 0.2, 0.22, 0.24)
    tone(988, now + 0.42, 0.35, 0.28)
    window.setTimeout(() => void ctx.close(), 1200)
  } catch {
    // Audio may be blocked until a user gesture
  }
}

export function buzzDevice() {
  try {
    navigator.vibrate?.([220, 100, 220, 100, 440])
  } catch {
    // ignore
  }
}

/** Keep the iPad awake during a firing so reminder timers can fire. */
let wakeLock: WakeLockSentinel | null = null

export async function requestFiringWakeLock() {
  if (!('wakeLock' in navigator)) return false
  try {
    wakeLock = await navigator.wakeLock.request('screen')
    wakeLock.addEventListener('release', () => {
      wakeLock = null
    })
    return true
  } catch {
    return false
  }
}

export async function releaseFiringWakeLock() {
  try {
    await wakeLock?.release()
  } catch {
    // ignore
  }
  wakeLock = null
}

export function formatReminderCountdown(nextDueAt: number | null, now = Date.now()): string {
  if (nextDueAt == null) return '—'
  const ms = Math.max(0, nextDueAt - now)
  const totalSec = Math.ceil(ms / 1000)
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  if (m >= 60) {
    const h = Math.floor(m / 60)
    const rm = m % 60
    return `${h}h ${rm}m`
  }
  return `${m}:${String(s).padStart(2, '0')}`
}
