import React from 'react'

export type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'danger' | 'subtle'
export type ButtonSize = 'sm' | 'md'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: React.ReactNode
  block?: boolean
}

const base =
  'inline-flex items-center justify-center gap-1.5 font-medium rounded-lg transition-colors cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed whitespace-nowrap'

/* Target tap minimum 44px hanya di perangkat sentuh, supaya desktop tetap rapat. */
const sizes: Record<ButtonSize, string> = {
  sm: 'px-2.5 py-1.5 text-xs [@media(pointer:coarse)]:min-h-11',
  md: 'px-3.5 py-2 text-xs [@media(pointer:coarse)]:min-h-11',
}

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-on-fill hover:bg-accent-hover',
  outline: 'bg-surface text-text border border-border-strong hover:bg-surface-sunken',
  ghost: 'bg-transparent text-text-muted hover:bg-surface-sunken hover:text-text',
  danger: 'bg-surface text-negative border border-border-strong hover:bg-negative-soft hover:border-negative/40',
  subtle: 'bg-accent-soft text-accent hover:bg-accent-soft/70',
}

export function Button({
  variant = 'outline',
  size = 'md',
  icon,
  block = false,
  className = '',
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button type={type} className={`${base} ${sizes[size]} ${variants[variant]} ${block ? 'w-full' : ''} ${className}`} {...props}>
      {icon}
      {children}
    </button>
  )
}
