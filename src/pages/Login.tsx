import React, { useState } from 'react'
import { useAuth } from '../lib/auth-context'
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
    <div className="min-h-screen bg-[#f4f8f5] text-slate-800 flex items-center justify-center p-4 sm:p-6 antialiased relative overflow-hidden selection:bg-emerald-700 selection:text-white">
      {/* Ambient pastel shapes */}
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-emerald-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-teal-200/40 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Info Panel */}
        <div className="lg:col-span-7 space-y-6 hidden lg:block pr-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#e8f5e9] border border-[#c8e6c9] text-[#1b4332] text-xs font-extrabold tracking-wide uppercase">
            <Sparkles size={14} className="text-[#2d6a4f]" />
            <span>Clean Pastel Workspace</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#1b4332] to-[#52b788] flex items-center justify-center text-white font-black text-2xl shadow-sm">
                F
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tight text-[#132a22]">FinSheet Pro</h1>
                <p className="text-sm font-bold text-[#40916c] tracking-wide uppercase">Smart Cash Flow & Asset Suite</p>
              </div>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed max-w-lg pt-1">
              Sistem pembukuan kas profesional & manajemen aset: 3 Buku Kas (Master, Operasional, Keluarga), Rencana Anggaran Biaya (RAB), Cash Flow tahunan, dan 13 Sheet Formula Live Excel.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3.5 pt-2">
            <div className="p-4 rounded-2xl bg-white border border-[#e2ece5] shadow-xs">
              <Layers className="text-[#2d6a4f] mb-2" size={20} />
              <h4 className="font-bold text-xs text-[#132a22]">3 Buku Kas Terpisah</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Master dropping ke Operasional & Keluarga otomatis.</p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-[#e2ece5] shadow-xs">
              <TrendingUp className="text-emerald-600 mb-2" size={20} />
              <h4 className="font-bold text-xs text-[#132a22]">13 Sheet Live Formula</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Export Excel real-time dengan kalkulasi native.</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-bold text-[#2d6a4f] pt-1">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={15} className="text-emerald-600" /> Database Cloud Neon
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={15} className="text-emerald-600" /> Enkripsi Session JWT
            </span>
          </div>
        </div>

        {/* Right Form Card */}
        <div className="lg:col-span-5 w-full">
          <div className="bg-white border border-[#e2ece5] rounded-3xl p-6 sm:p-8 shadow-xl shadow-emerald-950/4">
            <div className="lg:hidden flex items-center gap-3 mb-6 pb-4 border-b border-[#e2ece5]">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#1b4332] to-[#52b788] flex items-center justify-center text-white font-black text-lg shadow-sm">
                F
              </div>
              <div>
                <h1 className="font-black text-lg text-[#132a22] tracking-tight">FinSheet Pro</h1>
                <p className="text-xs text-[#40916c] font-bold">Smart Cash Flow & Asset</p>
              </div>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#132a22] tracking-tight">Masuk ke Akun</h2>
              <p className="text-xs text-slate-500 mt-1">Akses seluruh modul pencatatan dan data finansial Anda.</p>
            </div>

            {error && (
              <div className="mt-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-700 animate-in">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Email Akun
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-[#f8faf9] border border-[#e2ece5] rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:bg-white focus:border-[#2d6a4f] focus:ring-2 focus:ring-[#2d6a4f]/10 transition"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-[#f8faf9] border border-[#e2ece5] rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:bg-white focus:border-[#2d6a4f] focus:ring-2 focus:ring-[#2d6a4f]/10 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 bg-[#1b4332] hover:bg-[#2d6a4f] disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 shadow-sm transition active:scale-[0.98]"
              >
                {loading ? 'Memverifikasi...' : 'Masuk Sekarang'}
                <ArrowRight size={16} />
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-[#e2ece5] flex items-center justify-between text-xs text-slate-500">
              <span>Belum memiliki akun?</span>
              <Link to="/register" className="font-bold text-[#2d6a4f] hover:underline">
                Daftar Akun Baru
              </Link>
            </div>

            <div className="mt-6 p-3 rounded-xl bg-[#f4f8f5] border border-[#e2ece5] flex items-center gap-2 text-[11px] text-[#2d6a4f] font-semibold">
              <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
              <span>Koneksi aman PostgreSQL dengan enkripsi session.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
