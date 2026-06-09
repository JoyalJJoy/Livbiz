import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createSupabaseAdminClient, createSupabaseServerClient } from '@/lib/supabase/server';
import {
  isValidEmail,
  normalizeEmail,
  normalizeIndianPhone,
  validatePasswordStrength,
} from '@/lib/validation';

// GET User profile details
export async function GET() {
  try {
    const session = await getSession();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as unknown as { id: string }).id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        idType: true,
        idNumber: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Settings GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT Update user profile or password
export async function PUT(req: Request) {
  try {
    const session = await getSession();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as unknown as { id: string }).id;
    const body = await req.json();
    const { action } = body;

    if (action === 'update_profile') {
      const { firstName, lastName, email, phone, idType, idNumber } = body;

      // Validate field lengths
      if (typeof firstName === 'string' && firstName.length > 100) {
        return NextResponse.json({ error: 'First name must be 100 characters or less.' }, { status: 400 });
      }
      if (typeof lastName === 'string' && lastName.length > 100) {
        return NextResponse.json({ error: 'Last name must be 100 characters or less.' }, { status: 400 });
      }

      const normalizedEmail = normalizeEmail(email);
      const normalizedPhone = normalizeIndianPhone(phone);
      const trimmedFirstName = typeof firstName === 'string' ? firstName.trim() : '';
      const trimmedLastName = typeof lastName === 'string' ? lastName.trim() : '';

      if (!trimmedFirstName || !trimmedLastName || !normalizedEmail) {
        return NextResponse.json({ error: 'First name, last name, and email are required.' }, { status: 400 });
      }

      if (!isValidEmail(normalizedEmail)) {
        return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
      }

      if (phone && !/^[6-9]\d{9}$/.test(normalizedPhone)) {
        return NextResponse.json(
          { error: 'Invalid phone number format. Must be a 10-digit Indian mobile number.' },
          { status: 400 }
        );
      }

      // Validate idType and idNumber if provided
      if (idType) {
        if (idType !== 'AADHAAR' && idType !== 'PAN') {
          return NextResponse.json(
            { error: 'ID type must be either AADHAAR or PAN.' },
            { status: 400 }
          );
        }

        if (idNumber) {
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
      }

      // Check if email already in use by another user
      const existingUser = await prisma.user.findUnique({
        where: { email: normalizedEmail },
        select: { id: true },
      });

      if (existingUser && existingUser.id !== userId) {
        return NextResponse.json({ error: 'Email address is already in use.' }, { status: 400 });
      }

      const normalizedName = `${trimmedFirstName} ${trimmedLastName}`;

      const supabaseAdmin = await createSupabaseAdminClient();
      const { error: authUpdateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        email: normalizedEmail,
        user_metadata: {
          name: normalizedName,
          firstName: trimmedFirstName,
          lastName: trimmedLastName,
        },
      });

      if (authUpdateError) {
        return NextResponse.json(
          { error: authUpdateError.message || 'Could not update authentication profile.' },
          { status: 400 }
        );
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          name: normalizedName,
          firstName: trimmedFirstName,
          lastName: trimmedLastName,
          email: normalizedEmail,
          phone: normalizedPhone || null,
          idType: idType || null,
          idNumber: idNumber || null,
        },
        select: {
          name: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          idType: true,
          idNumber: true,
        },
      });

      return NextResponse.json({
        message: 'Profile updated successfully',
        user: {
          name: updatedUser.name,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          email: updatedUser.email,
          phone: updatedUser.phone,
          idType: updatedUser.idType,
          idNumber: updatedUser.idNumber,
        },
      });
    }

    if (action === 'update_password') {
      const { currentPassword, newPassword } = body;
      const passwordError = validatePasswordStrength(newPassword);

      if (!currentPassword || !newPassword) {
        return NextResponse.json({ error: 'All password fields are required.' }, { status: 400 });
      }

      if (passwordError) {
        return NextResponse.json({ error: passwordError }, { status: 400 });
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true },
      });

      if (!user) {
        return NextResponse.json({ error: 'User not found.' }, { status: 404 });
      }

      const supabase = await createSupabaseServerClient();
      const { data: verifiedSession, error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (verifyError || verifiedSession.user?.id !== userId) {
        return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 400 });
      }

      const supabaseAdmin = await createSupabaseAdminClient();
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        password: newPassword,
      });

      if (updateError) {
        return NextResponse.json(
          { error: updateError.message || 'Failed to update password.' },
          { status: 400 }
        );
      }

      return NextResponse.json({ message: 'Password updated successfully' });
    }

    return NextResponse.json({ error: 'Invalid action parameter.' }, { status: 400 });
  } catch (error) {
    console.error('Settings PUT Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
