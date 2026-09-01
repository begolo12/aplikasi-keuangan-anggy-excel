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
    <div className="min-h-screen bg-[#f8f9fa] text-[#1f1f1f] flex items-center justify-center p-4 sm:p-6 antialiased relative selection:bg-[#1a73e8] selection:text-white">
      <div className="relative z-10 w-full max-w-md bg-white border border-[#e0e2e0] rounded-3xl p-6 sm:p-8 md-elevation-1">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#1a73e8] flex items-center justify-center text-white font-bold text-xl md-elevation-1">
            F
          </div>
          <div>
            <h1 className="font-medium text-lg text-[#1f1f1f] tracking-tight leading-none">FinSheet Pro</h1>
            <p className="text-xs text-[#1a73e8] mt-1">Smart Cash Flow & Asset Suite</p>
          </div>
        </div>

        <div className="mt-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e8f0fe] text-[#1a73e8] text-[11px] font-medium tracking-wide mb-2">
            <Sparkles size={13} />
            <span>Workspace Cloud Privat</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-medium text-[#1f1f1f] tracking-tight">Buat Akun Baru</h2>
          <p className="text-xs text-[#747775] mt-1">Mulai kelola kas 3-ledger, anggaran, aset, dan piutang Anda.</p>
        </div>

        {error && (
          <div className="mt-4 p-3.5 bg-[#fce8e6] border border-[#fad2cf] rounded-2xl text-xs text-[#c5221f] animate-in">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-3.5">
          <div>
            <label htmlFor="reg-name" className="text-xs font-medium text-[#444746] block mb-1">
              Nama Lengkap
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#747775]" aria-hidden="true" />
              <input
                id="reg-name"
                type="text"
                required
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Anggy"
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#747775] rounded-xl text-xs sm:text-sm text-[#1f1f1f] placeholder:text-[#747775] outline-none focus:border-[#1a73e8] focus:ring-2 focus:ring-[#1a73e8]/20 transition"
              />
            </div>
          </div>

          <div>
            <label htmlFor="reg-email" className="text-xs font-medium text-[#444746] block mb-1">
              Email
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#747775]" aria-hidden="true" />
              <input
                id="reg-email"
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
            <label htmlFor="reg-password" className="text-xs font-medium text-[#444746] block mb-1">
              Password (min. 6 karakter)
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#747775]" aria-hidden="true" />
              <input
                id="reg-password"
                type="password"
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#747775] rounded-xl text-xs sm:text-sm text-[#1f1f1f] placeholder:text-[#747775] outline-none focus:border-[#1a73e8] focus:ring-2 focus:ring-[#1a73e8]/20 transition"
              />
            </div>
          </div>

          <div>
            <label htmlFor="reg-confirm" className="text-xs font-medium text-[#444746] block mb-1">
              Konfirmasi Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#747775]" aria-hidden="true" />
              <input
                id="reg-confirm"
                type="password"
                required
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#747775] rounded-xl text-xs sm:text-sm text-[#1f1f1f] placeholder:text-[#747775] outline-none focus:border-[#1a73e8] focus:ring-2 focus:ring-[#1a73e8]/20 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-3 py-3 bg-[#1a73e8] hover:bg-[#1557b0] disabled:opacity-50 text-white rounded-full text-xs sm:text-sm font-medium flex items-center justify-center gap-2 md-elevation-1 transition cursor-pointer"
          >
            {loading ? 'Mendaftarkan Workspace...' : 'Daftar Sekarang'}
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-[#e0e2e0] flex items-center justify-between text-xs text-[#747775]">
          <span>Sudah memiliki akun?</span>
          <Link to="/login" className="font-medium text-[#1a73e8] hover:underline">
            Masuk
          </Link>
        </div>

        <div className="mt-6 p-3 rounded-2xl bg-[#e8f0fe] flex items-center gap-2 text-[11px] text-[#1a73e8]">
          <ShieldCheck size={16} className="shrink-0" />
          <span>Isolasi data terjamin per workspace pengguna.</span>
        </div>
      </div>
    </div>
  )
}
