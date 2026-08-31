import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Ledger = 'master' | 'operasional' | 'keluarga'

export type Tx = {
  id: string
  tanggal: string
  nsb: string
  pos: string
  uraian: string
  penerimaan: number
  pengeluaran: number
  ledger: Ledger
  kategori?: string
  transferId?: string
  receivableId?: string
}

export type RabRow = {
  id: string
  group: string
  uraian: string
  sat: string
  vol: number
  hs: number
  w: [number, number, number, number]
  months: number[]
  total: number
}

export type PiutangRow = {
  id: string
  tgl: string
  nsb: string
  uraian: string
  terbit: number
  lunas: number
  keterangan?: string
}

export type AssetRow = {
  id: string
  jenis: 'PROPERTY' | 'KENDARAAN' | 'GADGET'
  nama: string
  atasNama: string
  tgl: string
  nilai: number
  dp: number
  bunga: number
  tenor: number
  nilaiPasar: number
  tambah: number
}

export type DepRow = {
  id: string
  nama: string
  tgl: string
  nilai: number
  umur: number
  nilaiTaksir: number
  kat: 'KENDARAAN' | 'GADGET'
}

export type SchedRow = {
  id: string
  nama: string
  hs: number
  months: number[]
  kat: 'service' | 'pajak'
}

export const uid = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

export const SCHEMA_VERSION = 2

function normalizeState(data: Partial<StateData>): StateData {
  const base = seed()
  const months = (values: unknown): number[] => Array.from({ length: 12 }, (_, index) => {
    const value = Array.isArray(values) ? Number(values[index]) : 0
    return Number.isFinite(value) && value >= 0 ? value : 0
  })
  const txs = Array.isArray(data.txs) ? data.txs.filter(Boolean).map((tx) => ({
    ...tx,
    id: typeof tx.id === 'string' && tx.id ? tx.id : uid(),
    penerimaan: Math.max(0, Number(tx.penerimaan) || 0),
    pengeluaran: Math.max(0, Number(tx.pengeluaran) || 0),
  })) : base.txs
  return {
    ...base,
    ...data,
    schemaVersion: SCHEMA_VERSION,
    demoMode: Boolean(data.demoMode),
    txs,
    rabAnggy: Array.isArray(data.rabAnggy) ? data.rabAnggy : base.rabAnggy,
    rabKeluarga: Array.isArray(data.rabKeluarga) ? data.rabKeluarga : base.rabKeluarga,
    piutangs: Array.isArray(data.piutangs) ? data.piutangs : base.piutangs,
    deps: Array.isArray(data.deps) ? data.deps : base.deps,
    assets: Array.isArray(data.assets) ? data.assets : base.assets,
    scheds: Array.isArray(data.scheds) ? data.scheds.map((row) => ({ ...row, months: months(row.months), total: months(row.months).reduce((sum, value) => sum + value, 0) })) : base.scheds,
    year: Number.isFinite(Number(data.year)) ? Math.round(Number(data.year)) : base.year,
    saldoAwal: Math.max(0, Number(data.saldoAwal) || 0),
  }
}

