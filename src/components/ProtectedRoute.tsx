import React from 'react'
import { useAuth } from '../lib/use-auth'
import { Navigate } from 'react-router-dom'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent text-on-fill flex items-center justify-center font-bold animate-pulse">
            A
          </div>
          <span className="text-xs font-semibold text-text-muted">Memuat sesi...</span>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
