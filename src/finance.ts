import type { AssetRow, DepRow, PiutangRow, RabRow, SchedRow, Tx } from './store'

export const MONTHS = 12

export function isValidDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00`))
}

export function yearTransactions(txs: Tx[], year: number): Tx[] {
  return txs
    .filter((tx) => tx.tanggal.startsWith(`${year}-`))
    .sort((a, b) => a.tanggal.localeCompare(b.tanggal) || a.id.localeCompare(b.id))
}

export function isTransfer(tx: Tx): boolean {
  return tx.pos.trim().toUpperCase() === 'DROPPING'
}

export function ledgerBalance(txs: Tx[], ledger: Tx['ledger'], saldoAwal = 0): number {
  return saldoAwal + txs.filter((tx) => tx.ledger === ledger).reduce((sum, tx) => sum + tx.penerimaan - tx.pengeluaran, 0)
}

export function consolidatedIncome(txs: Tx[]): number {
  return txs.filter((tx) => !isTransfer(tx)).reduce((sum, tx) => sum + Math.max(0, tx.penerimaan), 0)
}

export function consolidatedExpense(txs: Tx[]): number {
  return txs.filter((tx) => !isTransfer(tx)).reduce((sum, tx) => sum + Math.max(0, tx.pengeluaran), 0)
}

export function ledgerExpense(txs: Tx[], ledger: Tx['ledger']): number {
  return txs.filter((tx) => tx.ledger === ledger && !isTransfer(tx)).reduce((sum, tx) => sum + Math.max(0, tx.pengeluaran), 0)
}

export function runningBalances(txs: Tx[], ledger: Tx['ledger'], saldoAwal = 0): Map<string, number> {
  let balance = saldoAwal
  const result = new Map<string, number>()
  yearTransactions(txs, new Date().getFullYear())
    .filter((tx) => tx.ledger === ledger)
    .forEach((tx) => {
      balance += tx.penerimaan - tx.pengeluaran
      result.set(tx.id, balance)
    })
  return result
}

export function runningBalancesForYear(txs: Tx[], ledger: Tx['ledger'], year: number, saldoAwal = 0): Map<string, number> {
  let balance = saldoAwal
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
    if (month < 0 || month >= MONTHS || isTransfer(tx)) return
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
  return rows.reduce((sum, row) => sum + Math.max(0, row.terbit - row.lunas), 0)
}

export function straightLineValue(row: DepRow, asOf: string): { monthsElapsed: number; accumulated: number; bookValue: number } {
  const start = new Date(`${row.tgl}T00:00:00`)
  const end = new Date(`${asOf}T00:00:00`)
  const monthsElapsed = Math.max(0, Math.min(row.umur, (end.getFullYear() - start.getFullYear()) * 12 + end.getMonth() - start.getMonth()))
  const monthly = row.umur > 0 ? row.nilai / row.umur : row.nilai
  const accumulated = Math.min(row.nilai, monthly * monthsElapsed)
  return { monthsElapsed, accumulated, bookValue: Math.max(0, row.nilai - accumulated) }
}

export function assetDebt(row: AssetRow, asOf: string): { principal: number; monthlyPayment: number; paidMonths: number; outstanding: number } {
  const principal = Math.max(0, row.nilai - row.dp)
  const paidMonths = Math.max(0, Math.min(row.tenor, straightLineValue({ id: row.id, nama: row.nama, tgl: row.tgl, nilai: principal, umur: row.tenor, nilaiTaksir: 0, kat: 'GADGET' }, asOf).monthsElapsed))
  const annualRate = Math.max(0, row.bunga)
  const monthlyRate = annualRate / 12
  const monthlyPayment = monthlyRate === 0 ? principal / Math.max(1, row.tenor) : principal * monthlyRate / (1 - Math.pow(1 + monthlyRate, -Math.max(1, row.tenor)))
  const outstanding = monthlyRate === 0 ? Math.max(0, principal - monthlyPayment * paidMonths) : Math.max(0, principal * Math.pow(1 + monthlyRate, paidMonths) - monthlyPayment * ((Math.pow(1 + monthlyRate, paidMonths) - 1) / monthlyRate))
  return { principal, monthlyPayment, paidMonths, outstanding }
}

export function scheduleMonthlyTotals(rows: SchedRow[]): number[] {
  return Array.from({ length: MONTHS }, (_, month) => rows.reduce((sum, row) => sum + (row.months[month] || 0), 0))
}
