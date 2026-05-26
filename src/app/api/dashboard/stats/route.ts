import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as unknown as { id: string }).id;

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

    // 3. For support tickets count, load from simulated storage or return 0 initially
    // (Tickets will be saved in client localStorage for interactive persistence)
    const ticketsCount = 0; 

    return NextResponse.json({
      bookingsCount,
      activePassesCount,
      ticketsCount,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
