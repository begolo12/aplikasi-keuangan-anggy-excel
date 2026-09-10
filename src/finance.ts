import type { AssetRow, DepRow, PiutangRow, RabRow, SchedRow, Tx } from './store'

export const MONTHS = 12

export function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [y, m, d] = value.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d))
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d
}

/** Tanggal hari ini di zona waktu lokal, format YYYY-MM-DD. */
export function todayLocal(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function yearTransactions(txs: Tx[], year: number): Tx[] {
  return txs
    .filter((tx) => tx.tanggal.startsWith(`${year}-`))
    .sort((a, b) => a.tanggal.localeCompare(b.tanggal) || a.id.localeCompare(b.id))
}

export const TRANSFER_POS = ['DROPPING', 'PINDAH SALDO', 'PINDAH'] as const

export function isTransfer(tx: Tx): boolean {
  if (tx.transferId) return true
  const pos = tx.pos.trim().toUpperCase()
  return (TRANSFER_POS as readonly string[]).includes(pos)
}

/** Konversi aset (pinjaman diberikan / pelunasan diterima): gerak kas, bukan pendapatan/beban. */
export function isAssetConversion(tx: Tx): boolean {
  if (tx.receivableId) return true
  const pos = tx.pos.trim().toUpperCase()
  return pos === 'ASET - PIUTANG' || pos === 'PIUTANG-KELUAR' || pos === 'PIUTANG-MASUK'
}

/** Realisasi anggaran: pengeluaran operasional/keluarga di luar transfer dan konversi aset. */
export function isBudgetRealization(tx: Tx): boolean {
  return !isTransfer(tx) && !isAssetConversion(tx)
}

/** Saldo pembuka tahun berjalan (carry-over): jumlah semua mutasi sebelum 1 Jan tahun itu.
 * Master ikut saldoAwal sepanjang masa, op/keluarga murni bawaan riwayat. */
export function openingBalance(txs: Tx[], ledger: Tx['ledger'], year: number, saldoAwal = 0): number {
  const prefix = `${year}-`
  const carried = txs
    .filter((tx) => tx.ledger === ledger && tx.tanggal < prefix)
    .reduce((sum, tx) => sum + tx.penerimaan - tx.pengeluaran, 0)
  return ledger === 'master' ? saldoAwal + carried : carried
}

/** Saldo akhir tahun buku (s.d. 31 Des): pembuka + mutasi tahun berjalan. */
export function closingBalance(txs: Tx[], ledger: Tx['ledger'], year: number, saldoAwal = 0): number {
  return openingBalance(txs, ledger, year, saldoAwal) + yearTransactions(txs, year).filter((tx) => tx.ledger === ledger).reduce((sum, tx) => sum + tx.penerimaan - tx.pengeluaran, 0)
}

export function ledgerBalances(txs: Tx[], year: number, saldoAwal = 0): { master: number; operasional: number; keluarga: number; total: number } {
  const ytx = yearTransactions(txs, year)
  const master = openingBalance(txs, 'master', year, saldoAwal) + ytx.filter((tx) => tx.ledger === 'master').reduce((sum, tx) => sum + tx.penerimaan - tx.pengeluaran, 0)
  const operasional = openingBalance(txs, 'operasional', year) + ytx.filter((tx) => tx.ledger === 'operasional').reduce((sum, tx) => sum + tx.penerimaan - tx.pengeluaran, 0)
  const keluarga = openingBalance(txs, 'keluarga', year) + ytx.filter((tx) => tx.ledger === 'keluarga').reduce((sum, tx) => sum + tx.penerimaan - tx.pengeluaran, 0)
  return { master, operasional, keluarga, total: master + operasional + keluarga }
}

export function ledgerBalance(txs: Tx[], ledger: Tx['ledger'], saldoAwal = 0): number {
  const carried = txs.filter((tx) => tx.ledger === ledger).reduce((sum, tx) => sum + tx.penerimaan - tx.pengeluaran, 0)
  return ledger === 'master' ? saldoAwal + carried : carried
}
export function consolidatedIncome(txs: Tx[]): number {
  return txs.filter((tx) => !isTransfer(tx) && !isAssetConversion(tx)).reduce((sum, tx) => sum + Math.max(0, tx.penerimaan), 0)
}

export function consolidatedExpense(txs: Tx[]): number {
  return txs.filter((tx) => !isTransfer(tx) && !isAssetConversion(tx)).reduce((sum, tx) => sum + Math.max(0, tx.pengeluaran), 0)
}

export function ledgerExpense(txs: Tx[], ledger: Tx['ledger']): number {
  return txs.filter((tx) => tx.ledger === ledger && !isTransfer(tx) && !isAssetConversion(tx)).reduce((sum, tx) => sum + Math.max(0, tx.pengeluaran), 0)
}
export function runningBalances(txs: Tx[], ledger: Tx['ledger'], saldoAwal = 0, year?: number): Map<string, number> {
  return runningBalancesForYear(txs, ledger, year ?? new Date().getFullYear(), saldoAwal)
}

export function runningBalancesForYear(txs: Tx[], ledger: Tx['ledger'], year: number, saldoAwal = 0): Map<string, number> {
  let balance = openingBalance(txs, ledger, year, ledger === 'master' ? saldoAwal : 0)
  const result = new Map<string, number>()
  yearTransactions(txs, year)
    .filter((tx) => tx.ledger === ledger)
    .forEach((tx) => {
      balance += tx.penerimaan - tx.pengeluaran
      result.set(tx.id, balance)
    })
  return result
}

export function monthlyTotals(txs: Tx[], year: number): { income: number[]; expense: number[]; net: number[] } {
  const income = Array(MONTHS).fill(0) as number[]
  const expense = Array(MONTHS).fill(0) as number[]
  yearTransactions(txs, year).forEach((tx) => {
    const month = Number(tx.tanggal.slice(5, 7)) - 1
    if (month < 0 || month >= MONTHS || isTransfer(tx) || isAssetConversion(tx)) return
    income[month] += Math.max(0, tx.penerimaan)
    expense[month] += Math.max(0, tx.pengeluaran)
  })
  return { income, expense, net: income.map((value, index) => value - expense[index]) }
}

export function rabMonthlyTotals(rows: RabRow[]): number[] {
  return Array.from({ length: MONTHS }, (_, month) => rows.reduce((sum, row) => sum + (row.months[month] || 0), 0))
}

export function rabAnnualTotal(rows: RabRow[]): number {
  return rabMonthlyTotals(rows).reduce((sum, value) => sum + value, 0)
}

export function outstandingPiutang(rows: PiutangRow[]): number {
  return Math.max(0, rows.reduce((sum, row) => sum + (Number(row.terbit) || 0) - (Number(row.lunas) || 0), 0))
}

export function straightLineValue(row: DepRow, asOf: string): { monthsElapsed: number; accumulated: number; bookValue: number } {
  const nilai = Math.max(0, Number(row.nilai) || 0)
  const umur = Math.max(1, Number(row.umur) || 1)
  if (!row.tgl || !asOf) return { monthsElapsed: 0, accumulated: 0, bookValue: nilai }
  const start = new Date(`${row.tgl}T00:00:00`)
  const end = new Date(`${asOf}T00:00:00`)
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { monthsElapsed: 0, accumulated: 0, bookValue: nilai }
  }
  const diffMonths = (end.getFullYear() - start.getFullYear()) * 12 + end.getMonth() - start.getMonth()
  const monthsElapsed = Math.max(0, Math.min(umur, diffMonths))
  const monthly = nilai / umur
  const accumulated = Math.min(nilai, monthly * monthsElapsed)
  return { monthsElapsed, accumulated, bookValue: Math.max(0, nilai - accumulated) }
}

