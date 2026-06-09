'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface SupabaseAuthContextValue {
  /** Profile with role — null when not authenticated */
  user: UserProfile | null;
  /** Raw Supabase session */
  session: Session | null;
  /** True while the initial session is being loaded */
  isLoading: boolean;
  /** Sign out and reload */
  signOut: () => Promise<void>;
}

const SupabaseAuthContext = createContext<SupabaseAuthContextValue>({
  user: null,
  session: null,
  isLoading: true,
  signOut: async () => {},
});

export function useSupabaseAuth() {
  return useContext(SupabaseAuthContext);
}

/**
 * Fetches the user profile (name, role) from the API.
 * We call our own endpoint instead of Prisma directly because
 * this runs in the browser.
 */
async function fetchUserProfile(authUser: SupabaseUser): Promise<UserProfile | null> {
  try {
    const res = await fetch('/api/auth/me', { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    return data.user ?? null;
  } catch {
    // Fallback: use the auth user's email and metadata
    return {
      id: authUser.id,
      email: authUser.email ?? '',
      name: authUser.user_metadata?.name ?? authUser.email ?? '',
      role: 'CLIENT',
    };
  }
}

export default function SupabaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createBrowserClient();

  // Load initial session
  useEffect(() => {
    const loadSession = async () => {
      const {
        data: { session: initialSession },
      } = await supabase.auth.getSession();

      setSession(initialSession);

      if (initialSession?.user) {
        const profile = await fetchUserProfile(initialSession.user);
        setUser(profile);
      }

      setIsLoading(false);
    };

    loadSession();

    // Listen for auth state changes (login, logout, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);

      if (newSession?.user) {
        const profile = await fetchUserProfile(newSession.user);
        setUser(profile);
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
  }, [supabase]);

  return (
    <SupabaseAuthContext.Provider value={{ user, session, isLoading, signOut: handleSignOut }}>
      {children}
    </SupabaseAuthContext.Provider>
  );
}
