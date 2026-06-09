'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSupabaseAuth } from '@/components/SupabaseAuthProvider';
import Link from 'next/link';
import { Home, Calendar, Settings, Plus, ChevronDown, LogOut, User, Shield } from 'lucide-react';
import styles from './layout.module.css';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, session, isLoading, signOut } = useSupabaseAuth();

  // Avatar Dropdown state
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Protected route session checker
  useEffect(() => {
    if (!session && !isLoading) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [session, isLoading, router, pathname]);

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
        <div style={{ color: '#0f172a', fontWeight: 700, fontSize: '1.25rem' }}>Authenticating...</div>
      </div>
    );
  }

  if (!session && !isLoading) {
    return null; // Prevents flash of protected layout while routing
  }

  // Get user name and avatar initials
  const userName = user?.name || 'Client';
  const userInitials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Left sidebar menu configuration
  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'My Bookings', path: '/dashboard/bookings', icon: Calendar },
    { name: 'Settings', path: '/dashboard/settings', icon: Settings },
  ];

  const role = user?.role;
  if (role === 'SUPER_ADMIN' || role === 'ADMIN') {
    menuItems.push({ name: 'Admin Panel', path: '/admin', icon: Shield });
  }

  return (
    <div className={styles.dashboardWrapper}>
      
      {/* 1. TOP HEADER NAVIGATION BAR */}
      <header className={styles.topNavbar}>
        
        {/* Brand Logo Display */}
        <div className={styles.logoArea} onClick={() => router.push('/')}>
          <span className={styles.logoText}>
            livbiz<span className={styles.logoDot}>.</span>
          </span>
        </div>

        {/* Dynamic Nav Actions */}
        <div className={styles.topRightActions}>
          
          {/* Create booking button link */}
          <button className={styles.createBookingBtn} onClick={() => router.push('/book')}>
            <Plus size={16} />
            <span>Create booking</span>
          </button>

          {/* User Profile dropdown */}
          <div className={styles.userProfileDropdown} onClick={() => setDropdownOpen(!dropdownOpen)}>
            <div className={styles.userAvatar}>
              {userInitials}
            </div>
            <span className={styles.userName}>{userName}</span>
            <span className={styles.dropdownArrow}>
              <ChevronDown size={14} />
            </span>

            {/* Collapsible Dropdown list */}
            {dropdownOpen && (
              <div className={styles.dropdownMenu} onMouseLeave={() => setDropdownOpen(false)}>
                <button className={styles.dropdownItem} onClick={() => router.push('/dashboard/settings')}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <User size={14} />
                    <span>Settings</span>
                  </div>
                </button>
                
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

      {/* 2. BODY SPLIT SIDEBAR AREA */}
      <div className={styles.dashboardBody}>
        
        {/* Left Navigation Sidebar */}
        <aside className={styles.sidebar}>
          <ul className={styles.sidebarMenu}>
            {menuItems.map((item) => {
              const isActive = pathname === item.path;
              const Icon = item.icon;
              
              return (
                <li 
                  key={item.path} 
                  className={`${styles.menuItem} ${isActive ? styles.menuItemActive : ''}`}
                >
                  <Link href={item.path} className={styles.menuLink}>
                    <Icon size={18} />
                    <span>{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </aside>

        {/* Dynamic main body wrapper */}
        <main className={styles.mainContentArea}>
          {children}
        </main>

      </div>

    </div>
  );
}
