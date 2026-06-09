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

    const userId = (session.user as unknown as { id: string }).id;
    const cacheKey = `dashboard:stats:${userId}`;

    const stats = await cached(
      cacheKey,
      async () => {
        const now = new Date();
        const [bookingsCount, activePassesCount] = await Promise.all([
          prisma.booking.count({
            where: { userId },
          }),
          prisma.ticket.count({
            where: {
              userId,
              status: 'VALID',
              validUntil: {
                gt: now,
              },
            },
          }),
        ]);

        return {
          bookingsCount,
          activePassesCount,
          ticketsCount: 0,
        };
      },
      10_000 // Cache for 10 seconds
    );

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
