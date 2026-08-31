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

function emptySeed(): StateData {
  return {
    schemaVersion: SCHEMA_VERSION,
    demoMode: false,
    txs: [],
    rabAnggy: [],
    rabKeluarga: [],
    piutangs: [],
    deps: [],
    assets: [],
    scheds: [],
    year: 2026,
    saldoAwal: 0,
  }
}

function normalizeState(data: Partial<StateData>): StateData {
  const base = emptySeed()
  const months = (values: unknown): number[] =>
    Array.from({ length: 12 }, (_, index) => {
      const value = Array.isArray(values) ? Number(values[index]) : 0
      return Number.isFinite(value) && value >= 0 ? value : 0
    })
  const txs = Array.isArray(data.txs)
    ? data.txs.filter(Boolean).map((tx) => ({
        ...tx,
        id: typeof tx.id === 'string' && tx.id ? tx.id : uid(),
        penerimaan: Math.max(0, Number(tx.penerimaan) || 0),
        pengeluaran: Math.max(0, Number(tx.pengeluaran) || 0),
      }))
    : base.txs
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
    scheds: Array.isArray(data.scheds)
      ? data.scheds.map((row) => ({
          ...row,
          months: months(row.months),
          total: months(row.months).reduce((sum, value) => sum + value, 0),
        }))
      : base.scheds,
    year: Number.isFinite(Number(data.year)) ? Math.round(Number(data.year)) : base.year,
    saldoAwal: Math.max(0, Number(data.saldoAwal) || 0),
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

export type SyncStatus = 'synced' | 'syncing' | 'offline' | 'error'

export type State = StateData & {
  syncStatus: SyncStatus
  setSyncStatus: (s: SyncStatus) => void

  loadFromServer: () => Promise<void>
  syncToServer: () => Promise<void>

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

let syncTimeout: any = null
function queueSync(get: () => State) {
  if (syncTimeout) clearTimeout(syncTimeout)
  syncTimeout = setTimeout(() => {
    void get().syncToServer()
  }, 500)
}

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      ...emptySeed(),
      syncStatus: 'synced',
      setSyncStatus: (syncStatus) => set({ syncStatus }),

      loadFromServer: async () => {
        set({ syncStatus: 'syncing' })
        try {
          const res = await fetch('/api/state')
          if (res.ok) {
            const data = await res.json()
            set({ ...normalizeState(data), syncStatus: 'synced' })
          } else {
            set({ syncStatus: 'offline' })
          }
        } catch {
          set({ syncStatus: 'offline' })
        }
      },

      syncToServer: async () => {
        const s = get()
        set({ syncStatus: 'syncing' })
        try {
          const res = await fetch('/api/state', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              schemaVersion: s.schemaVersion,
              demoMode: s.demoMode,
              year: s.year,
              saldoAwal: s.saldoAwal,
              txs: s.txs,
              rabAnggy: s.rabAnggy,
              rabKeluarga: s.rabKeluarga,
              piutangs: s.piutangs,
              assets: s.assets,
              deps: s.deps,
              scheds: s.scheds,
            }),
          })
          if (res.ok) {
            set({ syncStatus: 'synced' })
          } else {
            set({ syncStatus: 'error' })
          }
        } catch {
          set({ syncStatus: 'offline' })
        }
      },

      addTx: (t) => {
        const penerimaan = Number(t.penerimaan) || 0
        const pengeluaran = Number(t.pengeluaran) || 0
        if (!t.tanggal || !t.uraian.trim() || penerimaan < 0 || pengeluaran < 0 || (penerimaan > 0 && pengeluaran > 0)) return
        set((s) => ({ txs: [...s.txs, { ...t, penerimaan, pengeluaran, id: uid() }], demoMode: false }))
        queueSync(get)
      },
      delTx: (id) => {
        set((s) => ({ txs: s.txs.filter((x) => x.id !== id), demoMode: false }))
        queueSync(get)
      },
      updTx: (id, patch) => {
        set((s) => ({ txs: s.txs.map((x) => (x.id === id ? { ...x, ...patch } : x)), demoMode: false }))
        queueSync(get)
      },

      transferDropping: (from, to, amount, tanggal, uraian) => {
        const s = get()
        const targetYear = Number(tanggal.slice(0, 4)) || s.year
        const currentMasterBal = s.saldoAwal + s.txs
          .filter((x) => x.ledger === from && x.tanggal.startsWith(`${targetYear}-`))
          .reduce((sum, x) => sum + x.penerimaan - x.pengeluaran, 0)

        if (from !== 'master' || !['operasional', 'keluarga'].includes(to) || !Number.isFinite(amount) || amount <= 0 || amount > currentMasterBal) return
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
        set((state) => ({ txs: [...state.txs, t1, t2], demoMode: false }))
        queueSync(get)
      },

      addRab: (which, r) => {
        set((s) =>
          which === 'anggy'
            ? { rabAnggy: [...s.rabAnggy, { ...r, id: uid() }], demoMode: false }
            : { rabKeluarga: [...s.rabKeluarga, { ...r, id: uid() }], demoMode: false }
        )
        queueSync(get)
      },
      delRab: (which, id) => {
        set((s) =>
          which === 'anggy'
            ? { rabAnggy: s.rabAnggy.filter((x) => x.id !== id), demoMode: false }
            : { rabKeluarga: s.rabKeluarga.filter((x) => x.id !== id), demoMode: false }
        )
        queueSync(get)
      },
      updRab: (which, id, patch) => {
        set((s) =>
          which === 'anggy'
            ? { rabAnggy: s.rabAnggy.map((x) => (x.id === id ? { ...x, ...patch } : x)), demoMode: false }
            : { rabKeluarga: s.rabKeluarga.map((x) => (x.id === id ? { ...x, ...patch } : x)), demoMode: false }
        )
        queueSync(get)
      },

      addPiutang: (p) => {
        set((s) => ({ piutangs: [...s.piutangs, { ...p, id: uid() }], demoMode: false }))
        queueSync(get)
      },
      delPiutang: (id) => {
        set((s) => ({ piutangs: s.piutangs.filter((x) => x.id !== id), demoMode: false }))
        queueSync(get)
      },
      updPiutang: (id, patch) => {
        set((s) => ({ piutangs: s.piutangs.map((x) => (x.id === id ? { ...x, ...patch } : x)), demoMode: false }))
        queueSync(get)
      },
      catatPelunasan: (id, nominal, tanggal) => {
        const s = get()
        const p = s.piutangs.find((x) => x.id === id)
        const outstanding = p ? p.terbit - p.lunas : 0
        if (!p || !Number.isFinite(nominal) || nominal <= 0 || nominal > outstanding) return
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
        set((state) => ({ piutangs: [...state.piutangs, newEntry], txs: [...state.txs, newTx], demoMode: false }))
        queueSync(get)
      },

      addAsset: (a) => {
        set((s) => ({ assets: [...s.assets, { ...a, id: uid() }], demoMode: false }))
        queueSync(get)
      },
      delAsset: (id) => {
        set((s) => ({ assets: s.assets.filter((x) => x.id !== id), demoMode: false }))
        queueSync(get)
      },
      updAsset: (id, patch) => {
        set((s) => ({ assets: s.assets.map((x) => (x.id === id ? { ...x, ...patch } : x)), demoMode: false }))
        queueSync(get)
      },

      addDep: (d) => {
        set((s) => ({ deps: [...s.deps, { ...d, id: uid() }], demoMode: false }))
        queueSync(get)
      },
      delDep: (id) => {
        set((s) => ({ deps: s.deps.filter((x) => x.id !== id), demoMode: false }))
        queueSync(get)
      },
      updDep: (id, patch) => {
        set((s) => ({ deps: s.deps.map((x) => (x.id === id ? { ...x, ...patch } : x)), demoMode: false }))
        queueSync(get)
      },

      addSched: (sc) => {
        set((s) => ({
          scheds: [...s.scheds, { ...sc, months: sc.months.length === 12 ? sc.months : Array(12).fill(0), id: uid() }],
          demoMode: false,
        }))
        queueSync(get)
      },
      delSched: (id) => {
        set((s) => ({ scheds: s.scheds.filter((x) => x.id !== id), demoMode: false }))
        queueSync(get)
      },
      updSched: (id, patch) => {
        set((s) => ({ scheds: s.scheds.map((x) => (x.id === id ? { ...x, ...patch } : x)), demoMode: false }))
        queueSync(get)
      },
      toggleSchedMonth: (id, monthIdx, customAmount) => {
        set((s) => ({
          scheds: s.scheds.map((item) => {
            if (item.id !== id || monthIdx < 0 || monthIdx >= 12) return item
            const newMonths = [...item.months]
            newMonths[monthIdx] = newMonths[monthIdx] > 0 ? 0 : Math.max(0, customAmount ?? item.hs)
            return { ...item, months: newMonths, total: newMonths.reduce((sum, value) => sum + value, 0) }
          }),
          demoMode: false,
        }))
        queueSync(get)
      },

      setYear: (y) => {
        set({ year: Math.round(y) })
        queueSync(get)
      },
      setSaldoAwal: (nominal) => {
        set({ saldoAwal: Math.max(0, Number(nominal) || 0), demoMode: false })
        queueSync(get)
      },
      setDemoMode: (value) => {
        set({ demoMode: value })
        queueSync(get)
      },
      importState: (data) => {
        set(normalizeState(data))
        queueSync(get)
      },
      reset: () => {
        set(emptySeed())
        queueSync(get)
      },
    }),
    { name: 'anggy-keu-v2' }
  )
)
