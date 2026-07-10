import type { ButtonHTMLAttributes, ReactNode } from 'react'
import './Button.css'

type Variant = 'primary' | 'outline' | 'ghost' | 'aux' | 'danger'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  children: ReactNode
}

export function Button({
  variant = 'primary',
  children,
  className = '',
  ...rest
}: Props) {
  return (
    <button
      type="button"
      className={`fs-btn fs-btn--${variant} ${className}`.trim()}
      {...rest}
    >
      {children}
    </button>
  )
}
