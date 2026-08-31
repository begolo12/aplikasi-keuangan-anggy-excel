import { pgTable, text, timestamp, numeric, integer, boolean, jsonb, index } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull().default('Pengguna'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const workspaces = pgTable('workspaces', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull().default('Keuangan Personal'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index('workspace_user_idx').on(t.userId),
])

export const transactions = pgTable('transactions', {
  id: text('id').primaryKey(),
  workspaceId: text('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  tanggal: text('tanggal').notNull(),
  nsb: text('nsb').notNull().default(''),
  pos: text('pos').notNull().default(''),
  uraian: text('uraian').notNull(),
  penerimaan: numeric('penerimaan', { precision: 19, scale: 2 }).notNull().default('0'),
  pengeluaran: numeric('pengeluaran', { precision: 19, scale: 2 }).notNull().default('0'),
  ledger: text('ledger').notNull(), // 'master' | 'operasional' | 'keluarga'
  kategori: text('kategori'),
  transferId: text('transfer_id'),
  receivableId: text('receivable_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index('tx_workspace_idx').on(t.workspaceId),
  index('tx_workspace_tanggal_idx').on(t.workspaceId, t.tanggal),
])

export const rabRows = pgTable('rab_rows', {
  id: text('id').primaryKey(),
  workspaceId: text('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  target: text('target').notNull(), // 'anggy' | 'keluarga'
  group: text('group').notNull(),
  uraian: text('uraian').notNull(),
  sat: text('sat').notNull().default('bln'),
  vol: integer('vol').notNull().default(1),
  hs: numeric('hs', { precision: 19, scale: 2 }).notNull().default('0'),
  w: jsonb('w').notNull(), // [w1, w2, w3, w4]
  months: jsonb('months').notNull(), // [m1..m12]
  total: numeric('total', { precision: 19, scale: 2 }).notNull().default('0'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index('rab_workspace_idx').on(t.workspaceId),
])

export const piutangs = pgTable('piutangs', {
  id: text('id').primaryKey(),
  workspaceId: text('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  tgl: text('tgl').notNull(),
  nsb: text('nsb').notNull(),
  uraian: text('uraian').notNull(),
  terbit: numeric('terbit', { precision: 19, scale: 2 }).notNull().default('0'),
  lunas: numeric('lunas', { precision: 19, scale: 2 }).notNull().default('0'),
  keterangan: text('keterangan'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index('piutang_workspace_idx').on(t.workspaceId),
])

export const assets = pgTable('assets', {
  id: text('id').primaryKey(),
  workspaceId: text('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  jenis: text('jenis').notNull().default('PROPERTY'),
  nama: text('nama').notNull(),
  atasNama: text('atas_nama').notNull().default(''),
  tgl: text('tgl').notNull(),
  nilai: numeric('nilai', { precision: 19, scale: 2 }).notNull().default('0'),
  dp: numeric('dp', { precision: 19, scale: 2 }).notNull().default('0'),
  bunga: numeric('bunga', { precision: 6, scale: 4 }).notNull().default('0.0800'),
  tenor: integer('tenor').notNull().default(120),
  nilaiPasar: numeric('nilai_pasar', { precision: 19, scale: 2 }).notNull().default('0'),
  tambah: numeric('tambah', { precision: 19, scale: 2 }).notNull().default('0'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index('asset_workspace_idx').on(t.workspaceId),
])

export const deps = pgTable('deps', {
  id: text('id').primaryKey(),
  workspaceId: text('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  nama: text('nama').notNull(),
  tgl: text('tgl').notNull(),
  nilai: numeric('nilai', { precision: 19, scale: 2 }).notNull().default('0'),
  umur: integer('umur').notNull().default(60),
  nilaiTaksir: numeric('nilai_taksir', { precision: 19, scale: 2 }).notNull().default('0'),
  kat: text('kat').notNull().default('KENDARAAN'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index('dep_workspace_idx').on(t.workspaceId),
])

export const schedules = pgTable('schedules', {
  id: text('id').primaryKey(),
  workspaceId: text('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  nama: text('nama').notNull(),
  hs: numeric('hs', { precision: 19, scale: 2 }).notNull().default('0'),
  months: jsonb('months').notNull(), // [12 elements]
  kat: text('kat').notNull().default('service'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index('sched_workspace_idx').on(t.workspaceId),
])

export const settings = pgTable('settings', {
  workspaceId: text('workspace_id').primaryKey().references(() => workspaces.id, { onDelete: 'cascade' }),
  year: integer('year').notNull().default(2026),
  saldoAwal: numeric('saldo_awal', { precision: 19, scale: 2 }).notNull().default('0'),
  demoMode: boolean('demo_mode').notNull().default(false),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})
