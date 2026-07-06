-- ==============================================================================
-- SQL Query untuk Generate Seluruh Tabel Sistem SPK MOORA (PostgreSQL / NeonDB)
-- ==============================================================================
-- Catatan: Query ini dapat dijalankan langsung di SQL Editor NeonDB, pgAdmin, 
-- atau DBeaver untuk membuat seluruh tabel, index, dan relasi yang dibutuhkan.

-- 1. Tabel Kriteria (Criteria)
CREATE TABLE IF NOT EXISTS "criteria" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "criteria_pkey" PRIMARY KEY ("id")
);

-- 2. Tabel Indikator Sub Alternatif (SubAlternative)
CREATE TABLE IF NOT EXISTS "sub_alternatives" (
    "id" SERIAL NOT NULL,
    "criteriaId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sub_alternatives_pkey" PRIMARY KEY ("id")
);

-- 3. Tabel Alternatif / Nama Jalan (Alternative)
CREATE TABLE IF NOT EXISTS "alternatives" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alternatives_pkey" PRIMARY KEY ("id")
);

-- 4. Tabel Penilaian & Matriks Keputusan (Evaluation)
CREATE TABLE IF NOT EXISTS "evaluations" (
    "id" SERIAL NOT NULL,
    "alternativeId" INTEGER NOT NULL,
    "criteriaId" INTEGER NOT NULL,
    "value" INTEGER NOT NULL,
    "indicatorIds" TEXT DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evaluations_pkey" PRIMARY KEY ("id")
);

-- 5. Tabel Akun Admin (Account)
CREATE TABLE IF NOT EXISTS "accounts" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- ==============================================================================
-- PEMBUATAN INDEX & UNIQUE CONSTRAINT
-- ==============================================================================

-- Unique Index untuk kode kriteria (C1-C5) dan kode alternatif (A1-A7)
CREATE UNIQUE INDEX IF NOT EXISTS "criteria_code_key" ON "criteria"("code");
CREATE UNIQUE INDEX IF NOT EXISTS "alternatives_code_key" ON "alternatives"("code");

-- Unique Index untuk username admin
CREATE UNIQUE INDEX IF NOT EXISTS "accounts_username_key" ON "accounts"("username");

-- Index untuk performa query relasi
CREATE INDEX IF NOT EXISTS "sub_alternatives_criteriaId_idx" ON "sub_alternatives"("criteriaId");
CREATE INDEX IF NOT EXISTS "evaluations_criteriaId_idx" ON "evaluations"("criteriaId");

-- Unique Composite Constraint: Satu alternatif jalan hanya boleh memiliki tepat 1 nilai per kriteria
CREATE UNIQUE INDEX IF NOT EXISTS "evaluations_alternativeId_criteriaId_key" ON "evaluations"("alternativeId", "criteriaId");

-- ==============================================================================
-- PEMBUATAN FOREIGN KEY (INTEGRITAS RELASIONAL CASCADE)
-- ==============================================================================

-- Relasi sub_alternatives ke criteria
ALTER TABLE "sub_alternatives" 
    DROP CONSTRAINT IF EXISTS "sub_alternatives_criteriaId_fkey",
    ADD CONSTRAINT "sub_alternatives_criteriaId_fkey" 
    FOREIGN KEY ("criteriaId") REFERENCES "criteria"("id") 
    ON DELETE CASCADE ON UPDATE CASCADE;

-- Relasi evaluations ke alternatives
ALTER TABLE "evaluations" 
    DROP CONSTRAINT IF EXISTS "evaluations_alternativeId_fkey",
    ADD CONSTRAINT "evaluations_alternativeId_fkey" 
    FOREIGN KEY ("alternativeId") REFERENCES "alternatives"("id") 
    ON DELETE CASCADE ON UPDATE CASCADE;

-- Relasi evaluations ke criteria
ALTER TABLE "evaluations" 
    DROP CONSTRAINT IF EXISTS "evaluations_criteriaId_fkey",
    ADD CONSTRAINT "evaluations_criteriaId_fkey" 
    FOREIGN KEY ("criteriaId") REFERENCES "criteria"("id") 
    ON DELETE CASCADE ON UPDATE CASCADE;
