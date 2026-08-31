import type { VercelRequest, VercelResponse } from '@vercel/node'
import { verifySessionToken, parseCookies } from '../lib/auth'
import { db } from '../lib/db'
import { transactions, rabRows, piutangs, assets, deps, schedules, settings } from '../lib/schema'
import { eq } from 'drizzle-orm'

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

      return res.status(200).json({
        schemaVersion: 2,
        demoMode: currentSetting?.demoMode ?? false,
        year: currentSetting?.year ?? 2026,
        saldoAwal: Number(currentSetting?.saldoAwal ?? 0),
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
      // Delete existing workspace records
      await Promise.all([
        db.delete(transactions).where(eq(transactions.workspaceId, workspaceId)),
        db.delete(rabRows).where(eq(rabRows.workspaceId, workspaceId)),
        db.delete(piutangs).where(eq(piutangs.workspaceId, workspaceId)),
        db.delete(assets).where(eq(assets.workspaceId, workspaceId)),
        db.delete(deps).where(eq(deps.workspaceId, workspaceId)),
        db.delete(schedules).where(eq(schedules.workspaceId, workspaceId)),
      ])

      // Insert new records if any
      if (Array.isArray(body.txs) && body.txs.length > 0) {
        await db.insert(transactions).values(
          body.txs.map((t: any) => ({
            id: t.id || crypto.randomUUID(),
            workspaceId,
            tanggal: t.tanggal,
            nsb: t.nsb || '',
            pos: t.pos || '',
            uraian: t.uraian,
            penerimaan: String(t.penerimaan || 0),
            pengeluaran: String(t.pengeluaran || 0),
            ledger: t.ledger,
            kategori: t.kategori || null,
            transferId: t.transferId || null,
            receivableId: t.receivableId || null,
          }))
        )
      }

      const rabItems: any[] = []
      if (Array.isArray(body.rabAnggy)) {
        body.rabAnggy.forEach((r: any) => rabItems.push({ ...r, target: 'anggy' }))
      }
      if (Array.isArray(body.rabKeluarga)) {
        body.rabKeluarga.forEach((r: any) => rabItems.push({ ...r, target: 'keluarga' }))
      }
      if (rabItems.length > 0) {
        await db.insert(rabRows).values(
          rabItems.map((r) => ({
            id: r.id || crypto.randomUUID(),
            workspaceId,
            target: r.target,
            group: r.group,
            uraian: r.uraian,
            sat: r.sat || 'bln',
            vol: Number(r.vol) || 1,
            hs: String(r.hs || 0),
            w: r.w || [0, 0, 0, 0],
            months: r.months || Array(12).fill(0),
            total: String(r.total || 0),
          }))
        )
      }

      if (Array.isArray(body.piutangs) && body.piutangs.length > 0) {
        await db.insert(piutangs).values(
          body.piutangs.map((p: any) => ({
            id: p.id || crypto.randomUUID(),
            workspaceId,
            tgl: p.tgl,
            nsb: p.nsb,
            uraian: p.uraian,
            terbit: String(p.terbit || 0),
            lunas: String(p.lunas || 0),
            keterangan: p.keterangan || null,
          }))
        )
      }

      if (Array.isArray(body.assets) && body.assets.length > 0) {
        await db.insert(assets).values(
          body.assets.map((a: any) => ({
            id: a.id || crypto.randomUUID(),
            workspaceId,
            jenis: a.jenis || 'PROPERTY',
            nama: a.nama,
            atasNama: a.atasNama || '',
            tgl: a.tgl,
            nilai: String(a.nilai || 0),
            dp: String(a.dp || 0),
            bunga: String(a.bunga || 0.08),
            tenor: Number(a.tenor) || 120,
            nilaiPasar: String(a.nilaiPasar || 0),
            tambah: String(a.tambah || 0),
          }))
        )
      }

      if (Array.isArray(body.deps) && body.deps.length > 0) {
        await db.insert(deps).values(
          body.deps.map((d: any) => ({
            id: d.id || crypto.randomUUID(),
            workspaceId,
            nama: d.nama,
            tgl: d.tgl,
            nilai: String(d.nilai || 0),
            umur: Number(d.umur) || 60,
            nilaiTaksir: String(d.nilaiTaksir || 0),
            kat: d.kat || 'KENDARAAN',
          }))
        )
      }

      if (Array.isArray(body.scheds) && body.scheds.length > 0) {
        await db.insert(schedules).values(
          body.scheds.map((s: any) => ({
            id: s.id || crypto.randomUUID(),
            workspaceId,
            nama: s.nama,
            hs: String(s.hs || 0),
            months: s.months || Array(12).fill(0),
            kat: s.kat || 'service',
          }))
        )
      }

      // Upsert settings
      await db
        .insert(settings)
        .values({
          workspaceId,
          year: Number(body.year) || 2026,
          saldoAwal: String(body.saldoAwal || 0),
          demoMode: Boolean(body.demoMode),
        })
        .onConflictDoUpdate({
          target: settings.workspaceId,
          set: {
            year: Number(body.year) || 2026,
            saldoAwal: String(body.saldoAwal || 0),
            demoMode: Boolean(body.demoMode),
            updatedAt: new Date(),
          },
        })

      return res.status(200).json({ ok: true })
    } catch (err) {
      console.error('Save state error:', err)
      return res.status(500).json({ error: 'Gagal menyimpan data ke server' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
