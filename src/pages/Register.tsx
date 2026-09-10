import React, { useState } from 'react'
import { useAuth } from '../lib/use-auth'
import { Link, useNavigate } from 'react-router-dom'
import { Lock, Mail, User, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password.length < 6) {
      setError('Password minimal 6 karakter')
      return
    }
    if (password !== confirmPassword) {
      setError('Konfirmasi password tidak cocok')
      return
    }

    setLoading(true)
    const res = await register(email, password, name)
    setLoading(false)
    if (res.ok) {
      navigate('/')
    } else {
      setError(res.error || 'Registrasi gagal')
    }
  }

  return (
    <div className="min-h-screen bg-canvas text-text flex items-center justify-center p-4 sm:p-6 antialiased relative selection:bg-accent selection:text-on-fill">
      <div className="relative z-10 w-full max-w-md bg-surface border border-border rounded-lg p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-lg bg-accent flex items-center justify-center text-on-fill font-semibold text-xl">
            F
          </div>
          <div>
            <h1 className="font-medium text-lg text-text tracking-tight leading-none">FinSheet Pro</h1>
            <p className="text-xs text-accent mt-1">Smart Cash Flow & Asset Suite</p>
          </div>
        </div>

        <div className="mt-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-accent-soft text-accent text-[11px] font-medium tracking-wide mb-2">
            <Sparkles size={13} />
            <span>Workspace Cloud Privat</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-medium text-text tracking-tight">Buat Akun Baru</h2>
          <p className="text-xs text-text-subtle mt-1">Mulai kelola kas 3-ledger, anggaran, aset, dan piutang Anda.</p>
        </div>

        {error && (
          <div className="mt-4 p-3.5 bg-negative-soft border border-negative rounded-lg text-xs text-negative animate-in">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-3.5">
          <div>
            <label htmlFor="reg-name" className="text-xs font-medium text-text-muted block mb-1">
              Nama Lengkap
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-subtle" aria-hidden="true" />
              <input
                id="reg-name"
                type="text"
                required
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Anggy"
                className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border-strong rounded-lg text-xs sm:text-sm text-text placeholder:text-text-subtle outline-none focus:border-accent transition"
              />
            </div>
          </div>

          <div>
            <label htmlFor="reg-email" className="text-xs font-medium text-text-muted block mb-1">
              Email
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-subtle" aria-hidden="true" />
              <input
                id="reg-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border-strong rounded-lg text-xs sm:text-sm text-text placeholder:text-text-subtle outline-none focus:border-accent transition"
              />
            </div>
          </div>

          <div>
            <label htmlFor="reg-password" className="text-xs font-medium text-text-muted block mb-1">
              Password (min. 6 karakter)
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-subtle" aria-hidden="true" />
              <input
                id="reg-password"
                type="password"
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border-strong rounded-lg text-xs sm:text-sm text-text placeholder:text-text-subtle outline-none focus:border-accent transition"
              />
            </div>
          </div>

          <div>
            <label htmlFor="reg-confirm" className="text-xs font-medium text-text-muted block mb-1">
              Konfirmasi Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-subtle" aria-hidden="true" />
              <input
                id="reg-confirm"
                type="password"
                required
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border-strong rounded-lg text-xs sm:text-sm text-text placeholder:text-text-subtle outline-none focus:border-accent transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-3 py-3 bg-accent hover:bg-accent-hover disabled:opacity-50 text-on-fill rounded-lg text-xs sm:text-sm font-medium flex items-center justify-center gap-2 transition cursor-pointer"
          >
            {loading ? 'Mendaftarkan Workspace...' : 'Daftar Sekarang'}
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-border flex items-center justify-between text-xs text-text-subtle">
          <span>Sudah memiliki akun?</span>
          <Link to="/login" className="font-medium text-accent hover:underline">
            Masuk
          </Link>
        </div>

        <div className="mt-6 p-3 rounded-lg bg-accent-soft flex items-center gap-2 text-[11px] text-accent">
          <ShieldCheck size={16} className="shrink-0" />
          <span>Isolasi data terjamin per workspace pengguna.</span>
        </div>
      </div>
    </div>
  )
}
