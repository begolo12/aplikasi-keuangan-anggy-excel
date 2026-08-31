import React from 'react'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
  hover?: boolean
}

export function Card({ children, className = '', hover = true, ...props }: CardProps) {
  return (
    <div
      className={`bg-white rounded-2xl border border-[#dbeae0] shadow-xs shadow-emerald-950/2 transition ${
        hover ? 'card-hover' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
