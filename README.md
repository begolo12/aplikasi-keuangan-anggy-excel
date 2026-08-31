# Anggy Keuangan

Ruang kerja keuangan pribadi untuk transaksi tiga ledger, anggaran RAB, cash flow, evaluasi realisasi, aset, depresiasi, jadwal, piutang, dan neraca.

## Status saat ini

Versi ini adalah frontend local-first. Data tersimpan di browser melalui `localStorage` dan belum tersinkron ke server. Gunakan `Backup JSON` secara berkala. Jangan menganggap data demo sebagai laporan keuangan nyata.

## Menjalankan lokal

```bash
npm ci
npm run dev
```

Validasi sebelum deploy:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

## Deploy Vercel

Project ini adalah Vite SPA. Import repository ke Vercel dan gunakan:

- Build command: `npm run build`
- Output directory: `dist`
- Install command: `npm ci`

Jangan memasukkan `DATABASE_URL` ke environment variable browser. Saat integrasi Neon dibuat, koneksi database harus berada di API/serverless function server-side.

## Data dan backup

- Pilih `Mulai dari data kosong` untuk pemakaian nyata.
- `Lihat data demo` hanya untuk memahami alur aplikasi.
- `Backup JSON` adalah snapshot data yang dapat dipulihkan melalui `Impor Backup`.
- Export Excel adalah laporan, bukan format restore utama.
- Import harus dikonfirmasi sebelum mengganti seluruh data lokal.

## Roadmap Neon PostgreSQL

Tahap berikutnya perlu menambahkan auth dan workspace sebelum data pengguna masuk cloud. Semua tabel harus memiliki `workspace_id`, nilai uang memakai `numeric`, transfer memakai correlation ID, dan pelunasan piutang memakai relasi parent-payment. `DATABASE_URL` tidak boleh dikirim ke client.

## Catatan produk

Sebelum penjualan publik, lengkapi privacy policy, terms of service, monitoring, server-side backup, autentikasi, isolasi workspace, serta rekonsiliasi data. Angka dan status laporan harus berasal dari data pengguna, bukan nilai contoh.
