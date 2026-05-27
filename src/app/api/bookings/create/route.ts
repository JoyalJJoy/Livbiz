import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { invalidateCache } from '@/lib/cache';
import { generateTicketCode } from '@/lib/tickets';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    const userId = (session.user as unknown as { id: string }).id;
    const body = await req.json();
    const { slotId, startTime, endTime, totalPrice, seats, seatIds, notes, attendees } = body;

    // Validate required fields
    if (!slotId || !startTime || !endTime || totalPrice == null) {
      return NextResponse.json(
        { error: 'Missing required fields: slotId, startTime, endTime, totalPrice' },
        { status: 400 }
      );
    }

    const parsedStart = new Date(startTime);
    const parsedEnd = new Date(endTime);

    if (isNaN(parsedStart.getTime()) || isNaN(parsedEnd.getTime())) {
      return NextResponse.json({ error: 'Invalid date format for startTime or endTime' }, { status: 400 });
    }

    if (parsedEnd <= parsedStart) {
      return NextResponse.json({ error: 'endTime must be after startTime' }, { status: 400 });
    }

    const requestedSeats = seats == null ? 1 : Number(seats);
    if (!Number.isInteger(requestedSeats) || requestedSeats < 1) {
      return NextResponse.json({ error: 'seats must be a positive whole number' }, { status: 400 });
    }

    // Verify slot exists and is active
    const slot = await prisma.slot.findUnique({
      where: { id: slotId },
      include: { campus: true },
    });

    if (!slot) {
      return NextResponse.json({ error: 'Slot not found' }, { status: 404 });
    }

    if (!slot.isActive) {
      return NextResponse.json({ error: 'This slot is no longer available' }, { status: 400 });
    }

    if (requestedSeats > slot.capacity) {
      return NextResponse.json(
        { error: 'Requested seats exceed this slot capacity' },
        { status: 400 }
      );
    }

    const conflictWhere = {
      slotId,
      status: { in: ['PENDING', 'APPROVED'] },
      AND: [
        { startTime: { lt: parsedEnd } },
        { endTime: { gt: parsedStart } },
      ],
    };

    // For day passes, check against capacity; for meeting rooms, any conflict blocks
    if (slot.type === 'MEETING_ROOM') {
      const conflictingBooking = await prisma.booking.findFirst({
        where: conflictWhere,
        select: { id: true },
      });

      if (conflictingBooking) {
        return NextResponse.json(
          { error: 'This meeting room is already booked for the selected time slot' },
          { status: 409 }
        );
      }
    }

    const requestedSeatIds = Array.isArray(seatIds) ? (seatIds as string[]) : [];

    if (slot.type === 'DAY_PASS') {
      const conflictingBookings = await prisma.booking.findMany({
        where: conflictWhere,
        select: { seatIds: true },
      });

      const alreadyBookedSeats = conflictingBookings.flatMap(b => b.seatIds);
      const duplicateSeats = requestedSeatIds.filter(seat => alreadyBookedSeats.includes(seat));

      if (duplicateSeats.length > 0) {
        return NextResponse.json(
          { error: `The following seat(s) are already booked for this time: ${duplicateSeats.join(', ')}` },
          { status: 409 }
        );
      }

      const bookedSeatAggregate = await prisma.booking.aggregate({
        where: conflictWhere,
        _sum: { seats: true },
      });
      const totalSeatsBooked = bookedSeatAggregate._sum.seats || 0;

      if (totalSeatsBooked + requestedSeats > slot.capacity) {
        return NextResponse.json(
          { error: 'Not enough seats available for the selected time slot' },
          { status: 409 }
        );
      }
    }

    const attendeeList = Array.isArray(attendees) ? attendees : [];
    const ticketRecipients = Array.from({ length: requestedSeats }, (_, index) => {
      const attendee = attendeeList[index] as { name?: unknown; email?: unknown } | undefined;
      const attendeeName = typeof attendee?.name === 'string' ? attendee.name.trim() : '';
      const attendeeEmail = typeof attendee?.email === 'string' ? attendee.email.trim() : '';

      return {
        name: attendeeName || session.user?.name || '',
        email: attendeeEmail || session.user?.email || '',
      };
    });

    // Create the booking
    const booking = await prisma.booking.create({
      data: {
        userId,
        slotId,
        startTime: parsedStart,
        endTime: parsedEnd,
        totalPrice: Number(totalPrice),
        seats: requestedSeats,
        seatIds: requestedSeatIds,
        notes: notes || null,
        status: 'PENDING',
        tickets: {
          create: ticketRecipients.map((att, i) => ({
            userId,
            code: generateTicketCode(),
            qrData: '{}',
            status: 'PENDING',
            validFrom: parsedStart,
            validUntil: parsedEnd,
            attendeeIndex: i + 1,
            recipientName: att.name || '',
            recipientEmail: att.email || '',
          }))
        }
      },
      include: {
        slot: {
          include: { campus: true },
        },
      },
    });

    // Invalidate caches so calendar + admin dashboard refresh
    invalidateCache('availability:*');
    invalidateCache('admin:stats');

    return NextResponse.json({
      success: true,
      message: 'Booking created successfully! It is pending admin approval.',
      booking: {
        id: booking.id,
        slotName: booking.slot.name,
        slotType: booking.slot.type,
        campusName: booking.slot.campus.name,
        startTime: booking.startTime.toISOString(),
        endTime: booking.endTime.toISOString(),
        totalPrice: Number(booking.totalPrice),
        status: booking.status,
      },
    });
  } catch (error) {
    console.error('Booking creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error. Please try again.' },
      { status: 500 }
    );
  }
}
