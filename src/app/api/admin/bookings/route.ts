import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { invalidateCache } from '@/lib/cache';
import QRCode from 'qrcode';
import { sendEmail } from '@/lib/email';
import { createAuditLog } from '@/lib/audit';

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const role = (session.user as unknown as { role: string }).role;
    if (role !== 'SUPER_ADMIN' && role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (statusFilter && statusFilter !== 'ALL') {
      where.status = statusFilter;
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true, phone: true } },
          slot: { include: { campus: { select: { name: true } } } },
          tickets: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.booking.count({ where }),
    ]);

    const formatted = bookings.map((b) => {
      const rawTickets: unknown = (b as unknown as { tickets?: unknown }).tickets;
      const tickets = Array.isArray(rawTickets) ? rawTickets : [];

      return {
        id: b.id,
        userName: b.user.name,
        userEmail: b.user.email,
        userPhone: b.user.phone,
        slotName: b.slot.name,
        slotType: b.slot.type,
        campusName: b.slot.campus.name,
        startTime: b.startTime.toISOString(),
        endTime: b.endTime.toISOString(),
        totalPrice: Number(b.totalPrice),
        status: b.status,
        notes: b.notes,
        adminNotes: b.adminNotes,
        createdAt: b.createdAt.toISOString(),
        tickets: tickets.map((tUnknown) => {
          const t = tUnknown as {
            id: string;
            code: string;
            qrData: string;
            status: string;
            validFrom: Date;
            validUntil: Date;
            usedAt?: Date | null;
            attendeeIndex?: number | null;
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
            usedAt: t.usedAt?.toISOString() || null,
            attendeeIndex: t.attendeeIndex ?? null,
            recipientEmail: t.recipientEmail ?? null,
            sentAt: t.sentAt?.toISOString() || null,
          };
        }),
      };
    });

    return NextResponse.json({
      bookings: formatted,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Admin Bookings GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const hostHeader = req.headers.get('host') || 'localhost:3000';
    const proto = req.headers.get('x-forwarded-proto') || 'http';
    const origin = `${proto}://${hostHeader}`;

    const role = (session.user as unknown as { role: string }).role;
    const adminId = (session.user as unknown as { id: string }).id;
    if (role !== 'SUPER_ADMIN' && role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { bookingId, action, adminNotes } = await req.json();

    // Validate adminNotes length
    if (adminNotes !== undefined && typeof adminNotes === 'string' && adminNotes.length > 1000) {
      return NextResponse.json({ error: 'Admin notes must be 1000 characters or less.' }, { status: 400 });
    }

    if (!bookingId || !action) {
      return NextResponse.json({ error: 'bookingId and action are required' }, { status: 400 });
    }

    if (!['approve', 'reject', 'cancel'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be approve, reject, or cancel' },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        slot: {
          include: {
            campus: true,
          },
        },
        user: true,
        tickets: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (action === 'approve') {
      if (booking.status !== 'PENDING') {
        return NextResponse.json(
          { error: 'Only pending bookings can be approved' },
          { status: 400 }
        );
      }

      const ticketsToActivate = booking.tickets;
      
      const updatedTickets = [];

      for (const t of ticketsToActivate) {
        const qrPayload = JSON.stringify({
          code: t.code,
          bookingId: booking.id,
          attendeeIndex: t.attendeeIndex,
          validFrom: booking.startTime.toISOString(),
          validUntil: booking.endTime.toISOString(),
        });

        const qrDataUrl = await QRCode.toDataURL(qrPayload, {
          width: 300,
          margin: 2,
          color: { dark: '#0f172a', light: '#ffffff' },
        });

        updatedTickets.push({ id: t.id, qrData: qrDataUrl, email: t.recipientEmail, name: t.recipientName, code: t.code, attendeeIndex: t.attendeeIndex });
      }

      // Update booking and all tickets in a transaction
      const transactionOperations = [
        prisma.booking.update({
          where: { id: bookingId },
          data: {
            status: 'APPROVED',
            adminNotes: adminNotes || null,
            reviewedBy: adminId,
            reviewedAt: new Date(),
          },
        }),
        ...updatedTickets.map(t => 
          prisma.ticket.update({
            where: { id: t.id },
            data: { status: 'VALID', qrData: t.qrData }
          })
        )
      ];

      const [updatedBooking] = await prisma.$transaction(transactionOperations);
      
      // Log administrative action
      await createAuditLog({
        action: 'BOOKING_APPROVED',
        userId: adminId,
        targetId: bookingId,
        targetType: 'BOOKING',
        changes: { status: 'APPROVED', adminNotes: adminNotes || null },
        ipAddress: req.headers.get('x-forwarded-for') || undefined,
      });
      
      // Send Emails concurrently in the background (non-blocking)
      const emailPromises = updatedTickets
        .filter(t => t.email)
        .map(t => {
          const isGuest = t.email!.toLowerCase().trim() !== booking.user.email.toLowerCase().trim();
          const walletPassUrl = `${origin}/tickets/${t.code}`;
          
          const greetingText = isGuest
            ? `Hi ${t.name || 'there'},<br/><br/>You have been registered by <strong>${booking.user.name}</strong> as an attendee for a conference room workspace booking at LivBizz.`
            : `Hi ${t.name || 'there'},<br/><br/>Your workspace booking at LivBizz has been approved and confirmed!`;

          const emailHtml = `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0b0f19; color: #f8fafc; border-radius: 20px; overflow: hidden; border: 1px solid #1e293b;">
              <!-- Header -->
              <div style="background: linear-gradient(135deg, #1e1b4b 0%, #0b0f19 100%); padding: 2rem; text-align: center; border-bottom: 1px solid #1e293b;">
                <h1 style="color: #ffffff; margin: 0; font-size: 1.5rem; letter-spacing: 0.1em; text-transform: uppercase; font-weight: 900;">LIVBIZZ PASS</h1>
                <p style="color: #6366f1; margin: 0.5rem 0 0 0; font-size: 0.85rem; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase;">Workspace Confirmation</p>
              </div>
              
              <!-- Content -->
              <div style="padding: 2rem; line-height: 1.6; font-size: 0.95rem;">
                <p style="color: #cbd5e1; font-size: 1rem; margin-top: 0;">${greetingText}</p>
                
                <!-- Ticket details box -->
                <div style="background-color: rgba(255,255,255,0.02); border: 1px solid #1e293b; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
                  <h3 style="color: #818cf8; margin: 0 0 1rem 0; font-size: 0.9rem; font-weight: 800; letter-spacing: 0.05em; text-transform: uppercase;">Reservation Details</h3>
                  <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem; color: #cbd5e1;">
                    <tr>
                      <td style="padding: 0.5rem 0; color: #64748b; font-weight: 600; width: 120px;">Workspace</td>
                      <td style="padding: 0.5rem 0; color: #ffffff; font-weight: 700;">${booking.slot.name}</td>
                    </tr>
                    <tr>
                      <td style="padding: 0.5rem 0; color: #64748b; font-weight: 600;">Campus</td>
                      <td style="padding: 0.5rem 0; color: #ffffff; font-weight: 700;">${booking.slot.campus.name}</td>
                    </tr>
                    <tr>
                      <td style="padding: 0.5rem 0; color: #64748b; font-weight: 600;">Date</td>
                      <td style="padding: 0.5rem 0; color: #ffffff; font-weight: 700;">${new Date(booking.startTime).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    </tr>
                    <tr>
                      <td style="padding: 0.5rem 0; color: #64748b; font-weight: 600;">Time Slot</td>
                      <td style="padding: 0.5rem 0; color: #ffffff; font-weight: 700;">
                        ${new Date(booking.startTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })} to 
                        ${new Date(booking.endTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 0.5rem 0; color: #64748b; font-weight: 600;">Seat / Pass</td>
                      <td style="padding: 0.5rem 0; color: #a5b4fc; font-weight: 800;">Seat ${t.attendeeIndex || 1}</td>
                    </tr>
                  </table>
                </div>

                <!-- Ticket Code Banner -->
                <div style="text-align: center; margin: 2rem 0; background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(99, 102, 241, 0.02) 100%); border: 1.5px dashed rgba(99, 102, 241, 0.3); border-radius: 12px; padding: 1.5rem;">
                  <span style="color: #64748b; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; display: block; margin-bottom: 0.5rem;">YOUR ACCESS CODE</span>
                  <strong style="color: #ffffff; font-family: monospace; font-size: 2rem; letter-spacing: 0.2em; font-weight: 800; display: block;">${t.code}</strong>
                </div>

                <!-- Check in instructions -->
                <div style="border-left: 3px solid #6366f1; padding-left: 1rem; margin: 2rem 0; color: #94a3b8; font-size: 0.85rem;">
                  <h4 style="color: #ffffff; margin: 0 0 0.5rem 0; font-size: 0.9rem; font-weight: 700;">Self Check-in at Reception</h4>
                  <ol style="margin: 0; padding-left: 1.2rem; line-height: 1.5;">
                    <li>Keep your Ticket Code <strong>${t.code}</strong> ready when arriving.</li>
                    <li>Scan the <strong>Front Desk QR Code</strong> displayed at reception.</li>
                    <li>Enter your code on the mobile check-in portal to unlock your pass.</li>
                  </ol>
                </div>

                <!-- Action Button -->
                <div style="text-align: center; margin-top: 2.5rem;">
                  <a href="${walletPassUrl}" style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: #ffffff; text-decoration: none; border-radius: 10px; padding: 0.85rem 2rem; font-size: 0.9rem; font-weight: 700; display: inline-block; box-shadow: 0 4px 12px rgba(99,102,241,0.25);">
                    View Pass in Digital Wallet
                  </a>
                </div>
              </div>

              <!-- Footer -->
              <div style="background-color: #080c14; padding: 1.5rem; text-align: center; border-top: 1px solid #1e293b; font-size: 0.75rem; color: #475569;">
                <p style="margin: 0 0 0.25rem 0;">LivBizz Coworking Workspaces</p>
                <p style="margin: 0;">This is an automated confirmation pass. Please do not reply to this email.</p>
              </div>
            </div>
          `;
          
          return sendEmail({
            to: t.email!,
            subject: isGuest 
              ? `Your LivBizz Workspace Access Pass from ${booking.user.name}` 
              : 'Your LivBizz Booking is Confirmed!',
            html: emailHtml,
          }).then(success => {
            if (!success) {
              console.error(`Deferred email send returned false for code ${t.code} to ${t.email}`);
            }
          }).catch(err => {
            console.error(`Deferred email send error for code ${t.code} to ${t.email}:`, err);
          });
        });

      if (emailPromises.length > 0) {
        Promise.allSettled(emailPromises).then((results) => {
          console.log(`Background email dispatch completed for booking ${booking.id}. Details:`, results);
        });
      }

      // Fetch tickets (createMany doesn't return rows)
      const tickets = await prisma.ticket.findMany({
        where: { bookingId: booking.id },
        // Order by createdAt so we don't depend on prisma client being regenerated for attendeeIndex
        orderBy: { createdAt: 'asc' },
        select: { code: true, validFrom: true, validUntil: true },
      });

      invalidateCache('admin:stats');
      invalidateCache(`dashboard:bookings:${booking.userId}`);
      invalidateCache(`dashboard:stats:${booking.userId}`);

      return NextResponse.json({
        message: 'Booking approved and tickets generated.',
        status: updatedBooking.status,
        tickets: tickets.map((t, idx) => ({
          attendeeIndex: idx + 1,
          code: t.code,
          validFrom: t.validFrom.toISOString(),
          validUntil: t.validUntil.toISOString(),
        })),
      });
    }

    if (action === 'reject') {
      if (booking.status !== 'PENDING') {
        return NextResponse.json(
          { error: 'Only pending bookings can be rejected' },
          { status: 400 }
        );
      }

      const updated = await prisma.booking.update({
        where: { id: bookingId },
        data: {
          status: 'REJECTED',
          adminNotes: adminNotes || null,
          reviewedBy: adminId,
          reviewedAt: new Date(),
        },
      });

      // Log administrative action
      await createAuditLog({
        action: 'BOOKING_REJECTED',
        userId: adminId,
        targetId: bookingId,
        targetType: 'BOOKING',
        changes: { status: 'REJECTED', adminNotes: adminNotes || null },
        ipAddress: req.headers.get('x-forwarded-for') || undefined,
      });

      invalidateCache('admin:stats');
      invalidateCache(`dashboard:bookings:${booking.userId}`);
      invalidateCache(`dashboard:stats:${booking.userId}`);

      return NextResponse.json({
        message: 'Booking rejected.',
        status: updated.status,
      });
    }

    if (action === 'cancel') {
      if (['CANCELLED', 'REJECTED'].includes(booking.status)) {
        return NextResponse.json(
          { error: 'This booking is already cancelled or rejected' },
          { status: 400 }
        );
      }

      await prisma.$transaction([
        prisma.booking.update({
          where: { id: bookingId },
          data: {
            status: 'CANCELLED',
            adminNotes: adminNotes || null,
            reviewedBy: adminId,
            reviewedAt: new Date(),
          },
        }),
        prisma.ticket.updateMany({
          where: { bookingId, status: 'VALID' },
          data: { status: 'REVOKED' },
        }),
      ]);

      // Log administrative action
      await createAuditLog({
        action: 'BOOKING_CANCELLED',
        userId: adminId,
        targetId: bookingId,
        targetType: 'BOOKING',
        changes: { status: 'CANCELLED', adminNotes: adminNotes || null },
        ipAddress: req.headers.get('x-forwarded-for') || undefined,
      });

      invalidateCache('admin:stats');
      invalidateCache(`dashboard:bookings:${booking.userId}`);
      invalidateCache(`dashboard:stats:${booking.userId}`);

      return NextResponse.json({ message: 'Booking cancelled.', status: 'CANCELLED' });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('Admin Bookings PATCH Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const role = (session.user as unknown as { role: string }).role;
    if (role !== 'SUPER_ADMIN' && role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { bookingId, startTime, endTime, totalPrice, seats, seatIds, notes, adminNotes } = body;

    // Validate string field lengths
    if (notes !== undefined && typeof notes === 'string' && notes.length > 1000) {
      return NextResponse.json({ error: 'Notes must be 1000 characters or less.' }, { status: 400 });
    }
    if (adminNotes !== undefined && typeof adminNotes === 'string' && adminNotes.length > 1000) {
      return NextResponse.json({ error: 'Admin notes must be 1000 characters or less.' }, { status: 400 });
    }

    if (!bookingId) {
      return NextResponse.json({ error: 'bookingId is required' }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (startTime) updateData.startTime = new Date(startTime);
    if (endTime) updateData.endTime = new Date(endTime);
    if (totalPrice !== undefined) updateData.totalPrice = parseFloat(totalPrice);
    if (seats !== undefined) updateData.seats = parseInt(seats, 10);
    if (seatIds !== undefined) {
      updateData.seatIds = Array.isArray(seatIds) 
        ? seatIds 
        : typeof seatIds === 'string' 
        ? seatIds.split(',').map(s => s.trim()).filter(Boolean)
        : [];
    }
    if (notes !== undefined) updateData.notes = notes;
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: updateData,
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        slot: { include: { campus: { select: { name: true } } } },
        tickets: true,
      }
    });

    // Log administrative action
    const adminId = (session.user as unknown as { id: string }).id;
    await createAuditLog({
      action: 'BOOKING_UPDATED',
      userId: adminId,
      targetId: bookingId,
      targetType: 'BOOKING',
      changes: updateData,
      ipAddress: req.headers.get('x-forwarded-for') || undefined,
    });

    invalidateCache('admin:stats');
    invalidateCache(`dashboard:bookings:${updatedBooking.userId}`);
    invalidateCache(`dashboard:stats:${updatedBooking.userId}`);

    return NextResponse.json({
      message: 'Booking details updated successfully.',
      booking: updatedBooking,
    });
  } catch (error) {
    console.error('Admin Bookings PUT Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
