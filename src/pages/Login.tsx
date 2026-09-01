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
    <div className="min-h-screen bg-[#f8f9fa] text-[#1f1f1f] flex items-center justify-center p-4 sm:p-6 antialiased relative selection:bg-[#1a73e8] selection:text-white">
      <div className="relative z-10 w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Info Panel */}
        <div className="lg:col-span-7 space-y-6 hidden lg:block pr-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#e8f0fe] text-[#1a73e8] text-xs font-medium">
            <Sparkles size={15} />
            <span>FinSheet Workspace</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#1a73e8] flex items-center justify-center text-white font-bold text-2xl md-elevation-1">
                F
              </div>
              <div>
                <h1 className="text-3xl font-medium tracking-tight text-[#1f1f1f]">FinSheet Pro</h1>
                <p className="text-xs font-medium text-[#1a73e8] tracking-wide uppercase">Smart Cash Flow & Asset Suite</p>
              </div>
            </div>
            <p className="text-[#444746] text-sm leading-relaxed max-w-lg pt-1">
              Kelola uang masuk dan keluar dengan 3 dompet terpisah — Kas Utama, Kas Usaha, dan Kas Keluarga — lengkap dengan rencana anggaran dan laporan Excel otomatis.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-white border border-[#e0e2e0]">
              <Layers className="text-[#1a73e8] mb-2" size={22} />
              <h4 className="font-medium text-xs text-[#1f1f1f]">3 Dompet Terpisah</h4>
              <p className="text-[11px] text-[#747775] mt-1">Kas Utama bisa dipindah ke Kas Usaha & Keluarga otomatis.</p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-[#e0e2e0]">
              <TrendingUp className="text-[#1a73e8] mb-2" size={22} />
              <h4 className="font-medium text-xs text-[#1f1f1f]">13 Sheet Live Formula</h4>
              <p className="text-[11px] text-[#747775] mt-1">Export Excel real-time dengan kalkulasi native.</p>
            </div>
          </div>

          <div className="flex items-center gap-5 text-xs text-[#444746] pt-1">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={16} className="text-[#137333]" /> Database Cloud Neon
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={16} className="text-[#137333]" /> Enkripsi Session JWT
            </span>
          </div>
        </div>

        {/* Right Form Card */}
        <div className="lg:col-span-5 w-full">
          <div className="bg-white border border-[#e0e2e0] rounded-3xl p-6 sm:p-8 md-elevation-1">
            <div className="lg:hidden flex items-center gap-3 mb-6 pb-4 border-b border-[#e0e2e0]">
              <div className="w-10 h-10 rounded-2xl bg-[#1a73e8] flex items-center justify-center text-white font-bold text-lg">
                F
              </div>
              <div>
                <h1 className="font-medium text-lg text-[#1f1f1f] tracking-tight">FinSheet Pro</h1>
                <p className="text-xs text-[#1a73e8]">Smart Cash Flow & Asset</p>
              </div>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-medium text-[#1f1f1f] tracking-tight">Masuk ke Akun</h2>
              <p className="text-xs text-[#747775] mt-1">Akses seluruh modul pembukuan dan data keuangan Anda.</p>
            </div>

            {error && (
              <div className="mt-4 p-3.5 bg-[#fce8e6] border border-[#fad2cf] rounded-2xl text-xs text-[#c5221f] animate-in">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="login-email" className="text-xs font-medium text-[#444746] block mb-1">
                  Email Akun
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#747775]" aria-hidden="true" />
                  <input
                    id="login-email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#747775] rounded-xl text-xs sm:text-sm text-[#1f1f1f] placeholder:text-[#747775] outline-none focus:border-[#1a73e8] focus:ring-2 focus:ring-[#1a73e8]/20 transition"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="login-password" className="text-xs font-medium text-[#444746] block mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#747775]" aria-hidden="true" />
                  <input
                    id="login-password"
                    type="password"
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#747775] rounded-xl text-xs sm:text-sm text-[#1f1f1f] placeholder:text-[#747775] outline-none focus:border-[#1a73e8] focus:ring-2 focus:ring-[#1a73e8]/20 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 bg-[#1a73e8] hover:bg-[#1557b0] disabled:opacity-50 text-white rounded-full text-xs sm:text-sm font-medium flex items-center justify-center gap-2 md-elevation-1 transition cursor-pointer"
              >
                {loading ? 'Memverifikasi...' : 'Masuk Sekarang'}
                <ArrowRight size={16} />
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-[#e0e2e0] flex items-center justify-between text-xs text-[#747775]">
              <span>Belum memiliki akun?</span>
              <Link to="/register" className="font-medium text-[#1a73e8] hover:underline">
                Daftar Akun Baru
              </Link>
            </div>

            <div className="mt-6 p-3 rounded-2xl bg-[#e8f0fe] flex items-center gap-2 text-[11px] text-[#1a73e8]">
              <ShieldCheck size={16} className="shrink-0" />
              <span>Koneksi aman PostgreSQL dengan enkripsi session.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
