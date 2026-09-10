import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { z } from 'zod'
import { isValidDate } from './finance'

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

const txSchema = z.object({
  tanggal: z.string().refine(isValidDate, 'tanggal tidak valid'),
  uraian: z.string().trim().min(1).max(300),
  nsb: z.string().trim().min(1).max(80),
  pos: z.string().trim().min(1).max(80),
  penerimaan: z.number().min(0).max(1e15),
  pengeluaran: z.number().min(0).max(1e15),
  ledger: z.enum(['master', 'operasional', 'keluarga']),
})

function emptySeed(): StateData {
  return {
    txs: [],
    rabAnggy: [],
    rabKeluarga: [],
    piutangs: [],
    deps: [],
    assets: [],
    scheds: [],
    year: 2026,
    saldoAwal: 0,
    customNsbList: ['ANGGY', 'KELUARGA', 'OPERASIONAL', 'PLN', 'BCA', 'MANDIRI', 'BRI'],
    customPosList: ['RUTIN', 'PINDAH SALDO', 'GAJI', 'BELANJA', 'ASET', 'PIUTANG', 'PAJAK', 'SERVIS', 'OPERASIONAL', 'KONSUMSI'],
    ledgerLabels: {
      master: 'Kas Utama',
      operasional: 'Kas Usaha',
      keluarga: 'Kas Keluarga',
    },
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
    customNsbList: Array.isArray(data.customNsbList) && data.customNsbList.length ? data.customNsbList : base.customNsbList,
    customPosList: Array.isArray(data.customPosList) && data.customPosList.length ? data.customPosList : base.customPosList,
    ledgerLabels: data.ledgerLabels ? { ...base.ledgerLabels, ...data.ledgerLabels } : base.ledgerLabels,
  }
}

export type StateData = {
  txs: Tx[]
  rabAnggy: RabRow[]
  rabKeluarga: RabRow[]
  piutangs: PiutangRow[]
  deps: DepRow[]
  assets: AssetRow[]
  scheds: SchedRow[]
  year: number
  saldoAwal: number
  customNsbList?: string[]
  customPosList?: string[]
  ledgerLabels?: {
    master: string
    operasional: string
    keluarga: string
  }
}

export type SyncStatus = 'synced' | 'syncing' | 'offline' | 'error'

