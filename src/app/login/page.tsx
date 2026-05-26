'use client';

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { Mail, Lock, Eye, EyeOff, User, ArrowLeft, Phone, CreditCard } from 'lucide-react';
import styles from './page.module.css';

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}><div style={{ color: '#0f172a', fontWeight: 700, fontSize: '1.25rem' }}>Loading...</div></div>}>
      <LoginPageContent />
    </Suspense>
  );
}

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  // URL redirect parameter
  const redirectParam = searchParams.get('redirect');

  // Determine correct redirect based on role
  const getRedirectUrl = useCallback((userSession: typeof session) => {
    if (redirectParam) return redirectParam;
    const role = (userSession?.user as unknown as { role?: string })?.role;
    if (role === 'SUPER_ADMIN' || role === 'ADMIN') return '/admin';
    return '/dashboard';
  }, [redirectParam]);

  // Session redirect check
  useEffect(() => {
    if (status === 'authenticated' && session) {
      router.push(getRedirectUrl(session));
    }
  }, [status, session, router, getRedirectUrl]);

  // Form toggling & inputs state
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [idType, setIdType] = useState<'AADHAAR' | 'PAN' | ''>('');
  const [idNumber, setIdNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Loading & error feedback states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [recoveryMessage, setRecoveryMessage] = useState<string | null>(null);
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null);

  const clearFeedback = () => {
    setFormError(null);
    setRecoveryMessage(null);
    setDevResetUrl(null);
  };

  const showSignIn = () => {
    setIsSignUp(false);
    setIsForgotPassword(false);
    clearFeedback();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isForgotPassword) {
      if (!email) return;

      setIsSubmitting(true);
      clearFeedback();

      try {
        const res = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        const data = await res.json();

        if (!res.ok) {
          setFormError(data.error || 'Could not start password recovery.');
          return;
        }

        setRecoveryMessage(data.message || 'Recovery instructions have been sent.');
        setDevResetUrl(data.devResetUrl || null);
      } catch {
        setFormError('Something went wrong. Please check your connection and try again.');
      } finally {
        setIsSubmitting(false);
      }

      return;
    }

    if (!email || !password) return;
    if (isSignUp && (!firstName.trim() || !lastName.trim())) return;

    setIsSubmitting(true);
    clearFeedback();

    try {
      if (isSignUp) {
        // Submit registration payload
        const signupRes = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email,
            password,
            phone,
            idType: idType || undefined,
            idNumber: idNumber.trim() || undefined,
          }),
        });

        const signupData = await signupRes.json();

        if (!signupRes.ok) {
          setFormError(signupData.error || 'Failed to create account.');
          setIsSubmitting(false);
          return;
        }
      }

      // Authorize credentials session via NextAuth
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setFormError(
          isSignUp
            ? 'Account registered successfully, but log in failed. Please sign in manually.'
            : 'Invalid email or password.'
        );
      } else {
        // Fetch the freshly-created session because useSession may still hold the previous render.
        const sessionRes = await fetch('/api/auth/session', { cache: 'no-store' });
        const freshSession = sessionRes.ok ? await sessionRes.json() : null;
        const role = (freshSession?.user as { role?: string } | undefined)?.role;

        if (role === 'SUPER_ADMIN' || role === 'ADMIN') {
          router.push(redirectParam || '/admin');
        } else {
          router.push(redirectParam || '/dashboard');
        }
      }
    } catch {
      setFormError('Something went wrong. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === 'loading') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
        <div style={{ color: '#0f172a', fontWeight: 700, fontSize: '1.25rem' }}>Verifying session...</div>
      </div>
    );
  }

  return (
    <div className={styles.loginWrapper}>
      
      {/* 1. LEFT DARK SIDEBAR BANNER */}
      <div className={styles.leftBanner}>
        
        {/* Back arrow to return to dashboard/booking */}
        <button className={styles.backBtn} onClick={() => router.push('/book')}>
          <ArrowLeft size={24} />
        </button>

        {/* Dynamic Coworking Illustration SVG */}
        <div className={styles.illustrationContainer}>
          <svg viewBox="0 0 500 400" className={styles.illustrationImg} fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Background elements */}
            <circle cx="120" cy="200" r="80" fill="#1e293b" />
            <circle cx="380" cy="180" r="100" fill="#1e293b" opacity="0.4" />
            
            {/* Window/Screens in the illustration */}
            <rect x="180" y="80" width="160" height="110" rx="8" fill="#334155" />
            <rect x="190" y="90" width="140" height="15" rx="3" fill="#475569" />
            <circle cx="200" cy="97.5" r="3" fill="#ef4444" />
            <circle cx="210" cy="97.5" r="3" fill="#eab308" />
            <circle cx="220" cy="97.5" r="3" fill="#22c55e" />
            
            {/* Lock illustration */}
            <rect x="235" y="130" width="50" height="40" rx="6" fill="#f59e0b" />
            <path d="M245 130V118C245 110 252 105 260 105C268 105 275 110 275 118V130" stroke="#f59e0b" strokeWidth="6" strokeLinecap="round" />
            
            {/* Key/Shield */}
            <rect x="60" y="150" width="80" height="100" rx="8" fill="#475569" />
            <path d="M100 170L115 185H105V210H95V185H85L100 170Z" fill="#e2e8f0" />
            <rect x="75" y="225" width="50" height="12" rx="4" fill="#f59e0b" />
            
            {/* Plant */}
            <path d="M400 320C400 320 420 280 430 250C440 280 460 320 460 320H400Z" fill="#10b981" />
            <path d="M410 320C410 320 430 260 440 230C450 260 470 320 470 320H410Z" fill="#047857" />
            <rect x="420" y="320" width="30" height="35" rx="4" fill="#eab308" />

            {/* Character sitting at computer */}
            <circle cx="280" cy="230" r="24" fill="#fca5a5" /> {/* Face */}
            <rect x="250" y="254" width="60" height="100" rx="12" fill="#065f46" /> {/* Body */}
            <path d="M290 220C280 200 250 220 260 240" stroke="#1e293b" strokeWidth="6" strokeLinecap="round" /> {/* Hair */}
            
            {/* Desk/Laptop */}
            <rect x="220" y="300" width="130" height="10" rx="3" fill="#e2e8f0" /> {/* Desk */}
            <path d="M270 300L260 275H300L290 300" fill="#cbd5e1" /> {/* Laptop */}
          </svg>

          <h2 className={styles.welcomeHeading}>Welcome back</h2>
          <p className={styles.welcomeText}>
            Sign in to access your dashboard and manage your bookings.
          </p>
        </div>

        <p className={styles.footerCopyright}>&copy; LivBiz Coworking</p>
      </div>

      {/* 2. RIGHT WHITE CREDENTIALS FORM */}
      <div className={styles.rightFormArea}>
        <div className={styles.formCard}>
          
          <div className={styles.formHeader}>
            <h1>{isForgotPassword ? 'Recover password' : isSignUp ? 'Sign up' : 'Sign in'}</h1>
            <p>
              {isForgotPassword
                ? 'Enter your client email to receive a secure reset link'
                : isSignUp
                  ? 'Create a premium client account to get started'
                  : 'Enter your credentials to continue'}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Validation alert banner */}
            {formError && <div className={styles.errorBanner}>{formError}</div>}
            {recoveryMessage && <div className={styles.successBanner}>{recoveryMessage}</div>}
            {devResetUrl && (
              <a className={styles.devResetLink} href={devResetUrl}>
                Open local reset link
              </a>
            )}

            {/* First Name & Last Name inputs (Sign Up Only) */}
            {isSignUp && (
              <div className={styles.nameRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>First Name</label>
                  <div className={styles.inputWrapper}>
                    <span className={styles.inputIcon}>
                      <User size={18} />
                    </span>
                    <input
                      type="text"
                      required
                      className={styles.inputField}
                      placeholder="First name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Last Name</label>
                  <div className={styles.inputWrapper}>
                    <span className={styles.inputIcon}>
                      <User size={18} />
                    </span>
                    <input
                      type="text"
                      required
                      className={styles.inputField}
                      placeholder="Last name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Phone Number input (Sign Up Only) */}
            {isSignUp && (
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Phone Number</label>
                <div className={styles.inputWrapper}>
                  <span className={styles.inputIcon}>
                    <Phone size={18} />
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <span style={{ padding: '0 0.5rem', color: '#64748b', borderRight: '1px solid #e2e8f0', marginRight: '0.5rem' }}>+91</span>
                    <input
                      type="tel"
                      required
                      className={styles.inputField}
                      style={{ paddingLeft: '0' }}
                      placeholder="9876543210"
                      pattern="[6-9][0-9]{9}"
                      title="Please enter a valid 10-digit Indian mobile number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Government ID (Sign Up Only, Optional) */}
            {isSignUp && (
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Government ID <span className={styles.optionalTag}>(Optional)</span></label>
                <div className={styles.idRow}>
                  <select
                    className={styles.idSelect}
                    value={idType}
                    onChange={(e) => {
                      setIdType(e.target.value as 'AADHAAR' | 'PAN' | '');
                      setIdNumber('');
                    }}
                  >
                    <option value="">Select type</option>
                    <option value="AADHAAR">Aadhaar Card</option>
                    <option value="PAN">PAN Card</option>
                  </select>
                  {idType && (
                    <div className={styles.inputWrapper}>
                      <span className={styles.inputIcon}>
                        <CreditCard size={18} />
                      </span>
                      <input
                        type="text"
                        className={styles.inputField}
                        placeholder={idType === 'AADHAAR' ? '1234 5678 9012' : 'ABCDE1234F'}
                        value={idNumber}
                        onChange={(e) => setIdNumber(e.target.value)}
                        maxLength={idType === 'AADHAAR' ? 14 : 10}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Email / Identifier Input */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                {isForgotPassword
                  ? 'Client Email Address'
                  : isSignUp
                    ? 'Email Address'
                    : 'Email or Mobile Number'}
              </label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}>
                  <Mail size={18} />
                </span>
                <input
                  type={isSignUp || isForgotPassword ? 'email' : 'text'}
                  required
                  className={styles.inputField}
                  placeholder={
                    isForgotPassword
                      ? 'Enter your account email'
                      : isSignUp
                        ? 'Enter your email'
                        : 'Enter email or 10-digit mobile number'
                  }
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password Input */}
            {!isForgotPassword && (
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Password</label>
                <div className={styles.inputWrapper}>
                  <span className={styles.inputIcon}>
                    <Lock size={18} />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    className={styles.inputField}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
            )}

            {/* Actions Bar (Remember Me & Forgot Password) */}
            {!isSignUp && !isForgotPassword && (
              <div className={styles.actionsBar}>
                <label className={styles.rememberMe}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Remember me</span>
                </label>
                <button
                  type="button"
                  className={styles.forgotLinkButton}
                  onClick={() => {
                    setIsForgotPassword(true);
                    setIsSignUp(false);
                    clearFeedback();
                  }}
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* Submit button */}
            <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
              {isForgotPassword
                ? (isSubmitting ? 'Sending recovery link...' : 'Send recovery link')
                : isSignUp
                  ? (isSubmitting ? 'Creating account...' : 'Sign up')
                  : (isSubmitting ? 'Signing in...' : 'Sign in')}
            </button>

            {/* OTP login (Sign In Only) */}
            {!isSignUp && !isForgotPassword && (
              <>
                <button type="button" className={styles.otpBtn}>
                  Sign in with OTP
                </button>
                <div className={styles.orSeparator}>or</div>
              </>
            )}

            {/* Toggle Footer text */}
            <div className={styles.toggleText}>
              {isForgotPassword ? (
                <>
                  Remember your password?{' '}
                  <span
                    className={styles.toggleLink}
                    onClick={showSignIn}
                  >
                    Sign in
                  </span>
                </>
              ) : isSignUp ? (
                <>
                  Already have an account?{' '}
                  <span
                    className={styles.toggleLink}
                    onClick={showSignIn}
                  >
                    Sign in
                  </span>
                </>
              ) : (
                <>
                  Don&apos;t have an account?{' '}
                  <span
                    className={styles.toggleLink}
                    onClick={() => {
                      setIsSignUp(true);
                      setIsForgotPassword(false);
                      clearFeedback();
                    }}
                  >
                    Sign up
                  </span>
                </>
              )}
            </div>

          </form>

        </div>
      </div>

    </div>
  );
}
