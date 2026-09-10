import React from 'react'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
}

/**
 * Permukaan dasar: putih, border 1px, radius 8px, tanpa bayangan.
 *
 * Padding hanya dua nilai:
 *   `p-4` daftar, kartu statistik, baris item
 *   `p-5` kartu isi/teks panjang
 * Baris kontrol (toolbar) pakai `p-3`.
 * Jangan tambah nilai lain tanpa alasan yang tidak bisa ditulis dengan dua ini.
 */
export function Card({ children, className = '', ...props }: CardProps) {
  return (
    <div className={`bg-surface border border-border rounded-lg ${className}`} {...props}>
      {children}
    </div>
  )
}
