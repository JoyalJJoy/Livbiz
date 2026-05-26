async function main() {
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();
  const bookings = await prisma.booking.findMany({
    include: { slot: true }
  });
  console.log(JSON.stringify(bookings, null, 2));
  await prisma.$disconnect();
}
main().catch((error) => {
  console.error(error);
  process.exit(1);
});
