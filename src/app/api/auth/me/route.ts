import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

/**
 * GET /api/auth/me
 *
 * Returns the current user's profile (id, email, name, role).
 * Used by the SupabaseAuthProvider on the client to fetch the
 * user's role and display name after authentication.
 */
export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  return NextResponse.json({
    user: session.user,
  });
}
