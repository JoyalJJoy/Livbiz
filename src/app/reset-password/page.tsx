'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Eye, EyeOff, KeyRound, Lock } from 'lucide-react';
import styles from '../login/page.module.css';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}><div style={{ color: '#0f172a', fontWeight: 700, fontSize: '1.25rem' }}>Loading...</div></div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token')?.trim() || '';

  const [tokenStatus, setTokenStatus] = useState<'checking' | 'valid' | 'invalid'>(
    token ? 'checking' : 'invalid'
  );
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(
    token ? null : 'This password recovery link is missing its token.'
  );
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      return;
    }

    const controller = new AbortController();

    fetch(`/api/auth/reset-password?token=${encodeURIComponent(token)}`, {
      cache: 'no-store',
      signal: controller.signal,
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok || !data.valid) {
          setTokenStatus('invalid');
          setFormError('This password recovery link is invalid or has expired.');
          return;
        }

        setTokenStatus('valid');
        setFormError(null);
      })
      .catch((error) => {
        if (error.name === 'AbortError') return;
        setTokenStatus('invalid');
        setFormError('Could not verify this password recovery link.');
      });

    return () => controller.abort();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    if (tokenStatus !== 'valid') {
      setFormError('This password recovery link is invalid or has expired.');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error || 'Could not reset password.');
        return;
      }

      setSuccessMessage(data.message || 'Your password has been reset.');
      setPassword('');
      setConfirmPassword('');
      setTokenStatus('invalid');
    } catch {
      setFormError('Something went wrong. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.loginWrapper}>
      <div className={styles.leftBanner}>
        <button className={styles.backBtn} onClick={() => router.push('/login')}>
          <ArrowLeft size={24} />
        </button>

        <div className={styles.illustrationContainer}>
          <KeyRound size={112} strokeWidth={1.3} color="#f59e0b" />
          <h2 className={styles.welcomeHeading}>Password recovery</h2>
          <p className={styles.welcomeText}>
            Set a fresh password and return to your LivBiz dashboard.
          </p>
        </div>

        <p className={styles.footerCopyright}>&copy; LivBiz Coworking</p>
      </div>

      <div className={styles.rightFormArea}>
        <div className={styles.formCard}>
          <div className={styles.formHeader}>
            <h1>Set new password</h1>
            <p>Choose a strong password for your client account</p>
          </div>

          <form onSubmit={handleSubmit}>
            {formError && <div className={styles.errorBanner}>{formError}</div>}
            {successMessage && <div className={styles.successBanner}>{successMessage}</div>}

            {!successMessage && (
              <>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>New Password</label>
                  <div className={styles.inputWrapper}>
                    <span className={styles.inputIcon}>
                      <Lock size={18} />
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      className={styles.inputField}
                      placeholder="Enter a new password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={tokenStatus !== 'valid' || isSubmitting}
                    />
                    <button
                      type="button"
                      className={styles.inputToggleEye}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Confirm Password</label>
                  <div className={styles.inputWrapper}>
                    <span className={styles.inputIcon}>
                      <Lock size={18} />
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      className={styles.inputField}
                      placeholder="Confirm your new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={tokenStatus !== 'valid' || isSubmitting}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={tokenStatus !== 'valid' || isSubmitting}
                >
                  {tokenStatus === 'checking'
                    ? 'Verifying link...'
                    : isSubmitting
                      ? 'Resetting password...'
                      : 'Reset password'}
                </button>
              </>
            )}

            <button type="button" className={styles.otpBtn} onClick={() => router.push('/login')}>
              Back to sign in
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
