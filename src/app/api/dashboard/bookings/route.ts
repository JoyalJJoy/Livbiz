import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { cached, invalidateCache } from '@/lib/cache';

// GET Bookings list for logged-in user
export async function GET() {
  try {
    const session = await getSession();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const cacheKey = `dashboard:bookings:${userId}`;

    const result = await cached(
      cacheKey,
      async () => {
        // Fetch user bookings, including their slot information, campus details, and access ticket QR details
        const dbBookings = await prisma.booking.findMany({
          where: { userId },
          include: {
            slot: {
              include: {
                campus: true,
              },
            },
            tickets: true,
          },
          orderBy: {
            startTime: 'desc',
          },
        });

        // Format list objects neatly for client dashboard consumes
        const formattedBookings = dbBookings.map((b) => {
          const rawTickets: unknown = b.tickets;
          const tickets = Array.isArray(rawTickets) ? rawTickets : [];

          const formattedTickets = tickets.map((tUnknown) => {
            const t = tUnknown as {
              id: string;
              code: string;
              qrData: string;
              status: string;
              validFrom: Date;
              validUntil: Date;
              attendeeIndex?: number | null;
              recipientName?: string | null;
              recipientEmail?: string | null;
              sentAt?: Date | null;
            };

            return {
              id: t.id,
              code: t.code,
              qrData: t.qrData,
              status: t.status,
              validFrom: t.validFrom.toISOString(),
              validUntil: t.validUntil.toISOString(),
              attendeeIndex: t.attendeeIndex ?? null,
              recipientName: t.recipientName ?? null,
              recipientEmail: t.recipientEmail ?? null,
              sentAt: t.sentAt?.toISOString() || null,
            };
          });

          return {
            id: b.id,
            slotName: b.slot.name,
            slotType: b.slot.type,
            campusName: b.slot.campus.name,
            startTime: b.startTime.toISOString(),
            endTime: b.endTime.toISOString(),
            totalPrice: Number(b.totalPrice),
            status: b.status,
            paymentStatus: b.paymentStatus,
            paymentMethod: b.paymentMethod,
            paymentReference: b.paymentReference,
            paymentDate: b.paymentDate ? b.paymentDate.toISOString() : null,
            ticket: formattedTickets[0] || null, // Map first ticket to singular 'ticket' property for dashboard home card compatibility
            tickets: formattedTickets,
          };
        });

        return { bookings: formattedBookings };
      },
      10_000 // Cache for 10 seconds
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Bookings GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT Update booking status (e.g. Cancel Booking)
export async function PUT(req: Request) {
  try {
    const session = await getSession();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { bookingId, action } = await req.json();

    if (!bookingId || action !== 'cancel') {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    // Retrieve booking to verify ownership
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (booking.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (booking.status !== 'PENDING') {
      return NextResponse.json({ error: 'Only pending bookings can be cancelled.' }, { status: 400 });
    }

    // Update booking status in PostgreSQL
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'CANCELLED' },
    });

    // Revoke access ticket(s) if they exist
    await prisma.ticket.updateMany({
      where: { bookingId, status: 'VALID' },
      data: { status: 'REVOKED' },
    });

    // Invalidate client dashboard cache immediately to keep it fresh
    invalidateCache(`dashboard:bookings:${userId}`);
    invalidateCache(`dashboard:stats:${userId}`);

    return NextResponse.json({
      message: 'Booking cancelled successfully.',
      bookingStatus: updatedBooking.status,
    });
  } catch (error) {
    console.error('Bookings PUT Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
