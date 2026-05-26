'use client';

import React, { useState, useEffect } from 'react';
import { ClipboardList, Clock, CheckCircle2, DollarSign, Users, Ticket, Loader2 } from 'lucide-react';
import styles from './page.module.css';

interface Stats {
  totalBookings: number;
  pendingBookings: number;
  approvedBookings: number;
  totalRevenue: number;
  totalUsers: number;
  activeTickets: number;
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

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, bookingsRes] = await Promise.all([
          fetch('/api/admin/stats'),
          fetch('/api/admin/bookings?limit=5'),
        ]);

        if (statsRes.ok) {
          setStats(await statsRes.json());
        }
        if (bookingsRes.ok) {
          const data = await bookingsRes.json();
          setRecentBookings(data.bookings || []);
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

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h1 className={styles.title}>Admin Dashboard</h1>
        <p className={styles.subtitle}>Overview of your coworking space operations</p>
      </div>

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
