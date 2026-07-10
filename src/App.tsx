import { useEffect, useState } from 'react'
import {
  createFiring,
  getCompletedFirings,
  getRunningFiring,
  loadFirings,
  rememberDeletedFiring,
  saveFirings,
} from './lib/firings'
import type { FiringSession, FiringType } from './types/firing'
import { HomeScreen } from './screens/HomeScreen'
import { ActiveFiringScreen } from './screens/ActiveFiringScreen'
import './App.css'

type Screen = { name: 'home' } | { name: 'active'; firingId: string }

export default function App() {
  const [firings, setFirings] = useState<FiringSession[]>(() => loadFirings())
  const [screen, setScreen] = useState<Screen>({ name: 'home' })

  useEffect(() => {
    saveFirings(firings)
  }, [firings])

  const running = getRunningFiring(firings)
  const history = getCompletedFirings(firings)
  const activeFiring =
    screen.name === 'active'
      ? firings.find((f) => f.id === screen.firingId)
      : undefined

  function startFiring(type: FiringType) {
    if (getRunningFiring(firings)) return
    const next = createFiring(type)
    setFirings((prev) => [next, ...prev])
    setScreen({ name: 'active', firingId: next.id })
  }

  function updateFiring(next: FiringSession) {
    setFirings((prev) => prev.map((f) => (f.id === next.id ? next : f)))
  }

  function endFiring(firingId: string) {
    setFirings((prev) =>
      prev.map((f) =>
        f.id === firingId
          ? { ...f, status: 'completed', endedAt: Date.now() }
          : f,
      ),
    )
    setScreen({ name: 'home' })
  }

  function deleteFiring(firingId: string) {
    rememberDeletedFiring(firingId)
    setFirings((prev) => prev.filter((f) => f.id !== firingId))
    setScreen({ name: 'home' })
  }

  if (screen.name === 'active' && activeFiring) {
    return (
      <ActiveFiringScreen
        firing={activeFiring}
        onChange={updateFiring}
        onEnd={() => endFiring(activeFiring.id)}
        onDelete={() => deleteFiring(activeFiring.id)}
        onBackToDashboard={() => setScreen({ name: 'home' })}
      />
    )
  }

  return (
    <HomeScreen
      running={running}
      history={history}
      onStartBisque={() => startFiring('bisque')}
      onStartGlaze={() => startFiring('glaze')}
      onOpenFiring={(id) => setScreen({ name: 'active', firingId: id })}
      onDeleteFiring={deleteFiring}
    />
  )
}
