import { createContext } from 'react'

export type AuthUser = {
  id: string
  email: string
  name: string
}

export type Workspace = {
  id: string
  name: string
}

export type AuthContextType = {
  user: AuthUser | null
  workspace: Workspace | null
  loading: boolean
  login: (email: string, pass: string) => Promise<{ ok: boolean; error?: string }>
  register: (email: string, pass: string, name?: string) => Promise<{ ok: boolean; error?: string }>
  logout: () => Promise<void>
  refresh: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | null>(null)
