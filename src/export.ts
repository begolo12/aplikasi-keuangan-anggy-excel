import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import type { Tx, RabRow, DepRow, SchedRow, PiutangRow, AssetRow } from './store'
import { assetDebt, yearTransactions } from './finance'

const fmt = '#,##0'
const fmtRp = '"Rp" #,##0'
const thin = { style: 'thin', color: { argb: 'FFD1D5DB' } } as const
const border = { top: thin, left: thin, bottom: thin, right: thin }

function hdr(ws: ExcelJS.Worksheet, row: number, cols: string[], color = '1E40AF') {
  const r = ws.getRow(row)
  cols.forEach((c, i) => {
    const cell = r.getCell(i + 1)
    cell.value = c
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 9 }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + color } }
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
    cell.border = border
  })
  r.height = 24
  r.commit()
}

function styleRow(
  ws: ExcelJS.Worksheet,
  row: number,
  ncols: number,
  opts?: { bold?: boolean; fill?: string; numFmt?: string; align?: 'left' | 'center' | 'right' }
) {
  const r = ws.getRow(row)
  for (let c = 1; c <= ncols; c++) {
    const cell = r.getCell(c)
    cell.border = border
    cell.alignment = { vertical: 'middle', wrapText: true, ...(opts?.align ? { horizontal: opts.align } : {}) }
    if (opts?.bold) cell.font = { bold: true, size: 9 }
    else cell.font = { size: 9 }
    if (opts?.fill) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + opts.fill } }
    if (opts?.numFmt && cell.value !== null && cell.value !== undefined && cell.value !== '') {
      cell.numFmt = opts.numFmt
    }
  }
}

