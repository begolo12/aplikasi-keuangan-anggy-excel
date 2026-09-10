export function formatRibuan(v: number | string | undefined | null): string {
  if (v === '' || v === undefined || v === null) return ''
  const num = typeof v === 'number' ? v : parseFloat(String(v).replace(/[^\d.-]/g, ''))
  if (isNaN(num)) return ''
  return new Intl.NumberFormat('id-ID').format(num)
}

export const KAS_FALLBACK = { master: 'Kas Utama', operasional: 'Kas Usaha', keluarga: 'Kas Keluarga' } as const

type LedgerKey = 'master' | 'operasional' | 'keluarga'

/**
 * Nama dompet yang sedang dipakai user. `state.ledgerLabels` bisa diubah di
 * Setelan, jadi setiap tempat yang menyebut dompet wajib lewat sini — bukan
 * literal, kalau tidak nama lama ketinggalan di layar.
 */
export function kasLabel(ledger: LedgerKey, labels?: Partial<Record<LedgerKey, string>>): string {
  return labels?.[ledger]?.trim() || KAS_FALLBACK[ledger]
}
