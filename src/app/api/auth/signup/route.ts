import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import {
  isValidEmail,
  normalizeEmail,
} from '@/lib/validation';
import { withRequestContext } from '@/lib/logger';
import { createSupabaseAdminClient } from '@/lib/supabase/server';

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

    // Check if user already exists in our profile table
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

    // Create user in Supabase Auth
    const supabaseAdmin = await createSupabaseAdminClient();

    // Generate a random password if none provided
    const userPassword = password || (crypto.randomUUID() + 'Aa1!');

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: normalizedEmail,
      password: userPassword,
      email_confirm: true, // Auto-confirm since we handle email verification ourselves
      user_metadata: {
        name: normalizedName,
        firstName,
        lastName,
      },
    });

    if (authError || !authData.user) {
      log.error('Supabase auth user creation failed', { error: authError });
      return NextResponse.json(
        { error: authError?.message || 'Failed to create account.' },
        { status: 400 }
      );
    }

    // Create profile row in our database, using the Supabase Auth user ID
    const user = await prisma.user.create({
      data: {
        id: authData.user.id, // Use the Supabase auth UUID
        name: normalizedName,
        firstName,
        lastName,
        email: normalizedEmail,
        phone: phone || null,
        idType: idType || null,
        idNumber: idNumber || null,
        role: 'CLIENT',
      },
    });

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
