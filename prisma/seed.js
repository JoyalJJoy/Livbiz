import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // 1. Create Super Admin
  const passwordHash = await bcrypt.hash('password@123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@livbiz.com' },
    update: { passwordHash },
    create: {
      email: 'admin@livbiz.com',
      name: 'Super Admin',
      passwordHash,
      role: 'SUPER_ADMIN',
    },
  });
  console.log(`Admin user: ${admin.id} (${admin.email})`);

  // 2. Create Main Campus
  const mainCampus = await prisma.campus.upsert({
    where: { slug: 'main-hub' },
    update: {},
    create: {
      name: 'LivBiz Main Hub',
      slug: 'main-hub',
      address: '123 Tech Park, Block A',
      city: 'Bangalore',
    },
  });
  console.log(`Campus: ${mainCampus.id} (${mainCampus.name})`);

  // 3. Create Day Pass Slots
  const existingSlots = await prisma.slot.findMany({ where: { campusId: mainCampus.id } });
  const slotNames = existingSlots.map(s => s.name);

  if (!slotNames.includes('Regular Day Pass')) {
    await prisma.slot.create({
      data: {
        campusId: mainCampus.id,
        name: 'Regular Day Pass',
        type: 'DAY_PASS',
        capacity: 50,
        pricePerUnit: 200.00,
        unit: 'DAY',
      },
    });
    console.log('Created: Regular Day Pass');
  }

  if (!slotNames.includes('Premium Day Pass')) {
    await prisma.slot.create({
      data: {
        campusId: mainCampus.id,
        name: 'Premium Day Pass',
        type: 'DAY_PASS',
        capacity: 20,
        pricePerUnit: 300.00,
        unit: 'DAY',
      },
    });
    console.log('Created: Premium Day Pass');
  }

  // 4. Create Meeting Room Slots
  if (!slotNames.includes('4-Seat Conference Room')) {
    await prisma.slot.create({
      data: {
        campusId: mainCampus.id,
        name: '4-Seat Conference Room',
        type: 'MEETING_ROOM',
        capacity: 4,
        pricePerUnit: 200.00,
        unit: 'HOUR',
      },
    });
    console.log('Created: 4-Seat Conference Room');
  }

  if (!slotNames.includes('16-Seat Conference Room')) {
    await prisma.slot.create({
      data: {
        campusId: mainCampus.id,
        name: '16-Seat Conference Room',
        type: 'MEETING_ROOM',
        capacity: 16,
        pricePerUnit: 500.00,
        unit: 'HOUR',
      },
    });
    console.log('Created: 16-Seat Conference Room');
  }

  console.log('Seeding finished.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
