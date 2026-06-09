'use client';

import { useSupabaseAuth } from '@/components/SupabaseAuthProvider';
import Link from 'next/link';
import styles from './Navbar.module.css';

export default function NavbarAccountButton() {
  const { user, session, isLoading } = useSupabaseAuth();
  const role = user?.role;
  const dashboardLink = (role === 'SUPER_ADMIN' || role === 'ADMIN') ? '/admin' : '/dashboard';

  // While loading, still show the button pointing to login (avoids layout shift)
  if (isLoading) {
    return (
      <Link href="/login" className={styles.accountButton}>
        My Account
      </Link>
    );
  }

  return session ? (
    <Link href={dashboardLink} className={styles.accountButton}>
      My Account
    </Link>
  ) : (
    <Link href="/login" className={styles.accountButton}>
      My Account
    </Link>
  );
}
