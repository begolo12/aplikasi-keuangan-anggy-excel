import React, { useState } from 'react'
import {
  Users,
  Tag,
  Wallet,
  Plus,
  Trash2,
  CheckCircle2,
  Calendar,
  Save,
} from 'lucide-react'
import { Card } from '../common/Card'
import { RupiahInput } from '../common/RupiahInput'
import { ConfirmDialog } from '../common/ConfirmDialog'
import type { State } from '../../store'

interface SettingsViewProps {
  store: State
}

export function SettingsView({ store: s }: SettingsViewProps) {
  const [activeTab, setActiveTab] = useState<'nsb' | 'pos' | 'kas' | 'periode'>('nsb')
  const [newNsb, setNewNsb] = useState('')
  const [newPos, setNewPos] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'nsb' | 'pos'; name: string } | null>(null)
  
  const [savedNotif, setSavedNotif] = useState(false)

  // Local state for Kas labels
  const [labels, setLabels] = useState({
    master: s.ledgerLabels?.master || 'Kas Utama',
    operasional: s.ledgerLabels?.operasional || 'Kas Usaha',
    keluarga: s.ledgerLabels?.keluarga || 'Kas Keluarga',
  })

  // Local state for Periode
  const [yearInput, setYearInput] = useState(s.year)
  const [saldoAwalInput, setSaldoAwalInput] = useState(s.saldoAwal)

  const nsbList = s.customNsbList || []
  const posList = s.customPosList || []

  const handleAddNsb = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newNsb.trim()) return
    s.addCustomNsb(newNsb)
    setNewNsb('')
    showSaved()
  }

  const handleAddPos = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPos.trim()) return
    s.addCustomPos(newPos)
    setNewPos('')
    showSaved()
  }

  const handleSaveKas = (e: React.FormEvent) => {
    e.preventDefault()
    s.setLedgerLabels(labels)
    showSaved()
  }

  const handleSavePeriode = (e: React.FormEvent) => {
    e.preventDefault()
    s.setYear(yearInput)
    s.setSaldoAwal(saldoAwalInput)
    showSaved()
  }

  const showSaved = () => {
    setSavedNotif(true)
    setTimeout(() => setSavedNotif(false), 2500)
  }

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium tracking-tight text-text">Pengaturan Master Data</h1>
          <p className="text-xs text-text-subtle mt-1">
            Kelola daftar nasabah, pos/kategori transaksi, penamaan dompet kas, dan saldo awal pembukuan.
          </p>
        </div>
        {savedNotif && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-positive-soft text-positive text-xs font-medium animate-in">
            <CheckCircle2 size={16} />
            <span>Perubahan berhasil disimpan!</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border overflow-x-auto pb-1">
        {[
          { id: 'nsb' as const, label: 'Daftar Nasabah / Pihak', icon: Users, count: nsbList.length },
          { id: 'pos' as const, label: 'Daftar Kategori / Pos', icon: Tag, count: posList.length },
          { id: 'kas' as const, label: 'Penamaan Dompet Kas', icon: Wallet },
          { id: 'periode' as const, label: 'Tahun & Saldo Awal', icon: Calendar },
        ].map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                isActive
                  ? 'bg-accent-soft text-text'
                  : 'text-text-muted hover:bg-surface-sunken'
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
              {'count' in tab && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${isActive ? 'bg-accent text-white' : 'bg-border-strong text-text'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* 1. MASTER NASABAH */}
      {activeTab === 'nsb' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4">
            <Card className="p-5">
              <h3 className="text-sm font-medium text-text mb-1">Tambah Nasabah / Pihak</h3>
              <p className="text-xs text-text-subtle mb-4">
                Nama orang, bank, toko, atau vendor yang sering bertransaksi.
              </p>
              <form onSubmit={handleAddNsb} className="space-y-3">
                <input
                  type="text"
                  required
                  value={newNsb}
                  onChange={(e) => setNewNsb(e.target.value)}
                  placeholder="Contoh: PT MAJU JAYA, PAK BUDI"
                  className="w-full px-3.5 py-2.5 bg-surface border border-border-strong rounded-lg text-xs text-text outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg bg-accent hover:bg-accent-hover text-white text-xs font-medium flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Plus size={16} /> Tambah Nasabah
                </button>
              </form>
            </Card>
          </div>

          <div className="lg:col-span-8">
            <Card className="p-5">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
                <div>
                  <h3 className="text-sm font-medium text-text">Daftar Master Nasabah</h3>
                  <p className="text-xs text-text-subtle">Otomatis muncul di pilihan input transaksi dan piutang.</p>
                </div>
                <span className="text-xs text-text-subtle">Total: {nsbList.length}</span>
              </div>

              {nsbList.length === 0 ? (
                <p className="text-xs text-text-subtle text-center py-8">Belum ada data nasabah master.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-[420px] overflow-y-auto pr-1">
                  {nsbList.map((name) => (
                    <div
                      key={name}
                      className="flex items-center justify-between p-3 rounded-lg bg-surface-sunken border border-border hover:border-border-strong transition"
                    >
                      <span className="text-xs font-medium text-text truncate">{name}</span>
                      <button
                        onClick={() => setDeleteTarget({ type: 'nsb', name })}
                        className="p-1.5 rounded-lg text-text-subtle hover:text-negative hover:bg-negative-soft transition cursor-pointer"
                        title="Hapus"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* 2. MASTER POS / KATEGORI */}
      {activeTab === 'pos' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4">
            <Card className="p-5">
              <h3 className="text-sm font-medium text-text mb-1">Tambah Kategori / Pos</h3>
              <p className="text-xs text-text-subtle mb-4">
                Kelompok pengeluaran atau pemasukan transaksi kas.
              </p>
              <form onSubmit={handleAddPos} className="space-y-3">
                <input
                  type="text"
                  required
                  value={newPos}
                  onChange={(e) => setNewPos(e.target.value)}
                  placeholder="Contoh: LOGISTIK, MARKETING, PULSA"
                  className="w-full px-3.5 py-2.5 bg-surface border border-border-strong rounded-lg text-xs text-text outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg bg-accent hover:bg-accent-hover text-white text-xs font-medium flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Plus size={16} /> Tambah Kategori
                </button>
              </form>
            </Card>
          </div>

          <div className="lg:col-span-8">
            <Card className="p-5">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
                <div>
                  <h3 className="text-sm font-medium text-text">Daftar Kategori Transaksi</h3>
                  <p className="text-xs text-text-subtle">Muncul di dropdown autocomplete pencatatan transaksi.</p>
                </div>
                <span className="text-xs text-text-subtle">Total: {posList.length}</span>
              </div>

              {posList.length === 0 ? (
                <p className="text-xs text-text-subtle text-center py-8">Belum ada data kategori.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-[420px] overflow-y-auto pr-1">
                  {posList.map((pos) => (
                    <div
                      key={pos}
                      className="flex items-center justify-between p-3 rounded-lg bg-surface-sunken border border-border hover:border-border-strong transition"
                    >
                      <span className="text-xs font-medium text-text truncate">{pos}</span>
                      <button
                        onClick={() => setDeleteTarget({ type: 'pos', name: pos })}
                        className="p-1.5 rounded-lg text-text-subtle hover:text-negative hover:bg-negative-soft transition cursor-pointer"
                        title="Hapus"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* 3. PENAMAAN DOMPET KAS */}
      {activeTab === 'kas' && (
        <Card className="p-6 max-w-2xl">
          <h3 className="text-base font-medium text-text mb-1">Pengaturan Penamaan Dompet Kas</h3>
          <p className="text-xs text-text-subtle mb-5">
            Ubah label tampilan untuk 3 dompet kas sesuai kebutuhan pembukuan Anda.
          </p>

          <form onSubmit={handleSaveKas} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-text-muted block mb-1">
                Dompet 1 (Master / Kas Utama)
              </label>
              <input
                type="text"
                required
                value={labels.master}
                onChange={(e) => setLabels({ ...labels, master: e.target.value })}
                placeholder="Kas Utama"
                className="w-full px-3.5 py-2.5 bg-surface border border-border-strong rounded-lg text-xs text-text outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
              />
              <p className="text-[11px] text-text-subtle mt-1">Dompet kas pusat tempat penerimaan saldo awal dan transfer keluar.</p>
            </div>

            <div>
              <label className="text-xs font-medium text-text-muted block mb-1">
                Dompet 2 (Operasional / Kas Usaha)
              </label>
              <input
                type="text"
                required
                value={labels.operasional}
                onChange={(e) => setLabels({ ...labels, operasional: e.target.value })}
                placeholder="Kas Usaha"
                className="w-full px-3.5 py-2.5 bg-surface border border-border-strong rounded-lg text-xs text-text outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
              />
              <p className="text-[11px] text-text-subtle mt-1">Digunakan untuk belanja operasional, gaji, dan anggaran bisnis.</p>
            </div>

            <div>
              <label className="text-xs font-medium text-text-muted block mb-1">
                Dompet 3 (Keluarga / Pribadi)
              </label>
              <input
                type="text"
                required
                value={labels.keluarga}
                onChange={(e) => setLabels({ ...labels, keluarga: e.target.value })}
                placeholder="Kas Keluarga"
                className="w-full px-3.5 py-2.5 bg-surface border border-border-strong rounded-lg text-xs text-text outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
              />
              <p className="text-[11px] text-text-subtle mt-1">Digunakan untuk kebutuhan rumah tangga dan anggaran keluarga.</p>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-lg bg-accent hover:bg-accent-hover text-white text-xs font-medium flex items-center gap-2 transition cursor-pointer"
              >
                <Save size={16} /> Simpan Penamaan Kas
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* 4. PERIODE TAHUN & SALDO AWAL */}
      {activeTab === 'periode' && (
        <Card className="p-6 max-w-2xl">
          <h3 className="text-base font-medium text-text mb-1">Tahun Buku & Saldo Awal</h3>
          <p className="text-xs text-text-subtle mb-5">
            Atur tahun aktif dan saldo awal yang ada di Kas Utama pada tanggal 1 Januari tahun tersebut.
          </p>

          <form onSubmit={handleSavePeriode} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-text-muted block mb-1">
                Tahun Finansial
              </label>
              <input
                type="number"
                min={2020}
                max={2040}
                required
                value={yearInput}
                onChange={(e) => setYearInput(parseInt(e.target.value, 10) || s.year)}
                className="w-full px-3.5 py-2.5 bg-surface border border-border-strong rounded-lg text-xs font-medium num outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-text-muted block mb-1">
                Saldo Awal Kas Utama (1 Jan {yearInput})
              </label>
              <RupiahInput
                value={saldoAwalInput}
                onChange={setSaldoAwalInput}
                placeholder="0"
                className="w-full px-3.5 py-2.5 bg-surface border border-border-strong rounded-lg text-sm font-medium num outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
              />
              <p className="text-[11px] text-text-subtle mt-1">Saldo ini menjadi modal dasar kas utama sebelum transaksi tahun berjalan dicatat.</p>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-lg bg-accent hover:bg-accent-hover text-white text-xs font-medium flex items-center gap-2 transition cursor-pointer"
              >
                <Save size={16} /> Terapkan Periode & Saldo Awal
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={`Hapus ${deleteTarget?.type === 'nsb' ? 'Nasabah' : 'Kategori'}`}
        message={`Yakin ingin menghapus master "${deleteTarget?.name}"? Transaksi yang sudah tercatat sebelumnya tetap aman.`}
        confirmLabel="Hapus Master"
        onConfirm={() => {
          if (!deleteTarget) return
          if (deleteTarget.type === 'nsb') {
            s.delCustomNsb(deleteTarget.name)
          } else {
            s.delCustomPos(deleteTarget.name)
          }
          setDeleteTarget(null)
          showSaved()
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