function seed(): StateData {
  return {
    schemaVersion: SCHEMA_VERSION,
    demoMode: true,
    txs: [
      { id: uid(), tanggal: '2025-12-31', nsb: 'ANGGY', pos: 'SALDO AWAL', uraian: 'SALDO AWAL - 26 AGUSTUS 2026', penerimaan: 20000000, pengeluaran: 0, ledger: 'master' },
      { id: uid(), tanggal: '2026-01-01', nsb: 'ANGGY', pos: 'SALARY', uraian: 'SALARY - JANUARI 2026', penerimaan: 6000000, pengeluaran: 0, ledger: 'master' },
      { id: uid(), tanggal: '2026-01-01', nsb: 'ANGGY', pos: 'DROPPING', uraian: 'DROPPING - OPERASIONAL', penerimaan: 0, pengeluaran: 1500000, ledger: 'master' },
      { id: uid(), tanggal: '2026-01-01', nsb: 'ANGGY', pos: 'DROPPING', uraian: 'DROPPING - KELUARGA', penerimaan: 0, pengeluaran: 4000000, ledger: 'master' },
      { id: uid(), tanggal: '2026-01-15', nsb: 'ANGGY', pos: 'PENJUALAN - ASET', uraian: 'PENJUALAN ASET - HP', penerimaan: 3800000, pengeluaran: 0, ledger: 'master' },
      { id: uid(), tanggal: '2026-01-15', nsb: 'DAMAR', pos: 'ASET - PIUTANG', uraian: 'KEMBALI HUTANG - DAMAR', penerimaan: 500000, pengeluaran: 0, ledger: 'master' },
      { id: uid(), tanggal: '2026-01-31', nsb: 'ANGGY', pos: 'PENDAPATAN LAIN', uraian: 'ADMIN BANK', penerimaan: 0, pengeluaran: 20000, ledger: 'master' },
      // operasional
      { id: uid(), tanggal: '2026-01-01', nsb: 'ANGGY', pos: 'DROPPING', uraian: 'DROPPING - OPERASIONAL', penerimaan: 1500000, pengeluaran: 0, ledger: 'operasional' },
      { id: uid(), tanggal: '2026-01-02', nsb: 'ANGGY', pos: 'ORANG TUA', uraian: 'ORANG TUA', penerimaan: 0, pengeluaran: 200000, ledger: 'operasional' },
      { id: uid(), tanggal: '2026-01-02', nsb: 'ANGGY', pos: 'OPERASIONAL', uraian: 'ADMIN BANK', penerimaan: 0, pengeluaran: 2500, ledger: 'operasional' },
      { id: uid(), tanggal: '2026-01-05', nsb: 'ANGGY', pos: 'BELANJA', uraian: 'ROKOK', penerimaan: 0, pengeluaran: 34000, ledger: 'operasional' },
      { id: uid(), tanggal: '2026-01-07', nsb: 'ANGGY', pos: 'OPERASIONAL', uraian: 'PULSA', penerimaan: 0, pengeluaran: 50000, ledger: 'operasional' },
      { id: uid(), tanggal: '2026-01-13', nsb: 'ANGGY', pos: 'BELANJA', uraian: 'KOPI', penerimaan: 0, pengeluaran: 20000, ledger: 'operasional' },
      // keluarga
      { id: uid(), tanggal: '2026-01-01', nsb: 'ANGGY', pos: 'DROPPING', uraian: 'DROPPING - MANDIRI', penerimaan: 4000000, pengeluaran: 0, ledger: 'keluarga' },
      { id: uid(), tanggal: '2026-01-02', nsb: 'ISTRI', pos: 'NAFKAH', uraian: 'NAFKAH', penerimaan: 0, pengeluaran: 1500000, ledger: 'keluarga' },
      { id: uid(), tanggal: '2026-01-02', nsb: 'ISTRI', pos: 'ANAK', uraian: 'SPP', penerimaan: 0, pengeluaran: 200000, ledger: 'keluarga' },
      { id: uid(), tanggal: '2026-01-02', nsb: 'ISTRI', pos: 'ANAK', uraian: 'LES', penerimaan: 0, pengeluaran: 100000, ledger: 'keluarga' },
      { id: uid(), tanggal: '2026-01-02', nsb: 'ISTRI', pos: 'ANAK', uraian: 'NGAJI', penerimaan: 0, pengeluaran: 50000, ledger: 'keluarga' },
      { id: uid(), tanggal: '2026-01-02', nsb: 'ISTRI', pos: 'MERTUA', uraian: 'MERTUA', penerimaan: 0, pengeluaran: 100000, ledger: 'keluarga' },
      { id: uid(), tanggal: '2026-01-02', nsb: 'ISTRI', pos: 'PEMBANTU', uraian: 'PEMBANTU', penerimaan: 0, pengeluaran: 400000, ledger: 'keluarga' },
      { id: uid(), tanggal: '2026-01-02', nsb: 'ISTRI', pos: 'RUMAH', uraian: 'LISTRIK', penerimaan: 0, pengeluaran: 100000, ledger: 'keluarga' },
      { id: uid(), tanggal: '2026-01-07', nsb: 'ANGGY', pos: 'ANAK', uraian: 'JAJAN ANAK', penerimaan: 0, pengeluaran: 30000, ledger: 'keluarga' },
      { id: uid(), tanggal: '2026-01-10', nsb: 'ANGGY', pos: 'ANAK', uraian: 'BUKU TULIS ANAK', penerimaan: 0, pengeluaran: 45000, ledger: 'keluarga' },
      { id: uid(), tanggal: '2026-01-20', nsb: 'ANGGY', pos: 'RUMAH', uraian: 'LISTRIK RUMAH', penerimaan: 0, pengeluaran: 50000, ledger: 'keluarga' },
    ],
    rabAnggy: [
      { id: uid(), group: 'OPERASIONAL', uraian: 'TARIK DANA', sat: 'mg', vol: 1, hs: 100000, w: [100000, 100000, 100000, 100000], months: Array(12).fill(400000), total: 4800000 },
      { id: uid(), group: 'OPERASIONAL', uraian: 'PULSA / TOP UP', sat: 'bln', vol: 1, hs: 100000, w: [100000, 0, 0, 0], months: Array(12).fill(100000), total: 1200000 },
      { id: uid(), group: 'ORANG TUA', uraian: 'ORANG TUA', sat: 'bln', vol: 1, hs: 200000, w: [200000, 0, 0, 0], months: Array(12).fill(200000), total: 2400000 },
      { id: uid(), group: 'BELANJA', uraian: 'BELANJA / SHOPPING', sat: 'mg', vol: 4, hs: 100000, w: [100000, 100000, 100000, 100000], months: Array(12).fill(400000), total: 4800000 },
      { id: uid(), group: 'BELANJA', uraian: 'ROKOK / SEJENISNYA', sat: 'mg', vol: 4, hs: 100000, w: [100000, 100000, 100000, 100000], months: Array(12).fill(400000), total: 4800000 },
      { id: uid(), group: 'MOMENTUM', uraian: 'MOMENTUM (SCHEDULED)', sat: 'ls', vol: 1, hs: 0, w: [0, 0, 0, 0], months: Array(12).fill(0), total: 0 },
      { id: uid(), group: 'INSIDENTAL', uraian: 'INSIDENTAL', sat: 'ls', vol: 1, hs: 0, w: [0, 0, 0, 0], months: Array(12).fill(0), total: 0 },
    ],
    rabKeluarga: [
      { id: uid(), group: 'NAFKAH', uraian: 'NAFKAH', sat: 'bln', vol: 1, hs: 1500000, w: [1500000, 0, 0, 0], months: Array(12).fill(1500000), total: 18000000 },
      { id: uid(), group: 'NAFKAH', uraian: 'BELANJA BULANAN', sat: 'bln', vol: 1, hs: 300000, w: [300000, 0, 0, 0], months: Array(12).fill(300000), total: 3600000 },
      { id: uid(), group: 'ANAK', uraian: 'SPP', sat: 'bln', vol: 1, hs: 200000, w: [200000, 0, 0, 0], months: Array(12).fill(200000), total: 2400000 },
      { id: uid(), group: 'ANAK', uraian: 'LES', sat: 'bln', vol: 1, hs: 100000, w: [100000, 0, 0, 0], months: Array(12).fill(100000), total: 1200000 },
      { id: uid(), group: 'ANAK', uraian: 'NGAJI', sat: 'bln', vol: 1, hs: 50000, w: [50000, 0, 0, 0], months: Array(12).fill(50000), total: 600000 },
      { id: uid(), group: 'ANAK', uraian: 'SAKU', sat: 'bln', vol: 1, hs: 100000, w: [100000, 0, 0, 0], months: Array(12).fill(100000), total: 1200000 },
      { id: uid(), group: 'ANAK', uraian: 'JAJAN', sat: 'bln', vol: 1, hs: 100000, w: [100000, 0, 0, 0], months: Array(12).fill(100000), total: 1200000 },
      { id: uid(), group: 'MERTUA', uraian: 'MERTUA', sat: 'bln', vol: 1, hs: 100000, w: [100000, 0, 0, 0], months: Array(12).fill(100000), total: 1200000 },
      { id: uid(), group: 'PEMBANTU', uraian: 'PEMBANTU', sat: 'bln', vol: 1, hs: 400000, w: [400000, 0, 0, 0], months: Array(12).fill(400000), total: 4800000 },
      { id: uid(), group: 'RUMAH', uraian: 'LISTRIK', sat: 'bln', vol: 1, hs: 100000, w: [100000, 0, 0, 0], months: Array(12).fill(100000), total: 1200000 },
    ],
    piutangs: [
      { id: uid(), tgl: '2025-11-01', nsb: 'DAMAR', uraian: 'HUTANG PRIBADI', terbit: 1000000, lunas: 0, keterangan: 'Hutang keperluan usaha' },
      { id: uid(), tgl: '2025-11-15', nsb: 'CEDAR', uraian: 'HUTANG PRIBADI', terbit: 1500000, lunas: 0, keterangan: 'Pinjaman modal' },
      { id: uid(), tgl: '2025-12-15', nsb: 'CEDAR', uraian: 'KEMBALI HUTANG', terbit: 0, lunas: 500000, keterangan: 'Cicilan 1' },
    ],
    deps: [
      { id: uid(), nama: 'MOTOR - VESPA', tgl: '2024-01-10', nilai: 50000000, umur: 60, nilaiTaksir: 35000000, kat: 'KENDARAAN' },
      { id: uid(), nama: 'SEPEDA - POLIGON', tgl: '2025-08-01', nilai: 5000000, umur: 60, nilaiTaksir: 3500000, kat: 'KENDARAAN' },
      { id: uid(), nama: 'LAPTOP - ASUS', tgl: '2025-07-01', nilai: 12000000, umur: 24, nilaiTaksir: 8000000, kat: 'GADGET' },
      { id: uid(), nama: 'HP - IPHONE', tgl: '2026-05-01', nilai: 15000000, umur: 12, nilaiTaksir: 12000000, kat: 'GADGET' },
      { id: uid(), nama: 'HP - SAMSUNG', tgl: '2026-03-01', nilai: 9000000, umur: 12, nilaiTaksir: 7000000, kat: 'GADGET' },
    ],
    assets: [
      { id: uid(), jenis: 'PROPERTY', nama: 'RUMAH', atasNama: 'ANGGY', tgl: '2023-04-01', nilai: 200000000, dp: 50000000, bunga: 0.08, tenor: 120, nilaiPasar: 400000000, tambah: 40000000 },
    ],
    scheds: [
      { id: uid(), nama: 'MOTOR - VESPA service', hs: 300000, months: [0, 0, 0, 0, 0, 300000, 0, 0, 0, 0, 0, 300000], kat: 'service' },
      { id: uid(), nama: 'SEPEDA - POLIGON', hs: 100000, months: [0, 0, 100000, 0, 0, 0, 0, 0, 0, 0, 0, 0], kat: 'service' },
      { id: uid(), nama: 'SERVICE AC', hs: 150000, months: [0, 0, 0, 0, 150000, 0, 0, 0, 0, 150000, 0, 0], kat: 'service' },
      { id: uid(), nama: 'PAJAK MOTOR VESPA', hs: 500000, months: [500000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], kat: 'pajak' },
      { id: uid(), nama: 'PBB - TAHUNAN', hs: 50000, months: [0, 0, 50000, 0, 0, 0, 0, 0, 0, 0, 0, 0], kat: 'pajak' },
    ],
    year: 2026,
    saldoAwal: 20000000,
  }
}

