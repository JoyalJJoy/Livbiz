import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const slotId = searchParams.get('slotId');
    const dateParam = searchParams.get('date'); // YYYY-MM-DD

    if (!slotId || !dateParam) {
      return NextResponse.json({ error: 'Missing slotId or date' }, { status: 400 });
    }

    const startOfDay = new Date(dateParam);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const bookings = await prisma.booking.findMany({
      where: {
        slotId,
        status: { in: ['PENDING', 'APPROVED'] },
        startTime: {
          gte: startOfDay,
          lt: endOfDay,
        }
      },
      select: {
        seatIds: true,
      }
    });

    const bookedSeatIds = bookings.flatMap(b => b.seatIds);

    return NextResponse.json({ bookedSeatIds });
  } catch (error) {
    console.error('Error fetching booked seats:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
