import { NextResponse } from 'next/server';
import { isRateLimited } from '@/lib/rate-limiter';
import { getClientIp } from '@/lib/request';
import { validatePasswordStrength } from '@/lib/validation';
import { withRequestContext } from '@/lib/logger';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    // Supabase validates the recovery link in /api/auth/callback, which
    // exchanges the code for a short-lived authenticated recovery session.
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    return NextResponse.json(
      { valid: Boolean(user) },
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

    if (rateLimit.limited) {
      return NextResponse.json(
        { error: 'Too many reset attempts. Please try again in a minute.' },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => null);
    const password = body?.password;
    const passwordError = validatePasswordStrength(password);

    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 });
    }

    // Update the user's password via Supabase Auth
    const supabase = await createSupabaseServerClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'This password recovery link is invalid or has expired.' },
        { status: 400 }
      );
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: password as string,
    });

    if (updateError) {
      log.error('Password update failed', { error: updateError });
      return NextResponse.json(
        { error: updateError.message || 'Failed to update password.' },
        { status: 400 }
      );
    }

    log.info('Password reset successful', {
      data: {
        userId: user.id,
        email: user.email,
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
