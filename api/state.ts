import type { VercelRequest, VercelResponse } from '@vercel/node'
import type { BatchItem } from 'drizzle-orm/batch'
import { verifySessionToken, parseCookies } from '../lib/auth.js'
import { db } from '../lib/db.js'
import { transactions, rabRows, piutangs, assets, deps, schedules, settings } from '../lib/schema.js'
import { eq } from 'drizzle-orm'

function clampStr(v: unknown, max = 200): string {
  return String(v ?? '').trim().slice(0, max)
}
function clampNum(v: unknown): number {
  const n = Number(v)
  return Number.isFinite(n) && n >= 0 && n <= 1e15 ? n : 0
}
/** Pad array ke panjang tetap dengan 0 (jsonb w/months selalu penuh). */
function pad(values: number[], len: number): number[] {
  const out = values.slice(0, len)
  while (out.length < len) out.push(0)
  return out
}

function isValidDateStr(v: unknown): boolean {
  if (typeof v !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return false
  const [y, m, d] = v.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d))
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d
}

function todayLocal(): string {
  const now = new Date()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${m}-${d}`
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const cookies = parseCookies(req.headers.cookie)
  const token = cookies.anggy_session
  if (!token) return res.status(401).json({ error: 'Unauthorized' })

  const session = await verifySessionToken(token)
  if (!session) return res.status(401).json({ error: 'Session expired' })

  const workspaceId = session.workspaceId

  if (req.method === 'GET') {
    try {
      const [
        txList,
        rabList,
        piutangList,
        assetList,
        depList,
        schedList,
        settingData,
      ] = await Promise.all([
        db.select().from(transactions).where(eq(transactions.workspaceId, workspaceId)),
        db.select().from(rabRows).where(eq(rabRows.workspaceId, workspaceId)),
        db.select().from(piutangs).where(eq(piutangs.workspaceId, workspaceId)),
        db.select().from(assets).where(eq(assets.workspaceId, workspaceId)),
        db.select().from(deps).where(eq(deps.workspaceId, workspaceId)),
        db.select().from(schedules).where(eq(schedules.workspaceId, workspaceId)),
        db.select().from(settings).where(eq(settings.workspaceId, workspaceId)).limit(1),
      ])

      const rabAnggy = rabList.filter((r) => r.target === 'anggy').map((r) => ({
        id: r.id,
        group: r.group,
        uraian: r.uraian,
        sat: r.sat,
        vol: r.vol,
        hs: Number(r.hs),
        w: (r.w as [number, number, number, number]) || [0, 0, 0, 0],
        months: (r.months as number[]) || Array(12).fill(0),
        total: Number(r.total),
      }))

      const rabKeluarga = rabList.filter((r) => r.target === 'keluarga').map((r) => ({
        id: r.id,
        group: r.group,
        uraian: r.uraian,
        sat: r.sat,
        vol: r.vol,
        hs: Number(r.hs),
        w: (r.w as [number, number, number, number]) || [0, 0, 0, 0],
        months: (r.months as number[]) || Array(12).fill(0),
        total: Number(r.total),
      }))

      const txs = txList.map((t) => ({
        id: t.id,
        tanggal: t.tanggal,
        nsb: t.nsb,
        pos: t.pos,
        uraian: t.uraian,
        penerimaan: Number(t.penerimaan),
        pengeluaran: Number(t.pengeluaran),
        ledger: t.ledger as 'master' | 'operasional' | 'keluarga',
        kategori: t.kategori || undefined,
        transferId: t.transferId || undefined,
        receivableId: t.receivableId || undefined,
      }))

      const piutangRows = piutangList.map((p) => ({
        id: p.id,
        tgl: p.tgl,
        nsb: p.nsb,
        uraian: p.uraian,
        terbit: Number(p.terbit),
        lunas: Number(p.lunas),
        keterangan: p.keterangan || undefined,
      }))

      const assetRows = assetList.map((a) => ({
        id: a.id,
        jenis: a.jenis as 'PROPERTY' | 'KENDARAAN' | 'GADGET',
        nama: a.nama,
        atasNama: a.atasNama,
        tgl: a.tgl,
        nilai: Number(a.nilai),
        dp: Number(a.dp),
        bunga: Number(a.bunga),
        tenor: a.tenor,
        nilaiPasar: Number(a.nilaiPasar),
        tambah: Number(a.tambah),
      }))

      const depRows = depList.map((d) => ({
        id: d.id,
        nama: d.nama,
        tgl: d.tgl,
        nilai: Number(d.nilai),
        umur: d.umur,
        nilaiTaksir: Number(d.nilaiTaksir),
        kat: d.kat as 'KENDARAAN' | 'GADGET',
      }))

      const schedRows = schedList.map((s) => ({
        id: s.id,
        nama: s.nama,
        hs: Number(s.hs),
        months: (s.months as number[]) || Array(12).fill(0),
        kat: s.kat as 'service' | 'pajak',
      }))

      const currentSetting = settingData[0]

      const master = (currentSetting?.masterData ?? null) as {
        customNsbList?: string[]
        customPosList?: string[]
        ledgerLabels?: { master: string; operasional: string; keluarga: string }
      } | null

      return res.status(200).json({
        schemaVersion: 3,
        updatedAt: currentSetting?.updatedAt ? currentSetting.updatedAt.toISOString() : null,
        year: currentSetting?.year ?? 2026,
        saldoAwal: Number(currentSetting?.saldoAwal ?? 0),
        customNsbList: Array.isArray(master?.customNsbList) ? master.customNsbList : [],
        customPosList: Array.isArray(master?.customPosList) ? master.customPosList : [],
        ledgerLabels: master?.ledgerLabels ?? null,
        txs,
        rabAnggy,
        rabKeluarga,
        piutangs: piutangRows,
        assets: assetRows,
        deps: depRows,
        scheds: schedRows,
      })
    } catch (err) {
      console.error('Fetch state error:', err)
      return res.status(500).json({ error: 'Gagal memuat data dari server' })
    }
  }

  if (req.method === 'PUT') {
    try {
      const body = req.body
      if (!body || typeof body !== 'object') return res.status(400).json({ error: 'Body tidak valid' })

      // size guards
      const limits: Record<string, number> = { txs: 5000, rabAnggy: 1000, rabKeluarga: 1000, piutangs: 2000, assets: 500, deps: 500, scheds: 500 }
      for (const [k, max] of Object.entries(limits)) {
        const arr = (body as Record<string, unknown>)[k]
        if (Array.isArray(arr) && arr.length > max) return res.status(413).json({ error: `${k} melebihi batas ${max}` })
      }
      const rawLen = Number(req.headers['content-length'] || 0)
      if (rawLen > 2_000_000) return res.status(413).json({ error: 'Payload terlalu besar' })
      // Tolak PUT parsial: semua kunci array wajib ada agar tak terjadi wipe tak sengaja.
      const requiredArrays = ['txs', 'rabAnggy', 'rabKeluarga', 'piutangs', 'assets', 'deps', 'scheds'] as const
      for (const k of requiredArrays) {
        if (!Array.isArray((body as Record<string, unknown>)[k])) return res.status(400).json({ error: `${k} harus array` })
      }
      if (body.year !== undefined && (!Number.isFinite(Number(body.year)) || Number(body.year) < 2000 || Number(body.year) > 2100)) return res.status(400).json({ error: 'year tidak valid' })
      if (body.saldoAwal !== undefined && (!Number.isFinite(Number(body.saldoAwal)) || Number(body.saldoAwal) < 0 || Number(body.saldoAwal) > 1e15)) return res.status(400).json({ error: 'saldoAwal tidak valid' })

      // Pre-compute all rows before touching the database
      type TxInsert = typeof transactions.$inferInsert
      type RabInsert = typeof rabRows.$inferInsert
      type PiutangInsert = typeof piutangs.$inferInsert
      type AssetInsert = typeof assets.$inferInsert
      type DepInsert = typeof deps.$inferInsert
      type SchedInsert = typeof schedules.$inferInsert

      const chunk = <T>(arr: T[], size: number): T[][] => {
        const out: T[][] = []
        for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
        return out
      }

      const txRows: TxInsert[] = (Array.isArray(body.txs) ? body.txs.slice(0, limits.txs) : []).map((t: Record<string, unknown>) => ({
        id: typeof t.id === 'string' && t.id ? clampStr(t.id, 64) : crypto.randomUUID(),
        workspaceId,
        tanggal: isValidDateStr(t.tanggal) ? String(t.tanggal) : todayLocal(),
        nsb: clampStr(t.nsb, 80) || 'ANGGY',
        pos: clampStr(t.pos, 80) || 'RUTIN',
        uraian: clampStr(t.uraian, 300) || '-',
        penerimaan: String(clampNum(t.penerimaan)),
        pengeluaran: String(clampNum(t.pengeluaran)),
        ledger: ['master', 'operasional', 'keluarga'].includes(String(t.ledger)) ? String(t.ledger) : 'master',
        kategori: t.kategori ? clampStr(t.kategori, 80) : null,
        transferId: t.transferId ? clampStr(t.transferId, 64) : null,
        receivableId: t.receivableId ? clampStr(t.receivableId, 64) : null,
      }))

      const rabItems: Record<string, unknown>[] = []
      if (Array.isArray(body.rabAnggy)) body.rabAnggy.forEach((r: Record<string, unknown>) => rabItems.push({ ...r, target: 'anggy' }))
      if (Array.isArray(body.rabKeluarga)) body.rabKeluarga.forEach((r: Record<string, unknown>) => rabItems.push({ ...r, target: 'keluarga' }))
      const rabRowsToInsert: RabInsert[] = rabItems.slice(0, 2000).map((r) => ({
        id: typeof r.id === 'string' && r.id ? clampStr(r.id as string, 64) : crypto.randomUUID(),
        workspaceId,
        target: String(r.target),
        group: clampStr(r.group, 80) || 'UMUM',
        uraian: clampStr(r.uraian, 300) || '-',
        sat: clampStr(r.sat, 20) || 'bln',
        vol: Math.max(0, Math.min(1e6, Number(r.vol) || 0)),
        hs: String(clampNum(r.hs)),
        w: pad(Array.isArray(r.w) ? (r.w as unknown[]).slice(0, 4).map(clampNum) : [], 4),
        months: pad(Array.isArray(r.months) ? (r.months as unknown[]).slice(0, 12).map(clampNum) : [], 12),
        total: String(clampNum(r.total)),
      }))

      const piutangRowsToInsert: PiutangInsert[] = (Array.isArray(body.piutangs) ? body.piutangs.slice(0, limits.piutangs) : []).map((p: Record<string, unknown>) => ({
        id: typeof p.id === 'string' && p.id ? clampStr(p.id as string, 64) : crypto.randomUUID(),
        workspaceId,
        tgl: isValidDateStr(p.tgl) ? String(p.tgl) : todayLocal(),
        nsb: clampStr(p.nsb, 80) || '-',
        uraian: clampStr(p.uraian, 300) || '-',
        terbit: String(clampNum(p.terbit)),
        lunas: String(clampNum(p.lunas)),
        keterangan: p.keterangan ? clampStr(p.keterangan, 500) : null,
      }))

      const assetRowsToInsert: AssetInsert[] = (Array.isArray(body.assets) ? body.assets.slice(0, limits.assets) : []).map((a: Record<string, unknown>) => ({
        id: typeof a.id === 'string' && a.id ? clampStr(a.id as string, 64) : crypto.randomUUID(),
        workspaceId,
        jenis: ['PROPERTY', 'KENDARAAN', 'GADGET'].includes(String(a.jenis)) ? String(a.jenis) : 'PROPERTY',
        nama: clampStr(a.nama, 160) || '-',
        atasNama: clampStr(a.atasNama, 120),
        tgl: isValidDateStr(a.tgl) ? String(a.tgl) : todayLocal(),
        nilai: String(clampNum(a.nilai)),
        dp: String(clampNum(a.dp)),
        bunga: String(Math.max(0, Math.min(1, Number(a.bunga) || 0))),
        tenor: Math.max(1, Math.min(600, Number(a.tenor) || 0)),
        nilaiPasar: String(clampNum(a.nilaiPasar)),
        tambah: String(clampNum(a.tambah)),
      }))

      const depRowsToInsert: DepInsert[] = (Array.isArray(body.deps) ? body.deps.slice(0, limits.deps) : []).map((d: Record<string, unknown>) => ({
        id: typeof d.id === 'string' && d.id ? clampStr(d.id as string, 64) : crypto.randomUUID(),
        workspaceId,
        nama: clampStr(d.nama, 160) || '-',
        tgl: isValidDateStr(d.tgl) ? String(d.tgl) : todayLocal(),
        nilai: String(clampNum(d.nilai)),
        umur: Math.max(1, Math.min(600, Number(d.umur) || 60)),
        nilaiTaksir: String(clampNum(d.nilaiTaksir)),
        kat: ['KENDARAAN', 'GADGET'].includes(String(d.kat)) ? String(d.kat) : 'KENDARAAN',
      }))

      const schedRowsToInsert: SchedInsert[] = (Array.isArray(body.scheds) ? body.scheds.slice(0, limits.scheds) : []).map((s: Record<string, unknown>) => ({
        id: typeof s.id === 'string' && s.id ? clampStr(s.id as string, 64) : crypto.randomUUID(),
        workspaceId,
        nama: clampStr(s.nama, 160) || '-',
        hs: String(clampNum(s.hs)),
        months: pad(Array.isArray(s.months) ? (s.months as unknown[]).slice(0, 12).map(clampNum) : [], 12),
        kat: ['service', 'pajak'].includes(String(s.kat)) ? String(s.kat) : 'service',
      }))

      // Persist custom master data (labels + custom lists)
      const masterData: Record<string, unknown> = {}
      if (Array.isArray(body.customNsbList)) masterData.customNsbList = (body.customNsbList as unknown[]).slice(0, 200).map((v) => clampStr(v, 80)).filter(Boolean)
      if (Array.isArray(body.customPosList)) masterData.customPosList = (body.customPosList as unknown[]).slice(0, 200).map((v) => clampStr(v, 80)).filter(Boolean)
      if (body.ledgerLabels && typeof body.ledgerLabels === 'object') {
        const l = body.ledgerLabels as Record<string, unknown>
        masterData.ledgerLabels = {
          master: clampStr(l.master, 40) || 'Kas Utama',
          operasional: clampStr(l.operasional, 40) || 'Kas Usaha',
          keluarga: clampStr(l.keluarga, 40) || 'Kas Keluarga',
        }
      }

      const yearClamped = Math.max(2000, Math.min(2100, Number(body.year) || 2026))
      const saldoAwal = String(clampNum(body.saldoAwal))
      const demoMode = Boolean(body.demoMode)

      // Optimistic concurrency: tolak tulis di atas revisi basi.
      const baseRev = typeof (body as Record<string, unknown>).baseRev === 'string' ? String((body as Record<string, unknown>).baseRev) : null
      const current = await db.select().from(settings).where(eq(settings.workspaceId, workspaceId)).limit(1)
      const currentRev = current[0]?.updatedAt ? current[0].updatedAt.toISOString() : null
      if (baseRev && currentRev && baseRev !== currentRev) {
        return res.status(409).json({ error: 'Data di server lebih baru. Muat ulang dulu.', updatedAt: currentRev })
      }

      const statements: BatchItem<'pg'>[] = [
        db.delete(transactions).where(eq(transactions.workspaceId, workspaceId)),
        db.delete(rabRows).where(eq(rabRows.workspaceId, workspaceId)),
        db.delete(piutangs).where(eq(piutangs.workspaceId, workspaceId)),
        db.delete(assets).where(eq(assets.workspaceId, workspaceId)),
        db.delete(deps).where(eq(deps.workspaceId, workspaceId)),
        db.delete(schedules).where(eq(schedules.workspaceId, workspaceId)),
      ]
      for (const part of chunk(txRows, 500)) statements.push(db.insert(transactions).values(part))
      for (const part of chunk(rabRowsToInsert, 500)) statements.push(db.insert(rabRows).values(part))
      for (const part of chunk(piutangRowsToInsert, 500)) statements.push(db.insert(piutangs).values(part))
      for (const part of chunk(assetRowsToInsert, 500)) statements.push(db.insert(assets).values(part))
      for (const part of chunk(depRowsToInsert, 500)) statements.push(db.insert(deps).values(part))
      for (const part of chunk(schedRowsToInsert, 500)) statements.push(db.insert(schedules).values(part))
      statements.push(
        db.insert(settings).values({ workspaceId, year: yearClamped, saldoAwal, demoMode, masterData }).onConflictDoUpdate({
          target: settings.workspaceId,
          set: { year: yearClamped, saldoAwal, demoMode, masterData, updatedAt: new Date() },
        })
      )
      await db.batch(statements as [BatchItem<'pg'>, ...BatchItem<'pg'>[]])
      const fresh = await db.select().from(settings).where(eq(settings.workspaceId, workspaceId)).limit(1)

      return res.status(200).json({ ok: true, updatedAt: fresh[0]?.updatedAt ? fresh[0].updatedAt.toISOString() : currentRev })
    } catch (err) {
      console.error('Save state error:', err)
      return res.status(500).json({ error: 'Gagal menyimpan data ke server' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
