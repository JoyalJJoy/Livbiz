'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Calendar, Key, ArrowRight, Clock, MapPin, CreditCard, QrCode, CalendarDays } from 'lucide-react';
import Image from 'next/image';
import styles from './page.module.css';

interface DashboardStats {
  bookingsCount: number;
  ticketsCount: number;
  activePassesCount: number;
}

interface BookingItem {
  id: string;
  slotName: string;
  slotType: string;
  campusName: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  status: string;
  ticket: {
    code: string;
    qrData: string;
    status: string;
    validFrom: string;
    validUntil: string;
  } | null;
}

export default function DashboardPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats>({
    bookingsCount: 0,
    ticketsCount: 0,
    activePassesCount: 0,
  });
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, bookingsRes] = await Promise.all([
          fetch('/api/dashboard/stats'),
          fetch('/api/dashboard/bookings'),
        ]);

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }

        if (bookingsRes.ok) {
          const bookingsData = await bookingsRes.json();
          setBookings(bookingsData.bookings || []);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      } finally {
        setIsLoading(false);
      }
    }

    if (session?.user) {
      fetchData();
    }
  }, [session]);

  const userName = session?.user?.name || 'Client';

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return { bg: '#ecfdf5', color: '#059669', label: 'Approved' };
      case 'PENDING': return { bg: '#fffbeb', color: '#d97706', label: 'Pending' };
      case 'REJECTED': return { bg: '#fef2f2', color: '#dc2626', label: 'Rejected' };
      case 'CANCELLED': return { bg: '#f1f5f9', color: '#64748b', label: 'Cancelled' };
      default: return { bg: '#f1f5f9', color: '#64748b', label: status };
    }
  };

  // Separate upcoming from past
  const now = new Date();
  const upcomingBookings = bookings.filter(b => new Date(b.endTime) >= now && b.status !== 'CANCELLED' && b.status !== 'REJECTED');
  const recentBookings = bookings.filter(b => new Date(b.endTime) < now || b.status === 'CANCELLED' || b.status === 'REJECTED').slice(0, 3);

  return (
    <div className={styles.dashboardHome}>
      
      {/* 1. WELCOME BANNER */}
      <section className={styles.welcomeSection}>
        <h1 className={styles.welcomeTitle}>
          Hello, {userName}! <span className={styles.handWave}>👋</span>
        </h1>
        <p className={styles.welcomeSubtitle}>
          Welcome to your premium coworking dashboard. Manage your spaces, bookings, and access passes.
        </p>
      </section>

      {/* 2. STATS CARDS */}
      <section className={styles.statsGrid}>
        <div className={styles.statCard} onClick={() => router.push('/dashboard/bookings')} style={{ cursor: 'pointer' }}>
          <div className={styles.statIconWrapper}>
            <Calendar size={24} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Total Bookings</span>
            <span className={styles.statValue}>{isLoading ? '...' : stats.bookingsCount}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconWrapper} style={{ color: '#10b981', backgroundColor: '#ecfdf5' }}>
            <Key size={24} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Active Passes</span>
            <span className={styles.statValue}>{isLoading ? '...' : stats.activePassesCount}</span>
          </div>
        </div>
      </section>

      {/* 3. UPCOMING BOOKINGS */}
      {!isLoading && upcomingBookings.length > 0 && (
        <section className={styles.bookingsSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Upcoming Bookings</h2>
            <button className={styles.viewAllBtn} onClick={() => router.push('/dashboard/bookings')}>
              View All <ArrowRight size={16} />
            </button>
          </div>

          <div className={styles.bookingsGrid}>
            {upcomingBookings.map(booking => {
              const statusInfo = getStatusColor(booking.status);
              return (
                <div key={booking.id} className={styles.bookingCard}>
                  <div className={styles.bookingCardHeader}>
                    <div className={styles.bookingType}>
                      {booking.slotType === 'MEETING_ROOM' ? '🏢' : '💼'} {booking.slotName}
                    </div>
                    <span 
                      className={styles.statusPill}
                      style={{ backgroundColor: statusInfo.bg, color: statusInfo.color }}
                    >
                      {statusInfo.label}
                    </span>
                  </div>

                  <div className={styles.bookingDetails}>
                    <div className={styles.bookingDetail}>
                      <Calendar size={14} />
                      <span>{formatDate(booking.startTime)}</span>
                    </div>
                    <div className={styles.bookingDetail}>
                      <Clock size={14} />
                      <span>{formatTime(booking.startTime)} – {formatTime(booking.endTime)}</span>
                    </div>
                    <div className={styles.bookingDetail}>
                      <MapPin size={14} />
                      <span>{booking.campusName}</span>
                    </div>
                    <div className={styles.bookingDetail}>
                      <CreditCard size={14} />
                      <span>₹{booking.totalPrice} · Pay at desk</span>
                    </div>
                  </div>

                  {booking.ticket && booking.ticket.status === 'VALID' && (
                    <div className={styles.ticketSection}>
                      <div className={styles.qrContainer}>
                        <Image src={booking.ticket.qrData} alt="Access QR Code" className={styles.qrImage} width={180} height={180} unoptimized />
                      </div>
                      <div className={styles.ticketCode}>
                        <QrCode size={14} />
                        <span>Code: <strong>{booking.ticket.code}</strong></span>
                      </div>
                    </div>
                  )}

                  {booking.status === 'PENDING' && (
                    <div className={styles.pendingNotice}>
                      ⏳ Waiting for admin approval. You&apos;ll see your QR pass here once approved.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 4. RECENT/PAST BOOKINGS */}
      {!isLoading && recentBookings.length > 0 && (
        <section className={styles.bookingsSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Recent History</h2>
          </div>
          <div className={styles.historyList}>
            {recentBookings.map(booking => {
              const statusInfo = getStatusColor(booking.status);
              return (
                <div key={booking.id} className={styles.historyItem}>
                  <div className={styles.historyLeft}>
                    <span className={styles.historyName}>{booking.slotName}</span>
                    <span className={styles.historyDate}>{formatDate(booking.startTime)} · {booking.campusName}</span>
                  </div>
                  <div className={styles.historyRight}>
                    <span className={styles.historyPrice}>₹{booking.totalPrice}</span>
                    <span 
                      className={styles.statusPill}
                      style={{ backgroundColor: statusInfo.bg, color: statusInfo.color, fontSize: '0.7rem', padding: '0.2rem 0.6rem' }}
                    >
                      {statusInfo.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 5. EMPTY STATE */}
      {!isLoading && bookings.length === 0 && (
        <section className={styles.emptyStateCard}>
          <div className={styles.illustrationContainer}>
            <div className={styles.glowRing} />
            <div className={styles.iconWrapper}>
              <CalendarDays size={48} />
            </div>
          </div>
          <h2 className={styles.emptyTitle}>No bookings yet</h2>
          <p className={styles.emptyDescription}>
            Book a premium meeting room or day pass and it will show up here with your QR access pass.
          </p>
          <button className={styles.bookNowBtn} onClick={() => router.push('/book')}>
            <span>Book now</span>
            <ArrowRight size={18} />
          </button>
        </section>
      )}
    </div>
  );
}