export function assetDebt(row: AssetRow, asOf: string): { principal: number; monthlyPayment: number; paidMonths: number; outstanding: number } {
  const nilai = Math.max(0, Number(row.nilai) || 0)
  const dp = Math.max(0, Number(row.dp) || 0)
  const principal = Math.max(0, nilai - dp)
  const tenor = Math.max(1, Number(row.tenor) || 1)
  const paidMonths = Math.max(0, Math.min(tenor, straightLineValue({ id: row.id, nama: row.nama, tgl: row.tgl, nilai: principal, umur: tenor, nilaiTaksir: 0, kat: 'GADGET' }, asOf).monthsElapsed))
  const annualRate = Math.max(0, Number(row.bunga) || 0)
  const monthlyRate = annualRate / 12
  const monthlyPayment = monthlyRate === 0 ? principal / tenor : principal * monthlyRate / (1 - Math.pow(1 + monthlyRate, -tenor))
  const outstanding = monthlyRate === 0 ? Math.max(0, principal - monthlyPayment * paidMonths) : Math.max(0, principal * Math.pow(1 + monthlyRate, paidMonths) - monthlyPayment * ((Math.pow(1 + monthlyRate, paidMonths) - 1) / monthlyRate))
  return { principal, monthlyPayment, paidMonths, outstanding }
}

export function scheduleMonthlyTotals(rows: SchedRow[]): number[] {
  return Array.from({ length: MONTHS }, (_, month) => rows.reduce((sum, row) => sum + (row.months[month] || 0), 0))
}
