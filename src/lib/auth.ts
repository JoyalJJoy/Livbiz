import { createSupabaseServerClient } from './supabase/server';
import { prisma } from './prisma';

/**
 * Supabase-based session helper.
 *
 * Returns a session object compatible with the old NextAuth shape so that
 * all downstream API routes and components can keep using `session.user.id`,
 * `session.user.role`, etc. without changes.
 *
 * Returns `null` when the request is not authenticated.
 */
export async function getSession(): Promise<{
  user: { id: string; email: string; name: string; role: string };
} | null> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    return null;
  }

  // Look up the profile row to get role and display name
  const profile = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { id: true, email: true, name: true, role: true },
  });

  if (!profile) {
    return null;
  }

  return {
    user: {
      id: profile.id,
      email: profile.email,
      name: profile.name,
      role: profile.role,
    },
  };
}
