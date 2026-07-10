import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import { isRateLimited } from '@/lib/rate-limiter';
import { getClientIp } from '@/lib/request';
import { isValidEmail, normalizeEmail } from '@/lib/validation';
import { withRequestContext } from '@/lib/logger';
import { createSupabaseAdminClient } from '@/lib/supabase/server';

const GENERIC_RESET_MESSAGE =
  'If a client account exists for that email, password recovery instructions have been sent.';

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function buildPasswordResetEmail(name: string, resetUrl: string) {
  const safeName = escapeHtml(name || 'there');
  const safeUrl = escapeHtml(resetUrl);

  return `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #0f172a; line-height: 1.6;">
      <h1 style="font-size: 24px; margin-bottom: 12px;">Reset your LivBizz password</h1>
      <p>Hi ${safeName},</p>
      <p>We received a request to reset the password for your LivBizz client account.</p>
      <p>
        <a href="${safeUrl}" style="display: inline-block; background: #0f172a; color: #ffffff; text-decoration: none; padding: 12px 18px; border-radius: 8px; font-weight: 700;">
          Set a new password
        </a>
      </p>
      <p>This link expires in 1 hour. If you did not request this, you can ignore this email.</p>
      <p style="font-size: 12px; color: #64748b;">${safeUrl}</p>
    </div>
  `;
}

export async function POST(req: Request) {
  const log = withRequestContext(req);
  try {
    const ip = getClientIp(req);
    const ipLimit = isRateLimited(`forgot-password:ip:${ip}`, 5);

    if (ipLimit.limited) {
      return NextResponse.json(
        { error: 'Too many password recovery attempts. Please try again in a minute.' },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => null);
    const email = normalizeEmail((body as { email?: unknown } | null)?.email);

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
    }

    const emailLimit = isRateLimited(`forgot-password:email:${email}`, 3);
    if (emailLimit.limited) {
      return NextResponse.json(
        { error: 'Too many recovery emails requested. Please try again shortly.' },
        { status: 429 }
      );
    }

    // Check if user exists in our profile table
    const user = await prisma.user.findUnique({
      where: { email },
      select: { email: true, name: true },
    });

    if (!user) {
      // Return generic message to prevent email enumeration
      return NextResponse.json({ success: true, message: GENERIC_RESET_MESSAGE });
    }

    const { origin } = new URL(req.url);
    const callbackUrl = `${origin}/api/auth/callback?next=/reset-password`;

    // Generate Supabase's signed recovery URL, then send it with our template.
    const supabaseAdmin = await createSupabaseAdminClient();
    const { data: resetData, error: resetError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: user.email,
      options: {
        redirectTo: callbackUrl,
      },
    });

    const resetUrl = resetData.properties?.action_link;

    if (resetError || !resetUrl) {
      log.error('Supabase password reset generation failed', { error: resetError });
      // Still return generic message
      return NextResponse.json({ success: true, message: GENERIC_RESET_MESSAGE });
    }

    const emailSent = await sendEmail({
      to: user.email,
      subject: 'Reset your LivBizz password',
      html: buildPasswordResetEmail(user.name, resetUrl),
    });

    log.info('Forgot password email sent', {
      data: {
        email: user.email,
        emailSent,
      },
    });

    const response: {
      success: boolean;
      message: string;
      devResetUrl?: string;
    } = {
      success: true,
      message: GENERIC_RESET_MESSAGE,
    };

    if (!emailSent && process.env.NODE_ENV !== 'production') {
      response.devResetUrl = resetUrl;
    }

    return NextResponse.json(response);
  } catch (error) {
    log.error('Forgot password error', { error });
    return NextResponse.json({ error: 'Internal server error. Please try again.' }, { status: 500 });
  }
}
