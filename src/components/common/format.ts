export function formatRibuan(v: number | string | undefined | null): string {
  if (v === '' || v === undefined || v === null) return ''
  const num = typeof v === 'number' ? v : parseFloat(String(v).replace(/[^\d.-]/g, ''))
  if (isNaN(num)) return ''
  return new Intl.NumberFormat('id-ID').format(num)
}
