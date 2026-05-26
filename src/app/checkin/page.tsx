'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ScanLine, CheckCircle2, XCircle, Loader2, Sparkles, MapPin, Calendar, Clock, User, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import styles from './checkin.module.css';

interface CheckinResult {
  valid: boolean;
  message?: string;
  error?: string;
  booking?: {
    attendeeName: string;
    slotName: string;
    slotType: string;
    campusName: string;
    startTime: string;
    endTime: string;
  };
  ticket?: {
    code: string;
    verifiedAt: string;
  };
}

export default function CheckinPage() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CheckinResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim().length !== 8) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/bookings/verify-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() }),
      });

      const data = await res.json();
      setResult(data);
    } catch {
      setResult({
        valid: false,
        error: 'Network connection error. Please verify your internet and try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCode('');
    setResult(null);
    setTimeout(() => {
      if (inputRef.current) inputRef.current.focus();
    }, 100);
  };

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

  return (
    <div className={styles.container}>
      <div className={styles.glowBg}></div>
      <div className={styles.glowBg2}></div>

      <div className={styles.wrapper}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.logoBadge}>
            <Sparkles size={16} className={styles.sparkleIcon} />
            <span>LIVBIZ DESK</span>
          </div>
          <h1 className={styles.title}>Self Check-in</h1>
          <p className={styles.subtitle}>Welcome! Enter your 8-digit access pass code to unlock entry.</p>
        </div>

        {/* Input Form Card */}
        {!result && (
          <div className={styles.card}>
            <div className={styles.iconCircle}>
              <ScanLine size={32} className={styles.scanIcon} />
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>TICKET PASS CODE</label>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="ABCD1234"
                  maxLength={8}
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className={styles.codeInput}
                  disabled={loading}
                  autoComplete="off"
                  spellCheck={false}
                />
                <span className={styles.inputHint}>Enter the 8-character code sent to your email or dashboard.</span>
              </div>

              <button
                type="submit"
                className={styles.submitBtn}
                disabled={loading || code.trim().length !== 8}
              >
                {loading ? (
                  <>
                    <Loader2 className={`${styles.spinner} animate-spin`} size={20} />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <span>Verify & Check In</span>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Results Card */}
        {result && (
          <div className={`${styles.card} ${result.valid ? styles.cardSuccess : styles.cardError}`}>
            <div className={styles.resultHeader}>
              {result.valid ? (
                <>
                  <div className={styles.successIconWrapper}>
                    <CheckCircle2 size={48} className={styles.successIcon} />
                  </div>
                  <h2 className={styles.resultTitle}>Access Granted ✓</h2>
                  <p className={styles.resultSubtitle}>{result.message}</p>
                </>
              ) : (
                <>
                  <div className={styles.errorIconWrapper}>
                    <XCircle size={48} className={styles.errorIcon} />
                  </div>
                  <h2 className={styles.resultTitle}>Verification Failed</h2>
                  <p className={styles.resultSubtitle}>{result.error}</p>
                </>
              )}
            </div>

            {result.valid && result.booking && (
              <div className={styles.bookingDetails}>
                <div className={styles.detailRow}>
                  <User size={16} className={styles.detailIcon} />
                  <span className={styles.detailLabel}>Guest Name</span>
                  <span className={styles.detailValue}>{result.booking.attendeeName}</span>
                </div>
                <div className={styles.detailRow}>
                  <MapPin size={16} className={styles.detailIcon} />
                  <span className={styles.detailLabel}>Workspace</span>
                  <span className={styles.detailValue}>
                    {result.booking.slotName} &bull; {result.booking.campusName}
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <Calendar size={16} className={styles.detailIcon} />
                  <span className={styles.detailLabel}>Date</span>
                  <span className={styles.detailValue}>{formatDate(result.booking.startTime)}</span>
                </div>
                <div className={styles.detailRow}>
                  <Clock size={16} className={styles.detailIcon} />
                  <span className={styles.detailLabel}>Duration</span>
                  <span className={styles.detailValue}>
                    {formatTime(result.booking.startTime)} &ndash; {formatTime(result.booking.endTime)}
                  </span>
                </div>
              </div>
            )}

            <button onClick={resetForm} className={styles.actionBtn}>
              <ArrowLeft size={16} />
              <span>Back to Check-in</span>
            </button>
          </div>
        )}

        {/* Footer */}
        <div className={styles.footer}>
          <Link href="/" className={styles.footerLink}>
            Return to Homepage
          </Link>
          <span>&bull;</span>
          <Link href="/book" className={styles.footerLink}>
            Book a Workspace
          </Link>
        </div>
      </div>
    </div>
  );
}
