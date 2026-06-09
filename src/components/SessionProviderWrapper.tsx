'use client';

import React from 'react';
import SupabaseAuthProvider from './SupabaseAuthProvider';

export default function SessionProviderWrapper({ children }: { children: React.ReactNode }) {
  return <SupabaseAuthProvider>{children}</SupabaseAuthProvider>;
}
