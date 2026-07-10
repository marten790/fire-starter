import type { InputHTMLAttributes } from 'react'
import './Toggle.css'

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label: string
  hint?: string
}

export function Toggle({ label, hint, id, className = '', ...rest }: Props) {
  const inputId = id ?? `toggle-${label.replace(/\s+/g, '-').toLowerCase()}`

  return (
    <label className={`fs-toggle ${className}`.trim()} htmlFor={inputId}>
      <span className="fs-toggle__text">
        <span className="fs-toggle__label">{label}</span>
        {hint && <span className="fs-toggle__hint">{hint}</span>}
      </span>
      <span className="fs-toggle__control">
        <input id={inputId} type="checkbox" role="switch" {...rest} />
        <span className="fs-toggle__track" aria-hidden="true">
          <span className="fs-toggle__thumb" />
        </span>
      </span>
    </label>
  )
}
