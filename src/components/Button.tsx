import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router-dom'

type Variant = 'primary' | 'secondary' | 'ghost'

type Props = {
  children: ReactNode
  variant?: Variant
  className?: string
  to?: string
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'>

function classes(variant: Variant, className?: string): string {
  return ['btn', `btn-${variant}`, className].filter(Boolean).join(' ')
}

export function Button({ children, variant = 'primary', className, to, type = 'button', ...rest }: Props) {
  const classNames = classes(variant, className)
  if (to) {
    return (
      <Link to={to} className={classNames}>
        {children}
      </Link>
    )
  }
  return (
    <button type={type} className={classNames} {...rest}>
      {children}
    </button>
  )
}
