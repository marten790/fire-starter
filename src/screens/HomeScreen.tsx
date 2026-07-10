import { Button } from '../components/Button'
import './HomeScreen.css'

type Props = {
  onStartBisque: () => void
  onStartGlaze: () => void
}

export function HomeScreen({ onStartBisque, onStartGlaze }: Props) {
  return (
    <main className="app-shell home">
      <header className="app-header">
        <p className="app-brand">Fire Starter</p>
        <p className="app-kiln">Kiln · Delores</p>
        <h1 className="home-title">Ready to fire?</h1>
        <p className="home-lead">
          Log dial, temperature, and cones on your iPad — even offline in the garage.
        </p>
      </header>

      <div className="app-actions">
        <Button className="fs-btn--block" variant="primary" onClick={onStartBisque}>
          Start bisque · Cone 06
        </Button>
        <Button className="fs-btn--block" variant="outline" onClick={onStartGlaze}>
          Start glaze · Cone 6 / 7
        </Button>
      </div>

      <section className="app-meta" aria-label="Kiln summary">
        <p>Elements: ~7 firings since replacement</p>
        <p>Meter: thermocouple °C · Dial: 1–6</p>
        <p>History & graphs coming next</p>
      </section>
    </main>
  )
}
