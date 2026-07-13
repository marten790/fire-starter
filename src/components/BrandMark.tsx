import './BrandMark.css'

type Props = {
  title?: string
  subtitle?: string
  compact?: boolean
}

/** Kiln + Firestarter wordmark from the Figma Product Template. */
export function BrandMark({
  title = 'Firestarter',
  subtitle,
  compact = false,
}: Props) {
  return (
    <div className={compact ? 'brand-mark brand-mark--compact' : 'brand-mark'}>
      <div className="brand-mark__row">
        <svg
          className="brand-mark__icon"
          viewBox="0 0 88 121"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <rect x="4" y="4" width="80" height="72" rx="18" stroke="#FF8156" strokeWidth="6" />
          <path
            d="M28 52c0-10 8-16 16-22 8 6 16 12 16 22 0 10-7 18-16 18s-16-8-16-18Z"
            fill="#FF8156"
          />
          <path
            d="M36 48c2-6 6-10 8-12 2 2 6 6 8 12"
            stroke="#fff"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path d="M22 88h44" stroke="#1F1E1E" strokeWidth="5" strokeLinecap="round" />
          <path d="M30 100h28" stroke="#1F1E1E" strokeWidth="5" strokeLinecap="round" />
          <path d="M38 112h12" stroke="#1F1E1E" strokeWidth="5" strokeLinecap="round" />
        </svg>
        <div className="brand-mark__text">
          <p className="brand-mark__title">{title}</p>
          {subtitle && <p className="brand-mark__subtitle">{subtitle}</p>}
        </div>
      </div>
    </div>
  )
}
