'use client';

import React, { useState, useEffect } from 'react';
import { ClipboardList, Clock, CheckCircle2, DollarSign, Users, Ticket, Loader2, History, BarChart2, CheckSquare } from 'lucide-react';
import Link from 'next/link';
import styles from './page.module.css';

interface Stats {
  totalBookings: number;
  pendingBookings: number;
  approvedBookings: number;
  totalRevenue: number;
  totalUsers: number;
  activeTickets: number;
  dayPassCount: number;
  meetingRoomCount: number;
  checkinsToday: number;
}

interface RecentBooking {
  id: string;
  userName: string;
  userEmail: string;
  slotName: string;
  slotType: string;
  totalPrice: number;
  status: string;
  createdAt: string;
}

interface AuditLog {
  id: string;
  action: string;
  userName: string;
  targetType: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [recentActivity, setRecentActivity] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, bookingsRes, activityRes] = await Promise.all([
          fetch('/api/admin/stats'),
          fetch('/api/admin/bookings?limit=5'),
          fetch('/api/admin/audit-logs?page=1&limit=5'),
        ]);

        if (statsRes.ok) {
          setStats(await statsRes.json());
        }
        if (bookingsRes.ok) {
          const data = await bookingsRes.json();
          setRecentBookings(data.bookings || []);
        }
        if (activityRes.ok) {
          const data = await activityRes.json();
          setRecentActivity(data.logs || []);
        }
      } catch (err) {
        console.error('Failed to fetch admin data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className={styles.loadingState}>
        <Loader2 className="animate-spin" size={28} />
        <span>Loading dashboard...</span>
      </div>
    );
  }

  const cards = [
    { label: 'Total Bookings', value: stats?.totalBookings ?? 0, icon: ClipboardList, color: '#6366f1', bg: '#eef2ff' },
    { label: 'Pending Requests', value: stats?.pendingBookings ?? 0, icon: Clock, color: '#f59e0b', bg: '#fffbeb' },
    { label: 'Approved', value: stats?.approvedBookings ?? 0, icon: CheckCircle2, color: '#22c55e', bg: '#f0fdf4' },
    { label: 'Total Revenue', value: `₹${(stats?.totalRevenue ?? 0).toLocaleString()}`, icon: DollarSign, color: '#0ea5e9', bg: '#f0f9ff' },
    { label: 'Total Users', value: stats?.totalUsers ?? 0, icon: Users, color: '#8b5cf6', bg: '#faf5ff' },
    { label: 'Active Passes', value: stats?.activeTickets ?? 0, icon: Ticket, color: '#ec4899', bg: '#fdf2f8' },
  ];

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'PENDING': return styles.statusPending;
      case 'APPROVED': return styles.statusApproved;
      case 'REJECTED': return styles.statusRejected;
      case 'CANCELLED': return styles.statusCancelled;
      default: return '';
    }
  };

  const formatActivityAction = (action: string) => {
    return action
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b[a-z]/g, (char) => char.toUpperCase());
  };

  // Compute stats details
  const totalShares = (stats?.dayPassCount ?? 0) + (stats?.meetingRoomCount ?? 0);
  const dayPassPercent = totalShares > 0 ? Math.round(((stats?.dayPassCount ?? 0) / totalShares) * 100) : 0;
  const meetingRoomPercent = totalShares > 0 ? Math.round(((stats?.meetingRoomCount ?? 0) / totalShares) * 100) : 0;

  // Occupancy rate calculation
  const activeTicketsCount = stats?.activeTickets ?? 0;
  const checkinsTodayCount = stats?.checkinsToday ?? 0;
  const occupancyPercent = activeTicketsCount > 0 ? Math.min(100, Math.round((checkinsTodayCount / activeTicketsCount) * 100)) : 0;

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h1 className={styles.title}>Admin Dashboard</h1>
        <p className={styles.subtitle}>Overview of your coworking space operations</p>
      </div>

      {/* Primary KPI Metrics grid */}
      <div className={styles.cardsGrid}>
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className={styles.statCard}>
              <div className={styles.statIconBox} style={{ backgroundColor: card.bg, color: card.color }}>
                <Icon size={22} />
              </div>
              <div className={styles.statInfo}>
                <div className={styles.statValue}>{card.value}</div>
                <div className={styles.statLabel}>{card.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Advanced Analytics Grid */}
      <div className={styles.analyticsGrid}>
        
        {/* CSS Chart: Booking Distribution */}
        <div className={styles.analyticsCard}>
          <div className={styles.analyticsCardHeader}>
            <BarChart2 size={18} className={styles.cardHeaderIcon} />
            <h3 className={styles.analyticsCardTitle}>Booking Type Breakdown</h3>
          </div>
          <p className={styles.analyticsCardDesc}>Percentage distribution of approved bookings by workspace category</p>
          <div className={styles.chartContainer}>
            <div className={styles.chartRow}>
              <div className={styles.chartLabel}>Day Passes ({stats?.dayPassCount ?? 0})</div>
              <div className={styles.progressBarWrapper}>
                <div className={styles.progressBar} style={{ width: `${dayPassPercent}%`, backgroundColor: '#6366f1' }}></div>
                <span className={styles.progressBarValue}>{dayPassPercent}%</span>
              </div>
            </div>
            <div className={styles.chartRow}>
              <div className={styles.chartLabel}>Meeting Rooms ({stats?.meetingRoomCount ?? 0})</div>
              <div className={styles.progressBarWrapper}>
                <div className={styles.progressBar} style={{ width: `${meetingRoomPercent}%`, backgroundColor: '#ec4899' }}></div>
                <span className={styles.progressBarValue}>{meetingRoomPercent}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Space Occupancy Indicator */}
        <div className={styles.analyticsCard}>
          <div className={styles.analyticsCardHeader}>
            <CheckSquare size={18} className={styles.cardHeaderIcon} />
            <h3 className={styles.analyticsCardTitle}>Today&apos;s Entry & Occupancy</h3>
          </div>
          <p className={styles.analyticsCardDesc}>Visits tracked today against active validation passes</p>
          <div className={styles.occupancyContent}>
            <div className={styles.occupancyDisplay}>
              <span className={styles.occupancyBigNum}>{checkinsTodayCount}</span>
              <span className={styles.occupancyDivider}>/</span>
              <span className={styles.occupancySubNum}>{activeTicketsCount}</span>
            </div>
            <div className={styles.occupancyMeter}>
              <div className={styles.occupancyFill} style={{ width: `${occupancyPercent}%` }}></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>
              <span>Check-ins Today</span>
              <span>{occupancyPercent}% Validated</span>
            </div>
          </div>
        </div>

        {/* Live System Activity Feed */}
        <div className={styles.analyticsCard}>
          <div className={styles.analyticsCardHeader}>
            <History size={18} className={styles.cardHeaderIcon} />
            <h3 className={styles.analyticsCardTitle}>Live System Activity</h3>
          </div>
          <p className={styles.analyticsCardDesc}>Most recent actions taken across system resources</p>
          
          <div className={styles.activityList}>
            {recentActivity.length === 0 ? (
              <div className={styles.emptyActivity}>No system logs recorded.</div>
            ) : (
              recentActivity.map((log) => (
                <div key={log.id} className={styles.activityItem}>
                  <div className={styles.activityDot}></div>
                  <div className={styles.activityDetails}>
                    <div className={styles.activityText}>
                      <strong>{log.userName}</strong> performed <strong>{formatActivityAction(log.action)}</strong> on {log.targetType}
                    </div>
                    <div className={styles.activityTime}>
                      {new Date(log.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <Link href="/admin/audit-logs" className={styles.viewAllLogsLink}>
            View All Audit Logs →
          </Link>
        </div>

      </div>

      <div className={styles.tableSection}>
        <h2 className={styles.tableTitle}>Recent Bookings</h2>
        {recentBookings.length === 0 ? (
          <p className={styles.emptyText}>No bookings yet.</p>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((b) => (
                  <tr key={b.id}>
                    <td>
                      <div className={styles.userCell}>
                        <span className={styles.userName}>{b.userName}</span>
                        <span className={styles.userEmail}>{b.userEmail}</span>
                      </div>
                    </td>
                    <td><span className={styles.typeBadge}>{b.slotName}</span></td>
                    <td className={styles.amountCell}>₹{Number(b.totalPrice).toLocaleString()}</td>
                    <td><span className={`${styles.statusPill} ${getStatusClass(b.status)}`}>{b.status.toLowerCase()}</span></td>
                    <td className={styles.dateCell}>{new Date(b.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
