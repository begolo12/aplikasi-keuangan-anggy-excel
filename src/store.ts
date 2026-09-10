import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { z } from 'zod'
import { isValidDate } from './finance.ts'

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

const money = z.number().finite().min(0).max(1e15)
const dateStr = z.string().refine(isValidDate, 'tanggal tidak valid')

const txSchema = z.object({
  tanggal: z.string().refine(isValidDate, 'tanggal tidak valid'),
  uraian: z.string().trim().min(1).max(300),
  nsb: z.string().trim().min(1).max(80),
  pos: z.string().trim().min(1).max(80),
  penerimaan: z.number().min(0).max(1e15),
  pengeluaran: z.number().min(0).max(1e15),
  ledger: z.enum(['master', 'operasional', 'keluarga']),
})

/** months selalu 12 angka; dipakai sebagai basis RAB dan jadwal. */
const months12 = z.array(money).length(12)

const idField = { id: z.string().min(1).max(64).optional() }

const rabSchema = z.object({
  ...idField,
  group: z.string().trim().max(80).default('UMUM'),
  uraian: z.string().trim().min(1).max(300),
  sat: z.string().trim().max(20).default('bln'),
  vol: z.number().finite().min(0).max(1e6),
  hs: money,
  w: z.array(money).length(4),
  months: months12,
  total: money,
})

const piutangSchema = z.object({
  ...idField,
  tgl: dateStr,
  nsb: z.string().trim().min(1).max(80),
  uraian: z.string().trim().max(300).default(''),
  terbit: money,
  lunas: money,
  keterangan: z.string().trim().max(500).optional(),
})

const assetSchema = z.object({
  ...idField,
  jenis: z.enum(['PROPERTY', 'KENDARAAN', 'GADGET']),
  nama: z.string().trim().min(1).max(160),
  atasNama: z.string().trim().max(120).default(''),
  tgl: dateStr,
  nilai: money,
  dp: money,
  bunga: z.number().finite().min(0).max(1),
  tenor: z.number().int().min(1).max(600),
  nilaiPasar: money,
  tambah: money,
})

const depSchema = z.object({
  ...idField,
  nama: z.string().trim().min(1).max(160),
  tgl: dateStr,
  nilai: money,
  umur: z.number().int().min(1).max(600),
  nilaiTaksir: money,
  kat: z.enum(['KENDARAAN', 'GADGET']),
})

const schedSchema = z.object({
  nama: z.string().trim().min(1).max(160),
  hs: money,
  months: months12,
  kat: z.enum(['service', 'pajak']),
})

export { rabSchema, piutangSchema, assetSchema, depSchema, schedSchema }

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

/** Sisakan hanya baris yang lolos schema; buang sisanya tanpa melempar. */
function keepValid<T>(schema: { safeParse: (v: unknown) => { success: boolean; data?: unknown } }, rows: unknown): T[] {
  if (!Array.isArray(rows)) return []
  const out: T[] = []
  for (const row of rows) {
    const parsed = schema.safeParse(row)
    if (parsed.success && parsed.data !== undefined) out.push(parsed.data as T)
  }
  return out
}

/** Sisakan array string yang bersih; `undefined` berarti belum pernah diset. */
function cleanList(value: unknown, maxLen: number): string[] | undefined {
  if (!Array.isArray(value)) return undefined
  return value
    .filter((v): v is string => typeof v === 'string')
    .map((v) => v.trim().slice(0, maxLen))
    .filter(Boolean)
}

