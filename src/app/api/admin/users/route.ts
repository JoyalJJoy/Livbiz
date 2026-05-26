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
          email: true,
          phone: true,
          role: true,
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
      email: u.email,
      phone: u.phone,
      role: u.role,
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