export type State = StateData & {
  syncStatus: SyncStatus
  serverRev: string | null
  setSyncStatus: (s: SyncStatus) => void

  loadFromServer: () => Promise<void>
  syncToServer: () => Promise<void>
  retrySync: () => void

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
  setLedgerLabels: (labels: { master: string; operasional: string; keluarga: string }) => void
  addCustomNsb: (name: string) => void
  delCustomNsb: (name: string) => void
  addCustomPos: (name: string) => void
  delCustomPos: (name: string) => void
}
let syncTimeout: NodeJS.Timeout | number | null = null
let syncInFlight = false
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
      syncStatus: 'synced' as SyncStatus,
      serverRev: null as string | null,
      setSyncStatus: (syncStatus) => set({ syncStatus }),
      loadFromServer: async () => {
        if (syncInFlight) return
        syncInFlight = true
        set({ syncStatus: 'syncing' })
        try {
          const res = await fetch('/api/state')
          if (res.ok) {
            const data = await res.json()
            set({ ...normalizeState(data), syncStatus: 'synced', serverRev: typeof data.updatedAt === 'string' ? data.updatedAt : get().serverRev })
          } else {
            set({ syncStatus: 'offline' })
          }
        } catch {
          set({ syncStatus: 'offline' })
        } finally {
          syncInFlight = false
        }
      },

      syncToServer: async () => {
        if (syncInFlight) return
        syncInFlight = true
        const s = get()
        set({ syncStatus: 'syncing' })
        try {
          const res = await fetch('/api/state', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              year: s.year,
              saldoAwal: s.saldoAwal,
              txs: s.txs,
              rabAnggy: s.rabAnggy,
              rabKeluarga: s.rabKeluarga,
              piutangs: s.piutangs,
              assets: s.assets,
              deps: s.deps,
              scheds: s.scheds,
              customNsbList: s.customNsbList,
              customPosList: s.customPosList,
              ledgerLabels: s.ledgerLabels,
              baseRev: s.serverRev,
            }),
          })
          if (res.ok) {
            const data = await res.json().catch(() => null)
            set({ syncStatus: 'synced', serverRev: data && typeof data.updatedAt === 'string' ? data.updatedAt : get().serverRev })
          } else if (res.status === 409) {
            syncInFlight = false
            await get().loadFromServer()
            set({ syncStatus: 'error' })
            return
          } else {
            set({ syncStatus: 'error' })
          }
        } catch {
          set({ syncStatus: 'offline' })
        } finally {
          syncInFlight = false
        }
      },

      retrySync: () => {
        const s = get()
        if (s.syncStatus === 'synced') return
        queueSync(get)
      },

      addTx: (t) => {
        const penerimaan = Number(t.penerimaan) || 0
        const pengeluaran = Number(t.pengeluaran) || 0
        const parsed = txSchema.safeParse({ ...t, penerimaan, pengeluaran })
        if (!parsed.success || (penerimaan > 0 && pengeluaran > 0) || (penerimaan === 0 && pengeluaran === 0)) return
        set((s) => ({ txs: [...s.txs, { ...parsed.data, id: uid(), kategori: t.kategori, transferId: t.transferId, receivableId: t.receivableId }] }))
        queueSync(get)
      },
      delTx: (id) => {
        const target = get().txs.find((x) => x.id === id)
        if (!target) return
        const pairCount = target.transferId ? get().txs.filter((x) => x.transferId === target.transferId).length - 1 : 0
        set((s) => {
          let txs = s.txs.filter((x) => x.id !== id)
          if (target.transferId) txs = txs.filter((x) => x.transferId !== target.transferId)
          let piutangs = s.piutangs
          if (target.receivableId) {
            const amount = Math.max(0, Number(target.penerimaan) || 0) - Math.max(0, Number(target.pengeluaran) || 0)
            piutangs = piutangs.map((p) => (p.id === target.receivableId ? { ...p, lunas: Math.max(0, (Number(p.lunas) || 0) - Math.abs(amount)) } : p))
          }
          return { txs, piutangs }
        })
        queueSync(get)
        notify(pairCount > 0 ? 'Transfer dihapus sepasang (keluar + masuk).' : 'Transaksi dihapus.', 'success')
      },
      updTx: (id, patch) => {
        const cur = get().txs.find((x) => x.id === id)
        if (!cur) return
        const merged = { ...cur, ...patch }
        const penerimaan = Number(merged.penerimaan) || 0
        const pengeluaran = Number(merged.pengeluaran) || 0
        if (penerimaan > 0 && pengeluaran > 0) return
        if (penerimaan === 0 && pengeluaran === 0) return
        if (patch.tanggal !== undefined && !isValidDate(String(patch.tanggal))) return
        if (patch.ledger !== undefined && !['master', 'operasional', 'keluarga'].includes(String(patch.ledger))) return
        set((s) => ({ txs: s.txs.map((x) => (x.id === id ? { ...x, ...patch, penerimaan, pengeluaran } : x)) }))
        queueSync(get)
      },

      transferDropping: (from, to, amount, tanggal, uraian) => {
        const s = get()
        if (!/^\d{4}-\d{2}-\d{2}$/.test(tanggal)) return
        const currentMasterBal = s.saldoAwal + s.txs.filter((x) => x.ledger === from).reduce((sum, x) => sum + x.penerimaan - x.pengeluaran, 0)

        if (from !== 'master' || !['operasional', 'keluarga'].includes(to) || !Number.isFinite(amount) || amount <= 0 || amount > currentMasterBal) return
        const transferId = uid()
        const t1: Tx = {
          id: uid(),
          tanggal,
          nsb: 'ANGGY',
          pos: 'PINDAH SALDO',
          uraian: uraian || `Pindah saldo ke ${to === 'operasional' ? 'Kas Usaha' : 'Kas Keluarga'}`,
          penerimaan: 0,
          pengeluaran: amount,
          ledger: 'master',
          transferId,
        }
        const t2: Tx = {
          id: uid(),
          tanggal,
          nsb: 'ANGGY',
          pos: 'PINDAH SALDO',
          uraian: uraian || `Pindah saldo ke ${to === 'operasional' ? 'Kas Usaha' : 'Kas Keluarga'}`,
          penerimaan: amount,
          pengeluaran: 0,
          ledger: to,
          transferId,
        }
        set((state) => ({ txs: [...state.txs, t1, t2] }))
        queueSync(get)
      },

      addRab: (which, r) => {
        set((s) =>
          which === 'anggy'
            ? { rabAnggy: [...s.rabAnggy, { ...r, id: uid() }] }
            : { rabKeluarga: [...s.rabKeluarga, { ...r, id: uid() }] }
        )
        queueSync(get)
      },
      delRab: (which, id) => {
        set((s) =>
          which === 'anggy'
            ? { rabAnggy: s.rabAnggy.filter((x) => x.id !== id) }
            : { rabKeluarga: s.rabKeluarga.filter((x) => x.id !== id) }
        )
        queueSync(get)
      },
      updRab: (which, id, patch) => {
        set((s) =>
          which === 'anggy'
            ? { rabAnggy: s.rabAnggy.map((x) => (x.id === id ? { ...x, ...patch } : x)) }
            : { rabKeluarga: s.rabKeluarga.map((x) => (x.id === id ? { ...x, ...patch } : x)) }
        )
        queueSync(get)
      },
      addPiutang: (p) => {
        const id = uid()
        const terbit = Math.max(0, Number(p.terbit) || 0)
        const tgl = /^\d{4}-\d{2}-\d{2}$/.test(p.tgl) ? p.tgl : new Date().toISOString().slice(0, 10)
        const outTx: Tx = {
          id: uid(),
          tanggal: tgl,
          nsb: p.nsb,
          pos: 'PIUTANG-KELUAR',
          uraian: `PINJAMAN - ${p.uraian || p.nsb}`,
          penerimaan: 0,
          pengeluaran: terbit,
          ledger: 'master',
          receivableId: id,
        }
        set((s) => ({ piutangs: [...s.piutangs, { ...p, id }], txs: terbit > 0 ? [...s.txs, outTx] : s.txs }))
        queueSync(get)
      },
      delPiutang: (id) => {
        set((s) => ({
          piutangs: s.piutangs.filter((x) => x.id !== id && !(x.terbit === 0 && (x.keterangan || '').includes(id))),
          txs: s.txs.filter((x) => x.receivableId !== id),
        }))
        queueSync(get)
      },

      updPiutang: (id, patch) => {
        set((s) => ({ piutangs: s.piutangs.map((x) => (x.id === id ? { ...x, ...patch } : x)) }))
        queueSync(get)
      },
      catatPelunasan: (id, nominal, tanggal) => {
        const s = get()
        const p = s.piutangs.find((x) => x.id === id)
        if (!p || p.terbit !== undefined && p.terbit === 0 && p.lunas > 0) return
        const outstanding = p ? Math.max(0, (Number(p.terbit) || 0) - (Number(p.lunas) || 0)) : 0
        if (!p || !Number.isFinite(nominal) || nominal <= 0 || nominal > outstanding) return
        const tglStr = /^\d{4}-\d{2}-\d{2}$/.test(tanggal || '') ? (tanggal as string) : new Date().toISOString().slice(0, 10)
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
        set((state) => ({
          piutangs: state.piutangs.map((x) => (x.id === id ? { ...x, lunas: (Number(x.lunas) || 0) + nominal } : x)),
          txs: [...state.txs, newTx],
        }))
        queueSync(get)
      },

      addAsset: (a) => {
        set((s) => ({ assets: [...s.assets, { ...a, id: uid() }] }))
        queueSync(get)
      },
      delAsset: (id) => {
        set((s) => ({ assets: s.assets.filter((x) => x.id !== id) }))
        queueSync(get)
      },
      updAsset: (id, patch) => {
        set((s) => ({ assets: s.assets.map((x) => (x.id === id ? { ...x, ...patch } : x)) }))
        queueSync(get)
      },

      addDep: (d) => {
        set((s) => ({ deps: [...s.deps, { ...d, id: uid() }] }))
        queueSync(get)
      },
      delDep: (id) => {
        set((s) => ({ deps: s.deps.filter((x) => x.id !== id) }))
        queueSync(get)
      },
      updDep: (id, patch) => {
        set((s) => ({ deps: s.deps.map((x) => (x.id === id ? { ...x, ...patch } : x)) }))
        queueSync(get)
      },

      addSched: (sc) => {
        set((s) => ({
          scheds: [...s.scheds, { ...sc, months: sc.months.length === 12 ? sc.months : Array(12).fill(0), id: uid() }],
        }))
        queueSync(get)
      },
      delSched: (id) => {
        set((s) => ({ scheds: s.scheds.filter((x) => x.id !== id) }))
        queueSync(get)
      },
      updSched: (id, patch) => {
        set((s) => ({ scheds: s.scheds.map((x) => (x.id === id ? { ...x, ...patch } : x)) }))
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
        }))
        queueSync(get)
      },

      setLedgerLabels: (labels) => {
        set({ ledgerLabels: labels })
        queueSync(get)
      },
      addCustomNsb: (name) => {
        const clean = name.trim().toUpperCase()
        if (!clean) return
        const current = get().customNsbList || []
        if (current.includes(clean)) return
        set({ customNsbList: [...current, clean] })
        queueSync(get)
      },
      delCustomNsb: (name) => {
        const clean = name.trim().toUpperCase()
        const current = get().customNsbList || []
        set({ customNsbList: current.filter((x) => x !== clean) })
        queueSync(get)
      },
      addCustomPos: (name) => {
        const clean = name.trim().toUpperCase()
        if (!clean) return
        const current = get().customPosList || []
        if (current.includes(clean)) return
        set({ customPosList: [...current, clean] })
        queueSync(get)
      },
      delCustomPos: (name) => {
        const clean = name.trim().toUpperCase()
        const current = get().customPosList || []
        set({ customPosList: current.filter((x) => x !== clean) })
        queueSync(get)
      },
      setYear: (y) => {
        const ny = Math.round(Number(y))
        if (!Number.isFinite(ny) || ny < 2000 || ny > 2100) return
        set({ year: ny })
        queueSync(get)
      },
      setSaldoAwal: (nominal) => {
        const n = Number(nominal)
        if (!Number.isFinite(n) || n < 0 || n > 1e15) return
        set({ saldoAwal: Math.max(0, n) })
        queueSync(get)
      },
    }),
    {
      name: 'anggy-keu-v2',
      partialize: (s) => {
        const { syncStatus: _syncStatus, ...rest } = s
        return rest
      },
    }
  )
)

export type ToastKind = 'success' | 'error' | 'info' | 'warning'
export type ToastMsg = { id: string; message: string; kind: ToastKind }

export const useToastStore = create<{ toasts: ToastMsg[]; push: (message: string, kind?: ToastKind) => void; dismiss: (id: string) => void }>((set) => ({
  toasts: [],
  push: (message, kind = 'success') =>
    set((s) => ({ toasts: [...s.toasts.slice(-3), { id: uid(), message, kind }] })),
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))

export function notify(message: string, kind: ToastKind = 'success'): void {
  useToastStore.getState().push(message, kind)
}
