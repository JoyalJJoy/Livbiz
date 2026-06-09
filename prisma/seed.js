import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // 1. Optionally create the Super Admin profile.
  // Create the matching auth user in Supabase first, then pass its UUID here.
  if (process.env.SUPABASE_SEED_ADMIN_ID) {
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@livbizz.com' },
      select: { id: true },
    });

    if (existingAdmin) {
      if (existingAdmin.id !== process.env.SUPABASE_SEED_ADMIN_ID) {
        console.warn(
          `Admin profile already exists with id ${existingAdmin.id}; expected ${process.env.SUPABASE_SEED_ADMIN_ID}.`,
        );
      }

      const admin = await prisma.user.update({
        where: { email: 'admin@livbizz.com' },
        data: {
          name: 'Super Admin',
          firstName: 'Super',
          lastName: 'Admin',
          role: 'SUPER_ADMIN',
        },
      });
      console.log(`Admin profile: ${admin.id} (${admin.email})`);
    } else {
      const admin = await prisma.user.create({
        data: {
          id: process.env.SUPABASE_SEED_ADMIN_ID,
          email: 'admin@livbizz.com',
          name: 'Super Admin',
          firstName: 'Super',
          lastName: 'Admin',
          role: 'SUPER_ADMIN',
        },
      });
      console.log(`Admin profile: ${admin.id} (${admin.email})`);
    }
  } else {
    console.log('Skipped admin profile: set SUPABASE_SEED_ADMIN_ID to a Supabase Auth user UUID.');
  }

  // 2. Create Main Campus
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
