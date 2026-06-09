import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cached } from '@/lib/cache';

/**
 * GET /api/slots/availability?type=DAY_PASS&month=2026-06
 * 
 * Returns dates with booking counts and capacity for a given slot type and month.
 * The frontend uses this to mark fully-booked dates in the calendar.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'DAY_PASS';
    const month = searchParams.get('month'); // Format: YYYY-MM

    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return NextResponse.json(
        { error: 'month parameter required in YYYY-MM format' },
        { status: 400 }
      );
    }

    const [year, mon] = month.split('-').map(Number);
    const startOfMonth = new Date(year, mon - 1, 1);
    const endOfMonth = new Date(year, mon, 0, 23, 59, 59, 999);

    const cacheKey = `availability:${type}:${month}`;

    const result = await cached(
      cacheKey,
      async () => {
        // Get all slots of this type with their capacities
        const slots = await prisma.slot.findMany({
          where: { type, isActive: true },
          select: { id: true, name: true, capacity: true },
        });

        if (slots.length === 0) {
          return { dates: {}, totalCapacity: 0 };
        }

        const slotIds = slots.map(s => s.id);
        const totalCapacity = slots.reduce((sum, s) => sum + s.capacity, 0);

        // Get booking count aggregated by day directly from database using covering indexes
        const bookings = await prisma.$queryRaw<Array<{ date: string; count: number }>>`
          SELECT TO_CHAR("startTime", 'YYYY-MM-DD') as date, COUNT(*)::int as count
          FROM "Booking"
          WHERE "slotId" = ANY(${slotIds})
            AND "status" IN ('PENDING', 'APPROVED')
            AND "startTime" >= ${startOfMonth}
            AND "startTime" <= ${endOfMonth}
            AND "startTime" IS NOT NULL
          GROUP BY TO_CHAR("startTime", 'YYYY-MM-DD')
        `;

        // Map counts
        const dateCounts: Record<string, number> = {};
        for (const row of bookings) {
          dateCounts[row.date] = row.count;
        }

        // Build response: for each date, indicate if it's fully booked
        const dates: Record<string, { booked: number; capacity: number; full: boolean }> = {};
        for (const [dateKey, count] of Object.entries(dateCounts)) {
          dates[dateKey] = {
            booked: count,
            capacity: totalCapacity,
            full: count >= totalCapacity,
          };
        }

        return { dates, totalCapacity };
      },
      15_000 // Cache for 15 seconds — balance between freshness and performance
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Availability API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
