import React from 'react'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
  hover?: boolean
  variant?: 'elevated' | 'outlined' | 'filled'
}

export function Card({
  children,
  className = '',
  hover = false,
  variant = 'outlined',
  ...props
}: CardProps) {
  const variantStyles = {
    outlined: 'bg-white border border-[#e0e2e0] rounded-2xl shadow-none',
    elevated: 'bg-white rounded-2xl md-elevation-1 border-none',
    filled: 'bg-[#f0f4f9] rounded-2xl border-none',
  }

  return (
    <div
      className={`${variantStyles[variant]} transition-all duration-200 ${
        hover ? 'card-hover cursor-pointer' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
