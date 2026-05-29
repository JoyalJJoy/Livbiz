import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { isRateLimited } from '@/lib/rate-limiter';
import { getClientIp } from '@/lib/request';
import {
  getEmailFromPasswordResetIdentifier,
  hashPasswordResetToken,
} from '@/lib/password-reset';
import { validatePasswordStrength } from '@/lib/validation';
import { withRequestContext } from '@/lib/logger';

async function findPasswordResetToken(token: string) {
  if (!token || token.length < 32 || token.length > 256) {
    return null;
  }

  const tokenHash = hashPasswordResetToken(token);
  const record = await prisma.verificationToken.findUnique({
    where: { token: tokenHash },
  });

  if (!record) {
    return null;
  }

  const email = getEmailFromPasswordResetIdentifier(record.identifier);
  if (!email) {
    return null;
  }

  if (record.expires <= new Date()) {
    await prisma.verificationToken.deleteMany({
      where: { token: tokenHash },
    });
    return null;
  }

  return { record, email };
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token')?.trim() || '';
    const resetToken = await findPasswordResetToken(token);

    return NextResponse.json(
      { valid: Boolean(resetToken) },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    console.error('Reset token validation error:', error);
    return NextResponse.json({ valid: false }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const log = withRequestContext(req);
  try {
    const ip = getClientIp(req);
    const rateLimit = isRateLimited(`reset-password:ip:${ip}`, 10);

    if (rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many reset attempts. Please try again in a minute.' },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => null);
    const token = typeof body?.token === 'string' ? body.token.trim() : '';
    const password = body?.password;
    const passwordError = validatePasswordStrength(password);

    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 });
    }

    const resetToken = await findPasswordResetToken(token);
    if (!resetToken) {
      return NextResponse.json(
        { error: 'This password recovery link is invalid or has expired.' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: resetToken.email },
      select: { id: true },
    });

    if (!user) {
      await prisma.verificationToken.deleteMany({
        where: { identifier: resetToken.record.identifier },
      });
      return NextResponse.json(
        { error: 'This password recovery link is invalid or has expired.' },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password as string, 10);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { passwordHash },
      }),
      prisma.verificationToken.deleteMany({
        where: { identifier: resetToken.record.identifier },
      }),
    ]);

    log.info('Password reset successful', {
      data: {
        email: resetToken.email,
        userId: user.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Your password has been reset. You can sign in with the new password.',
    });
  } catch (error) {
    log.error('Reset password error', { error });
    return NextResponse.json({ error: 'Internal server error. Please try again.' }, { status: 500 });
  }
}
