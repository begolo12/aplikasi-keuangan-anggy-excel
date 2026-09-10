import assert from 'node:assert/strict'
import { closingBalance, consolidatedExpense, consolidatedIncome, groupHeaderRefs, isAssetConversion, isTransfer, ledgerBalance, monthlyTotals, openingBalance, outstandingPiutang, rabMonthlyTotals, runningBalancesForYear, straightLineValue } from './finance.ts'
import { assetSchema, depSchema, normalizeState, piutangSchema, rabSchema, schedSchema } from './store.ts'
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

// Total RAB hanya menjumlah baris header grup. Rentang kontigu akan menghitung
// tiap grup dua kali, karena header sudah berisi SUM detail di bawahnya.
assert.equal(groupHeaderRefs([7, 9, 12], 'H'), 'SUM(H7,H9,H12)')
assert.equal(groupHeaderRefs([7], 'N'), 'SUM(N7)')
assert.equal(groupHeaderRefs([], 'H'), '0')

const goodRab = { id: 'r1', group: 'A', uraian: 'Sewa', sat: 'bln', vol: 1, hs: 100, w: [100, 0, 0, 0], months: [100, ...Array(11).fill(0)], total: 100 }
const normalized = normalizeState({
  rabAnggy: [goodRab, { ...goodRab, id: 'r2', hs: Number.NaN }],
  scheds: [{ id: 's1', nama: 'Pajak', hs: 50, months: [50, ...Array(11).fill(0)], kat: 'pajak' }],
  customNsbList: [],
  customPosList: ['abc'],
  ledgerLabels: { master: 'x'.repeat(80), operasional: '', keluarga: 'K' },
  txs: [{ id: 't1', tanggal: '2026-01-01', nsb: 'A', pos: 'GAJI', uraian: 'g', penerimaan: 10, pengeluaran: 0, ledger: 'master' }],
  __rogueKey: 'harus dibuang',
} as never)

// Baris dengan angka rusak dibuang, bukan dipaksa masuk sebagai NaN.
assert.equal(normalized.rabAnggy.length, 1)
assert.deepEqual(normalized.rabAnggy[0]?.months.slice(0, 2), [100, 0])
// List kosong yang disengaja harus bertahan, bukan kembali ke seed default.
assert.deepEqual(normalized.customNsbList, [])
assert.deepEqual(normalized.customPosList, ['abc'])
// Label kosong jatuh ke bawaan, yang kepanjangan dipotong di 40 karakter.
assert.equal(normalized.ledgerLabels?.master.length, 40)
assert.equal(normalized.ledgerLabels?.operasional, 'Kas Usaha')
// Kunci asing tidak boleh bocor ke state.
assert.equal(Object.prototype.hasOwnProperty.call(normalized, '__rogueKey'), false)
// Jadwal selalu 12 bulan walaupun sumbernya lebih pendek.
assert.equal(normalized.scheds[0]?.months.length, 12)

const badRab = rabSchema.safeParse({ ...goodRab, months: Array(11).fill(0) })
assert.equal(badRab.success, false)
const badSched = schedSchema.safeParse({ nama: 'x', hs: 1, months: Array(3).fill(0), kat: 'service' })
assert.equal(badSched.success, false)
const badPiutang = piutangSchema.safeParse({ tgl: '2026-02-30', nsb: 'A', terbit: 1, lunas: 0 })
assert.equal(badPiutang.success, false)
const badAsset = assetSchema.safeParse({ jenis: 'GADGET', nama: 'HP', tgl: '2026-01-01', nilai: 100, dp: 0, bunga: 2, tenor: 12, nilaiPasar: 0, tambah: 0 })
assert.equal(badAsset.success, false)
const badDep = depSchema.safeParse({ nama: 'HP', tgl: '2026-01-01', nilai: 100, umur: 0, nilaiTaksir: 0, kat: 'GADGET' })
assert.equal(badDep.success, false)

process.stdout.write('finance self-check passed\n')
