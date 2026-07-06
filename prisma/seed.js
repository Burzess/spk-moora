const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// Manually parse .env if DATABASE_URL is not set
if (!process.env.DATABASE_URL) {
  try {
    const envPath = path.join(__dirname, '../.env');
    if (fs.existsSync(envPath)) {
      const envConfig = fs.readFileSync(envPath, 'utf8');
      envConfig.split('\n').forEach((line) => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
          let value = match[2].trim();
          if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
          if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
          process.env[match[1].trim()] = value;
        }
      });
    }
  } catch (e) {
    console.warn('Could not read .env file:', e);
  }
}

const prisma = new PrismaClient();

async function main() {
  console.log('Mulai melakukan seeding data Kriteria, Sub-Kriteria (Indikator), dan Alternatif...');

  const criteriaData = [
    {
      code: 'C1',
      name: 'Lokasi',
      type: 'BENEFIT',
      subAlternatives: [
        { name: 'Lokasi memungkinkan untuk operasional usaha setiap hari', value: 3 },
        { name: 'Lokasi mudah dijangkau oleh kendaraan umum maupun kendaraan pribadi', value: 2 },
        { name: 'Lokasi usaha mudah terlihat oleh pengguna jalan', value: 1 },
      ],
    },
    {
      code: 'C2',
      name: 'Fasilitas Pendukung',
      type: 'BENEFIT',
      subAlternatives: [
        { name: 'Ketersediaan lahan parkir', value: 3 },
        { name: 'Ketersediaan fasilitas toilet', value: 2 },
        { name: 'Ketersediaan area makan bagi pelanggan', value: 1 },
      ],
    },
    {
      code: 'C3',
      name: 'Biaya Sewa',
      type: 'COST',
      subAlternatives: [
        { name: '≤ Rp 500.000 (≤ 20%)', value: 1 },
        { name: 'Rp 500.001 - 800.000 (> 20% – 40%)', value: 2 },
        { name: 'Rp 800.001 - 1.100.000 (> 40% – 60%)', value: 3 },
        { name: 'Rp 1.100.001 - 1.400.000 (> 60% – 80%)', value: 4 },
        { name: '> Rp 1.400.001 (> 80%)', value: 5 },
      ],
    },
    {
      code: 'C4',
      name: 'Lingkungan & sosial',
      type: 'BENEFIT',
      subAlternatives: [
        { name: 'Lingkungan yang bersih dan terawat', value: 3 },
        { name: 'Gangguan warga sekitar', value: 2 },
        { name: 'Keamanan lokasi dari tindak kejahatan', value: 1 },
      ],
    },
    {
      code: 'C5',
      name: 'Potensi Pasar',
      type: 'BENEFIT',
      subAlternatives: [
        { name: 'sedikit usaha kuliner sejenis di sekitar lokasi', value: 3 },
        { name: 'Daya beli masyarakat di sekitar lokasi sangat tinggi', value: 2 },
        { name: 'Banyak pelanggan potensial berasal dari sekitar lokasi', value: 1 },
      ],
    },
  ];

  for (const crit of criteriaData) {
    const createdCriteria = await prisma.criteria.upsert({
      where: { code: crit.code },
      update: {
        name: crit.name,
        type: crit.type,
      },
      create: {
        code: crit.code,
        name: crit.name,
        type: crit.type,
      },
    });

    // Bersihkan sub-alternatif lama pada kriteria ini agar tidak terjadi duplikasi saat di-seed ulang
    await prisma.subAlternative.deleteMany({
      where: { criteriaId: createdCriteria.id },
    });

    for (const sub of crit.subAlternatives) {
      await prisma.subAlternative.create({
        data: {
          criteriaId: createdCriteria.id,
          name: sub.name,
          value: sub.value,
        },
      });
    }
    console.log(`✔ Berhasil menyelaraskan Kriteria ${crit.code} (${crit.name}) dengan ${crit.subAlternatives.length} sub-alternatif indikator.`);
  }

  const alternativesData = [
    { code: 'A1', name: 'Jalan kalisari' },
    { code: 'A2', name: 'Jalan raya semampir' },
    { code: 'A3', name: 'Dukuh setro' },
    { code: 'A4', name: 'Jembatan suroboyo' },
    { code: 'A5', name: 'Sentra bulak' },
    { code: 'A6', name: 'Sidotopo wetan baru' },
    { code: 'A7', name: 'Tambak wedi' },
  ];

  for (const alt of alternativesData) {
    await prisma.alternative.upsert({
      where: { code: alt.code },
      update: { name: alt.name },
      create: { code: alt.code, name: alt.name },
    });
  }
  console.log(`✔ Berhasil menyelaraskan ${alternativesData.length} data Alternatif.`);

  console.log('Seeding selesai dengan sukses!');
}

main()
  .catch((e) => {
    console.error('Terjadi kesalahan saat seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
