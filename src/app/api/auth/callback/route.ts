import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

/**
 * GET /api/auth/callback
 *
 * Handles the OAuth / email-confirmation / password-reset callback from Supabase.
 * Exchanges the auth code for a session, then redirects to the appropriate page.
 */
export async function GET(request: Request) {
  try {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const next = searchParams.get('next') ?? '/dashboard';

    if (code) {
      const supabase = await createSupabaseServerClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (!error) {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }

    // If there's no code or exchange failed, redirect to login with error
    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
  } catch {
    // On unexpected errors, still redirect to login rather than crashing
    const { origin } = new URL(request.url);
    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
  }
}
