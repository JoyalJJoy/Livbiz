'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSupabaseAuth } from '@/components/SupabaseAuthProvider';
import Link from 'next/link';
import Image from 'next/image';
import { LayoutDashboard, ClipboardList, ScanLine, ChevronDown, LogOut, Users, History } from 'lucide-react';
import styles from './layout.module.css';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, session, isLoading, signOut } = useSupabaseAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    if (!session && !isLoading) {
      router.push('/login?redirect=/admin');
    }
    if (!!session && !isLoading) {
      const role = user?.role;
      if (role !== 'SUPER_ADMIN' && role !== 'ADMIN') {
        router.push('/dashboard');
      }
    }
  }, [session, isLoading, user, router]);

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <div style={{ color: '#0f172a', fontWeight: 700, fontSize: '1.25rem' }}>Loading Admin Panel...</div>
      </div>
    );
  }

  const role = user?.role;
  if ((!session && !isLoading) || (role !== 'SUPER_ADMIN' && role !== 'ADMIN')) {
    return null;
  }

  const userName = user?.name || 'Admin';
  const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Bookings', path: '/admin/bookings', icon: ClipboardList },
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Verify Pass', path: '/admin/verify', icon: ScanLine },
    { name: 'Audit Logs', path: '/admin/audit-logs', icon: History },
  ];

  return (
    <div className={styles.adminWrapper}>
      <header className={styles.topNavbar}>
        <div className={styles.logoArea} onClick={() => router.push('/admin')}>
          <div className={styles.logoContainer}>
            <Image 
              src="/images/logo.png" 
              alt="LivBizz emblem" 
              width={32}
              height={32}
              className={styles.logoImage}
            />
          </div>
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
                <button className={styles.dropdownItem} onClick={() => signOut().then(() => { window.location.href = '/'; })}>
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
