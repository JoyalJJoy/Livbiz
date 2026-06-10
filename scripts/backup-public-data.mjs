import fs from 'node:fs';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const TABLES = [
  'User',
  'Campus',
  'Slot',
  'Booking',
  'Ticket',
  'AuditLog',
  'VerificationToken',
  'Account',
  'Session',
];

function serialize(value) {
  return JSON.stringify(
    value,
    (_key, item) => {
      if (typeof item === 'bigint') return item.toString();
      if (item instanceof Date) return item.toISOString();
      return item;
    },
    2,
  );
}

async function tableExists(tableName) {
  const result = await prisma.$queryRaw`
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name = ${tableName}
    ) AS "exists"
  `;

  return Boolean(result[0]?.exists);
}

async function readTable(tableName) {
  if (!(await tableExists(tableName))) {
    return { exists: false, rows: [] };
  }

  const rows = await prisma.$queryRawUnsafe(`SELECT * FROM "${tableName}"`);
  return { exists: true, rows };
}

async function main() {
  const createdAt = new Date().toISOString();
  const backup = {
    createdAt,
    databaseHost: new URL(process.env.DATABASE_URL).hostname,
    tables: {},
  };

  for (const tableName of TABLES) {
    backup.tables[tableName] = await readTable(tableName);
  }

  const outDir = path.join(process.cwd(), 'backups');
  fs.mkdirSync(outDir, { recursive: true });

  const stamp = createdAt.replace(/[:.]/g, '-');
  const outFile = path.join(outDir, `public-data-${stamp}.json`);
  fs.writeFileSync(outFile, serialize(backup));

  const counts = Object.fromEntries(
    Object.entries(backup.tables).map(([tableName, table]) => [
      tableName,
      table.exists ? table.rows.length : 'missing',
    ]),
  );

  console.log(outFile);
  console.log(counts);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
