import './BottomNav.css'

export type NavTab = 'dashboard' | 'history'

type Props = {
  active: NavTab
  onChange: (tab: NavTab) => void
}

export function BottomNav({ active, onChange }: Props) {
  return (
    <nav className="bottom-nav" aria-label="Main">
      <button
        type="button"
        className={active === 'dashboard' ? 'bottom-nav__item is-active' : 'bottom-nav__item'}
        onClick={() => onChange('dashboard')}
      >
        <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
          <rect x="3" y="3" width="8" height="8" rx="1.5" fill="currentColor" />
          <rect x="13" y="3" width="8" height="8" rx="1.5" fill="currentColor" />
          <rect x="3" y="13" width="8" height="8" rx="1.5" fill="currentColor" />
          <rect x="13" y="13" width="8" height="8" rx="1.5" fill="currentColor" />
        </svg>
        <span>Dashboard</span>
      </button>
      <button
        type="button"
        className={active === 'history' ? 'bottom-nav__item is-active' : 'bottom-nav__item'}
        onClick={() => onChange('history')}
      >
        <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" fill="none">
          <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="2" />
          <path d="M12 7.5V12l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <span>History</span>
      </button>
    </nav>
  )
}
