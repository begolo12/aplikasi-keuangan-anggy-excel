import React from 'react'
import { useAuth } from '../lib/auth-context'
import { Navigate } from 'react-router-dom'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1E3A5F] text-white flex items-center justify-center font-bold animate-pulse">
            A
          </div>
          <span className="text-xs font-semibold text-slate-500">Memuat sesi...</span>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
