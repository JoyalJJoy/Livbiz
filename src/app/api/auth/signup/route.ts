import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import {
  isValidEmail,
  normalizeEmail,
  normalizeIndianPhone,
} from '@/lib/validation';
import { withRequestContext } from '@/lib/logger';
import crypto from 'crypto';
import { sendEmail } from '@/lib/email';
import { getRequestOrigin } from '@/lib/request';
import {
  PASSWORD_RESET_TOKEN_TTL_MS,
  createPasswordResetToken,
  getPasswordResetIdentifier,
  hashPasswordResetToken,
} from '@/lib/password-reset';

function buildPasswordSetupEmail(name: string, resetUrl: string) {
  const safeName = name || 'there';
  return `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #0f172a; line-height: 1.6;">
      <h1 style="font-size: 24px; margin-bottom: 12px;">Set a password for your new LivBizz account</h1>
      <p>Hi ${safeName},</p>
      <p>Welcome to LivBizz! Your client account has been created successfully.</p>
      <p>Please click the link below to set a secure password for your account so you can log in later:</p>
      <p>
        <a href="${resetUrl}" style="display: inline-block; background: #0f172a; color: #ffffff; text-decoration: none; padding: 12px 18px; border-radius: 8px; font-weight: 700;">
          Set password
        </a>
      </p>
      <p>This link expires in 1 hour.</p>
      <p style="font-size: 12px; color: #64748b;">${resetUrl}</p>
    </div>
  `;
}

// Zod schema for signup validation
const signupSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
  email: z.string().email('Invalid email format'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Za-z]/, 'Password must contain at least one letter')
    .regex(/\d/, 'Password must contain at least one number')
    .optional(),
  phone: z.string().regex(/^\d{10}$/, 'Phone must be 10 digits').optional(),
  idType: z.enum(['AADHAAR', 'PAN']).optional(),
  idNumber: z.string().optional(),
  sendSetupLink: z.boolean().optional(),
});

export async function POST(req: Request) {
  const log = withRequestContext(req);
  try {
    const body = await req.json();
    
    // Validate input with Zod
    const validation = signupSchema.safeParse(body);
    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors;
      return NextResponse.json(
        { error: 'Validation failed', details: errors },
        { status: 400 }
      );
    }

    const { firstName, lastName, email, password, phone, idType, idNumber } = validation.data;
    const normalizedName = `${firstName.trim()} ${lastName.trim()}`;
    const normalizedEmail = normalizeEmail(email);
    const normalizedPhone = normalizeIndianPhone(phone || '');

    // Validate idType and idNumber if provided
    if (idType && idNumber) {
      if (idType === 'AADHAAR' && !/^\d{12}$/.test(idNumber)) {
        return NextResponse.json(
          { error: 'Aadhaar number must be exactly 12 digits.' },
          { status: 400 }
        );
      }
      if (idType === 'PAN' && !/^[A-Z]{5}\d{4}[A-Z]$/.test(idNumber)) {
        return NextResponse.json(
          { error: 'PAN must match the format: 5 letters, 4 digits, 1 letter (e.g., ABCDE1234F).' },
          { status: 400 }
        );
      }
    }

    if (!isValidEmail(normalizedEmail)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'A user with this email already exists.' },
        { status: 400 }
      );
    }

    // Hash password (generate random secure password if password not provided)
    const rawPassword = password || crypto.randomBytes(16).toString('hex');
    const passwordHash = await bcrypt.hash(rawPassword, 10);

    // Save user inside PostgreSQL
    const user = await prisma.user.create({
      data: {
        name: normalizedName,
        firstName,
        lastName,
        email: normalizedEmail,
        phone: normalizedPhone || null,
        idType: idType || null,
        idNumber: idNumber || null,
        passwordHash,
        role: 'CLIENT',
      },
    });

    // If passwordless registration or sendSetupLink is true, automatically trigger a password reset/set setup link
    if (!password || body.sendSetupLink) {
      const token = createPasswordResetToken();
      const tokenHash = hashPasswordResetToken(token);
      const identifier = getPasswordResetIdentifier(normalizedEmail);
      const expires = new Date(Date.now() + PASSWORD_RESET_TOKEN_TTL_MS);

      await prisma.verificationToken.create({
        data: {
          identifier,
          token: tokenHash,
          expires,
        },
      });

      const resetUrl = `${getRequestOrigin(req)}/reset-password?token=${encodeURIComponent(token)}`;
      await sendEmail({
        to: normalizedEmail,
        subject: 'Set a password for your new LivBizz account',
        html: buildPasswordSetupEmail(normalizedName, resetUrl),
      });
    }

    log.info('User signed up successfully', {
      data: {
        userId: user.id,
        email: normalizedEmail,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Account created successfully!',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (error) {
    log.error('Signup error', { error });
    return NextResponse.json(
      { error: 'Internal server error. Please try again.' },
      { status: 500 }
    );
  }
}
