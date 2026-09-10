// In-memory rate limiter per IP+action. Cukup untuk serverless instance tunggal;
// reset saat cold start, tidak dibagi antar region — ini pelindung kasar, bukan WAF.

type Bucket = { count: number; resetAt: number }

const buckets = new Map<string, Bucket>()

/**
 * Ambil hop TERAKHIR rantai `x-forwarded-for`, bukan hop pertama: proxy yang
 * menangani request menambahkan hop di ujung, sedangkan hop awal bisa ditulis
 * klien. Membaca hop pertama membuat limit bisa dilewati hanya dengan
 * memalsukan header, sekaligus membuat Map tumbuh tanpa batas.
 */
function clientIp(req: { headers: Record<string, unknown> }): string {
  const fwd = req.headers['x-forwarded-for']
  if (typeof fwd === 'string' && fwd.length > 0) {
    const hops = fwd.split(',')
    return hops[hops.length - 1].trim() || 'unknown'
  }
  const real = req.headers['x-real-ip']
  if (typeof real === 'string' && real.length > 0) return real
  return 'unknown'
}

/** Buang bucket yang sudah kedaluwarsa; dipanggil hanya saat Map membesar. */
function sweep(now: number) {
  if (buckets.size < 5000) return
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key)
  }
}

export function isRateLimited(
  req: { headers: Record<string, unknown> },
  action: string,
  max: number,
  windowMs: number
): { retryAfterSec: number } | null {
  const key = `${action}:${clientIp(req)}`
  const now = Date.now()
  const bucket = buckets.get(key)
  if (!bucket || bucket.resetAt <= now) {
    sweep(now)
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return null
  }
  bucket.count += 1
  if (bucket.count > max) {
    return { retryAfterSec: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)) }
  }
  return null
}

export function rateLimitResponse(res: { setHeader: (k: string, v: string) => void; status: (n: number) => { json: (d: unknown) => unknown } }, rl: { retryAfterSec: number }) {
  res.setHeader('Retry-After', String(rl.retryAfterSec))
  return res.status(429).json({ error: `Terlalu banyak percobaan. Coba lagi dalam ${rl.retryAfterSec} detik.` })
}
