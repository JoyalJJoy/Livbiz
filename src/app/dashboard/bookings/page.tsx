'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { MapPin, Calendar, Clock, QrCode, X, AlertTriangle, Plus, Loader2 } from 'lucide-react';
import Image from 'next/image';
import styles from './bookings.module.css';

interface Ticket {
  id: string;
  code: string;
  qrData: string;
  status: string;
  validFrom: string;
  validUntil: string;
  attendeeIndex: number | null;
  recipientName: string | null;
  recipientEmail: string | null;
  sentAt: string | null;
}

interface Booking {
  id: string;
  slotName: string;
  slotType: 'DAY_PASS' | 'MEETING_ROOM';
  campusName: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'EXPIRED';
  tickets?: Ticket[];
}

export default function BookingsPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Modal active state
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [activeTicketIndex, setActiveTicketIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Fetch bookings list on mount/session update
  const fetchBookings = async (showLoadingOverlay = false) => {
    try {
      if (showLoadingOverlay) {
        setLoading(true);
      }
      const res = await fetch('/api/dashboard/bookings');
      if (res.ok) {
        const data = await res.json();
        setBookings(data.bookings || data);
      } else {
        setErrorMsg('Failed to load bookings list.');
      }
    } catch {
      setErrorMsg('Network error loading bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user) {
      Promise.resolve().then(() => {
        fetchBookings();
      });
    }
  }, [session]);

  // Cancel Booking
  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    try {
      const res = await fetch('/api/dashboard/bookings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, action: 'cancel' }),
      });

      if (res.ok) {
        // Refresh bookings local list
        fetchBookings();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to cancel booking.');
      }
    } catch {
      alert('Error updating booking status.');
    }
  };

  // Open modal for QR Ticket access
  const openAccessKeyModal = (booking: Booking) => {
    setSelectedBooking(booking);
    setActiveTicketIndex(0);
    setCopiedCode(null);
    setModalOpen(true);
  };

  // Date Formatting Helper
  const formatDateTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDateOnly = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTimeOnly = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', gap: '1rem', minHeight: '300px', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 className="animate-spin" size={24} style={{ color: '#4f46e5' }} />
        <span style={{ fontWeight: 600, color: '#475569' }}>Loading your booking history...</span>
      </div>
    );
  }

  return (
    <div className={styles.bookingsWrapper}>
      
      {/* 1. TOP HEADER ACTION ROW */}
      <div className={styles.headerSection}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>My Bookings</h1>
          <p className={styles.subtitle}>View your upcoming reservations, access space keys, or check history details.</p>
        </div>

        <button className={styles.newBookingBtn} onClick={() => router.push('/book')}>
          <Plus size={16} />
          <span>New booking</span>
        </button>
      </div>

      {/* 2. DYNAMIC BOOKINGS VIEW */}
      {errorMsg && (
        <div style={{ padding: '1rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', color: '#b91c1c', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertTriangle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {bookings.length === 0 ? (
        <div className={styles.emptyState}>
          <Calendar size={48} style={{ strokeWidth: 1.2, color: '#94a3b8' }} />
          <h2 className={styles.emptyTitle}>No bookings found</h2>
          <p className={styles.emptyDesc}>
            You haven&apos;t booked any meeting rooms or day passes yet. Select a workspace to get started!
          </p>
          <button className={styles.newBookingBtn} onClick={() => router.push('/book')} style={{ marginTop: '0.5rem' }}>
            Book a Workspace
          </button>
        </div>
      ) : (
        <div className={styles.bookingsList}>
          {bookings.map((booking) => (
            <div key={booking.id} className={styles.bookingCard}>
              
              {/* Left Column info */}
              <div className={styles.leftInfo}>
                <div className={styles.topRow}>
                  <h3 className={styles.slotName}>{booking.slotName}</h3>
                  <span
                    className={`${styles.typeBadge} ${
                      booking.slotType === 'DAY_PASS' ? styles.typeDayPass : styles.typeMeetingRoom
                    }`}
                  >
                    {booking.slotType === 'DAY_PASS' ? 'Day Pass' : 'Meeting Room'}
                  </span>
                </div>

                <p className={styles.campusName}>
                  <MapPin size={15} style={{ color: '#ef4444' }} />
                  <span>{booking.campusName}</span>
                </p>

                <div className={styles.timeRow}>
                  <span className={styles.timeItem}>
                    <Calendar size={14} />
                    <span>{formatDateOnly(booking.startTime)}</span>
                  </span>
                  <span className={styles.timeItem}>
                    <Clock size={14} />
                    <span>
                      {formatTimeOnly(booking.startTime)} &ndash; {formatTimeOnly(booking.endTime)}
                    </span>
                  </span>
                </div>
              </div>

              {/* Right Column Action items */}
              <div className={styles.rightActions}>
                <span className={styles.price}>
                  &#8377;{Number(booking.totalPrice).toFixed(2)}
                </span>
                
                <span className={`${styles.statusPill} ${styles[`status${booking.status}`] || ''}`}>
                  {booking.status.toLowerCase()}
                </span>

                {/* APPROVED spaces get an access pass QR key */}
                {booking.status === 'APPROVED' && (
                  <button className={styles.viewKeyBtn} onClick={() => openAccessKeyModal(booking)}>
                    <QrCode size={14} />
                    <span>View Access Pass</span>
                  </button>
                )}

                {/* PENDING spaces can be cancelled */}
                {booking.status === 'PENDING' && (
                  <button className={styles.cancelBtn} onClick={() => handleCancelBooking(booking.id)}>
                    Cancel booking
                  </button>
                )}
              </div>

            </div>
          ))}
        </div>
      )}

      {/* 3. ACCESS KEY MODAL OVERLAY */}
      {modalOpen && selectedBooking && (() => {
        const activeTicket = selectedBooking.tickets?.[activeTicketIndex] || selectedBooking.tickets?.[0];
        const isMultiTicket = selectedBooking.tickets && selectedBooking.tickets.length > 1;

        const handleCopyShareLink = (codeStr: string) => {
          const shareUrl = `${window.location.origin}/tickets/${codeStr}`;
          navigator.clipboard.writeText(shareUrl);
          setCopiedCode(codeStr);
          setTimeout(() => setCopiedCode(null), 2000);
        };

        return (
          <div className={styles.modalOverlay} onClick={() => setModalOpen(false)}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              
              <button className={styles.closeModalBtn} onClick={() => setModalOpen(false)}>
                <X size={20} />
              </button>

              <div className={styles.modalHeader}>
                <h2 className={styles.modalTitle}>Workspace Access Pass</h2>
                <p className={styles.modalSubtitle}>Scan at entrance gate or enter code at reception self-desk.</p>
              </div>

              {/* Multi ticket selector tabs */}
              {isMultiTicket && selectedBooking.tickets && (
                <div className={styles.ticketTabsList}>
                  {selectedBooking.tickets.map((t, idx) => (
                    <button
                      key={t.id}
                      className={`${styles.ticketTabBtn} ${activeTicketIndex === idx ? styles.ticketTabActive : ''}`}
                      onClick={() => setActiveTicketIndex(idx)}
                    >
                      Seat {t.attendeeIndex || (idx + 1)}
                    </button>
                  ))}
                </div>
              )}

              {/* QR Code Image from Ticket */}
              <div className={styles.qrContainer}>
                {activeTicket?.qrData ? (
                  <Image 
                    src={activeTicket.qrData} 
                    alt="Access Pass QR Code" 
                    width={180} 
                    height={180} 
                    style={{ borderRadius: '8px' }}
                    unoptimized
                  />
                ) : (
                  <div style={{ width: 180, height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f1f5f9', borderRadius: '8px', color: '#64748b', fontWeight: 600, fontSize: '0.85rem' }}>
                    QR Code Pending
                  </div>
                )}
              </div>

              {/* Generated pass Reference Code */}
              <div className={styles.ticketCodeDisplay}>
                {activeTicket?.code || `PASS-${selectedBooking.id.slice(-6).toUpperCase()}`}
              </div>

              {/* Share Ticket pass button */}
              {activeTicket?.code && (
                <button
                  onClick={() => handleCopyShareLink(activeTicket.code)}
                  className={`${styles.shareTicketBtn} ${copiedCode === activeTicket.code ? styles.shareTicketBtnCopied : ''}`}
                >
                  {copiedCode === activeTicket.code ? 'Link Copied! ✓' : 'Copy Pass Share Link 🔗'}
                </button>
              )}

              {/* Specific Booking details inside Overlay */}
              <div className={styles.modalDetailsList}>
                <div className={styles.modalDetailItem}>
                  <span className={styles.modalDetailLabel}>Attendee</span>
                  <span className={styles.modalDetailValue}>
                    {activeTicket?.recipientName || session?.user?.name || 'Coworker'}
                  </span>
                </div>
                {activeTicket?.recipientEmail && (
                  <div className={styles.modalDetailItem}>
                    <span className={styles.modalDetailLabel}>Guest Email</span>
                    <span className={styles.modalDetailValue} style={{ fontSize: '0.8rem' }}>{activeTicket.recipientEmail}</span>
                  </div>
                )}
                <div className={styles.modalDetailItem}>
                  <span className={styles.modalDetailLabel}>Space Resource</span>
                  <span className={styles.modalDetailValue}>{selectedBooking.slotName}</span>
                </div>
                <div className={styles.modalDetailItem}>
                  <span className={styles.modalDetailLabel}>Campus</span>
                  <span className={styles.modalDetailValue}>{selectedBooking.campusName}</span>
                </div>
                <div className={styles.modalDetailItem}>
                  <span className={styles.modalDetailLabel}>Valid From</span>
                  <span className={styles.modalDetailValue}>{formatDateTime(selectedBooking.startTime)}</span>
                </div>
                <div className={styles.modalDetailItem}>
                  <span className={styles.modalDetailLabel}>Valid Until</span>
                  <span className={styles.modalDetailValue}>{formatDateTime(selectedBooking.endTime)}</span>
                </div>
              </div>

            </div>
          </div>
        );
      })()}

    </div>
  );
}
