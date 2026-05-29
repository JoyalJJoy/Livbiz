import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cached } from '@/lib/cache';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');

    // Validate type parameter against allowed values
    const allowedTypes = ['DAY_PASS', 'MEETING_ROOM'];
    if (type && !allowedTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid slot type. Must be DAY_PASS or MEETING_ROOM.' },
        { status: 400 }
      );
    }

    const cacheKey = `slots:${type || 'all'}`;

    const formatted = await cached(
      cacheKey,
      async () => {
        const where: Record<string, unknown> = { isActive: true };
        if (type) {
          where.type = type;
        }

        const slots = await prisma.slot.findMany({
          where,
          include: {
            campus: {
              select: { name: true, slug: true, city: true },
            },
          },
          orderBy: { pricePerUnit: 'asc' },
        });

        return slots.map((s) => ({
          id: s.id,
          name: s.name,
          type: s.type,
          capacity: s.capacity,
          pricePerUnit: Number(s.pricePerUnit),
          unit: s.unit,
          campusName: s.campus.name,
          campusSlug: s.campus.slug,
          campusCity: s.campus.city,
        }));
      },
      60_000 // Cache for 60 seconds — slot data rarely changes
    );

    return NextResponse.json(formatted, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch (error) {
    console.error('Slots GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