export function normalizeState(data: Partial<StateData>): StateData {
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

  // List kosong yang disengaja (`[]`) harus bertahan; hanya nilai yang bukan
  // array sama sekali yang jatuh ke seed default.
  const nsbList = cleanList(data.customNsbList, 80)
  const posList = cleanList(data.customPosList, 80)

  return {
    txs,
    rabAnggy: keepValid<RabRow>(rabSchema, data.rabAnggy),
    rabKeluarga: keepValid<RabRow>(rabSchema, data.rabKeluarga),
    piutangs: keepValid<PiutangRow>(piutangSchema, data.piutangs),
    assets: keepValid<AssetRow>(assetSchema, data.assets),
    deps: keepValid<DepRow>(depSchema, data.deps),
    scheds: Array.isArray(data.scheds)
      ? data.scheds.map((row) => ({
          ...row,
          id: typeof row.id === 'string' && row.id ? row.id : uid(),
          months: months(row.months),
          total: months(row.months).reduce((sum, value) => sum + value, 0),
        }))
      : base.scheds,
    year: Number.isFinite(Number(data.year)) ? Math.round(Number(data.year)) : base.year,
    saldoAwal: Math.max(0, Number(data.saldoAwal) || 0),
    customNsbList: nsbList ?? base.customNsbList,
    customPosList: posList ?? base.customPosList,
    ledgerLabels: data.ledgerLabels
      ? {
          master: String(data.ledgerLabels.master ?? '').trim().slice(0, 40) || base.ledgerLabels!.master,
          operasional: String(data.ledgerLabels.operasional ?? '').trim().slice(0, 40) || base.ledgerLabels!.operasional,
          keluarga: String(data.ledgerLabels.keluarga ?? '').trim().slice(0, 40) || base.ledgerLabels!.keluarga,
        }
      : base.ledgerLabels,
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

  loadFromServer: () => Promise<void>
  syncToServer: () => Promise<void>
  retrySync: () => void

  addTx: (t: Omit<Tx, 'id'>) => void
  delTx: (id: string) => void
  updTx: (id: string, patch: Partial<Tx>) => void
  transferDropping: (from: 'master', to: 'operasional' | 'keluarga', amount: number, tanggal: string, uraian: string) => void

  addRab: (which: 'anggy' | 'keluarga', r: Omit<RabRow, 'id'>) => void
  delRab: (which: 'anggy' | 'keluarga', id: string) => void

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
let syncQueuedAgain = false

function queueSync(get: () => State) {
  if (syncTimeout) clearTimeout(syncTimeout)
  syncTimeout = setTimeout(() => {
    syncTimeout = null
    const state = get()
    // Kalau sync lain masih jalan, jangan buang jadwalnya — coba lagi sebentar
    // lagi. Tanpa ini, edit di jendela terakhir tidak pernah terkirim sampai
    // ada edit berikutnya atau event `online`.
    if (syncInFlight) {
      syncQueuedAgain = true
      queueSync(get)
      return
    }
    void state.syncToServer()
  }, 500)
}

/**
 * Kirim sekarang juga, batalkan debounce. Dipakai saat tab disembunyikan:
 * tanpa ini, edit dalam jendela 500 ms terakhir hilang saat tab ditutup.
 */
export function flushPendingSync(): void {
  if (!syncTimeout) return
  clearTimeout(syncTimeout)
  syncTimeout = null
  void useStore.getState().syncToServer()
}

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      ...emptySeed(),
      syncStatus: 'synced' as SyncStatus,
      serverRev: null as string | null,
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
        const payload = {
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
        }
        try {
          const res = await fetch('/api/state', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
          if (res.ok) {
            const data = await res.json().catch(() => null)
            set({ syncStatus: 'synced', serverRev: data && typeof data.updatedAt === 'string' ? data.updatedAt : get().serverRev })
          } else if (res.status === 409) {
            // Server punya revisi lebih baru. Sebelum menimpa state lokal,
            // simpan draf yang ditolak supaya pekerjaan user tidak lenyap
            // tanpa jejak, lalu beri tahu bahwa versi server yang dipakai.
            try {
              localStorage.setItem('anggy-keu-conflict-draft', JSON.stringify({ savedAt: new Date().toISOString(), payload }))
            } catch {}
            syncInFlight = false
            await get().loadFromServer()
            set({ syncStatus: 'error' })
            notify('Data di server lebih baru. Perubahan terakhir tidak tersimpan otomatis — draf pemulihannya sudah disimpan di perangkat ini.', 'warning')
            return
          } else {
            const data = await res.json().catch(() => null)
            const detail = data && typeof data.error === 'string' ? data.error : `HTTP ${res.status}`
            set({ syncStatus: 'error' })
            notify(`Gagal menyimpan ke server: ${detail}`, 'error')
          }
        } catch {
          set({ syncStatus: 'offline' })
        } finally {
          syncInFlight = false
          if (syncQueuedAgain) {
            syncQueuedAgain = false
            queueSync(get)
          }
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
            const masuk = Math.max(0, Number(target.penerimaan) || 0)
            const keluar = Math.max(0, Number(target.pengeluaran) || 0)
            // Transaksi pinjaman mengurangi pokok yang diterbitkan; transaksi
            // pelunasan mengurangi yang sudah dibayar. Salah sisi membuat
            // piutang tetap "belum lunas" atau lunas melebihi terbit.
            const isIssuance = keluar > masuk
            piutangs = piutangs.map((p) => {
              if (p.id !== target.receivableId) return p
              const lunas = Math.max(0, Number(p.lunas) || 0)
              const terbit = Math.max(0, Number(p.terbit) || 0)
              return isIssuance
                ? { ...p, terbit: Math.max(0, terbit - keluar) }
                : { ...p, lunas: Math.max(0, lunas - masuk) }
            })
          }
          return { txs, piutangs }
        })
        queueSync(get)
        notify(pairCount > 0 ? 'Transfer dihapus sepasang (keluar + masuk).' : 'Transaksi dihapus.', 'success')
      },
      updTx: (id, patch) => {
        const cur = get().txs.find((x) => x.id === id)
        if (!cur) return
        // Field identitas tidak boleh diubah lewat patch: mengganti id memutus
        // kunci running balance, dan mengubah tautan transfer/piutang membuat
        // pasangannya menggantung.
        if (patch.id !== undefined || patch.receivableId !== undefined || patch.transferId !== undefined) {
          notify('Id dan tautan transaksi tidak bisa diubah.', 'error')
          return
        }
        const merged = { ...cur, ...patch }
        const penerimaan = Number(merged.penerimaan) || 0
        const pengeluaran = Number(merged.pengeluaran) || 0
        if (penerimaan > 0 && pengeluaran > 0) return
        if (penerimaan === 0 && pengeluaran === 0) return
        if (patch.tanggal !== undefined && !isValidDate(String(patch.tanggal))) return
        if (patch.ledger !== undefined && !['master', 'operasional', 'keluarga'].includes(String(patch.ledger))) return

        // Kaki transfer harus berpasangan dengan nominal berlawanan. Mengubah
        // satu sisi saja membuat total 3 kas tidak lagi nol.
        if (cur.transferId) {
          const changesAmount = penerimaan !== cur.penerimaan || pengeluaran !== cur.pengeluaran || patch.ledger !== undefined
          if (changesAmount) {
            notify('Transaksi transfer tidak bisa diubah nominalnya. Hapus pasangannya lalu buat transfer baru.', 'error')
            return
          }
        }

        set((s) => {
          const txs = s.txs.map((x) => (x.id === id ? { ...x, ...patch, penerimaan, pengeluaran } : x))
          // Transaksi pelunasan piutang: `lunas` harus ikut bergerak saat
          // nominalnya berubah, kalau tidak sisa piutang jadi tidak sinkron.
          let piutangs = s.piutangs
          if (cur.receivableId && !cur.transferId) {
            const before = Math.max(0, cur.penerimaan) - Math.max(0, cur.pengeluaran)
            const after = penerimaan - pengeluaran
            const delta = after - before
            if (delta !== 0) {
              piutangs = piutangs.map((p) => {
                if (p.id !== cur.receivableId) return p
                const next = Math.max(0, (Number(p.lunas) || 0) + delta)
                return { ...p, lunas: Math.min(next, Number(p.terbit) || next) }
              })
            }
          }
          return { txs, piutangs }
        })
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
        const parsed = rabSchema.safeParse(r)
        if (!parsed.success) {
          notify('Baris anggaran tidak valid: periksa uraian, volume, harga satuan, dan 12 bulan.', 'error')
          return
        }
        // `total` adalah turunan dari `months` (lihat rabMonthlyTotals), jadi
        // selalu dihitung ulang — kalau tidak, grandTotal di UI bisa basi.
        const total = parsed.data.months.reduce((sum, value) => sum + value, 0)
        const row: RabRow = { ...parsed.data, total, w: parsed.data.w as [number, number, number, number], id: uid() }
        set((s) => (which === 'anggy' ? { rabAnggy: [...s.rabAnggy, row] } : { rabKeluarga: [...s.rabKeluarga, row] }))
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
      addPiutang: (p) => {
        const parsed = piutangSchema.safeParse(p)
        if (!parsed.success) {
          notify('Data piutang tidak valid: periksa nama, tanggal, dan nominal.', 'error')
          return
        }
        if (parsed.data.lunas > parsed.data.terbit) {
          notify('Jumlah lunas tidak boleh melebihi jumlah yang diterbitkan.', 'error')
          return
        }
        const id = uid()
        const data = parsed.data
        const outTx: Tx = {
          id: uid(),
          tanggal: data.tgl,
          nsb: data.nsb,
          pos: 'PIUTANG-KELUAR',
          uraian: `PINJAMAN - ${data.uraian || data.nsb}`,
          penerimaan: 0,
          pengeluaran: data.terbit,
          ledger: 'master',
          receivableId: id,
        }
        set((s) => ({ piutangs: [...s.piutangs, { ...data, id }], txs: data.terbit > 0 ? [...s.txs, outTx] : s.txs }))
        queueSync(get)
      },
      delPiutang: (id) => {
        // Hapus piutangnya saja. Transaksi kas yang sudah terjadi adalah riwayat
        // nyata — menghapusnya akan mengubah saldo surut tanpa persetujuan user.
        // Tautannya dilepas supaya tidak menggantung ke id yang sudah tidak ada.
        set((s) => ({
          piutangs: s.piutangs.filter((x) => x.id !== id),
          txs: s.txs.map((x) => {
            if (x.receivableId !== id) return x
            const { receivableId: _drop, ...rest } = x
            return rest
          }),
        }))
        queueSync(get)
      },

      updPiutang: (id, patch) => {
        const cur = get().piutangs.find((x) => x.id === id)
        if (!cur) return
        if (patch.id !== undefined) return
        const merged = { ...cur, ...patch }
        if (!isValidDate(String(merged.tgl))) return
        const terbit = Math.max(0, Number(merged.terbit) || 0)
        const lunas = Math.max(0, Number(merged.lunas) || 0)
        // Lunas tidak boleh melebihi yang diterbitkan.
        if (lunas > terbit) return
        set((s) => ({ piutangs: s.piutangs.map((x) => (x.id === id ? { ...merged, terbit, lunas } : x)) }))
        queueSync(get)
      },
      catatPelunasan: (id, nominal, tanggal) => {
        const s = get()
        const p = s.piutangs.find((x) => x.id === id)
        if (!p) return
        const outstanding = Math.max(0, (Number(p.terbit) || 0) - (Number(p.lunas) || 0))
        if (!Number.isFinite(nominal) || nominal <= 0 || nominal > outstanding) return
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
        const parsed = assetSchema.safeParse(a)
        if (!parsed.success) {
          notify('Data aset tidak valid: periksa nama, tanggal, nilai, DP, bunga, dan tenor.', 'error')
          return
        }
        if (parsed.data.dp > parsed.data.nilai) {
          notify('DP tidak boleh melebihi harga aset.', 'error')
          return
        }
        set((s) => ({ assets: [...s.assets, { ...parsed.data, id: uid() }] }))
        queueSync(get)
      },
      delAsset: (id) => {
        set((s) => ({ assets: s.assets.filter((x) => x.id !== id) }))
        queueSync(get)
      },
      updAsset: (id, patch) => {
        const cur = get().assets.find((x) => x.id === id)
        if (!cur || patch.id !== undefined) return
        const parsed = assetSchema.safeParse({ ...cur, ...patch })
        if (!parsed.success) {
          notify('Perubahan aset tidak valid.', 'error')
          return
        }
        if (parsed.data.dp > parsed.data.nilai) {
          notify('DP tidak boleh melebihi harga aset.', 'error')
          return
        }
        set((s) => ({ assets: s.assets.map((x) => (x.id === id ? { ...parsed.data, id } : x)) }))
        queueSync(get)
      },

      addDep: (d) => {
        const parsed = depSchema.safeParse(d)
        if (!parsed.success) {
          notify('Data penyusutan tidak valid: periksa nama, tanggal, nilai, dan umur ekonomis.', 'error')
          return
        }
        set((s) => ({ deps: [...s.deps, { ...parsed.data, id: uid() }] }))
        queueSync(get)
      },
      delDep: (id) => {
        set((s) => ({ deps: s.deps.filter((x) => x.id !== id) }))
        queueSync(get)
      },
      updDep: (id, patch) => {
        const cur = get().deps.find((x) => x.id === id)
        if (!cur || patch.id !== undefined) return
        const parsed = depSchema.safeParse({ ...cur, ...patch })
        if (!parsed.success) {
          notify('Perubahan penyusutan tidak valid.', 'error')
          return
        }
        set((s) => ({ deps: s.deps.map((x) => (x.id === id ? { ...parsed.data, id } : x)) }))
        queueSync(get)
      },

      addSched: (sc) => {
        // `months` diisi view sebagai array 12 penuh; kalau bukan, jangan
        // diam-diam diganti 12 nol — pengingat tanpa bulan tidak berguna.
        const parsed = schedSchema.safeParse(sc)
        if (!parsed.success) {
          notify('Pengingat tidak valid: periksa nama, nominal, dan 12 bulan.', 'error')
          return
        }
        set((s) => ({ scheds: [...s.scheds, { ...parsed.data, id: uid() }] }))
        queueSync(get)
      },
      delSched: (id) => {
        set((s) => ({ scheds: s.scheds.filter((x) => x.id !== id) }))
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
        // Batas 40 karakter = batas server (api/state.ts). Kalau klien tidak
        // memotong, label akan berubah sendiri setelah reload berikutnya.
        const clean = (v: unknown, fallback: string) => String(v ?? '').trim().slice(0, 40) || fallback
        set({
          ledgerLabels: {
            master: clean(labels.master, 'Kas Utama'),
            operasional: clean(labels.operasional, 'Kas Usaha'),
            keluarga: clean(labels.keluarga, 'Kas Keluarga'),
          },
        })
        queueSync(get)
      },
      addCustomNsb: (name) => {
        const clean = name.trim().toUpperCase().slice(0, 80)
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
        const clean = name.trim().toUpperCase().slice(0, 80)
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
