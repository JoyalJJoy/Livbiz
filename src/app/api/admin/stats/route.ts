import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { cached } from '@/lib/cache';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const role = session.user.role;
    if (role !== 'SUPER_ADMIN' && role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const stats = await cached(
      'admin:stats',
      async () => {
        const now = new Date();
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const [
          totalBookings,
          pendingBookings,
          approvedBookings,
          totalUsers,
          activeTickets,
          revenueResult,
          dayPassCount,
          meetingRoomCount,
          checkinsToday,
        ] = await Promise.all([
          prisma.booking.count(),
          prisma.booking.count({ where: { status: 'PENDING' } }),
          prisma.booking.count({ where: { status: 'APPROVED' } }),
          prisma.user.count({ where: { role: 'CLIENT' } }),
          prisma.ticket.count({
            where: {
              status: 'VALID',
              validUntil: { gt: now },
            },
          }),
          prisma.booking.aggregate({
            _sum: { totalPrice: true },
            where: { status: 'APPROVED' },
          }),
          prisma.booking.count({ where: { status: 'APPROVED', slot: { type: 'DAY_PASS' } } }),
          prisma.booking.count({ where: { status: 'APPROVED', slot: { type: 'MEETING_ROOM' } } }),
          prisma.ticket.count({
            where: {
              status: 'USED',
              usedAt: {
                gte: todayStart,
                lte: todayEnd,
              },
            },
          }),
        ]);

        return {
          totalBookings,
          pendingBookings,
          approvedBookings,
          totalRevenue: Number(revenueResult._sum.totalPrice || 0),
          totalUsers,
          activeTickets,
          dayPassCount,
          meetingRoomCount,
          checkinsToday,
        };
      },
      5_000 // Cache for 5 seconds — stats are expensive but need to be fresh
    );

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Admin Stats Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