export type StateData = {
  schemaVersion: number
  demoMode: boolean
  txs: Tx[]
  rabAnggy: RabRow[]
  rabKeluarga: RabRow[]
  piutangs: PiutangRow[]
  deps: DepRow[]
  assets: AssetRow[]
  scheds: SchedRow[]
  year: number
  saldoAwal: number
}

export type State = StateData & {
  addTx: (t: Omit<Tx, 'id'>) => void
  delTx: (id: string) => void
  updTx: (id: string, patch: Partial<Tx>) => void
  transferDropping: (from: 'master', to: 'operasional' | 'keluarga', amount: number, tanggal: string, uraian: string) => void
  
  addRab: (which: 'anggy' | 'keluarga', r: Omit<RabRow, 'id'>) => void
  delRab: (which: 'anggy' | 'keluarga', id: string) => void
  updRab: (which: 'anggy' | 'keluarga', id: string, patch: Partial<RabRow>) => void

  addPiutang: (p: Omit<PiutangRow, 'id'>) => void
  delPiutang: (id: string) => void
  updPiutang: (id: string, patch: Partial<PiutangRow>) => void
  catatPelunasan: (id: string, nominal: number, tanggal: string) => void

  addAsset: (a: Omit<AssetRow, 'id'>) => void
  delAsset: (id: string) => void
  updAsset: (id: string, patch: Partial<AssetRow>) => void

  addDep: (d: Omit<DepRow, 'id'>) => void
  delDep: (id: string) => void
  updDep: (id: string, patch: Partial<DepRow>) => void

  addSched: (sc: Omit<SchedRow, 'id'>) => void
  delSched: (id: string) => void
  updSched: (id: string, patch: Partial<SchedRow>) => void
  toggleSchedMonth: (id: string, monthIdx: number, customAmount?: number) => void

  setYear: (y: number) => void
  setSaldoAwal: (nominal: number) => void
  setDemoMode: (value: boolean) => void
  importState: (data: StateData) => void
  reset: () => void
}