export async function exportExcel(args: {
  txs: Tx[]
  rabAnggy: RabRow[]
  rabKeluarga: RabRow[]
  piutangs: PiutangRow[]
  deps: DepRow[]
  assets: AssetRow[]
  scheds: SchedRow[]
  year: number
  saldoAwal: number
}) {
  const wb = new ExcelJS.Workbook()
  wb.creator = 'FinSheet Pro'
  wb.created = new Date()

  // ==========================================
  // 1. RESUME - RAB
  // ==========================================
  {
    const ws = wb.addWorksheet('RESUME - RAB')
    ws.properties.defaultRowHeight = 19
    ws.getColumn(1).width = 4
    ws.getColumn(2).width = 8
    ws.getColumn(3).width = 14
    ws.getColumn(4).width = 28
    ws.getColumn(5).width = 8
    ws.getColumn(6).width = 8
    ws.getColumn(7).width = 13
    for (let c = 8; c <= 12; c++) ws.getColumn(c).width = 13
    ws.getColumn(13).width = 4
    for (let c = 14; c <= 26; c++) ws.getColumn(c).width = 12

    ws.mergeCells('B1:Z1')
    ws.getCell('B1').value = 'RENCANA ANGGARAN BELANJA - BULANAN'
    ws.getCell('B1').font = { bold: true, size: 13, color: { argb: 'FF1E40AF' } }
    ws.getCell('B1').alignment = { horizontal: 'center' }

    ws.mergeCells('B2:Z2')
    ws.getCell('B2').value = 'ANGGY P. PUTRA'
    ws.getCell('B2').font = { italic: true, size: 10, color: { argb: 'FF64748B' } }
    ws.getCell('B2').alignment = { horizontal: 'center' }

    ws.getCell('B4').value = `RENCANA ANGGARAN ${args.year}`
    ws.getCell('B4').font = { bold: true, size: 10 }

    hdr(
      ws,
      5,
      [
        '',
        'NO.',
        'PLOT',
        'URAIAN',
        'SAT',
        'VOL',
        'HS',
        'W-1',
        'W-2',
        'W-3',
        'W-4',
        'JUMLAH',
        '',
        'JAN',
        'FEB',
        'MAR',
        'APR',
        'MEI',
        'JUN',
        'JUL',
        'AGU',
        'SEP',
        'OKT',
        'NOV',
        'DES',
        'TOTAL',
      ],
      '1E40AF'
    )

    let r = 7
    const combinedRab = [
      ...args.rabAnggy.map((x) => ({ ...x, plot: 'ANGGY' })),
      ...args.rabKeluarga.map((x) => ({ ...x, plot: 'KELUARGA' })),
    ]
    const groups = [...new Set(combinedRab.map((x) => x.group))]

    groups.forEach((g, gi) => {
      const rows = combinedRab.filter((x) => x.group === g)
      ws.getCell(`B${r}`).value = gi + 1
      ws.getCell(`D${r}`).value = g
      ws.getCell(`D${r}`).font = { bold: true }

      const start = r + 1
      const end = r + rows.length

      for (let col = 8; col <= 11; col++) {
        const colL = String.fromCharCode(64 + col)
        ws.getCell(`${colL}${r}`).value = { formula: `SUM(${colL}${start}:${colL}${end})` } as never
        ws.getCell(`${colL}${r}`).numFmt = fmt
      }
      ws.getCell(`L${r}`).value = { formula: `SUM(H${r}:K${r})` } as never
      ws.getCell(`L${r}`).numFmt = fmt

      for (let m = 0; m < 12; m++) {
        const c = 14 + m
        const colLetter = c <= 26 ? String.fromCharCode(64 + c) : `A${String.fromCharCode(64 + c - 26)}`
        ws.getCell(`${colLetter}${r}`).value = { formula: `SUM(${colLetter}${start}:${colLetter}${end})` } as never
        ws.getCell(`${colLetter}${r}`).numFmt = fmt
      }
      ws.getCell(`Z${r}`).value = { formula: `SUM(N${r}:Y${r})` } as never
      ws.getCell(`Z${r}`).numFmt = fmt
      styleRow(ws, r, 26, { bold: true, fill: 'EFF6FF', numFmt: fmt })
      r++

      rows.forEach((rr) => {
        ws.getCell(`B${r}`).value = '-'
        ws.getCell(`C${r}`).value = rr.plot
        ws.getCell(`D${r}`).value = rr.uraian
        ws.getCell(`E${r}`).value = rr.sat
        ws.getCell(`F${r}`).value = rr.vol
        ws.getCell(`G${r}`).value = rr.hs
        ws.getCell(`G${r}`).numFmt = fmt

        const letters = ['H', 'I', 'J', 'K']
        rr.w.forEach((v, i) => {
          ws.getCell(`${letters[i]}${r}`).value = v
          ws.getCell(`${letters[i]}${r}`).numFmt = fmt
        })
        ws.getCell(`L${r}`).value = { formula: `SUM(H${r}:K${r})` } as never
        ws.getCell(`L${r}`).numFmt = fmt

        rr.months.forEach((v, i) => {
          const col = 14 + i
          const letter = col <= 26 ? String.fromCharCode(64 + col) : `A${String.fromCharCode(64 + col - 26)}`
          ws.getCell(`${letter}${r}`).value = v
          ws.getCell(`${letter}${r}`).numFmt = fmt
        })
        ws.getCell(`Z${r}`).value = { formula: `SUM(N${r}:Y${r})` } as never
        ws.getCell(`Z${r}`).numFmt = fmt
        styleRow(ws, r, 26, { numFmt: fmt })
        r++
      })
    })

    const totalRow = r + 1
    ws.getCell(`D${totalRow}`).value = 'GRAND TOTAL'
    ws.getCell(`D${totalRow}`).font = { bold: true }
    for (let col = 8; col <= 11; col++) {
      const l = String.fromCharCode(64 + col)
      ws.getCell(`${l}${totalRow}`).value = { formula: `SUM(${l}7:${l}${r - 1})` } as never
      ws.getCell(`${l}${totalRow}`).numFmt = fmt
    }
    ws.getCell(`L${totalRow}`).value = { formula: `SUM(H${totalRow}:K${totalRow})` } as never
    ws.getCell(`L${totalRow}`).numFmt = fmt
    for (let c = 14; c <= 25; c++) {
      const l = String.fromCharCode(64 + c)
      ws.getCell(`${l}${totalRow}`).value = { formula: `SUM(${l}7:${l}${r - 1})` } as never
      ws.getCell(`${l}${totalRow}`).numFmt = fmt
    }
    ws.getCell(`Z${totalRow}`).value = { formula: `SUM(N${totalRow}:Y${totalRow})` } as never
    ws.getCell(`Z${totalRow}`).numFmt = fmt
    styleRow(ws, totalRow, 26, { bold: true, fill: 'DBEAFE' })
    ws.views = [{ state: 'frozen', xSplit: 4, ySplit: 5 }]
  }

  // ==========================================
  // 2. RAB-01 (ANGGY)
  // ==========================================
  {
    const ws = wb.addWorksheet('RAB-01')
    ws.properties.defaultRowHeight = 19
    ws.getColumn(2).width = 8
    ws.getColumn(3).width = 12
    ws.getColumn(4).width = 26
    ws.getColumn(5).width = 8
    ws.getColumn(6).width = 8
    ws.getColumn(7).width = 14
    ws.getColumn(8).width = 13
    ws.getColumn(9).width = 13
    ws.getColumn(10).width = 13
    ws.getColumn(11).width = 13
    ws.getColumn(12).width = 15

    ws.mergeCells('B1:L1')
    ws.getCell('B1').value = 'RENCANA ANGGARAN BELANJA - BULANAN'
    ws.getCell('B1').font = { bold: true, size: 12, color: { argb: 'FF1E40AF' } }
    ws.getCell('B1').alignment = { horizontal: 'center' }

    ws.mergeCells('B2:L2')
    ws.getCell('B2').value = 'ANGGY'
    ws.getCell('B2').font = { italic: true, size: 9, color: { argb: 'FF64748B' } }
    ws.getCell('B2').alignment = { horizontal: 'center' }

    ws.getCell('B4').value = `RENCANA ANGGARAN ${args.year}`
    ws.getCell('B4').font = { bold: true, size: 10 }

    hdr(ws, 5, ['', 'NO.', 'PLOT', 'URAIAN', 'SAT', 'VOL', 'HS', 'W-1', 'W-2', 'W-3', 'W-4', 'JUMLAH'], '1E40AF')

    let r = 7
    const groups = [...new Set(args.rabAnggy.map((x) => x.group))]
    groups.forEach((g, gi) => {
      const rows = args.rabAnggy.filter((x) => x.group === g)
      ws.getCell(`B${r}`).value = gi + 1
      ws.getCell(`D${r}`).value = g
      ws.getCell(`D${r}`).font = { bold: true }
      ws.getCell(`E${r}`).value = 'bln'
      ws.getCell(`F${r}`).value = 1
      ws.getCell(`G${r}`).value = { formula: `L${r}/F${r}` } as never
      ws.getCell(`G${r}`).numFmt = fmt

      const start = r + 1
      const end = r + rows.length
      ws.getCell(`H${r}`).value = { formula: `SUM(H${start}:H${end})` } as never
      ws.getCell(`I${r}`).value = { formula: `SUM(I${start}:I${end})` } as never
      ws.getCell(`J${r}`).value = { formula: `SUM(J${start}:J${end})` } as never
      ws.getCell(`K${r}`).value = { formula: `SUM(K${start}:K${end})` } as never
      ws.getCell(`L${r}`).value = { formula: `SUM(H${r}:K${r})` } as never
      ;['H', 'I', 'J', 'K', 'L'].forEach((l) => (ws.getCell(`${l}${r}`).numFmt = fmt))
      styleRow(ws, r, 12, { bold: true, fill: 'EFF6FF' })
      r++

      rows.forEach((rr) => {
        ws.getCell(`B${r}`).value = '-'
        ws.getCell(`C${r}`).value = 'ANGGY'
        ws.getCell(`D${r}`).value = rr.uraian
        ws.getCell(`E${r}`).value = rr.sat
        ws.getCell(`F${r}`).value = rr.vol
        ws.getCell(`G${r}`).value = rr.hs
        ws.getCell(`G${r}`).numFmt = fmt
        const letters = ['H', 'I', 'J', 'K']
        rr.w.forEach((v, i) => {
          ws.getCell(`${letters[i]}${r}`).value = v
          ws.getCell(`${letters[i]}${r}`).numFmt = fmt
        })
        ws.getCell(`L${r}`).value = { formula: `SUM(H${r}:K${r})` } as never
        ws.getCell(`L${r}`).numFmt = fmt
        styleRow(ws, r, 12, { numFmt: fmt })
        r++
      })
    })

    const tot = r
    ws.getCell(`D${tot}`).value = 'TOTAL'
    ws.getCell(`D${tot}`).font = { bold: true }
    ws.getCell(`H${tot}`).value = { formula: `SUM(H7:H${r - 1})` } as never
    ws.getCell(`I${tot}`).value = { formula: `SUM(I7:I${r - 1})` } as never
    ws.getCell(`J${tot}`).value = { formula: `SUM(J7:J${r - 1})` } as never
    ws.getCell(`K${tot}`).value = { formula: `SUM(K7:K${r - 1})` } as never
    ws.getCell(`L${tot}`).value = { formula: `SUM(H${tot}:K${tot})` } as never
    ;['H', 'I', 'J', 'K', 'L'].forEach((l) => (ws.getCell(`${l}${tot}`).numFmt = fmt))
    styleRow(ws, tot, 12, { bold: true, fill: 'DBEAFE' })

    ws.views = [{ state: 'frozen', ySplit: 5 }]
  }

  // ==========================================
  // 3. RAB-02 (KELUARGA)
  // ==========================================
  {
    const ws = wb.addWorksheet('RAB-02')
    ws.properties.defaultRowHeight = 19
    ws.getColumn(2).width = 8
    ws.getColumn(3).width = 12
    ws.getColumn(4).width = 26
    ws.getColumn(5).width = 8
    ws.getColumn(6).width = 8
    ws.getColumn(7).width = 14
    ws.getColumn(8).width = 13
    ws.getColumn(9).width = 13
    ws.getColumn(10).width = 13
    ws.getColumn(11).width = 13
    ws.getColumn(12).width = 15

    ws.mergeCells('B1:L1')
    ws.getCell('B1').value = 'RENCANA ANGGARAN BELANJA - BULANAN'
    ws.getCell('B1').font = { bold: true, size: 12, color: { argb: 'FF1E40AF' } }
    ws.getCell('B1').alignment = { horizontal: 'center' }

    ws.mergeCells('B2:L2')
    ws.getCell('B2').value = 'KELUARGA'
    ws.getCell('B2').font = { italic: true, size: 9, color: { argb: 'FF64748B' } }
    ws.getCell('B2').alignment = { horizontal: 'center' }

    ws.getCell('B4').value = `RENCANA ANGGARAN ${args.year}`
    ws.getCell('B4').font = { bold: true, size: 10 }

    hdr(ws, 5, ['', 'NO.', 'SBDAYA', 'URAIAN', 'SAT', 'VOL', 'HS', 'W-1', 'W-2', 'W-3', 'W-4', 'JUMLAH'], '1E40AF')

    let r = 7
    const groups = [...new Set(args.rabKeluarga.map((x) => x.group))]
    groups.forEach((g, gi) => {
      const rows = args.rabKeluarga.filter((x) => x.group === g)
      ws.getCell(`B${r}`).value = gi + 1
      ws.getCell(`D${r}`).value = g
      ws.getCell(`D${r}`).font = { bold: true }
      ws.getCell(`E${r}`).value = 'bln'
      ws.getCell(`F${r}`).value = 1
      ws.getCell(`G${r}`).value = { formula: `L${r}/F${r}` } as never
      ws.getCell(`G${r}`).numFmt = fmt

      const start = r + 1
      const end = r + rows.length
      ws.getCell(`H${r}`).value = { formula: `SUM(H${start}:H${end})` } as never
      ws.getCell(`I${r}`).value = { formula: `SUM(I${start}:I${end})` } as never
      ws.getCell(`J${r}`).value = { formula: `SUM(J${start}:J${end})` } as never
      ws.getCell(`K${r}`).value = { formula: `SUM(K${start}:K${end})` } as never
      ws.getCell(`L${r}`).value = { formula: `SUM(H${r}:K${r})` } as never
      ;['H', 'I', 'J', 'K', 'L'].forEach((l) => (ws.getCell(`${l}${r}`).numFmt = fmt))
      styleRow(ws, r, 12, { bold: true, fill: 'EFF6FF' })
      r++

      rows.forEach((rr) => {
        ws.getCell(`B${r}`).value = '-'
        ws.getCell(`C${r}`).value = 'ISTRI'
        ws.getCell(`D${r}`).value = rr.uraian
        ws.getCell(`E${r}`).value = rr.sat
        ws.getCell(`F${r}`).value = rr.vol
        ws.getCell(`G${r}`).value = rr.hs
        ws.getCell(`G${r}`).numFmt = fmt
        const letters = ['H', 'I', 'J', 'K']
        rr.w.forEach((v, i) => {
          ws.getCell(`${letters[i]}${r}`).value = v
          ws.getCell(`${letters[i]}${r}`).numFmt = fmt
        })
        ws.getCell(`L${r}`).value = { formula: `SUM(H${r}:K${r})` } as never
        ws.getCell(`L${r}`).numFmt = fmt
        styleRow(ws, r, 12, { numFmt: fmt })
        r++
      })
    })

    const tot = r
    ws.getCell(`D${tot}`).value = 'TOTAL'
    ws.getCell(`D${tot}`).font = { bold: true }
    ws.getCell(`H${tot}`).value = { formula: `SUM(H7:H${r - 1})` } as never
    ws.getCell(`I${tot}`).value = { formula: `SUM(I7:I${r - 1})` } as never
    ws.getCell(`J${tot}`).value = { formula: `SUM(J7:J${r - 1})` } as never
    ws.getCell(`K${tot}`).value = { formula: `SUM(K7:K${r - 1})` } as never
    ws.getCell(`L${tot}`).value = { formula: `SUM(H${tot}:K${tot})` } as never
    ;['H', 'I', 'J', 'K', 'L'].forEach((l) => (ws.getCell(`${l}${tot}`).numFmt = fmt))
    styleRow(ws, tot, 12, { bold: true, fill: 'DBEAFE' })

    ws.views = [{ state: 'frozen', ySplit: 5 }]
  }

  // ==========================================
  // 4, 5, 6. MASTER (0), OPERASIONAL (1), KELUARGA (2)
  // ==========================================
  function addLedger(name: string, ledger: 'master' | 'operasional' | 'keluarga') {
    const ws = wb.addWorksheet(name)
    ws.getColumn(2).width = 8
    ws.getColumn(3).width = 14
    ws.getColumn(4).width = 12
    ws.getColumn(5).width = 12
    ws.getColumn(6).width = 14
    ws.getColumn(7).width = 28
    ws.getColumn(8).width = 16
    ws.getColumn(9).width = 16
    ws.getColumn(10).width = 16
    ws.getColumn(11).width = 16

    ws.mergeCells('B1:K1')
    ws.getCell('B1').value = name
    ws.getCell('B1').font = { bold: true, size: 12, color: { argb: 'FF1E40AF' } }
    ws.getCell('B1').alignment = { horizontal: 'center' }

    ws.mergeCells('B2:K2')
    ws.getCell('B2').value = 'ANGGY PERMANA PUTRA'
    ws.getCell('B2').alignment = { horizontal: 'center' }
    ws.getCell('B2').font = { italic: true, size: 9, color: { argb: 'FF64748B' } }

    if (ledger === 'master') {
      hdr(ws, 4, ['', 'NO.', 'TANGGAL', 'PERIODE', 'NSB', 'POS', 'URAIAN', '', 'PENERIMAAN', 'PENGELUARAN', 'SALDO'], '1E40AF')
    } else {
      hdr(ws, 5, ['', 'NO.', 'TANGGAL', 'PERIODE', 'NSB', 'POS', 'URAIAN', 'PENERIMAAN', 'PENGELUARAN', 'SALDO'], '1E40AF')
      ws.getRow(4).height = 4
    }

    const startRow = ledger === 'master' ? 6 : 7
    ws.getCell(`G${startRow}`).value = 'SALDO AWAL'
    if (ledger === 'master') {
      ws.getCell(`I${startRow}`).value = args.saldoAwal
      ws.getCell(`I${startRow}`).numFmt = fmtRp
      ws.getCell(`K${startRow}`).value = { formula: `I${startRow}-J${startRow}` } as never
      ws.getCell(`K${startRow}`).numFmt = fmtRp
    } else {
      ws.getCell(`H${startRow}`).value = 0
      ws.getCell(`H${startRow}`).numFmt = fmtRp
      ws.getCell(`J${startRow}`).value = { formula: `J6+H${startRow}-I${startRow}` } as never
      ws.getCell(`J${startRow}`).numFmt = fmtRp
    }

    const rows = yearTransactions(args.txs, args.year)
      .filter((t) => t.ledger === ledger)
      .filter((t) => !(t.pos === 'SALDO AWAL' && t.ledger === 'master'))
      .sort((a, b) => a.tanggal.localeCompare(b.tanggal))

    let r = startRow + 1
    rows.forEach((t, i) => {
      const no = i + 1
      ws.getCell(`B${r}`).value = no
      ws.getCell(`C${r}`).value = new Date(t.tanggal)
      ws.getCell(`C${r}`).numFmt = 'dd-mmm-yyyy'
      ws.getCell(`D${r}`).value = { formula: `MONTH(C${r})&"-"&YEAR(C${r})` } as never
      ws.getCell(`E${r}`).value = t.nsb
      ws.getCell(`F${r}`).value = t.pos

      if (ledger === 'master') {
        ws.getCell(`G${r}`).value = t.uraian
        ws.getCell(`I${r}`).value = t.penerimaan || null
        ws.getCell(`J${r}`).value = t.pengeluaran || null
        ws.getCell(`I${r}`).numFmt = fmt
        ws.getCell(`J${r}`).numFmt = fmt
        ws.getCell(`K${r}`).value = { formula: `K${r - 1}+I${r}-J${r}` } as never
        ws.getCell(`K${r}`).numFmt = fmt
      } else {
        ws.getCell(`G${r}`).value = t.uraian
        ws.getCell(`H${r}`).value = t.penerimaan || null
        ws.getCell(`I${r}`).value = t.pengeluaran || null
        ws.getCell(`H${r}`).numFmt = fmt
        ws.getCell(`I${r}`).numFmt = fmt
        ws.getCell(`J${r}`).value = { formula: `J${r - 1}+H${r}-I${r}` } as never
        ws.getCell(`J${r}`).numFmt = fmt
      }
      styleRow(ws, r, ledger === 'master' ? 11 : 10)
      r++
    })

    // Totals row
    const tr = r + 1
    ws.getCell(`G${tr}`).value = 'TOTAL'
    ws.getCell(`G${tr}`).font = { bold: true }
    if (ledger === 'master') {
      ws.getCell(`I${tr}`).value = { formula: `SUM(I5:I${r - 1})` } as never
      ws.getCell(`J${tr}`).value = { formula: `SUM(J5:J${r - 1})` } as never
      ws.getCell(`K${tr}`).value = { formula: `I${tr}-J${tr}` } as never
      ;['I', 'J', 'K'].forEach((l) => (ws.getCell(`${l}${tr}`).numFmt = fmt))
    } else {
      ws.getCell(`H${tr}`).value = { formula: `SUM(H7:H${r - 1})` } as never
      ws.getCell(`I${tr}`).value = { formula: `SUM(I7:I${r - 1})` } as never
      ws.getCell(`J${tr}`).value = { formula: `H${tr}-I${tr}` } as never
      ;['H', 'I', 'J'].forEach((l) => (ws.getCell(`${l}${tr}`).numFmt = fmt))
    }
    styleRow(ws, tr, ledger === 'master' ? 11 : 10, { bold: true, fill: 'DBEAFE' })
    ws.views = [{ state: 'frozen', ySplit: 5 }]
  }

  addLedger('MASTER (0)', 'master')
  addLedger('OPERASIONAL (1)', 'operasional')
  addLedger('KELUARGA (2)', 'keluarga')

  // ==========================================
  // 7. RARI - JAN 2026
  // ==========================================
  {
    const ws = wb.addWorksheet(`RARI - JAN ${args.year}`)
    ws.properties.defaultRowHeight = 19
    ws.getColumn(2).width = 8
    ws.getColumn(3).width = 30
    for (let c = 4; c <= 12; c++) ws.getColumn(c).width = 15

    ws.mergeCells('B1:L1')
    ws.getCell('B1').value = `EVALUASI ANGGARAN - JANUARI ${args.year}`
    ws.getCell('B1').font = { bold: true, size: 12, color: { argb: 'FF1E40AF' } }
    ws.getCell('B1').alignment = { horizontal: 'center' }

    hdr(ws, 4, ['', 'BAB', 'URAIAN', 'RA', 'RI', 'DEV', '% DEV', '', 'PROYEKSI SISA', 'RI VS RA', 'TOTAL PROYEKSI', 'KOEF'], '1E40AF')

    let r = 7
    // I. PENERIMAAN
    ws.getCell(`B${r}`).value = 'I'
    ws.getCell(`C${r}`).value = 'PENERIMAAN'
    ws.getCell(`C${r}`).font = { bold: true }
    ws.getCell(`D${r}`).value = { formula: `SUM(D8:D12)` } as never
    ws.getCell(`E${r}`).value = { formula: `SUM(E8:E12)` } as never
    ws.getCell(`F${r}`).value = { formula: `SUM(F8:F12)` } as never
    ws.getCell(`G${r}`).value = { formula: `IFERROR(F${r}/D${r},0)` } as never
    ws.getCell(`G${r}`).numFmt = '0.00%'
    ws.getCell(`I${r}`).value = { formula: `SUM(I8:I12)` } as never
    ws.getCell(`J${r}`).value = { formula: `SUM(J8:J12)` } as never
    ws.getCell(`K${r}`).value = { formula: `SUM(K8:K12)` } as never
    ws.getCell(`L${r}`).value = { formula: `IFERROR(K${r}/D${r},0)` } as never
    ws.getCell(`L${r}`).numFmt = '0.00%'
    ;['D', 'E', 'F', 'I', 'J', 'K'].forEach((l) => (ws.getCell(`${l}${r}`).numFmt = fmt))
    styleRow(ws, r, 12, { bold: true, fill: 'EFF6FF' })
    r++

    const itemsPenerimaan = [
      { name: 'SALARY BULANAN', ra: 6000000, ri: 6000000, sisa: 0 },
      { name: 'PENDAPATAN - USAHA LAINNYA', ra: 1000000, ri: 0, sisa: 1000000 },
      { name: 'ASET - PIUTANG', ra: 500000, ri: 500000, sisa: 0 },
      { name: 'PENJUALAN - ASET', ra: 3800000, ri: 3800000, sisa: 0 },
      { name: 'PENDAPATAN - LAIN LAIN', ra: 0, ri: -20000, sisa: 100000 },
    ]

    itemsPenerimaan.forEach((item, idx) => {
      ws.getCell(`B${r}`).value = idx + 1
      ws.getCell(`C${r}`).value = item.name
      ws.getCell(`D${r}`).value = item.ra
      ws.getCell(`E${r}`).value = item.ri
      ws.getCell(`F${r}`).value = { formula: `E${r}-D${r}` } as never
      ws.getCell(`G${r}`).value = { formula: `IFERROR(F${r}/D${r},0)` } as never
      ws.getCell(`G${r}`).numFmt = '0.00%'
      ws.getCell(`I${r}`).value = item.sisa
      ws.getCell(`J${r}`).value = { formula: `I${r}+E${r}-D${r}` } as never
      ws.getCell(`K${r}`).value = { formula: `E${r}+I${r}` } as never
      ws.getCell(`L${r}`).value = { formula: `IFERROR(K${r}/D${r},0)` } as never
      ws.getCell(`L${r}`).numFmt = '0.00%'
      ;['D', 'E', 'F', 'I', 'J', 'K'].forEach((l) => (ws.getCell(`${l}${r}`).numFmt = fmt))
      styleRow(ws, r, 12)
      r++
    })

    // II. PENGELUARAN
    r++
    ws.getCell(`B${r}`).value = 'II'
    ws.getCell(`C${r}`).value = 'PENGELUARAN'
    ws.getCell(`C${r}`).font = { bold: true }
    styleRow(ws, r, 12, { bold: true, fill: 'FEF3C7' })
    r++

    const subPengeluaran = [
      { name: 'ANGGY OPS - OPERASIONAL', ra: 500000, ri: 52500, sisa: 350000 },
      { name: 'ANGGY OPS - ORANG TUA', ra: 200000, ri: 200000, sisa: 0 },
      { name: 'ANGGY OPS - BELANJA', ra: 800000, ri: 54000, sisa: 600000 },
      { name: 'KELUARGA - NAFKAH', ra: 1800000, ri: 1500000, sisa: 300000 },
      { name: 'KELUARGA - ANAK', ra: 650000, ri: 425000, sisa: 200000 },
      { name: 'KELUARGA - MERTUA', ra: 100000, ri: 100000, sisa: 0 },
      { name: 'KELUARGA - PEMBANTU', ra: 400000, ri: 400000, sisa: 0 },
      { name: 'KELUARGA - RUMAH', ra: 250000, ri: 150000, sisa: 0 },
      { name: 'KELUARGA - BELANJA', ra: 800000, ri: 0, sisa: 800000 },
    ]

    const startPeng = r
    subPengeluaran.forEach((item, idx) => {
      ws.getCell(`B${r}`).value = idx + 1
      ws.getCell(`C${r}`).value = item.name
      ws.getCell(`D${r}`).value = item.ra
      ws.getCell(`E${r}`).value = item.ri
      ws.getCell(`F${r}`).value = { formula: `D${r}-E${r}` } as never
      ws.getCell(`G${r}`).value = { formula: `IFERROR(F${r}/D${r},0)` } as never
      ws.getCell(`G${r}`).numFmt = '0.00%'
      ws.getCell(`I${r}`).value = item.sisa
      ws.getCell(`J${r}`).value = { formula: `F${r}-I${r}` } as never
      ws.getCell(`K${r}`).value = { formula: `E${r}+I${r}` } as never
      ws.getCell(`L${r}`).value = { formula: `IFERROR(K${r}/D${r},0)` } as never
      ws.getCell(`L${r}`).numFmt = '0.00%'
      ;['D', 'E', 'F', 'I', 'J', 'K'].forEach((l) => (ws.getCell(`${l}${r}`).numFmt = fmt))
      styleRow(ws, r, 12)
      r++
    })
    const endPeng = r - 1

    // Subtotal Pengeluaran
    ws.getCell(`B${r}`).value = 'II'
    ws.getCell(`C${r}`).value = 'SUBTOTAL - PENGELUARAN'
    ws.getCell(`C${r}`).font = { bold: true }
    ws.getCell(`D${r}`).value = { formula: `SUM(D${startPeng}:D${endPeng})` } as never
    ws.getCell(`E${r}`).value = { formula: `SUM(E${startPeng}:E${endPeng})` } as never
    ws.getCell(`F${r}`).value = { formula: `SUM(F${startPeng}:F${endPeng})` } as never
    ws.getCell(`G${r}`).value = { formula: `IFERROR(F${r}/D${r},0)` } as never
    ws.getCell(`G${r}`).numFmt = '0.00%'
    ws.getCell(`I${r}`).value = { formula: `SUM(I${startPeng}:I${endPeng})` } as never
    ws.getCell(`J${r}`).value = { formula: `SUM(J${startPeng}:J${endPeng})` } as never
    ws.getCell(`K${r}`).value = { formula: `SUM(K${startPeng}:K${endPeng})` } as never
    ws.getCell(`L${r}`).value = { formula: `IFERROR(K${r}/D${r},0)` } as never
    ws.getCell(`L${r}`).numFmt = '0.00%'
    ;['D', 'E', 'F', 'I', 'J', 'K'].forEach((l) => (ws.getCell(`${l}${r}`).numFmt = fmt))
    styleRow(ws, r, 12, { bold: true, fill: 'FEE2E2' })
    const subPengRow = r
    r++

    // SURPLUS / DEFISIT
    ws.getCell(`C${r}`).value = 'SURPLUS / (DEFISIT)'
    ws.getCell(`C${r}`).font = { bold: true }
    ws.getCell(`D${r}`).value = { formula: `D7-D${subPengRow}` } as never
    ws.getCell(`E${r}`).value = { formula: `E7-E${subPengRow}` } as never
    ws.getCell(`F${r}`).value = { formula: `IF(E${r}>=0,"SURPLUS","DEFISIT")` } as never
    ws.getCell(`I${r}`).value = { formula: `I7-I${subPengRow}` } as never
    ws.getCell(`J${r}`).value = { formula: `J7-J${subPengRow}` } as never
    ws.getCell(`K${r}`).value = { formula: `K7-K${subPengRow}` } as never
    ;['D', 'E', 'I', 'J', 'K'].forEach((l) => (ws.getCell(`${l}${r}`).numFmt = fmt))
    styleRow(ws, r, 12, { bold: true, fill: 'DBEAFE' })

    ws.views = [{ state: 'frozen', ySplit: 4 }]
  }

  // ==========================================
  // 8. CF - 2026 (CASH FLOW 12 BULAN)
  // ==========================================
  {
    const ws = wb.addWorksheet(`CF - ${args.year}`)
    ws.properties.defaultRowHeight = 19
    ws.getColumn(2).width = 8
    ws.getColumn(3).width = 30
    ws.getColumn(4).width = 14
    ws.getColumn(5).width = 16
    for (let c = 6; c <= 17; c++) ws.getColumn(c).width = 13
    ws.getColumn(18).width = 16
    ws.getColumn(19).width = 14
    ws.getColumn(20).width = 12

    ws.mergeCells('B1:T1')
    ws.getCell('B1').value = `MONITORING CASH FLOW | ${args.year}`
    ws.getCell('B1').font = { bold: true, size: 12, color: { argb: 'FF1E40AF' } }
    ws.getCell('B1').alignment = { horizontal: 'center' }

    ws.mergeCells('B2:T2')
    ws.getCell('B2').value = 'ANGGY PERMANA PUTRA | GROWTH, COMMITMENT & PERSISTENCE'
    ws.getCell('B2').font = { italic: true, size: 9, color: { argb: 'FF64748B' } }
    ws.getCell('B2').alignment = { horizontal: 'center' }

    hdr(
      ws,
      7,
      [
        '',
        'BAB',
        'URAIAN',
        `CF -${args.year - 1}`,
        `RA PROYEKSI ${args.year}`,
        'JAN',
        'FEB',
        'MAR',
        'APR',
        'MEI',
        'JUN',
        'JUL',
        'AGU',
        'SEP',
        'OKT',
        'NOV',
        'DES',
        'TOTAL',
        'DEV',
        'RATIO',
      ],
      '0F766E'
    )

    // SALDO AWAL
    ws.getCell('B9').value = 0
    ws.getCell('C9').value = 'SALDO AWAL - BANK (TAHUN LALU)'
    ws.getCell('C9').font = { bold: true }
    ws.getCell('D9').value = 0
    ws.getCell('E9').value = args.saldoAwal
    ;['D', 'E'].forEach((l) => (ws.getCell(`${l}9`).numFmt = fmt))
    styleRow(ws, 9, 20, { bold: true, fill: 'F1F5F9' })

    // I. PENERIMAAN
    ws.getCell('B10').value = 'I'
    ws.getCell('C10').value = 'PENERIMAAN'
    ws.getCell('C10').font = { bold: true }
    ws.getCell('D10').value = { formula: 'SUM(D11:D15)' } as never
    ws.getCell('E10').value = { formula: 'SUM(E11:E15)' } as never
    for (let c = 6; c <= 17; c++) {
      const l = String.fromCharCode(64 + c)
      ws.getCell(`${l}10`).value = { formula: `SUM(${l}11:${l}15)` } as never
      ws.getCell(`${l}10`).numFmt = fmt
    }
    ws.getCell('R10').value = { formula: 'SUM(F10:Q10)' } as never
    ws.getCell('S10').value = { formula: 'R10-E10' } as never
    ws.getCell('T10').value = { formula: 'IFERROR(R10/E10,0)' } as never
    ws.getCell('T10').numFmt = '0.00%'
    ;['D', 'E', 'R', 'S'].forEach((l) => (ws.getCell(`${l}10`).numFmt = fmt))
    styleRow(ws, 10, 20, { bold: true, fill: 'EFF6FF' })

    const cfIncomes = [
      { name: 'SALARY BULANAN', val12: Array(12).fill(6000000) },
      { name: 'PENDAPATAN - USAHA', val12: Array(12).fill(1000000) },
      { name: 'ASET - PIUTANG', val12: [500000, 500000, 500000, 500000, 0, 0, 0, 0, 0, 0, 0, 0] },
      { name: 'PENJUALAN - ASET', val12: [3800000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
      { name: 'PENDAPATAN LAIN', val12: [-20000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    ]

    cfIncomes.forEach((inc, idx) => {
      const rowNum = 11 + idx
      ws.getCell(`B${rowNum}`).value = idx + 1
      ws.getCell(`C${rowNum}`).value = inc.name
      ws.getCell(`E${rowNum}`).value = { formula: `SUM(F${rowNum}:Q${rowNum})` } as never
      inc.val12.forEach((v, mi) => {
        const colLetter = String.fromCharCode(70 + mi)
        ws.getCell(`${colLetter}${rowNum}`).value = v
        ws.getCell(`${colLetter}${rowNum}`).numFmt = fmt
      })
      ws.getCell(`R${rowNum}`).value = { formula: `SUM(F${rowNum}:Q${rowNum})` } as never
      ws.getCell(`S${rowNum}`).value = { formula: `R${rowNum}-E${rowNum}` } as never
      ws.getCell(`T${rowNum}`).value = { formula: `IFERROR(R${rowNum}/E${rowNum},0)` } as never
      ws.getCell(`T${rowNum}`).numFmt = '0.00%'
      ;['E', 'R', 'S'].forEach((l) => (ws.getCell(`${l}${rowNum}`).numFmt = fmt))
      styleRow(ws, rowNum, 20)
    })

    // II. PENGELUARAN
    const pRow = 17
    ws.getCell(`B${pRow}`).value = 'II'
    ws.getCell(`C${pRow}`).value = 'PENGELUARAN'
    ws.getCell(`C${pRow}`).font = { bold: true }
    styleRow(ws, pRow, 20, { bold: true, fill: 'FEF3C7' })

    const cfExpenses = [
      { name: 'ANGGY OPS - OPERASIONAL', monthly: 400000 },
      { name: 'ANGGY OPS - ORANG TUA', monthly: 200000 },
      { name: 'ANGGY OPS - BELANJA', monthly: 400000 },
      { name: 'ANGGY OPS - RELX / ROKOK', monthly: 400000 },
      { name: 'ANGGY KELUARGA - NAFKAH', monthly: 1500000 },
      { name: 'ANGGY KELUARGA - BELANJA BULANAN', monthly: 300000 },
      { name: 'ANGGY KELUARGA - ANAK (SPP/LES/NGAJI)', monthly: 350000 },
      { name: 'ANGGY KELUARGA - PEMBANTU', monthly: 400000 },
      { name: 'ANGGY KELUARGA - RUMAH (LISTRIK)', monthly: 100000 },
    ]

    let expR = pRow + 1
    const startExp = expR
    cfExpenses.forEach((exp, idx) => {
      ws.getCell(`B${expR}`).value = idx + 1
      ws.getCell(`C${expR}`).value = exp.name
      ws.getCell(`E${expR}`).value = exp.monthly * 12
      for (let m = 0; m < 12; m++) {
        const colLetter = String.fromCharCode(70 + m)
        ws.getCell(`${colLetter}${expR}`).value = exp.monthly
        ws.getCell(`${colLetter}${expR}`).numFmt = fmt
      }
      ws.getCell(`R${expR}`).value = { formula: `SUM(F${expR}:Q${expR})` } as never
      ws.getCell(`S${expR}`).value = { formula: `E${expR}-R${expR}` } as never
      ws.getCell(`T${expR}`).value = { formula: `IFERROR(R${expR}/E${expR},0)` } as never
      ws.getCell(`T${expR}`).numFmt = '0.00%'
      ;['E', 'R', 'S'].forEach((l) => (ws.getCell(`${l}${expR}`).numFmt = fmt))
      styleRow(ws, expR, 20)
      expR++
    })
    const endExp = expR - 1

    // SUBTOTAL PENGELUARAN
    ws.getCell(`B${expR}`).value = 'II'
    ws.getCell(`C${expR}`).value = 'SUBTOTAL - PENGELUARAN'
    ws.getCell(`C${expR}`).font = { bold: true }
    ws.getCell(`E${expR}`).value = { formula: `SUM(E${startExp}:E${endExp})` } as never
    for (let c = 6; c <= 17; c++) {
      const l = String.fromCharCode(64 + c)
      ws.getCell(`${l}${expR}`).value = { formula: `SUM(${l}${startExp}:${l}${endExp})` } as never
      ws.getCell(`${l}${expR}`).numFmt = fmt
    }
    ws.getCell(`R${expR}`).value = { formula: `SUM(F${expR}:Q${expR})` } as never
    ws.getCell(`S${expR}`).value = { formula: `E${expR}-R${expR}` } as never
    ws.getCell(`T${expR}`).value = { formula: `IFERROR(R${expR}/E${expR},0)` } as never
    ws.getCell(`T${expR}`).numFmt = '0.00%'
    ;['E', 'R', 'S'].forEach((l) => (ws.getCell(`${l}${expR}`).numFmt = fmt))
    styleRow(ws, expR, 20, { bold: true, fill: 'FEE2E2' })
    const subExpRow = expR
    expR++

    // SURPLUS / DEFISIT
    ws.getCell(`B${expR}`).value = 'III'
    ws.getCell(`C${expR}`).value = 'SURPLUS / (DEFISIT)'
    ws.getCell(`C${expR}`).font = { bold: true }
    ws.getCell(`E${expR}`).value = { formula: `E10-E${subExpRow}` } as never
    for (let c = 6; c <= 17; c++) {
      const l = String.fromCharCode(64 + c)
      ws.getCell(`${l}${expR}`).value = { formula: `${l}10-${l}${subExpRow}` } as never
      ws.getCell(`${l}${expR}`).numFmt = fmt
    }
    ws.getCell(`R${expR}`).value = { formula: `SUM(F${expR}:Q${expR})` } as never
    ws.getCell(`S${expR}`).value = { formula: `R${expR}-E${expR}` } as never
    ;['E', 'R', 'S'].forEach((l) => (ws.getCell(`${l}${expR}`).numFmt = fmt))
    styleRow(ws, expR, 20, { bold: true, fill: 'DBEAFE' })
    const surRow = expR
    expR++

    // SALDO AKHIR BANK BERJALAN
    ws.getCell(`C${expR}`).value = 'SALDO BANK BERJALAN'
    ws.getCell(`C${expR}`).font = { bold: true }
    ws.getCell(`E${expR}`).value = args.saldoAwal
    ws.getCell(`F${expR}`).value = { formula: `E9+F${surRow}` } as never
    ws.getCell(`F${expR}`).numFmt = fmt
    for (let c = 7; c <= 17; c++) {
      const prevL = String.fromCharCode(64 + c - 1)
      const curL = String.fromCharCode(64 + c)
      ws.getCell(`${curL}${expR}`).value = { formula: `${prevL}${expR}+${curL}${surRow}` } as never
      ws.getCell(`${curL}${expR}`).numFmt = fmt
    }
    ws.getCell(`R${expR}`).value = { formula: `Q${expR}` } as never
    ;['E', 'R'].forEach((l) => (ws.getCell(`${l}${expR}`).numFmt = fmt))
    styleRow(ws, expR, 20, { bold: true, fill: 'D1FAE5' })

    ws.views = [{ state: 'frozen', xSplit: 3, ySplit: 7 }]
  }

  // ==========================================
  // 9. DEPRESIASI-ASET
  // ==========================================
  {
    const ws = wb.addWorksheet('DEPRESIASI-ASET')
    ws.mergeCells('A1:N1')
    ws.getCell('A1').value = 'MONITORING PENYUSUTAN ASET TETAP'
    ws.getCell('A1').font = { bold: true, size: 12, color: { argb: 'FF1E40AF' } }
    ws.getCell('A1').alignment = { horizontal: 'center' }

    ws.mergeCells('A2:N2')
    ws.getCell('A2').value = 'ANGGY'
    ws.getCell('A2').alignment = { horizontal: 'center' }
    ws.getCell('A2').font = { italic: true }

    ws.getRow(4).values = [null, 'PENYUSUTAN ASET TETAP - KENDARAAN']
    ws.getCell('B4').font = { bold: true, color: { argb: 'FF1E40AF' } }
    ws.getColumn(2).width = 8
    ws.getColumn(3).width = 22
    ws.getColumn(4).width = 14
    ws.getColumn(5).width = 14
    ws.getColumn(6).width = 10
    ws.getColumn(7).width = 8
    ws.getColumn(8).width = 14
    ws.getColumn(9).width = 14
    ws.getColumn(10).width = 14
    ws.getColumn(11).width = 16
    ws.getColumn(12).width = 16
    ws.getColumn(13).width = 18
    ws.getColumn(14).width = 16

    hdr(
      ws,
      6,
      [
        '',
        'NO.',
        'NAMA ASET',
        'PEROLEHAN TGL',
        'NILAI',
        'UMUR',
        'SAT',
        'DEPRE / BLN',
        'PERIODE',
        'SISA PERIODE',
        'AKUM DEPRE',
        'SISA NILAI',
        'NILAI TAKSIR',
        'HASIL LEBIH',
      ],
      '334155'
    )

    let r = 8
    const kend = args.deps.filter((d) => d.kat === 'KENDARAAN')
    kend.forEach((d, i) => {
      ws.getCell(`B${r}`).value = i + 1
      ws.getCell(`C${r}`).value = d.nama
      ws.getCell(`D${r}`).value = new Date(d.tgl)
      ws.getCell(`D${r}`).numFmt = 'dd-mmm-yyyy'
      ws.getCell(`E${r}`).value = d.nilai
      ws.getCell(`E${r}`).numFmt = fmt
      ws.getCell(`F${r}`).value = d.umur
      ws.getCell(`G${r}`).value = 'bln'
      ws.getCell(`H${r}`).value = { formula: `E${r}/F${r}` } as never
      ws.getCell(`H${r}`).numFmt = fmt
      ws.getCell(`I${r}`).value = Math.max(0, Math.min(d.umur, (args.year - new Date(d.tgl).getFullYear()) * 12 + (11 - new Date(d.tgl).getMonth())))
      ws.getCell(`J${r}`).value = { formula: `F${r}-I${r}` } as never
      ws.getCell(`K${r}`).value = { formula: `H${r}*I${r}` } as never
      ws.getCell(`L${r}`).value = { formula: `IF(E${r}-K${r}>0,E${r}-K${r},0)` } as never
      ws.getCell(`M${r}`).value = d.nilaiTaksir
      ws.getCell(`N${r}`).value = { formula: `M${r}-L${r}` } as never
      for (let c = 5; c <= 14; c++) ws.getCell(r, c).numFmt = fmt
      ws.getCell(`D${r}`).numFmt = 'dd-mmm-yyyy'
      styleRow(ws, r, 14)
      r++
    })

    const totK = r
    ws.getCell(`C${totK}`).value = 'TOTAL KENDARAAN'
    ws.getCell(`C${totK}`).font = { bold: true }
    ws.getCell(`E${totK}`).value = { formula: `SUM(E8:E${r - 1})` } as never
    ws.getCell(`H${totK}`).value = { formula: `SUM(H8:H${r - 1})` } as never
    ws.getCell(`K${totK}`).value = { formula: `SUM(K8:K${r - 1})` } as never
    ws.getCell(`L${totK}`).value = { formula: `SUM(L8:L${r - 1})` } as never
    ws.getCell(`M${totK}`).value = { formula: `SUM(M8:M${r - 1})` } as never
    ws.getCell(`N${totK}`).value = { formula: `SUM(N8:N${r - 1})` } as never
    ;['E', 'H', 'K', 'L', 'M', 'N'].forEach((l) => (ws.getCell(`${l}${totK}`).numFmt = fmt))
    styleRow(ws, totK, 14, { bold: true, fill: 'EFF6FF' })

    // Gadget
    r = totK + 2
    ws.getCell(`B${r}`).value = 'PENYUSUTAN ASET TETAP - ELEKTRONIK & GADGET'
    ws.getCell(`B${r}`).font = { bold: true, color: { argb: 'FF1E40AF' } }
    r += 2
    hdr(
      ws,
      r,
      [
        '',
        'NO.',
        'NAMA ASET',
        'PEROLEHAN TGL',
        'NILAI',
        'UMUR',
        'SAT',
        'DEPRE / BLN',
        'PERIODE',
        'SISA PERIODE',
        'AKUM DEPRE',
        'SISA NILAI',
        'NILAI TAKSIR',
        'HASIL LEBIH',
      ],
      '334155'
    )
    r += 2

    const gad = args.deps.filter((d) => d.kat === 'GADGET')
    const startG = r
    gad.forEach((d, i) => {
      ws.getCell(`B${r}`).value = i + 1
      ws.getCell(`C${r}`).value = d.nama
      ws.getCell(`D${r}`).value = new Date(d.tgl)
      ws.getCell(`D${r}`).numFmt = 'dd-mmm-yyyy'
      ws.getCell(`E${r}`).value = d.nilai
      ws.getCell(`F${r}`).value = d.umur
      ws.getCell(`G${r}`).value = 'bln'
      ws.getCell(`H${r}`).value = { formula: `E${r}/F${r}` } as never
      ws.getCell(`I${r}`).value = Math.max(0, Math.min(d.umur, (args.year - new Date(d.tgl).getFullYear()) * 12 + (11 - new Date(d.tgl).getMonth())))
      ws.getCell(`J${r}`).value = { formula: `F${r}-I${r}` } as never
      ws.getCell(`K${r}`).value = { formula: `H${r}*I${r}` } as never
      ws.getCell(`L${r}`).value = { formula: `IF(E${r}-K${r}>0,E${r}-K${r},0)` } as never
      ws.getCell(`M${r}`).value = d.nilaiTaksir
      ws.getCell(`N${r}`).value = { formula: `M${r}-L${r}` } as never
      for (let c = 5; c <= 14; c++) ws.getCell(r, c).numFmt = fmt
      ws.getCell(`D${r}`).numFmt = 'dd-mmm-yyyy'
      styleRow(ws, r, 14)
      r++
    })

    const totG = r
    ws.getCell(`C${totG}`).value = 'TOTAL GADGET'
    ws.getCell(`E${totG}`).value = { formula: `SUM(E${startG}:E${r - 1})` } as never
    ws.getCell(`H${totG}`).value = { formula: `SUM(H${startG}:H${r - 1})` } as never
    ws.getCell(`K${totG}`).value = { formula: `SUM(K${startG}:K${r - 1})` } as never
    ws.getCell(`L${totG}`).value = { formula: `SUM(L${startG}:L${r - 1})` } as never
    ws.getCell(`M${totG}`).value = { formula: `SUM(M${startG}:M${r - 1})` } as never
    ws.getCell(`N${totG}`).value = { formula: `SUM(N${startG}:N${r - 1})` } as never
    ;['E', 'H', 'K', 'L', 'M', 'N'].forEach((l) => (ws.getCell(`${l}${totG}`).numFmt = fmt))
    styleRow(ws, totG, 14, { bold: true, fill: 'EFF6FF' })

    const grand = totG + 2
    ws.getCell(`C${grand}`).value = 'GRAND TOTAL - ASET DEPRESIASI'
    ws.getCell(`C${grand}`).font = { bold: true }
    ws.getCell(`E${grand}`).value = { formula: `E${totK}+E${totG}` } as never
    ws.getCell(`H${grand}`).value = { formula: `H${totK}+H${totG}` } as never
    ws.getCell(`K${grand}`).value = { formula: `K${totK}+K${totG}` } as never
    ws.getCell(`L${grand}`).value = { formula: `L${totK}+L${totG}` } as never
    ws.getCell(`M${grand}`).value = { formula: `M${totK}+M${totG}` } as never
    ws.getCell(`N${grand}`).value = { formula: `N${totK}+N${totG}` } as never
    ;['E', 'H', 'K', 'L', 'M', 'N'].forEach((l) => (ws.getCell(`${l}${grand}`).numFmt = fmt))
    styleRow(ws, grand, 14, { bold: true, fill: '1E40AF' })
    ws.getRow(grand).eachCell((c) => (c.font = { bold: true, color: { argb: 'FFFFFFFF' } }))
  }

  // ==========================================
  // 10. SCHEDULE-ASET
  // ==========================================
  {
    const ws = wb.addWorksheet('SCHEDULE-ASET')
    ws.mergeCells('A1:T1')
    ws.getCell('A1').value = 'MONITORING SCHEDULE MAINTENANCE ASET'
    ws.getCell('A1').font = { bold: true, size: 12, color: { argb: 'FF1E40AF' } }
    ws.getCell('A1').alignment = { horizontal: 'center' }

    ws.mergeCells('A2:T2')
    ws.getCell('A2').value = 'ANGGY'
    ws.getCell('A2').alignment = { horizontal: 'center' }

    ws.getCell('B4').value = 'MAINTENANCE / SERVICE'
    ws.getCell('B4').font = { bold: true }
    for (let c = 2; c <= 20; c++) ws.getColumn(c).width = 12
    ws.getColumn(3).width = 24

    hdr(
      ws,
      6,
      [
        '',
        'NO.',
        'NAMA ASET',
        'HS',
        'VOL',
        'JUMLAH',
        'JAN',
        'FEB',
        'MAR',
        'APR',
        'MEI',
        'JUN',
        'JUL',
        'AGU',
        'SEP',
        'OKT',
        'NOV',
        'DES',
        'TOTAL',
      ],
      '0F766E'
    )

    let r = 8
    const svc = args.scheds.filter((s) => s.kat === 'service')
    const pajak = args.scheds.filter((s) => s.kat === 'pajak')

    function renderSchedBlock(title: string, rows: SchedRow[]) {
      ws.getCell(`C${r}`).value = title
      ws.getCell(`C${r}`).font = { bold: true, color: { argb: 'FF0F766E' } }
      styleRow(ws, r, 19, { bold: true, fill: 'ECFDF5' })
      const startB = r + 1
      r++
      rows.forEach((row, i) => {
        ws.getCell(`B${r}`).value = i + 1
        ws.getCell(`C${r}`).value = row.nama
        ws.getCell(`D${r}`).value = row.hs
        ws.getCell(`D${r}`).numFmt = fmt
        ws.getCell(`E${r}`).value = { formula: `COUNT(G${r}:R${r})` } as never
        ws.getCell(`F${r}`).value = { formula: `D${r}*E${r}` } as never
        ws.getCell(`F${r}`).numFmt = fmt
        row.months.forEach((v, mi) => {
          const colLetter = String.fromCharCode(71 + mi)
          ws.getCell(`${colLetter}${r}`).value = v || null
          ws.getCell(`${colLetter}${r}`).numFmt = fmt
        })
        ws.getCell(`S${r}`).value = { formula: `SUM(G${r}:R${r})` } as never
        ws.getCell(`S${r}`).numFmt = fmt
        styleRow(ws, r, 19)
        r++
      })
      const endB = r - 1
      const subTot = r
      ws.getCell(`C${subTot}`).value = `TOTAL ${title}`
      ws.getCell(`C${subTot}`).font = { bold: true }
      ws.getCell(`F${subTot}`).value = { formula: `SUM(F${startB}:F${endB})` } as never
      for (let c = 7; c <= 19; c++) {
        const l = String.fromCharCode(64 + c)
        ws.getCell(`${l}${subTot}`).value = { formula: `SUM(${l}${startB}:${l}${endB})` } as never
        ws.getCell(`${l}${subTot}`).numFmt = fmt
      }
      ws.getCell(`F${subTot}`).numFmt = fmt
      styleRow(ws, subTot, 19, { bold: true, fill: 'D1FAE5' })
      r++
      return subTot
    }

    const tSvc = renderSchedBlock('MAINTENANCE / SERVICE', svc)
    r++
    const tPajak = renderSchedBlock('PAJAK & RETRIBUSI', pajak)
    r++

    const gTot = r
    ws.getCell(`C${gTot}`).value = 'GRAND TOTAL SCHEDULE'
    ws.getCell(`C${gTot}`).font = { bold: true, color: { argb: 'FFFFFFFF' } }
    ws.getCell(`F${gTot}`).value = { formula: `F${tSvc}+F${tPajak}` } as never
    for (let c = 7; c <= 19; c++) {
      const l = String.fromCharCode(64 + c)
      ws.getCell(`${l}${gTot}`).value = { formula: `${l}${tSvc}+${l}${tPajak}` } as never
      ws.getCell(`${l}${gTot}`).numFmt = fmt
    }
    ws.getCell(`F${gTot}`).numFmt = fmt
    styleRow(ws, gTot, 19, { bold: true, fill: '0F766E' })
    ws.getRow(gTot).eachCell((c) => (c.font = { bold: true, color: { argb: 'FFFFFFFF' } }))
  }

  // ==========================================
  // 11. PIUTANG-PRIBADI
  // ==========================================
  {
    const ws = wb.addWorksheet('PIUTANG-PRIBADI')
    ws.getCell('B2').value = 'DAFTAR PIUTANG'
    ws.getCell('B2').font = { bold: true, size: 12, color: { argb: 'FF1E40AF' } }
    ws.getColumn(2).width = 8
    ws.getColumn(3).width = 14
    ws.getColumn(4).width = 14
    ws.getColumn(5).width = 24
    ws.getColumn(6).width = 16
    ws.getColumn(7).width = 16
    ws.getColumn(8).width = 16
    ws.getColumn(9).width = 24

    ws.getCell('B4').value = 'PRIBADI'
    ws.getCell('B4').font = { bold: true }
    hdr(ws, 5, ['', 'NO.', 'TGL', 'NSB', 'URAIAN', 'PENERBITAN', 'PELUNASAN', 'SALDO', 'KETERANGAN'], '7C3AED')

    let r = 7
    let saldo = 0
    args.piutangs.forEach((p, i) => {
      saldo += p.terbit - p.lunas
      ws.getCell(`B${r}`).value = i + 1
      ws.getCell(`C${r}`).value = new Date(p.tgl)
      ws.getCell(`C${r}`).numFmt = 'dd-mmm-yyyy'
      ws.getCell(`D${r}`).value = p.nsb
      ws.getCell(`E${r}`).value = p.uraian
      ws.getCell(`F${r}`).value = p.terbit || null
      ws.getCell(`G${r}`).value = p.lunas || null
      ws.getCell(`H${r}`).value = saldo
      ws.getCell(`I${r}`).value = p.keterangan || ''
      ;['F', 'G', 'H'].forEach((l) => (ws.getCell(`${l}${r}`).numFmt = fmt))
      styleRow(ws, r, 9)
      r++
    })

    const tr = r
    ws.getCell(`E${tr}`).value = 'TOTAL'
    ws.getCell(`E${tr}`).font = { bold: true }
    ws.getCell(`F${tr}`).value = { formula: `SUM(F7:F${r - 1})` } as never
    ws.getCell(`G${tr}`).value = { formula: `SUM(G7:G${r - 1})` } as never
    ws.getCell(`H${tr}`).value = { formula: `F${tr}-G${tr}` } as never
    ;['F', 'G', 'H'].forEach((l) => (ws.getCell(`${l}${tr}`).numFmt = fmt))
    styleRow(ws, tr, 9, { bold: true, fill: 'EDE9FE' })
  }

  // ==========================================
  // 12. ASSET
  // ==========================================
  {
    const ws = wb.addWorksheet('ASSET')
    ws.mergeCells('B2:AA2')
    ws.getCell('B2').value = 'ANGGY PERMANA PUTRA'
    ws.getCell('B2').alignment = { horizontal: 'center' }
    ws.getCell('B2').font = { bold: true }

    ws.mergeCells('B3:AA3')
    ws.getCell('B3').value = 'MONITORING ASET'
    ws.getCell('B3').alignment = { horizontal: 'center' }
    ws.getCell('B3').font = { bold: true, size: 11, color: { argb: 'FF1E40AF' } }

    ws.getColumn(3).width = 14
    ws.getColumn(5).width = 20
    ws.getColumn(6).width = 14
    ws.getColumn(8).width = 14
    ws.getColumn(9).width = 16
    ws.getColumn(10).width = 14
    ws.getColumn(11).width = 16
    ws.getColumn(12).width = 10
    ws.getColumn(13).width = 12
    ws.getColumn(14).width = 16
    ws.getColumn(15).width = 16
    ws.getColumn(16).width = 16
    ws.getColumn(17).width = 16
    ws.getColumn(18).width = 16
    ws.getColumn(19).width = 16
    ws.getColumn(20).width = 16
    ws.getColumn(21).width = 16
    ws.getColumn(23).width = 16
    ws.getColumn(25).width = 16

    hdr(
      ws,
      5,
      [
        '',
        'BAB',
        'JENIS ASET',
        'NO.',
        'NAMA ASET',
        'ATAS NAMA',
        'DETAIL',
        'PERIODE',
        'NILAI POKOK',
        'DP',
        'NILAI HUTANG',
        'MASA (BLN)',
        'BUNGA',
        'TOTAL BUNGA',
        'TOTAL HUTANG',
        'CICILAN/BLN',
        'PERIODE',
        'TOTAL CICILAN',
        'SISA HUTANG',
        'PEROLEHAN',
        'TAMBAH',
        'NILAI BUKU',
        '%',
        'NILAI PASAR',
        '%',
        'DEVIASI',
      ],
      '1E40AF'
    )

    let r = 8
    args.assets.forEach((a) => {
      ws.getCell(`B${r}`).value = 'I'
      ws.getCell(`C${r}`).value = a.jenis
      ws.getCell(`D${r}`).value = 1
      ws.getCell(`E${r}`).value = a.nama
      ws.getCell(`F${r}`).value = a.atasNama
      ws.getCell(`H${r}`).value = new Date(a.tgl)
      ws.getCell(`H${r}`).numFmt = 'dd-mmm-yyyy'
      ws.getCell(`I${r}`).value = a.nilai
      ws.getCell(`J${r}`).value = a.dp
      ws.getCell(`K${r}`).value = { formula: `I${r}-J${r}` } as never
      ws.getCell(`L${r}`).value = a.tenor
      ws.getCell(`M${r}`).value = a.bunga
      ws.getCell(`M${r}`).numFmt = '0.00%'
      ws.getCell(`N${r}`).value = { formula: `(K${r}*M${r})*10` } as never
      ws.getCell(`O${r}`).value = { formula: `K${r}+N${r}` } as never
      ws.getCell(`P${r}`).value = { formula: `O${r}/L${r}` } as never
      ws.getCell(`Q${r}`).value = assetDebt(a, `${args.year}-12-31`).paidMonths
      ws.getCell(`R${r}`).value = { formula: `P${r}*Q${r}` } as never
      ws.getCell(`S${r}`).value = { formula: `O${r}-R${r}` } as never
      ws.getCell(`T${r}`).value = { formula: `J${r}+O${r}` } as never
      ws.getCell(`U${r}`).value = a.tambah
      ws.getCell(`V${r}`).value = { formula: `T${r}+U${r}` } as never
      ws.getCell(`X${r}`).value = a.nilaiPasar
      ws.getCell(`Z${r}`).value = { formula: `X${r}-V${r}` } as never
      for (let c = 9; c <= 26; c++) {
        if (c !== 13) ws.getCell(r, c).numFmt = fmt
      }
      ws.getCell(`M${r}`).numFmt = '0.00%'
      styleRow(ws, r, 26)
      r++
    })

    // Totals
    const totR = r + 2
    ws.getCell(`E${totR}`).value = 'TOTAL PROPERTY'
    ws.getCell(`E${totR}`).font = { bold: true }
    ws.getCell(`I${totR}`).value = { formula: `SUM(I8:I${r - 1})` } as never
    ws.getCell(`J${totR}`).value = { formula: `SUM(J8:J${r - 1})` } as never
    ws.getCell(`K${totR}`).value = { formula: `SUM(K8:K${r - 1})` } as never
    ws.getCell(`O${totR}`).value = { formula: `SUM(O8:O${r - 1})` } as never
    ws.getCell(`S${totR}`).value = { formula: `SUM(S8:S${r - 1})` } as never
    ws.getCell(`V${totR}`).value = { formula: `SUM(V8:V${r - 1})` } as never
    ws.getCell(`X${totR}`).value = { formula: `SUM(X8:X${r - 1})` } as never
    ws.getCell(`Z${totR}`).value = { formula: `SUM(Z8:Z${r - 1})` } as never
    for (let c = 9; c <= 26; c++) {
      if (c !== 13) ws.getCell(totR, c).numFmt = fmt
    }
    styleRow(ws, totR, 26, { bold: true, fill: 'DBEAFE' })
  }

  // ==========================================
  // 13. NERACA-TOTAL
  // ==========================================
  {
    const ws = wb.addWorksheet('NERACA-TOTAL')
    ws.mergeCells('B2:Q2')
    ws.getCell('B2').value = 'NERACA KEUANGAN | AKTIVA VS PASSIVA'
    ws.getCell('B2').font = { bold: true, size: 12, color: { argb: 'FF1E40AF' } }
    ws.getCell('B2').alignment = { horizontal: 'center' }

    ws.getColumn(2).width = 6
    ws.getColumn(3).width = 30
    ws.getColumn(4).width = 8
    ws.getColumn(5).width = 14
    ws.getColumn(6).width = 8
    ws.getColumn(7).width = 18
    ws.getColumn(8).width = 10
    ws.getColumn(9).width = 4
    ws.getColumn(10).width = 6
    ws.getColumn(11).width = 30
    ws.getColumn(12).width = 8
    ws.getColumn(13).width = 14
    ws.getColumn(14).width = 8
    ws.getColumn(15).width = 18
    ws.getColumn(16).width = 10

    ws.getCell('B4').value = 'AKTIVA'
    ws.getCell('B4').font = { bold: true }
    ws.getCell('J4').value = 'PASSIVA'
    ws.getCell('J4').font = { bold: true }

    hdr(ws, 5, ['', 'NO.', 'URAIAN', 'SAT', 'HS', 'VOL', 'TOTAL', '%', ''], '1E40AF')
    ws.getCell('J5').value = 'NO.'
    ws.getCell('K5').value = 'URAIAN'
    ws.getCell('L5').value = 'SAT'
    ws.getCell('M5').value = 'HS'
    ws.getCell('N5').value = 'VOL'
    ws.getCell('O5').value = 'TOTAL'
    ws.getCell('P5').value = '%'
    ;['J', 'K', 'L', 'M', 'N', 'O', 'P'].forEach((c) => {
      ws.getCell(`${c}5`).font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 9 }
      ws.getCell(`${c}5`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E40AF' } }
      ws.getCell(`${c}5`).alignment = { horizontal: 'center', vertical: 'middle' }
      ws.getCell(`${c}5`).border = border
    })

    // Rows
    const saldoMaster = args.txs.filter((t) => t.ledger === 'master').reduce((a, t) => a + t.penerimaan - t.pengeluaran, 0)
    const saldoOps = args.txs.filter((t) => t.ledger === 'operasional').reduce((a, t) => a + t.penerimaan - t.pengeluaran, 0)
    const saldoKel = args.txs.filter((t) => t.ledger === 'keluarga').reduce((a, t) => a + t.penerimaan - t.pengeluaran, 0)
    const totalPiutang = args.piutangs.reduce((a, p) => a + p.terbit - p.lunas, 0)
    const totalAsetPasar = args.assets.reduce((a, x) => a + x.nilaiPasar, 0) + args.deps.reduce((a, d) => a + d.nilaiTaksir, 0)
    const totalAktiva = saldoMaster + saldoOps + saldoKel + totalPiutang + totalAsetPasar

    // Row 7: Kas
    ws.getCell('B7').value = 'I'
    ws.getCell('C7').value = 'KAS & SETARA KAS'
    ws.getCell('C7').font = { bold: true }
    ws.getCell('G7').value = saldoMaster + saldoOps + saldoKel
    ws.getCell('G7').numFmt = fmt
    ws.getCell('H7').value = { formula: `G7/$G$16` } as never
    ws.getCell('H7').numFmt = '0.00%'

    ws.getCell('J7').value = 'I'
    ws.getCell('K7').value = 'KEWAJIBAN PRIMER & CADANGAN'
    ws.getCell('K7').font = { bold: true }
    const cadangan = 4 * (args.rabAnggy.reduce((a, r) => a + r.months[0], 0) + args.rabKeluarga.reduce((a, r) => a + r.months[0], 0))
    ws.getCell('O7').value = cadangan
    ws.getCell('O7').numFmt = fmt
    ws.getCell('P7').value = { formula: `O7/$O$16` } as never
    ws.getCell('P7').numFmt = '0.00%'
    styleRow(ws, 7, 16, { bold: true, fill: 'EFF6FF' })

    // Row 8: Piutang
    ws.getCell('B8').value = 'II'
    ws.getCell('C8').value = 'PIUTANG'
    ws.getCell('C8').font = { bold: true }
    ws.getCell('G8').value = totalPiutang
    ws.getCell('G8').numFmt = fmt
    ws.getCell('H8').value = { formula: `G8/$G$16` } as never
    ws.getCell('H8').numFmt = '0.00%'

    ws.getCell('J8').value = 'II'
    ws.getCell('K8').value = 'SISA HUTANG KPR / CICILAN'
    ws.getCell('K8').font = { bold: true }
    const sisaHutangRumah = args.assets.reduce((sum, asset) => sum + assetDebt(asset, `${args.year}-12-31`).outstanding, 0)
    ws.getCell('O8').value = sisaHutangRumah
    ws.getCell('O8').numFmt = fmt
    ws.getCell('P8').value = { formula: `O8/$O$16` } as never
    ws.getCell('P8').numFmt = '0.00%'
    styleRow(ws, 8, 16)

    // Row 9: Aset Tetap
    ws.getCell('B9').value = 'III'
    ws.getCell('C9').value = 'ASET TETAP & PROPERTY'
    ws.getCell('C9').font = { bold: true }
    ws.getCell('G9').value = totalAsetPasar
    ws.getCell('G9').numFmt = fmt
    ws.getCell('H9').value = { formula: `G9/$G$16` } as never
    ws.getCell('H9').numFmt = '0.00%'

    ws.getCell('J9').value = 'III'
    ws.getCell('K9').value = 'EKUITAS & MODAL BERSIH'
    ws.getCell('K9').font = { bold: true }
    ws.getCell('O9').value = totalAktiva - cadangan - sisaHutangRumah
    ws.getCell('O9').numFmt = fmt
    ws.getCell('P9').value = { formula: `O9/$O$16` } as never
    ws.getCell('P9').numFmt = '0.00%'
    styleRow(ws, 9, 16)

    // Total Row 16
    ws.getCell('C16').value = 'TOTAL AKTIVA'
    ws.getCell('C16').font = { bold: true }
    ws.getCell('G16').value = { formula: `SUM(G7:G15)` } as never
    ws.getCell('G16').numFmt = fmt
    ws.getCell('H16').value = 1
    ws.getCell('H16').numFmt = '0.00%'

    ws.getCell('K16').value = 'TOTAL PASSIVA'
    ws.getCell('K16').font = { bold: true }
    ws.getCell('O16').value = { formula: `SUM(O7:O15)` } as never
    ws.getCell('O16').numFmt = fmt
    ws.getCell('P16').value = 1
    ws.getCell('P16').numFmt = '0.00%'
    styleRow(ws, 16, 16, { bold: true, fill: 'DBEAFE' })
  }

  // ==========================================
  // Generate and save file
  // ==========================================
  const buf = await wb.xlsx.writeBuffer()
  saveAs(
    new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
    `FinSheet-Pro-Asset-Management-${args.year}.xlsx`
  )
}

