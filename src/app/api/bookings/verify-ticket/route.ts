import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createAuditLog } from '@/lib/audit';
import { isRateLimited } from '@/lib/rate-limiter';

export async function POST(req: Request) {
  try {
    // 1. IP-based Rate Limiting (Max 10 check-in attempts per minute)
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
    const rateLimit = isRateLimited(ip, 10);
    if (rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many check-in attempts. Please try again in 1 minute.' },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': String(rateLimit.limit),
            'X-RateLimit-Remaining': String(rateLimit.remaining),
          }
        }
      );
    }

    const { code } = await req.json();

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Ticket code is required' }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();

    // 2. Strict Alphanumeric Format Validation (Exactly 8 Alphanumeric chars)
    const codeRegex = /^[A-Z0-9]{8}$/;
    if (!codeRegex.test(cleanCode)) {
      return NextResponse.json({
        valid: false,
        error: 'Invalid ticket code format. Pass codes must be exactly 8 alphanumeric characters.',
      }, { status: 400 });
    }

    const ticket = await prisma.ticket.findUnique({
      where: { code: cleanCode },
      include: {
        booking: {
          include: {
            user: { select: { name: true, email: true } },
            slot: { include: { campus: { select: { name: true } } } },
          },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json({
        valid: false,
        error: 'Ticket code not found. Please check the code and try again.',
      }, { status: 404 });
    }

    if (ticket.booking.status !== 'APPROVED') {
      return NextResponse.json({
        valid: false,
        error: 'This booking has not been approved by the administrator yet.',
      }, { status: 400 });
    }

    if (ticket.status === 'USED') {
      const checkinTime = ticket.usedAt 
        ? new Date(ticket.usedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
        : 'earlier today';
      return NextResponse.json({
        valid: false,
        error: `This pass was already scanned and used at ${checkinTime}.`,
      }, { status: 400 });
    }

    if (ticket.status === 'REVOKED') {
      return NextResponse.json({
        valid: false,
        error: 'This pass has been cancelled/revoked.',
      }, { status: 400 });
    }

    if (ticket.status !== 'VALID') {
      return NextResponse.json({
        valid: false,
        error: `This ticket is inactive. Status: ${ticket.status}`,
      }, { status: 400 });
    }

    const now = new Date();
    // 15 minutes early buffer
    const earlyBuffer = 15 * 60 * 1000;
    const validFromWithBuffer = new Date(ticket.validFrom.getTime() - earlyBuffer);
    
    if (now < validFromWithBuffer) {
      const startTimeStr = ticket.validFrom.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
      return NextResponse.json({
        valid: false,
        error: `You are too early! This pass becomes active at ${startTimeStr} (15-min early arrival allowed).`,
      }, { status: 400 });
    }

    // 15 minutes late buffer
    const lateBuffer = 15 * 60 * 1000;
    const validUntilWithBuffer = new Date(ticket.validUntil.getTime() + lateBuffer);

    if (now > validUntilWithBuffer) {
      return NextResponse.json({
        valid: false,
        error: `This pass expired at ${ticket.validUntil.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}. Entry denied.`,
      }, { status: 400 });
    }

    // Mark the ticket as USED in database
    const updatedTicket = await prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        status: 'USED',
        usedAt: now,
        scannedBy: 'CLIENT_SELF_DESK',
      },
    });

    // Log check-in action
    await createAuditLog({
      action: 'TICKET_VERIFIED_SELF',
      userId: null,
      targetId: ticket.id,
      targetType: 'TICKET',
      changes: { status: 'USED', scannedBy: 'CLIENT_SELF_DESK' },
      ipAddress: ip,
    });

    return NextResponse.json({
      valid: true,
      message: 'Check-in successful! Welcome to the space.',
      booking: {
        attendeeName: ticket.recipientName || ticket.booking.user.name,
        slotName: ticket.booking.slot.name,
        slotType: ticket.booking.slot.type,
        campusName: ticket.booking.slot.campus.name,
        startTime: ticket.booking.startTime.toISOString(),
        endTime: ticket.booking.endTime.toISOString(),
      },
      ticket: {
        code: updatedTicket.code,
        verifiedAt: now.toISOString(),
      },
    });
  } catch (error) {
    console.error('Verify Public Ticket Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
