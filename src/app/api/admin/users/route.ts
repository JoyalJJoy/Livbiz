import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const role = (session.user as unknown as { role?: string }).role;
    if (role !== 'SUPER_ADMIN' && role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const filterRole = searchParams.get('role') || 'ALL';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
    const requestedLimit = parseInt(searchParams.get('limit') || '20', 10) || 20;
    const limit = Math.min(Math.max(1, requestedLimit), 100);
    const skip = (page - 1) * limit;

    const whereClause: Prisma.UserWhereInput = {};
    
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (filterRole !== 'ALL') {
      whereClause.role = filterRole;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          role: true,
          idType: true,
          idNumber: true,
          createdAt: true,
          _count: {
            select: { bookings: true },
          },
        },
      }),
      prisma.user.count({ where: whereClause }),
    ]);

    const userIds = users.map((u) => u.id);
    const spendingByUser = userIds.length
      ? await prisma.booking.groupBy({
          by: ['userId'],
          where: {
            userId: { in: userIds },
            status: 'APPROVED',
          },
          _sum: { totalPrice: true },
        })
      : [];

    const spendingLookup = new Map(
      spendingByUser.map((row) => [row.userId, Number(row._sum.totalPrice || 0)])
    );

    const formattedUsers = users.map(u => ({
      id: u.id,
      name: u.name,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      phone: u.phone,
      role: u.role,
      idType: u.idType,
      idNumber: u.idNumber,
      createdAt: u.createdAt.toISOString(),
      bookingsCount: u._count.bookings,
      totalSpent: spendingLookup.get(u.id) || 0,
    }));

    return NextResponse.json({
      success: true,
      data: formattedUsers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Admin Users API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentRole = (session.user as unknown as { role?: string }).role;
    if (currentRole !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Only SUPER_ADMIN can change roles' }, { status: 403 });
    }

    const { userId, role } = await req.json();

    if (!userId || !role) {
      return NextResponse.json({ error: 'Missing userId or role' }, { status: 400 });
    }

    if (!['CLIENT', 'ADMIN', 'SUPER_ADMIN'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, name: true, role: true },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Admin Users PATCH error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentRole = (session.user as unknown as { role?: string }).role;
    if (currentRole !== 'SUPER_ADMIN' && currentRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { userId, firstName, lastName, email, phone, idType, idNumber } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    if (!email || !firstName || !lastName) {
      return NextResponse.json({ error: 'First name, last name, and email are required.' }, { status: 400 });
    }

    let normalizedPhone: string | null = null;
    if (phone) {
      const cleaned = phone.replace(/\D/g, '');
      if (cleaned.length !== 10) {
        return NextResponse.json({ error: 'Phone number must be exactly 10 digits.' }, { status: 400 });
      }
      normalizedPhone = cleaned;
    }

    if (idType && idNumber) {
      if (idType === 'AADHAAR' && !/^\d{12}$/.test(idNumber.replace(/\s/g, ''))) {
        return NextResponse.json({ error: 'Aadhaar must be exactly 12 digits.' }, { status: 400 });
      }
      if (idType === 'PAN' && !/^[A-Z]{5}\d{4}[A-Z]$/.test(idNumber.trim())) {
        return NextResponse.json({ error: 'PAN must be in standard format (5 letters, 4 digits, 1 letter).' }, { status: 400 });
      }
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        email: email.toLowerCase().trim(),
        id: { not: userId }
      }
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Email address is already in use by another account.' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        name: `${firstName.trim()} ${lastName.trim()}`,
        email: email.toLowerCase().trim(),
        phone: normalizedPhone,
        idType: idType || null,
        idNumber: idNumber ? idNumber.trim() : null,
      }
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Admin Users PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
