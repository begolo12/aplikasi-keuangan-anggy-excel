import assert from 'node:assert/strict'
import { closingBalance, consolidatedExpense, consolidatedIncome, isAssetConversion, isTransfer, ledgerBalance, monthlyTotals, openingBalance, outstandingPiutang, rabMonthlyTotals, runningBalancesForYear, straightLineValue } from './finance.ts'
import type { PiutangRow, RabRow, Tx } from './store.ts'

const txs: Tx[] = [
  { id: 'income', tanggal: '2026-01-02', nsb: 'A', pos: 'SALARY', uraian: 'Gaji', penerimaan: 1000, pengeluaran: 0, ledger: 'master' },
  { id: 'transfer-out', tanggal: '2026-01-03', nsb: 'A', pos: 'DROPPING', uraian: 'Transfer', penerimaan: 0, pengeluaran: 200, ledger: 'master', transferId: 't1' },
  { id: 'transfer-in', tanggal: '2026-01-03', nsb: 'A', pos: 'DROPPING', uraian: 'Transfer', penerimaan: 200, pengeluaran: 0, ledger: 'operasional', transferId: 't1' },
  { id: 'expense', tanggal: '2026-02-04', nsb: 'A', pos: 'BELANJA', uraian: 'Belanja', penerimaan: 0, pengeluaran: 150, ledger: 'operasional' },
  { id: 'old', tanggal: '2025-12-31', nsb: 'A', pos: 'SALARY', uraian: 'Tahun lalu', penerimaan: 9999, pengeluaran: 0, ledger: 'master' },
]
assert.equal(ledgerBalance(txs.filter((tx) => tx.tanggal.startsWith('2026')), 'master', 500), 1300)
assert.equal(consolidatedIncome(txs.filter((tx) => tx.tanggal.startsWith('2026'))), 1000)
assert.equal(consolidatedExpense(txs.filter((tx) => tx.tanggal.startsWith('2026'))), 150)
assert.deepEqual(monthlyTotals(txs, 2026).net, [1000, -150, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])

// Carry-over: dropping 2025 terbawa ke 2026, saldoAwal hanya master sekali.
const carry: Tx[] = [
  { id: 'c1', tanggal: '2025-06-01', nsb: 'A', pos: 'SALARY', uraian: 'Gaji', penerimaan: 1000, pengeluaran: 0, ledger: 'master' },
  { id: 'c2', tanggal: '2025-06-02', nsb: 'A', pos: 'PINDAH SALDO', uraian: 'Drop', penerimaan: 0, pengeluaran: 400, ledger: 'master', transferId: 'x' },
  { id: 'c3', tanggal: '2025-06-02', nsb: 'A', pos: 'PINDAH SALDO', uraian: 'Drop', penerimaan: 400, pengeluaran: 0, ledger: 'operasional', transferId: 'x' },
]
assert.equal(openingBalance(carry, 'master', 2026, 100), 700)
assert.equal(openingBalance(carry, 'operasional', 2026), 400)
assert.equal(closingBalance(carry, 'operasional', 2026), 400)
assert.equal(closingBalance(carry, 'master', 2026, 100), 700)

// Transfer ditandai transferId walau pos diketik bebas.
assert.equal(isTransfer({ id: 't', tanggal: '2026-01-01', nsb: 'A', pos: 'RUTIN', uraian: 'x', penerimaan: 10, pengeluaran: 0, ledger: 'master', transferId: 'z' }), true)
// Pelunasan bukan pendapatan/beban, tapi tetap gerak kas.
const repay: Tx = { id: 'r', tanggal: '2026-03-01', nsb: 'B', pos: 'ASET - PIUTANG', uraian: 'Kembali', penerimaan: 600, pengeluaran: 0, ledger: 'master', receivableId: 'p1' }
const loan: Tx = { id: 'l', tanggal: '2026-01-10', nsb: 'B', pos: 'PIUTANG-KELUAR', uraian: 'Pinjam', penerimaan: 0, pengeluaran: 1000, ledger: 'master', receivableId: 'p1' }
assert.equal(isAssetConversion(repay), true)
assert.equal(isAssetConversion(loan), true)
assert.equal(consolidatedIncome([repay]), 0)
assert.equal(consolidatedExpense([loan]), 0)
assert.equal(ledgerBalance([loan, repay], 'master', 0), -400)
// Running balance mulai dari bawaan, bukan nol.
const carry2026: Tx[] = [
  ...carry,
  { id: 'c4', tanggal: '2026-01-05', nsb: 'A', pos: 'BELANJA', uraian: 'Belanja', penerimaan: 0, pengeluaran: 150, ledger: 'operasional' },
]
const run = runningBalancesForYear(carry2026, 'operasional', 2026, 0)
assert.equal(run.get('c4'), 250)

const rab = { id: 'rab', group: 'A', uraian: 'Test', sat: 'bln', vol: 1, hs: 100, w: [100, 0, 0, 0], months: [100, 200, ...Array(10).fill(0)], total: 300 } satisfies RabRow
assert.deepEqual(rabMonthlyTotals([rab]).slice(0, 3), [100, 200, 0])

const receivable = [
  { id: 'p1', tgl: '2026-01-01', nsb: 'B', uraian: 'Pinjaman', terbit: 1000, lunas: 0 },
  { id: 'p2', tgl: '2026-01-15', nsb: 'B', uraian: 'Bayar kembali', terbit: 0, lunas: 250 },
] satisfies PiutangRow[]
assert.equal(outstandingPiutang(receivable), 750)
assert.deepEqual(straightLineValue({ id: 'd', nama: 'Laptop', tgl: '2025-01-01', nilai: 1200, umur: 12, nilaiTaksir: 0, kat: 'GADGET' }, '2026-01-01'), { monthsElapsed: 12, accumulated: 1200, bookValue: 0 })
process.stdout.write('finance self-check passed\n')
