import { useEffect, useRef, useState } from 'react'
import { BottomNav, type NavTab } from './components/BottomNav'
import { ReminderAlert } from './components/ReminderAlert'
import {
  completeFiring,
  createFiring,
  getCompletedFirings,
  getRunningFiring,
  loadFirings,
  rememberDeletedFiring,
  saveFirings,
} from './lib/firings'
import {
  buzzDevice,
  clearReminderSchedule,
  ensureNotificationPermission,
  loadReminderSettings,
  playReminderChime,
  releaseFiringWakeLock,
  requestFiringWakeLock,
  saveReminderSettings,
  scheduleNextReminder,
  showBrowserNotification,
  snoozeReminder,
  type ReminderSettings,
} from './lib/reminders'
import type { FiringSession, FiringType, PreStartChecklistItem } from './types/firing'
import { ActiveFiringScreen } from './screens/ActiveFiringScreen'
import { DashboardScreen } from './screens/DashboardScreen'
import { HistoryScreen } from './screens/HistoryScreen'
import './App.css'

type Screen =
  | { name: 'home' }
  | { name: 'history' }
  | { name: 'active'; firingId: string }

export default function App() {
  const [firings, setFirings] = useState<FiringSession[]>(() => loadFirings())
  const [screen, setScreen] = useState<Screen>({ name: 'home' })
  const [reminders, setReminders] = useState<ReminderSettings>(() => loadReminderSettings())
  const [reminderOpen, setReminderOpen] = useState(false)
  const alertedForDueAt = useRef<number | null>(null)

  useEffect(() => {
    saveFirings(firings)
  }, [firings])

  useEffect(() => {
    saveReminderSettings(reminders)
  }, [reminders])

  const running = getRunningFiring(firings)
  const history = getCompletedFirings(firings)
  const activeFiring =
    screen.name === 'active'
      ? firings.find((f) => f.id === screen.firingId)
      : undefined

  const runningId = running?.id
  const navTab: NavTab = screen.name === 'history' ? 'history' : 'dashboard'

  useEffect(() => {
    setReminders((prev) => {
      if (!runningId) {
        if (prev.nextDueAt == null && prev.firingId == null) return prev
        return clearReminderSchedule(prev)
      }
      if (!prev.enabled) {
        if (prev.firingId === runningId && prev.nextDueAt == null) return prev
        return { ...prev, firingId: runningId, nextDueAt: null }
      }
      if (prev.firingId !== runningId || prev.nextDueAt == null) {
        return scheduleNextReminder(prev, runningId)
      }
      return prev
    })
  }, [runningId, reminders.enabled])

  useEffect(() => {
    if (!running || !reminders.enabled || reminders.nextDueAt == null) {
      setReminderOpen(false)
      return
    }

    function fireReminder() {
      if (!reminders.nextDueAt) return
      if (Date.now() < reminders.nextDueAt) return
      if (alertedForDueAt.current === reminders.nextDueAt) return
      alertedForDueAt.current = reminders.nextDueAt
      setReminderOpen(true)
      playReminderChime()
      buzzDevice()
      void showBrowserNotification(
        'Time to check Delores',
        `Firestarter · ${reminders.intervalMinutes} min kiln check`,
      )
    }

    fireReminder()
    const id = window.setInterval(fireReminder, 1000)
    return () => window.clearInterval(id)
  }, [running, reminders.enabled, reminders.nextDueAt, reminders.intervalMinutes])

  useEffect(() => {
    if (!running || !reminders.enabled) {
      void releaseFiringWakeLock()
      return
    }
    void ensureNotificationPermission()
    void requestFiringWakeLock()

    function onVisibility() {
      if (document.visibilityState === 'visible') {
        void requestFiringWakeLock()
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      void releaseFiringWakeLock()
    }
  }, [running, reminders.enabled])

  function updateReminders(next: ReminderSettings) {
    setReminders(next)
  }

  function acknowledgeReminder() {
    setReminderOpen(false)
    if (!running) return
    setReminders((prev) => scheduleNextReminder(prev, running.id))
    alertedForDueAt.current = null
  }

  function snoozeReminderAlert() {
    setReminderOpen(false)
    setReminders((prev) => snoozeReminder(prev, 15))
    alertedForDueAt.current = null
  }

  function openLogFromReminder() {
    if (!running) {
      acknowledgeReminder()
      return
    }
    setReminderOpen(false)
    setReminders((prev) => scheduleNextReminder(prev, running.id))
    alertedForDueAt.current = null
    setScreen({ name: 'active', firingId: running.id })
  }

  function bumpReminderAfterLog(firingId: string) {
    setReminders((prev) => {
      if (!prev.enabled) return prev
      return scheduleNextReminder(prev, firingId)
    })
    alertedForDueAt.current = null
    setReminderOpen(false)
  }

  function startFiring(type: FiringType, checklist: PreStartChecklistItem[]) {
    if (getRunningFiring(firings)) return
    const next = createFiring(type, { preStartChecklist: checklist })
    setFirings((prev) => [next, ...prev])
    void ensureNotificationPermission()
    setReminders((prev) => {
      const withInterval =
        type === 'bisque' ? { ...prev, intervalMinutes: 15 as const } : prev
      return withInterval.enabled
        ? scheduleNextReminder(withInterval, next.id)
        : { ...withInterval, firingId: next.id }
    })
    alertedForDueAt.current = null
    setScreen({ name: 'active', firingId: next.id })
  }

  function updateFiring(next: FiringSession) {
    setFirings((prev) => prev.map((f) => (f.id === next.id ? next : f)))
  }

  function endFiring(firingId: string) {
    setFirings((prev) =>
      prev.map((f) => (f.id === firingId ? completeFiring(f) : f)),
    )
    setReminders((prev) => clearReminderSchedule(prev))
    setReminderOpen(false)
    alertedForDueAt.current = null
  }

  function deleteFiring(firingId: string) {
    rememberDeletedFiring(firingId)
    setFirings((prev) => prev.filter((f) => f.id !== firingId))
    if (running?.id === firingId) {
      setReminders((prev) => clearReminderSchedule(prev))
      setReminderOpen(false)
      alertedForDueAt.current = null
    }
    setScreen({ name: 'home' })
  }

  function goTab(tab: NavTab) {
    setScreen(tab === 'history' ? { name: 'history' } : { name: 'home' })
  }

  return (
    <>
      <ReminderAlert
        open={reminderOpen}
        intervalMinutes={reminders.intervalMinutes}
        onGotIt={acknowledgeReminder}
        onSnooze={snoozeReminderAlert}
        onOpenLog={openLogFromReminder}
      />

      {screen.name === 'active' && activeFiring ? (
        <ActiveFiringScreen
          firing={activeFiring}
          reminders={reminders}
          onRemindersChange={updateReminders}
          onLoggedReading={() => bumpReminderAfterLog(activeFiring.id)}
          onChange={updateFiring}
          onEnd={() => endFiring(activeFiring.id)}
          onDelete={() => deleteFiring(activeFiring.id)}
          onBackToDashboard={() => setScreen({ name: 'home' })}
        />
      ) : screen.name === 'history' ? (
        <HistoryScreen
          history={history}
          allFirings={firings}
          onOpenFiring={(id) => setScreen({ name: 'active', firingId: id })}
          onDeleteFiring={deleteFiring}
        />
      ) : (
        <DashboardScreen
          running={running}
          allFirings={firings}
          reminderNextDueAt={
            reminders.enabled && running ? reminders.nextDueAt : null
          }
          onStartFiring={startFiring}
          onOpenFiring={(id) => setScreen({ name: 'active', firingId: id })}
          onDeleteFiring={deleteFiring}
        />
      )}

      <BottomNav active={navTab} onChange={goTab} />
    </>
  )
}
