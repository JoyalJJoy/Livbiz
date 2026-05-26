'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { LayoutDashboard, ClipboardList, ScanLine, ChevronDown, LogOut, Users } from 'lucide-react';
import styles from './layout.module.css';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?redirect=/admin');
    }
    if (status === 'authenticated') {
      const role = (session?.user as unknown as { role?: string })?.role;
      if (role !== 'SUPER_ADMIN' && role !== 'ADMIN') {
        router.push('/dashboard');
      }
    }
  }, [status, session, router]);

  if (status === 'loading') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <div style={{ color: '#0f172a', fontWeight: 700, fontSize: '1.25rem' }}>Loading Admin Panel...</div>
      </div>
    );
  }

  const role = (session?.user as unknown as { role?: string })?.role;
  if (status === 'unauthenticated' || (role !== 'SUPER_ADMIN' && role !== 'ADMIN')) {
    return null;
  }

  const userName = session?.user?.name || 'Admin';
  const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Bookings', path: '/admin/bookings', icon: ClipboardList },
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Verify Pass', path: '/admin/verify', icon: ScanLine },
  ];

  return (
    <div className={styles.adminWrapper}>
      <header className={styles.topNavbar}>
        <div className={styles.logoArea} onClick={() => router.push('/admin')}>
          <span className={styles.logoText}>livbiz<span className={styles.logoDot}>.</span></span>
          <span className={styles.adminBadge}>Admin</span>
        </div>

        <div className={styles.topRightActions}>
          <div className={styles.userProfileDropdown} onClick={() => setDropdownOpen(!dropdownOpen)}>
            <div className={styles.userAvatar}>{userInitials}</div>
            <span className={styles.userName}>{userName}</span>
            <span className={styles.dropdownArrow}><ChevronDown size={14} /></span>

            {dropdownOpen && (
              <div className={styles.dropdownMenu} onMouseLeave={() => setDropdownOpen(false)}>
                <button className={styles.dropdownItem} onClick={() => signOut({ callbackUrl: '/' })}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444' }}>
                    <LogOut size={14} />
                    <span>Sign out</span>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className={styles.adminBody}>
        <aside className={styles.sidebar}>
          <ul className={styles.sidebarMenu}>
            {menuItems.map((item) => {
              const isActive = pathname === item.path;
              const Icon = item.icon;
              return (
                <li key={item.path} className={`${styles.menuItem} ${isActive ? styles.menuItemActive : ''}`}>
                  <Link href={item.path} className={styles.menuLink}>
                    <Icon size={18} />
                    <span>{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </aside>

        <main className={styles.mainContentArea}>
          {children}
        </main>
      </div>
    </div>
  );
}
