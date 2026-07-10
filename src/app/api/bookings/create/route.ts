import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { invalidateCache } from '@/lib/cache';
import { generateTicketCode } from '@/lib/tickets';
import { bookingCreateSchema } from '@/lib/schemas';
import { withRequestContext } from '@/lib/logger';
import type { BookingStatus } from '@prisma/client';

export async function POST(req: Request) {
  const log = withRequestContext(req);
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    const userId = session.user.id;

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const parsed = bookingCreateSchema.safeParse(body);
    if (!parsed.success) {
      const issue = parsed.error.issues?.[0];
      const firstError = issue?.message || 'Invalid request data';
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { slotId, startTime, endTime, totalPrice, seats, seatIds, notes, attendees } = parsed.data;
    const parsedStart = new Date(startTime);
    const parsedEnd = new Date(endTime);
    const requestedSeats = seats ?? 1;
    const requestedSeatIds = seatIds ?? [];

    // Wrap conflict check + creation in a transaction to prevent TOCTOU races
    const booking = await prisma.$transaction(async (tx) => {
      const slot = await tx.slot.findUnique({
        where: { id: slotId },
        include: { campus: true },
      });

      if (!slot) {
        throw new AppError('Slot not found', 404);
      }

      if (!slot.isActive) {
        throw new AppError('This slot is no longer available', 400);
      }

      if (requestedSeats > slot.capacity) {
        throw new AppError('Requested seats exceed this slot capacity', 400);
      }

      const conflictWhere = {
        slotId,
        status: { in: ['PENDING', 'APPROVED'] as BookingStatus[] },
        AND: [
          { startTime: { lt: parsedEnd } },
          { endTime: { gt: parsedStart } },
        ],
      };

      if (slot.type === 'MEETING_ROOM') {
        const conflicting = await tx.booking.findFirst({
          where: conflictWhere,
          select: { id: true },
        });
        if (conflicting) {
          throw new AppError('This meeting room is already booked for the selected time slot', 409);
        }
      }

      if (slot.type === 'DAY_PASS') {
        const conflictingBookings = await tx.booking.findMany({
          where: conflictWhere,
          select: { seatIds: true },
        });

        const alreadyBookedSeats = conflictingBookings.flatMap(b => b.seatIds);
        const duplicateSeats = requestedSeatIds.filter(seat => alreadyBookedSeats.includes(seat));

        if (duplicateSeats.length > 0) {
          throw new AppError(
            `The following seat(s) are already booked for this time: ${duplicateSeats.join(', ')}`,
            409
          );
        }

        const bookedSeatAggregate = await tx.booking.aggregate({
          where: conflictWhere,
          _sum: { seats: true },
        });
        const totalSeatsBooked = bookedSeatAggregate._sum.seats || 0;

        if (totalSeatsBooked + requestedSeats > slot.capacity) {
          throw new AppError('Not enough seats available for the selected time slot', 409);
        }
      }

      const attendeeList = Array.isArray(attendees) ? attendees : [];
      const ticketRecipients = Array.from({ length: requestedSeats }, (_, index) => {
        const attendee = attendeeList[index];
        return {
          name: attendee?.name?.trim() || session.user?.name || '',
          email: attendee?.email?.trim() || session.user?.email || '',
        };
      });

      const created = await tx.booking.create({
        data: {
          userId,
          slotId,
          startTime: parsedStart,
          endTime: parsedEnd,
          totalPrice,
          seats: requestedSeats,
          seatIds: requestedSeatIds,
          notes: notes ?? null,
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
              recipientName: att.name,
              recipientEmail: att.email,
            })),
          },
        },
        include: {
          slot: {
            include: { campus: true },
          },
        },
      });

      return created;
    });

    invalidateCache('availability:*');
    invalidateCache('admin:stats');

    log.info('Booking created successfully', {
      data: {
        bookingId: booking.id,
        userId,
        slotId,
        seats: requestedSeats,
      },
    });

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
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    log.error('Booking creation error', { error });
    return NextResponse.json(
      { error: 'Internal server error. Please try again.' },
      { status: 500 }
    );
  }
}

class AppError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}
