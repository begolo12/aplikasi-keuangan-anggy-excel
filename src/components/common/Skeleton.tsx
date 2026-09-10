interface SkeletonProps {
  className?: string
}

/** Placeholder satu blok. Bentuk ditentukan pemanggil lewat `className`. */
export function Skeleton({ className = '' }: SkeletonProps) {
  return <div className={`skeleton ${className}`} aria-hidden="true" />
}

/** Baris demi baris untuk tabel/list yang sedang dimuat. */
export function SkeletonRows({ rows = 5, className = '' }: { rows?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`} aria-hidden="true">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="skeleton h-9 w-full" />
      ))}
    </div>
  )
}
