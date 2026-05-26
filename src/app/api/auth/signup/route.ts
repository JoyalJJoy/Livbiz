import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import {
  isValidEmail,
  normalizeEmail,
  normalizeIndianPhone,
} from '@/lib/validation';

// Zod schema for signup validation
const signupSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
  email: z.string().email('Invalid email format'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Za-z]/, 'Password must contain at least one letter')
    .regex(/\d/, 'Password must contain at least one number'),
  phone: z.string().regex(/^\d{10}$/, 'Phone must be 10 digits').optional(),
  idType: z.enum(['AADHAAR', 'PAN']).optional(),
  idNumber: z.string().optional(),
});

export async function POST(req: Request) {
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

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

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
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error. Please try again.' },
      { status: 500 }
    );
  }
}
