export function formatRibuan(v: number | string | undefined | null): string {
  if (v === '' || v === undefined || v === null) return ''
  const num = typeof v === 'number' ? v : parseFloat(String(v).replace(/\D/g, ''))
  if (isNaN(num) || num === 0) return ''
  return new Intl.NumberFormat('id-ID').format(num)
}

export function parseRibuan(str: string): number {
  if (!str) return 0
  const clean = String(str).replace(/\D/g, '')
  return clean ? parseInt(clean, 10) : 0
}
