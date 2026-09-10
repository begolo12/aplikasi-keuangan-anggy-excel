import { useCallback, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

const KEY = 'anggy_theme'

/** Cermin dari skrip pra-render di `index.html`; keduanya harus baca kunci yang sama. */
export function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
  try {
    localStorage.setItem(KEY, theme)
  } catch {
    // Mode privat bisa menolak localStorage; kelas di <html> tetap berlaku.
  }
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() =>
    document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  )

  const toggle = useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === 'dark' ? 'light' : 'dark'
      applyTheme(next)
      return next
    })
  }, [])

  // Ikut berubah kalau pengguna mengubah preferensi OS dan belum pernah memilih manual.
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = (e: MediaQueryListEvent) => {
      try {
        if (localStorage.getItem(KEY)) return
      } catch {
        // tanpa localStorage, ikuti OS saja
      }
      const next: Theme = e.matches ? 'dark' : 'light'
      document.documentElement.classList.toggle('dark', next === 'dark')
      setTheme(next)
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return { theme, toggle }
}
