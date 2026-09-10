import React from 'react'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
}

/**
 * Permukaan dasar: putih, border 1px, radius 8px, tanpa bayangan.
 * Padding ditentukan pemanggil supaya satu nilai per konteks, bukan enam varian.
 */
export function Card({ children, className = '', ...props }: CardProps) {
  return (
    <div className={`bg-surface border border-border rounded-lg ${className}`} {...props}>
      {children}
    </div>
  )
}
