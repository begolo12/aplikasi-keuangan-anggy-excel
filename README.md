# FinSheet Pro — Smart Cash Flow & Asset Management

Aplikasi manajemen keuangan pribadi & operasional berbasis cloud dengan database **Neon PostgreSQL**, sistem autentikasi **JWT Session**, dan 3-Ledger cash flow management.

## Fitur Utama

- **Autentikasi & Multi-User:** Login & Register akun email/password dengan enkripsi password (bcrypt) dan session cookie httpOnly.
- **Database Cloud Neon PostgreSQL:** Seluruh transaksi, anggaran RAB, cicilan KPR/aset, depresiasi, piutang, dan jadwal tersimpan aman di cloud per workspace pengguna.
- **3-Ledger Cash System:**
  - **MASTER (0):** Rekening induk, gaji, dan penerimaan dividen.
  - **OPERASIONAL (1):** Kas harian, bensin, dan pulsa.
  - **KELUARGA (2):** Kas belanja rutin, uang sekolah, nafkah, dan rumah.
- **RAB Anggaran & Cash Flow 12 Bulan:** Proyeksi mingguan W-1 s.d. W-4 dan evaluasi realisasi (RARI) otomatis.
- **Aset & Fasilitas Kredit:** Perhitungan KPR properti, cicilan bulanan, sisa hutang pokok, dan capital gain.
- **Depresiasi Garis Lurus:** Monitoring nilai buku aset bergerak (kendaraan & gadget).
- **Export Excel 13 Sheet Live Formula:** Menghasilkan file workbook `.xlsx` lengkap dengan format ribuan dan formula Excel native.
- **Mobile-First Responsive UI:** Dilengkapi Bottom Navigation Bar dan tampilan Card khusus smartphone.
- **Backup & Restore JSON:** Snapshot data lokal untuk arsip mandiri.

---

## Cara Menjalankan Lokal

1. Salin template environment:
   ```bash
   cp .env.example .env.local
   ```
2. Isi `DATABASE_URL` dan `JWT_SECRET` di file `.env.local`.
3. Pasang dependensi dan sinkronkan database:
   ```bash
   npm install
   npx drizzle-kit push
   ```
4. Jalankan aplikasi:
   ```bash
   npm run dev
   ```

---

## Deployment ke Vercel

1. Push repository ke GitHub.
2. Import project ke Vercel (framework preset: **Vite**).
3. Masukkan Environment Variables di Vercel Dashboard (Settings → Environment Variables):
   - `DATABASE_URL` = `postgresql://...`
   - `JWT_SECRET` = `(random secret key min 32 chars)`
4. Deploy! Vercel otomatis menjalankan `/api/*` sebagai Serverless Functions dan menyajikan frontend static.

> **Catatan Keamanan:** `DATABASE_URL` dan `JWT_SECRET` adalah variabel **server-side**. Jangan pernah menambahkan prefix `VITE_` agar kredensial database tidak terekspos ke browser client bundle.
