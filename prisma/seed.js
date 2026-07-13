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
        pricePerUnit: 350.00,
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
        pricePerUnit: 250.00,
        unit: 'DAY',
      },
    });
    console.log('Created: Premium Day Pass');
  }

  // 4. Create/Update Meeting Room Slots
  // Rename old 4-Seat Conference Room if it exists
  const old4Seat = await prisma.slot.findFirst({
    where: { name: '4-Seat Conference Room', campusId: mainCampus.id }
  });
  if (old4Seat) {
    await prisma.slot.update({
      where: { id: old4Seat.id },
      data: {
        name: '6-Seat Conference Room',
        capacity: 6
      }
    });
    console.log('Renamed 4-Seat to 6-Seat Conference Room');
  }

  // Rename old 16-Seat Conference Room if it exists
  const old16Seat = await prisma.slot.findFirst({
    where: { name: '16-Seat Conference Room', campusId: mainCampus.id }
  });
  if (old16Seat) {
    await prisma.slot.update({
      where: { id: old16Seat.id },
      data: {
        name: '12-Seat Conference Room',
        capacity: 12
      }
    });
    console.log('Renamed 16-Seat to 12-Seat Conference Room');
  }

  // Check the updated slots list
  const updatedSlots = await prisma.slot.findMany({ where: { campusId: mainCampus.id } });
  const updatedSlotNames = updatedSlots.map(s => s.name);

  if (!updatedSlotNames.includes('6-Seat Conference Room')) {
    await prisma.slot.create({
      data: {
        campusId: mainCampus.id,
        name: '6-Seat Conference Room',
        type: 'MEETING_ROOM',
        capacity: 6,
        pricePerUnit: 500.00,
        unit: 'HOUR',
      },
    });
    console.log('Created: 6-Seat Conference Room');
  }

  if (!updatedSlotNames.includes('12-Seat Conference Room')) {
    await prisma.slot.create({
      data: {
        campusId: mainCampus.id,
        name: '12-Seat Conference Room',
        type: 'MEETING_ROOM',
        capacity: 12,
        pricePerUnit: 1500.00,
        unit: 'HOUR',
      },
    });
    console.log('Created: 12-Seat Conference Room');
  }

  // Update prices for existing slots
  await prisma.slot.updateMany({
    where: { name: '6-Seat Conference Room', campusId: mainCampus.id },
    data: { pricePerUnit: 500.00 }
  });
  await prisma.slot.updateMany({
    where: { name: '12-Seat Conference Room', campusId: mainCampus.id },
    data: { pricePerUnit: 1500.00 }
  });
  console.log('Updated prices for Conference Rooms');

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
