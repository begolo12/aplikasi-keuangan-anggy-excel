import React, { useState, useEffect, useCallback } from 'react'
import { AuthContext } from './auth-context-values'
import type { AuthUser, Workspace } from './auth-context-values'
export type { AuthUser, Workspace } from './auth-context-values'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [workspace, setWorkspace] = useState<Workspace | null>(null)
  const [loading, setLoading] = useState(true)

  // refresh dipanggil dari event (login/logout) dan sekali saat mount via effect;
  // setState terjadi di dalam async callback setelah await, bukan sinkron saat render.
  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me')
      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
        setWorkspace(data.workspace)
      } else {
        setUser(null)
        setWorkspace(null)
      }
    } catch {
      setUser(null)
      setWorkspace(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let alive = true
    void (async () => {
      try {
        const res = await fetch('/api/auth/me')
        if (!alive) return
        if (res.ok) {
          const data = await res.json()
          setUser(data.user)
          setWorkspace(data.workspace)
        } else {
          setUser(null)
          setWorkspace(null)
        }
      } catch {
        if (!alive) return
        setUser(null)
        setWorkspace(null)
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [])

  const login = async (email: string, pass: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      })
      const data: { user?: AuthUser; workspace?: Workspace; error?: string } = await res.json()
      if (!res.ok) {
        return { ok: false, error: data.error || 'Gagal login' }
      }
      if (data.user) setUser(data.user)
      if (data.workspace) setWorkspace(data.workspace)
      return { ok: true }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Koneksi gagal'
      return { ok: false, error: message }
    }
  }

  const register = async (email: string, pass: string, name?: string) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass, name }),
      })
      const data: { user?: AuthUser; workspace?: Workspace; error?: string } = await res.json()
      if (!res.ok) {
        return { ok: false, error: data.error || 'Gagal mendaftar' }
      }
      if (data.user) setUser(data.user)
      if (data.workspace) setWorkspace(data.workspace)
      return { ok: true }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Koneksi gagal'
      return { ok: false, error: message }
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } finally {
      // Buang cache keuangan lokal supaya data tidak tertinggal di komputer bersama.
      localStorage.removeItem('anggy-keu-v2')
      setUser(null)
      setWorkspace(null)
    }
  }

  return (
    <AuthContext.Provider value={{ user, workspace, loading, login, register, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  )
}

