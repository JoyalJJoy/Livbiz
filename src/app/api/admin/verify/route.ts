import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createAuditLog } from '@/lib/audit';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const role = (session.user as unknown as { role: string }).role;
    if (role !== 'SUPER_ADMIN' && role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { code } = await req.json();

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Ticket code is required' }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();

    const ticket = await prisma.ticket.findUnique({
      where: { code: cleanCode },
      include: {
        booking: {
          include: {
            user: { select: { name: true, email: true, phone: true } },
            slot: { include: { campus: { select: { name: true } } } },
          },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json({
        valid: false,
        error: 'Ticket not found. Please check the code and try again.',
      }, { status: 404 });
    }

    if (ticket.status === 'USED') {
      return NextResponse.json({
        valid: false,
        error: `This pass has already been used on ${ticket.usedAt?.toLocaleString() || 'a previous visit'}.`,
        ticket: {
          code: ticket.code,
          status: ticket.status,
          usedAt: ticket.usedAt?.toISOString(),
        },
      }, { status: 400 });
    }

    if (ticket.status === 'REVOKED') {
      return NextResponse.json({
        valid: false,
        error: 'This pass has been revoked. The associated booking was cancelled.',
      }, { status: 400 });
    }

    if (ticket.status !== 'VALID') {
      return NextResponse.json({
        valid: false,
        error: `Invalid ticket status: ${ticket.status}`,
      }, { status: 400 });
    }

    const now = new Date();
    if (now < ticket.validFrom) {
      return NextResponse.json({
        valid: false,
        error: `This pass is not valid yet. It is valid from ${ticket.validFrom.toLocaleString()}.`,
      }, { status: 400 });
    }

    if (now > ticket.validUntil) {
      return NextResponse.json({
        valid: false,
        error: `This pass has expired. It was valid until ${ticket.validUntil.toLocaleString()}.`,
      }, { status: 400 });
    }

    // Mark ticket as USED
    const adminId = (session.user as unknown as { id: string }).id;
    await prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        status: 'USED',
        usedAt: now,
        scannedBy: adminId,
      },
    });

    // Log administrative action
    await createAuditLog({
      action: 'TICKET_VERIFIED',
      userId: adminId,
      targetId: ticket.id,
      targetType: 'TICKET',
      changes: { status: 'USED', scannedBy: adminId },
      ipAddress: req.headers.get('x-forwarded-for') || undefined,
    });

    return NextResponse.json({
      valid: true,
      message: 'Pass verified successfully! Entry granted.',
      booking: {
        userName: ticket.booking.user.name,
        userEmail: ticket.booking.user.email,
        userPhone: ticket.booking.user.phone,
        slotName: ticket.booking.slot.name,
        slotType: ticket.booking.slot.type,
        campusName: ticket.booking.slot.campus.name,
        startTime: ticket.booking.startTime.toISOString(),
        endTime: ticket.booking.endTime.toISOString(),
        totalPrice: Number(ticket.booking.totalPrice),
      },
      ticket: {
        code: ticket.code,
        validFrom: ticket.validFrom.toISOString(),
        validUntil: ticket.validUntil.toISOString(),
        verifiedAt: now.toISOString(),
      },
    });
  } catch (error) {
    console.error('Verify Ticket Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
