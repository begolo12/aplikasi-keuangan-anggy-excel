import { useEffect, useRef } from 'react'

/**
 * Escape menutup, fokus masuk ke elemen pertama, Tab berputar di dalam modal,
 * dan fokus kembali ke pemicu saat ditutup.
 * `enabled` menerima hasil `Boolean(openTarget)` supaya hook bisa dipanggil
 * tanpa syarat sebelum early-return `if (!open) return null`.
 */
export function useModalA11y(enabled: boolean, onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null)

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
        onClose()
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
    return () => {
      document.removeEventListener('keydown', onKey)
      previous?.focus?.()
    }
  }, [enabled, onClose])

  return ref
}
