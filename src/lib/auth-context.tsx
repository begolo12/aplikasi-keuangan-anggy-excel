import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

export type AuthUser = {
  id: string
  email: string
  name: string
}

export type Workspace = {
  id: string
  name: string
}

type AuthContextType = {
  user: AuthUser | null
  workspace: Workspace | null
  loading: boolean
  login: (email: string, pass: string) => Promise<{ ok: boolean; error?: string }>
  register: (email: string, pass: string, name?: string) => Promise<{ ok: boolean; error?: string }>
  logout: () => Promise<void>
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [workspace, setWorkspace] = useState<Workspace | null>(null)
  const [loading, setLoading] = useState(true)

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
    void refresh()
  }, [refresh])

  const login = async (email: string, pass: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      })
      const data = await res.json()
      if (!res.ok) {
        return { ok: false, error: data.error || 'Gagal login' }
      }
      setUser(data.user)
      setWorkspace(data.workspace)
      return { ok: true }
    } catch (e: any) {
      return { ok: false, error: e.message || 'Koneksi gagal' }
    }
  }

  const register = async (email: string, pass: string, name?: string) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass, name }),
      })
      const data = await res.json()
      if (!res.ok) {
        return { ok: false, error: data.error || 'Gagal mendaftar' }
      }
      setUser(data.user)
      setWorkspace(data.workspace)
      return { ok: true }
    } catch (e: any) {
      return { ok: false, error: e.message || 'Koneksi gagal' }
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } finally {
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

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
