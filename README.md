# SPK MOORA - Sistem Pendukung Keputusan Lokasi

Aplikasi web SPK menggunakan metode MOORA dengan dua peran:

- User publik (tanpa login): memilih alternatif lokasi dan mengisi bobot kriteria secara dinamis.
- Admin (dengan login): mengelola data master dan penilaian, serta melihat hasil audit MOORA seluruh alternatif.

## Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS + Shadcn UI components
- Prisma ORM + PostgreSQL (local) + Neon Postgres (Vercel)
- Iron Session (auth admin)

## Fitur Utama

### Public (`/`)

- Multi-select alternatif (minimal 2)
- Input bobot kriteria (custom)
- Hitung MOORA via Server Action
- Hasil ranking hanya untuk alternatif yang dipilih

### Admin

- Login/Logout (`/login`)
- Dashboard ringkasan (`/dashboard`)
- CRUD Kriteria + Sub-Kriteria (`/dashboard/kriteria`)
- CRUD Alternatif (`/dashboard/alternatif`)
- Input Penilaian 1-5 per alternatif (`/dashboard/penilaian`)
- Audit hasil MOORA semua alternatif (`/dashboard/hasil`)

## Struktur Data

Skema Prisma utama:

- `Account`
- `Criteria`
- `SubAlternative`
- `Alternative`
- `Evaluation`

## Menjalankan Project

1. Install dependencies:

```bash
pnpm install
```

2. Buat file env lokal:

```bash
Copy-Item .env.example .env
```

3. Pastikan PostgreSQL lokal aktif dan database `spk_dev` sudah dibuat.

4. Jalankan migrasi database:

```bash
pnpm db:migrate:dev
```

5. Jalankan aplikasi:

```bash
pnpm dev
```

6. Buka aplikasi:

- Public: `http://localhost:3000`
- Admin login: `http://localhost:3000/login`

## Setup Database Lokal vs Vercel

- **Lokal (development)**: gunakan Postgres lokal di `.env`.
- **Vercel (production/preview)**: set env variable di dashboard Vercel:
  - `DATABASE_URL` = **pooled** Neon connection string (`-pooler` pada host)
  - `DIRECT_URL` = **direct** Neon connection string (tanpa `-pooler`, untuk Prisma migration)

Contoh format Neon:

```env
DATABASE_URL="postgresql://user:password@ep-xxxx-pooler.region.aws.neon.tech/dbname?sslmode=require"
DIRECT_URL="postgresql://user:password@ep-xxxx.region.aws.neon.tech/dbname?sslmode=require"
```

Untuk deploy migration di environment production:

```bash
pnpm db:migrate:deploy
```

## Kredensial Admin Default

Jika tabel `Account` kosong, akun default otomatis dibuat saat membuka halaman login:

- Username: `admin`
- Password: `admin12345`

Konfigurasi dapat diubah via environment variable:

- `DEFAULT_ADMIN_USERNAME`
- `DEFAULT_ADMIN_PASSWORD`
- `SESSION_PASSWORD`

## Catatan MOORA

Perhitungan publik menggunakan normalisasi dinamis berdasarkan alternatif terpilih:

1. Ambil data `Evaluation` hanya untuk alternatif terpilih.
2. Hitung divisor tiap kriteria: `sqrt(sum(xij^2))`.
3. Normalisasi lalu kalikan bobot user.
4. Hitung `Yi = sum(benefit) - sum(cost)`.
5. Urutkan descending untuk ranking akhir.