export const useStore = create<State>()(
  persist(
    (set) => ({
      ...seed(),

      addTx: (t) => set((s) => {
        const penerimaan = Number(t.penerimaan) || 0
        const pengeluaran = Number(t.pengeluaran) || 0
        if (!t.tanggal || !t.uraian.trim() || penerimaan < 0 || pengeluaran < 0 || (penerimaan > 0 && pengeluaran > 0)) return s
        return { txs: [...s.txs, { ...t, penerimaan, pengeluaran, id: uid() }], demoMode: false }
      }),
      delTx: (id) => set((s) => ({ txs: s.txs.filter((x) => x.id !== id), demoMode: false })),
      updTx: (id, patch) => set((s) => ({ txs: s.txs.map((x) => (x.id === id ? { ...x, ...patch } : x)), demoMode: false })),


      transferDropping: (from, to, amount, tanggal, uraian) =>
        set((s) => {
          if (from !== 'master' || !['operasional', 'keluarga'].includes(to) || !Number.isFinite(amount) || amount <= 0 || amount > s.txs.filter((x) => x.ledger === from).reduce((sum, x) => sum + x.penerimaan - x.pengeluaran, s.saldoAwal)) return s
          const transferId = uid()
          const t1: Tx = {
            id: uid(),
            tanggal,
            nsb: 'ANGGY',
            pos: 'DROPPING',
            uraian: uraian || `DROPPING - ${to.toUpperCase()}`,
            penerimaan: 0,
            pengeluaran: amount,
            ledger: 'master',
            transferId,
          }
          const t2: Tx = {
            id: uid(),
            tanggal,
            nsb: 'ANGGY',
            pos: 'DROPPING',
            uraian: uraian || `DROPPING - ${to.toUpperCase()}`,
            penerimaan: amount,
            pengeluaran: 0,
            ledger: to,
            transferId,
          }
          return { txs: [...s.txs, t1, t2] }
        }),

      addRab: (which, r) =>
        set((s) =>
          which === 'anggy'
            ? { rabAnggy: [...s.rabAnggy, { ...r, id: uid() }] }
            : { rabKeluarga: [...s.rabKeluarga, { ...r, id: uid() }] }
        ),
      delRab: (which, id) =>
        set((s) =>
          which === 'anggy'
            ? { rabAnggy: s.rabAnggy.filter((x) => x.id !== id) }
            : { rabKeluarga: s.rabKeluarga.filter((x) => x.id !== id) }
        ),
      updRab: (which, id, patch) =>
        set((s) =>
          which === 'anggy'
            ? { rabAnggy: s.rabAnggy.map((x) => (x.id === id ? { ...x, ...patch } : x)) }
            : { rabKeluarga: s.rabKeluarga.map((x) => (x.id === id ? { ...x, ...patch } : x)) }
        ),

      addPiutang: (p) => set((s) => ({ piutangs: [...s.piutangs, { ...p, id: uid() }] })),
      delPiutang: (id) => set((s) => ({ piutangs: s.piutangs.filter((x) => x.id !== id) })),
      updPiutang: (id, patch) => set((s) => ({ piutangs: s.piutangs.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
      catatPelunasan: (id, nominal, tanggal) =>
        set((s) => {
          const p = s.piutangs.find((x) => x.id === id)
          const outstanding = p ? p.terbit - p.lunas : 0
          if (!p || !Number.isFinite(nominal) || nominal <= 0 || nominal > outstanding) return s
          const tglStr = tanggal || new Date().toISOString().slice(0, 10)
          const newEntry: PiutangRow = {
            id: uid(),
            tgl: tglStr,
            nsb: p.nsb,
            uraian: `KEMBALI HUTANG - ${p.nsb}`,
            terbit: 0,
            lunas: nominal,
            keterangan: `Pelunasan piutang ref: ${p.uraian}`,
          }
          const newTx: Tx = {
            id: uid(),
            tanggal: tglStr,
            nsb: p.nsb,
            pos: 'ASET - PIUTANG',
            uraian: `KEMBALI HUTANG - ${p.nsb}`,
            penerimaan: nominal,
            pengeluaran: 0,
            ledger: 'master',
            receivableId: id,
          }
          return { piutangs: [...s.piutangs, newEntry], txs: [...s.txs, newTx], demoMode: false }
        }),

      addAsset: (a) => set((s) => ({ assets: [...s.assets, { ...a, id: uid() }] })),
      delAsset: (id) => set((s) => ({ assets: s.assets.filter((x) => x.id !== id) })),
      updAsset: (id, patch) => set((s) => ({ assets: s.assets.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),

      addDep: (d) => set((s) => ({ deps: [...s.deps, { ...d, id: uid() }] })),
      delDep: (id) => set((s) => ({ deps: s.deps.filter((x) => x.id !== id) })),
      updDep: (id, patch) => set((s) => ({ deps: s.deps.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),

      addSched: (sc) => set((s) => ({ scheds: [...s.scheds, { ...sc, months: sc.months.length === 12 ? sc.months : Array(12).fill(0), id: uid() }], demoMode: false })),
      delSched: (id) => set((s) => ({ scheds: s.scheds.filter((x) => x.id !== id) })),
      updSched: (id, patch) => set((s) => ({ scheds: s.scheds.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
      toggleSchedMonth: (id, monthIdx, customAmount) =>
        set((s) => ({
          scheds: s.scheds.map((item) => {
            if (item.id !== id || monthIdx < 0 || monthIdx >= 12) return item
            const newMonths = [...item.months]
            newMonths[monthIdx] = newMonths[monthIdx] > 0 ? 0 : Math.max(0, customAmount ?? item.hs)
            return { ...item, months: newMonths, total: newMonths.reduce((sum, value) => sum + value, 0) }
          }),
          demoMode: false,
        })),

      setYear: (y) => set({ year: Math.round(y) }),
      setSaldoAwal: (nominal) => set({ saldoAwal: Math.max(0, Number(nominal) || 0), demoMode: false }),
      setDemoMode: (value) => set({ demoMode: value }),
      importState: (data) => set(normalizeState(data)),
      reset: () => set(seed()),
    }),
    { name: 'anggy-keu-v2' }
  )
)

