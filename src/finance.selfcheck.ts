import assert from 'node:assert/strict'
import { consolidatedExpense, consolidatedIncome, ledgerBalance, monthlyTotals, outstandingPiutang, rabMonthlyTotals, straightLineValue } from './finance.ts'
import type { PiutangRow, RabRow, Tx } from './store.ts'

const txs: Tx[] = [
  { id: 'income', tanggal: '2026-01-02', nsb: 'A', pos: 'SALARY', uraian: 'Gaji', penerimaan: 1000, pengeluaran: 0, ledger: 'master' },
  { id: 'transfer-out', tanggal: '2026-01-03', nsb: 'A', pos: 'DROPPING', uraian: 'Transfer', penerimaan: 0, pengeluaran: 200, ledger: 'master' },
  { id: 'transfer-in', tanggal: '2026-01-03', nsb: 'A', pos: 'DROPPING', uraian: 'Transfer', penerimaan: 200, pengeluaran: 0, ledger: 'operasional' },
  { id: 'expense', tanggal: '2026-02-04', nsb: 'A', pos: 'BELANJA', uraian: 'Belanja', penerimaan: 0, pengeluaran: 150, ledger: 'operasional' },
  { id: 'old', tanggal: '2025-12-31', nsb: 'A', pos: 'SALARY', uraian: 'Tahun lalu', penerimaan: 9999, pengeluaran: 0, ledger: 'master' },
]
assert.equal(ledgerBalance(txs.filter((tx) => tx.tanggal.startsWith('2026')), 'master', 500), 1300)
assert.equal(consolidatedIncome(txs.filter((tx) => tx.tanggal.startsWith('2026'))), 1000)
assert.equal(consolidatedExpense(txs.filter((tx) => tx.tanggal.startsWith('2026'))), 150)
assert.deepEqual(monthlyTotals(txs, 2026).net, [1000, -150, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])

const rab = { id: 'rab', group: 'A', uraian: 'Test', sat: 'bln', vol: 1, hs: 100, w: [100, 0, 0, 0], months: [100, 200, ...Array(10).fill(0)], total: 300 } satisfies RabRow
assert.deepEqual(rabMonthlyTotals([rab]).slice(0, 3), [100, 200, 0])

const receivable = [{ id: 'p', tgl: '2026-01-01', nsb: 'B', uraian: 'Pinjaman', terbit: 1000, lunas: 250 }] satisfies PiutangRow[]
assert.equal(outstandingPiutang(receivable), 750)
assert.deepEqual(straightLineValue({ id: 'd', nama: 'Laptop', tgl: '2025-01-01', nilai: 1200, umur: 12, nilaiTaksir: 0, kat: 'GADGET' }, '2026-01-01'), { monthsElapsed: 12, accumulated: 1200, bookValue: 0 })
console.log('finance self-check passed')
