const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const targetEmail = '23bcaa27@kristujayanti.com';
  console.log(`Searching for user with email: ${targetEmail}`);

  try {
    const user = await prisma.user.findUnique({
      where: { email: targetEmail },
      include: {
        bookings: { select: { id: true } },
        tickets: { select: { id: true } },
        accounts: { select: { id: true } },
        sessions: { select: { id: true } },
        auditLogs: { select: { id: true } }
      }
    });

    if (!user) {
      console.log(`❌ User with email ${targetEmail} not found in the database.`);
      return;
    }

    console.log(`Found user: ${user.name} (${user.id})`);
    console.log(`- Accounts: ${user.accounts.length}`);
    console.log(`- Sessions: ${user.sessions.length}`);
    console.log(`- Bookings: ${user.bookings.length}`);
    console.log(`- Tickets: ${user.tickets.length}`);
    console.log(`- Audit Logs: ${user.auditLogs.length}`);

    console.log('Starting transaction to delete user and all associated records...');
    
    const [deletedTickets, deletedBookings, deletedAccounts, deletedSessions, deletedLogs, deletedUser] = await prisma.$transaction([
      // Delete tickets first (FK to booking/user)
      prisma.ticket.deleteMany({ where: { userId: user.id } }),
      // Delete bookings (FK to user)
      prisma.booking.deleteMany({ where: { userId: user.id } }),
      // Delete auth accounts
      prisma.account.deleteMany({ where: { userId: user.id } }),
      // Delete active sessions
      prisma.session.deleteMany({ where: { userId: user.id } }),
      // Delete audit logs
      prisma.auditLog.deleteMany({ where: { userId: user.id } }),
      // Finally delete the user
      prisma.user.delete({ where: { id: user.id } })
    ]);

    console.log('✅ User and all associated data deleted successfully!');
    console.log(`- Deleted User Record: ${deletedUser.name} (${deletedUser.email})`);
    console.log(`- Deleted Bookings: ${deletedBookings.count}`);
    console.log(`- Deleted Tickets: ${deletedTickets.count}`);
    console.log(`- Deleted Accounts: ${deletedAccounts.count}`);
    console.log(`- Deleted Sessions: ${deletedSessions.count}`);
    console.log(`- Deleted Audit Logs: ${deletedLogs.count}`);

  } catch (err) {
    console.error('❌ Error during user deletion:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
