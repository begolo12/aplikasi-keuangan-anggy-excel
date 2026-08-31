import React, { useState } from 'react'
import { useAuth } from '../lib/auth-context'
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
    <div className="min-h-screen bg-[#f4f8f5] text-slate-800 flex items-center justify-center p-4 sm:p-6 antialiased relative overflow-hidden selection:bg-emerald-700 selection:text-white">
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-emerald-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-teal-200/40 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md bg-white border border-[#e2ece5] rounded-3xl p-6 sm:p-8 shadow-xl shadow-emerald-950/4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#1b4332] to-[#52b788] flex items-center justify-center text-white font-black text-xl shadow-sm">
            A
          </div>
          <div>
            <h1 className="font-extrabold text-lg text-[#132a22] tracking-tight leading-none">Anggy Keuangan</h1>
            <p className="text-xs text-[#40916c] font-bold mt-1">Multi-Ledger & Asset Suite</p>
          </div>
        </div>

        <div className="mt-6">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#e8f5e9] border border-[#c8e6c9] text-[#1b4332] text-[10px] font-extrabold uppercase tracking-wider mb-2">
            <Sparkles size={12} className="text-[#2d6a4f]" />
            <span>Workspace Cloud Privat</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#132a22] tracking-tight">Buat Akun Baru</h2>
          <p className="text-xs text-slate-500 mt-1">Mulai kelola keuangan 3-ledger, anggaran, aset, dan piutang Anda.</p>
        </div>

        {error && (
          <div className="mt-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-700 animate-in">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-3.5">
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Nama Lengkap
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Anggy"
                className="w-full pl-10 pr-3.5 py-2.5 bg-[#f8faf9] border border-[#e2ece5] rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:bg-white focus:border-[#2d6a4f] focus:ring-2 focus:ring-[#2d6a4f]/10 transition"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Email
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
              Password (min. 6 karakter)
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

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Konfirmasi Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 bg-[#f8faf9] border border-[#e2ece5] rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:bg-white focus:border-[#2d6a4f] focus:ring-2 focus:ring-[#2d6a4f]/10 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-3 py-3 bg-[#1b4332] hover:bg-[#2d6a4f] disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 shadow-sm transition active:scale-[0.98]"
          >
            {loading ? 'Mendaftarkan Workspace...' : 'Daftar Sekarang'}
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-[#e2ece5] flex items-center justify-between text-xs text-slate-500">
          <span>Sudah memiliki akun?</span>
          <Link to="/login" className="font-bold text-[#2d6a4f] hover:underline">
            Masuk
          </Link>
        </div>

        <div className="mt-6 p-3 rounded-xl bg-[#f4f8f5] border border-[#e2ece5] flex items-center gap-2 text-[11px] text-[#2d6a4f] font-semibold">
          <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
          <span>Isolasi data terjamin per workspace pengguna.</span>
        </div>
      </div>
    </div>
  )
}
