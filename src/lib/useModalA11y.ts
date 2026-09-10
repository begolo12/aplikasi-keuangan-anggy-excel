import { useEffect, useRef } from 'react'

// Hitungan, bukan boolean: dua dialog bisa terbuka bersamaan (konfirmasi di
// atas form). Boolean akan membuka kunci saat yang pertama ditutup.
let lockCount = 0
let savedOverflow = ''
let savedPadding = ''

function lockScroll() {
  if (lockCount === 0) {
    savedOverflow = document.body.style.overflow
    savedPadding = document.body.style.paddingRight
    // Ganti lebar scrollbar supaya konten tidak melompat saat scrollbar hilang.
    const gap = window.innerWidth - document.documentElement.clientWidth
    document.body.style.overflow = 'hidden'
    if (gap > 0) document.body.style.paddingRight = `${gap}px`
  }
  lockCount++
}

function unlockScroll() {
  lockCount = Math.max(0, lockCount - 1)
  if (lockCount === 0) {
    document.body.style.overflow = savedOverflow
    document.body.style.paddingRight = savedPadding
  }
}

/**
 * Escape menutup, fokus masuk ke elemen pertama, Tab berputar di dalam modal,
 * dan fokus kembali ke pemicu saat ditutup.
 * `enabled` menerima hasil `Boolean(openTarget)` supaya hook bisa dipanggil
 * tanpa syarat sebelum early-return `if (!open) return null`.
 */
export function useModalA11y(enabled: boolean, onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null)
  // Callback disimpan di ref supaya efek tidak dijalankan ulang tiap render
  // (deps `onClose` selalu berubah karena arrow function di pemanggil). Kalau
  // efek restart saat user mengetik, fokus dilompatkan ke elemen pertama.
  const closeRef = useRef(onClose)
  useEffect(() => {
    closeRef.current = onClose
  })

  useEffect(() => {
    if (!enabled) return
    const previous = document.activeElement as HTMLElement | null
    const root = ref.current
    const focusables = () =>
      Array.from(
        root?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        ) ?? []
      ).filter((el) => el.offsetParent !== null)

    focusables()[0]?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeRef.current()
        return
      }
      if (e.key !== 'Tab') return
      const items = focusables()
      if (items.length === 0) return
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKey)
    lockScroll()
    return () => {
      document.removeEventListener('keydown', onKey)
      unlockScroll()
      previous?.focus?.()
    }
  }, [enabled])

  return ref
}
