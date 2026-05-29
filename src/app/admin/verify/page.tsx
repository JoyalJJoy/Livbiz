'use client';

import React, { useState, useEffect } from 'react';
import { ScanLine, CheckCircle2, XCircle, Loader2, User, Calendar, Clock, MapPin } from 'lucide-react';
import Image from 'next/image';
import styles from './verify.module.css';

interface VerifyResult {
  valid: boolean;
  message?: string;
  error?: string;
  booking?: {
    userName: string;
    userEmail: string;
    userPhone: string | null;
    slotName: string;
    slotType: string;
    campusName: string;
    startTime: string;
    endTime: string;
    totalPrice: number;
  };
  ticket?: {
    code: string;
    validFrom: string;
    validUntil: string;
    verifiedAt: string;
  };
}

export default function VerifyPassPage() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerifyResult | null>(null);
  
  const [deskQrUrl, setDeskQrUrl] = useState('');
  const [deskUrl, setDeskUrl] = useState('');

  useEffect(() => {
    const fetchDeskQr = async () => {
      try {
        const res = await fetch('/api/admin/desk-qr');
        if (res.ok) {
          const data = await res.json();
          setDeskQrUrl(data.qrDataUrl);
          setDeskUrl(data.checkinUrl);
        }
      } catch (err) {
        console.error('Failed to load desk QR:', err);
      }
    };
    fetchDeskQr();
  }, []);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() }),
      });

      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ valid: false, error: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const formatTime = (d: string) => new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h1 className={styles.title}>Verify Access Pass</h1>
        <p className={styles.subtitle}>Scan or enter ticket codes to verify guest bookings.</p>
      </div>

      <div className={styles.gridContainer}>
        {/* Left Column: Manual Check-in */}
        <div className={styles.verifyCard}>
          <div className={styles.scanIcon}>
            <ScanLine size={48} strokeWidth={1.5} />
          </div>

          <form onSubmit={handleVerify} className={styles.form}>
            <input
              type="text"
              className={styles.codeInput}
              placeholder="Enter ticket code (e.g. ABCD1234)"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              maxLength={12}
              autoFocus
            />
            <button type="submit" className={styles.verifyBtn} disabled={loading || !code.trim()}>
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <ScanLine size={18} />
                  <span>Verify Pass</span>
                </>
              )}
            </button>
          </form>

          <p className={styles.hint}>
            Scan the guest QR ticket using your scanner or camera, or type the code here
          </p>
        </div>

        {/* Right Column: Reception Desk Self-Checkin QR */}
        <div className={styles.qrCard}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Front Desk QR Code</h2>
          <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0, lineHeight: 1.4 }}>
            Ask guests to scan this QR code on arrival to open the check-in portal on their mobile device.
          </p>
          
          <div className={styles.qrBox}>
            {deskQrUrl ? (
              <Image src={deskQrUrl} alt="Desk QR" width={170} height={170} unoptimized />
            ) : (
              <div style={{ width: 170, height: 170, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600 }}>
                Generating QR...
              </div>
            )}
          </div>
          
          {deskUrl && (
            <span className={styles.qrLink}>{deskUrl}</span>
          )}
        </div>
      </div>

      {/* Result Card */}
      {result && (
        <div className={`${styles.resultCard} ${result.valid ? styles.resultSuccess : styles.resultError}`}>
          <div className={styles.resultHeader}>
            {result.valid ? (
              <>
                <CheckCircle2 size={32} className={styles.successIcon} />
                <h2>Pass Verified ✓</h2>
                <p>{result.message}</p>
              </>
            ) : (
              <>
                <XCircle size={32} className={styles.errorIcon} />
                <h2>Verification Failed</h2>
                <p>{result.error}</p>
              </>
            )}
          </div>

          {result.valid && result.booking && (
            <div className={styles.resultDetails}>
              <div className={styles.detailRow}>
                <User size={16} />
                <span className={styles.detailLabel}>Visitor</span>
                <span className={styles.detailValue}>{result.booking.userName}</span>
              </div>
              <div className={styles.detailRow}>
                <MapPin size={16} />
                <span className={styles.detailLabel}>Space</span>
                <span className={styles.detailValue}>{result.booking.slotName} — {result.booking.campusName}</span>
              </div>
              <div className={styles.detailRow}>
                <Calendar size={16} />
                <span className={styles.detailLabel}>Date</span>
                <span className={styles.detailValue}>{formatDate(result.booking.startTime)}</span>
              </div>
              <div className={styles.detailRow}>
                <Clock size={16} />
                <span className={styles.detailLabel}>Time</span>
                <span className={styles.detailValue}>{formatTime(result.booking.startTime)} – {formatTime(result.booking.endTime)}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
