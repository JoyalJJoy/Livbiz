import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // 1. Create a Super Admin User
  const admin = await prisma.user.upsert({
    where: { email: 'admin@livbiz.com' },
    update: {},
    create: {
      email: 'admin@livbiz.com',
      name: 'Super Admin',
      firstName: 'Super',
      lastName: 'Admin',
      // password is 'password@123'
      passwordHash: '$2b$10$jOzAbCcQ6q0ZMeBevJeckuwxCchprvWuvoK7iUmYLkrsqBHK6x3uu', 
      role: 'SUPER_ADMIN',
    },
  });
  console.log(`Created admin user with id: ${admin.id}`);

  // 2. Create the main Campus
  const mainCampus = await prisma.campus.upsert({
    where: { slug: 'main-hub' },
    update: {},
    create: {
      name: 'LivBizz Main Hub',
      slug: 'main-hub',
      address: '123 Tech Park, Block A',
      city: 'Bangalore',
    },
  });
  console.log(`Created campus with id: ${mainCampus.id}`);

  // 3. Create Day Pass Slot
  await prisma.slot.create({
    data: {
      campusId: mainCampus.id,
      name: 'Regular Day Pass',
      type: 'DAY_PASS',
      capacity: 50, // 50 desks available per day
      pricePerUnit: 200.00,
      unit: 'DAY',
    },
  });

  await prisma.slot.create({
    data: {
      campusId: mainCampus.id,
      name: 'Premium Day Pass',
      type: 'DAY_PASS',
      capacity: 20, // 20 premium desks available per day
      pricePerUnit: 300.00,
      unit: 'DAY',
    },
  });

  // 4. Create Meeting Room Slot
  await prisma.slot.create({
    data: {
      campusId: mainCampus.id,
      name: 'Conference Room Alpha',
      type: 'MEETING_ROOM',
      capacity: 8,
      pricePerUnit: 250.00,
      unit: 'HOUR',
    },
  });

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
