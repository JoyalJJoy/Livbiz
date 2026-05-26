'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import styles from './Navbar.module.css';

export default function NavbarAccountButton() {
  const { data: session, status } = useSession();
  const role = (session?.user as { role?: string } | undefined)?.role;
  const dashboardLink = (role === 'SUPER_ADMIN' || role === 'ADMIN') ? '/admin' : '/dashboard';

  // While loading, still show the button pointing to login (avoids layout shift)
  if (status === 'loading') {
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
