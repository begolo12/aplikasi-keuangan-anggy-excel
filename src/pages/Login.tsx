import React, { useState } from 'react'
import { useAuth } from '../lib/use-auth'
import { Link, useNavigate } from 'react-router-dom'
import { Lock, Mail, ArrowRight, ShieldCheck, CheckCircle2, TrendingUp, Sparkles, Layers } from 'lucide-react'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await login(email, password)
    setLoading(false)
    if (res.ok) {
      navigate('/')
    } else {
      setError(res.error || 'Login gagal. Periksa kembali email dan password Anda.')
    }
  }

  return (
    <div className="min-h-screen bg-canvas text-text flex items-center justify-center p-4 sm:p-6 antialiased relative selection:bg-accent selection:text-white">
      <div className="relative z-10 w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Info Panel */}
        <div className="lg:col-span-7 space-y-6 hidden lg:block pr-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg bg-accent-soft text-accent text-xs font-medium">
            <Sparkles size={15} />
            <span>FinSheet Workspace</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center text-white font-bold text-2xl md-elevation-1">
                F
              </div>
              <div>
                <h1 className="text-3xl font-medium tracking-tight text-text">FinSheet Pro</h1>
                <p className="text-xs font-medium text-accent tracking-wide uppercase">Smart Cash Flow & Asset Suite</p>
              </div>
            </div>
            <p className="text-text-muted text-sm leading-relaxed max-w-lg pt-1">
              Kelola uang masuk dan keluar dengan 3 dompet terpisah — Kas Utama, Kas Usaha, dan Kas Keluarga — lengkap dengan rencana anggaran dan laporan Excel otomatis.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-lg bg-surface border border-border">
              <Layers className="text-accent mb-2" size={22} />
              <h4 className="font-medium text-xs text-text">3 Dompet Terpisah</h4>
              <p className="text-[11px] text-text-subtle mt-1">Kas Utama bisa dipindah ke Kas Usaha & Keluarga otomatis.</p>
            </div>
            <div className="p-4 rounded-lg bg-surface border border-border">
              <TrendingUp className="text-accent mb-2" size={22} />
              <h4 className="font-medium text-xs text-text">13 Sheet Live Formula</h4>
              <p className="text-[11px] text-text-subtle mt-1">Export Excel real-time dengan kalkulasi native.</p>
            </div>
          </div>

          <div className="flex items-center gap-5 text-xs text-text-muted pt-1">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={16} className="text-positive" /> Database Cloud Neon
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={16} className="text-positive" /> Enkripsi Session JWT
            </span>
          </div>
        </div>

        {/* Right Form Card */}
        <div className="lg:col-span-5 w-full">
          <div className="bg-surface border border-border rounded-lg p-6 sm:p-8 md-elevation-1">
            <div className="lg:hidden flex items-center gap-3 mb-6 pb-4 border-b border-border">
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center text-white font-bold text-lg">
                F
              </div>
              <div>
                <h1 className="font-medium text-lg text-text tracking-tight">FinSheet Pro</h1>
                <p className="text-xs text-accent">Smart Cash Flow & Asset</p>
              </div>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-medium text-text tracking-tight">Masuk ke Akun</h2>
              <p className="text-xs text-text-subtle mt-1">Akses seluruh modul pembukuan dan data keuangan Anda.</p>
            </div>

            {error && (
              <div className="mt-4 p-3.5 bg-negative-soft border border-negative rounded-lg text-xs text-negative animate-in">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="login-email" className="text-xs font-medium text-text-muted block mb-1">
                  Email Akun
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-subtle" aria-hidden="true" />
                  <input
                    id="login-email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border-strong rounded-lg text-xs sm:text-sm text-text placeholder:text-text-subtle outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="login-password" className="text-xs font-medium text-text-muted block mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-subtle" aria-hidden="true" />
                  <input
                    id="login-password"
                    type="password"
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border-strong rounded-lg text-xs sm:text-sm text-text placeholder:text-text-subtle outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 bg-accent hover:bg-accent-hover disabled:opacity-50 text-white rounded-lg text-xs sm:text-sm font-medium flex items-center justify-center gap-2 md-elevation-1 transition cursor-pointer"
              >
                {loading ? 'Memverifikasi...' : 'Masuk Sekarang'}
                <ArrowRight size={16} />
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-border flex items-center justify-between text-xs text-text-subtle">
              <span>Belum memiliki akun?</span>
              <Link to="/register" className="font-medium text-accent hover:underline">
                Daftar Akun Baru
              </Link>
            </div>

            <div className="mt-6 p-3 rounded-lg bg-accent-soft flex items-center gap-2 text-[11px] text-accent">
              <ShieldCheck size={16} className="shrink-0" />
              <span>Koneksi aman PostgreSQL dengan enkripsi session.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
