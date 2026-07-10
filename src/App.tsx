import { useState } from 'react'
import { HomeScreen } from './screens/HomeScreen'
import { ActiveFiringScreen } from './screens/ActiveFiringScreen'
import type { FiringType } from './types/firing'
import './App.css'

type Screen =
  | { name: 'home' }
  | { name: 'active'; firingType: FiringType }

export default function App() {
  const [screen, setScreen] = useState<Screen>({ name: 'home' })

  if (screen.name === 'active') {
    return (
      <ActiveFiringScreen
        firingType={screen.firingType}
        onEnd={() => setScreen({ name: 'home' })}
      />
    )
  }

  return (
    <HomeScreen
      onStartBisque={() => setScreen({ name: 'active', firingType: 'bisque' })}
      onStartGlaze={() => setScreen({ name: 'active', firingType: 'glaze' })}
    />
  )
}
