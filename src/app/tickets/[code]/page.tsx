import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import QRCode from 'qrcode';
import { MapPin, Calendar, Clock, User, QrCode, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';
import styles from './tickets.module.css';

interface TicketPageProps {
  params: Promise<{ code: string }>;
}

export default async function TicketWalletPage({ params }: TicketPageProps) {
  const { code } = await params;
  const cleanCode = code.trim().toUpperCase();

  // Retrieve ticket from database
  const ticket = await prisma.ticket.findUnique({
    where: { code: cleanCode },
    include: {
      booking: {
        include: {
          user: { select: { name: true, email: true } },
          slot: { include: { campus: { select: { name: true, address: true } } } },
        },
      },
    },
  });

  if (!ticket) {
    notFound();
  }

  let qrDataUrl = '';
  
  // High efficiency check: If ticket already has pre-computed QR data URL from DB, leverage it!
  if (ticket.qrData && ticket.qrData.startsWith('data:image')) {
    qrDataUrl = ticket.qrData;
  } else {
    // Dynamic fallback generation (only for legacy/manually seeded rows missing QR strings)
    const qrPayload = JSON.stringify({
      code: ticket.code,
      bookingId: ticket.bookingId,
      attendeeIndex: ticket.attendeeIndex,
      validFrom: ticket.validFrom.toISOString(),
      validUntil: ticket.validUntil.toISOString(),
    });

    try {
      qrDataUrl = await QRCode.toDataURL(qrPayload, {
        width: 300,
        margin: 2,
        color: { dark: '#0f172a', light: '#ffffff' },
      });
    } catch (err) {
      console.error('Failed to generate fallback QR code on server:', err);
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Determine ticket status badge classes
  let statusLabel = 'Active';
  let statusClass = styles.statusValid;
  if (ticket.status === 'USED') {
    statusLabel = 'Used';
    statusClass = styles.statusUsed;
  } else if (ticket.status === 'REVOKED') {
    statusLabel = 'Cancelled';
    statusClass = styles.statusRevoked;
  } else if (ticket.booking.status !== 'APPROVED') {
    statusLabel = 'Pending Review';
    statusClass = styles.statusPending;
  }

  return (
    <div className={styles.container}>
      <div className={styles.glowBg}></div>
      <div className={styles.glowBg2}></div>

      <div className={styles.wrapper}>
        {/* Pass Top Banner */}
        <div className={styles.topBar}>
          <Link href="/" className={styles.brand}>
            <span>LIVBIZ</span>
          </Link>
          <div className={`${styles.statusBadge} ${statusClass}`}>
            <span className={styles.pulseDot}></span>
            <span>{statusLabel}</span>
          </div>
        </div>

        {/* Digital Wallet Pass */}
        <div className={styles.passCard}>
          {/* Card Head */}
          <div className={styles.cardHeader}>
            <div className={styles.cardHeaderLeft}>
              <span className={styles.passType}>
                {ticket.booking.slot.type === 'DAY_PASS' ? 'DAY PASS' : 'CONFERENCE PASS'}
              </span>
              <h2 className={styles.roomName}>{ticket.booking.slot.name}</h2>
            </div>
            <div className={styles.seatBadge}>
              <span>SEAT</span>
              <strong>{ticket.attendeeIndex || 1}</strong>
            </div>
          </div>

          {/* Dotted Divider */}
          <div className={styles.divider}>
            <div className={styles.leftCutout}></div>
            <div className={styles.dashedLine}></div>
            <div className={styles.rightCutout}></div>
          </div>

          {/* Card Body */}
          <div className={styles.cardBody}>
            {/* QR Code Container */}
            <div className={styles.qrWrapper}>
              {qrDataUrl && ticket.status !== 'REVOKED' ? (
                <div className={styles.qrBox}>
                  <img src={qrDataUrl} alt="Access QR Code Pass" className={styles.qrImage} />
                  {ticket.status === 'USED' && (
                    <div className={styles.qrOverlay}>
                      <ShieldCheck size={36} className={styles.usedIcon} />
                      <span>CHECKED IN</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className={styles.qrPlaceholder}>
                  <span>Pass Suspended</span>
                </div>
              )}
              <span className={styles.codeText}>{ticket.code}</span>
            </div>

            {/* Grid Information */}
            <div className={styles.gridDetails}>
              <div className={styles.detailBlock}>
                <span className={styles.blockLabel}>ATTENDEE</span>
                <span className={styles.blockVal}>
                  <User size={12} className={styles.inlineIcon} />
                  {ticket.recipientName || ticket.booking.user.name}
                </span>
              </div>

              <div className={styles.detailBlock}>
                <span className={styles.blockLabel}>DATE</span>
                <span className={styles.blockVal}>
                  <Calendar size={12} className={styles.inlineIcon} />
                  {formatDate(ticket.validFrom)}
                </span>
              </div>

              <div className={styles.detailBlock} style={{ gridColumn: 'span 2' }}>
                <span className={styles.blockLabel}>VALIDITY TIME</span>
                <span className={styles.blockVal}>
                  <Clock size={12} className={styles.inlineIcon} />
                  {formatTime(ticket.validFrom)} &ndash; {formatTime(ticket.validUntil)}
                </span>
              </div>

              <div className={styles.detailBlock} style={{ gridColumn: 'span 2' }}>
                <span className={styles.blockLabel}>LOCATION</span>
                <span className={styles.blockVal} style={{ whiteSpace: 'normal', fontSize: '0.8rem' }}>
                  <MapPin size={12} className={styles.inlineIcon} style={{ color: '#ef4444' }} />
                  <strong>{ticket.booking.slot.campus.name}</strong> &bull; {ticket.booking.slot.campus.address}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button Links */}
        <div className={styles.actionCard}>
          <div className={styles.actionIcon}>
            <QrCode size={24} style={{ color: '#818cf8' }} />
          </div>
          <div className={styles.actionInfo}>
            <h4>Ready to Check-in?</h4>
            <p>Scan the Desk QR code at the entrance reception and click below to complete validation.</p>
          </div>
          <Link href="/checkin" className={styles.checkinLink}>
            <span>Go to Check-in</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* User Help */}
        <div className={styles.help}>
          <HelpCircle size={14} />
          <span>Need help? Show this ticket pass to reception staff upon arrival.</span>
        </div>
      </div>
    </div>
  );
}
