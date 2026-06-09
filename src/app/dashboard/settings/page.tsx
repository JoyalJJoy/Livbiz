'use client';

import React, { useState, useEffect } from 'react';
import { useSupabaseAuth } from '@/components/SupabaseAuthProvider';
import { User, Mail, Phone, Lock, Eye, EyeOff, CheckCircle2, AlertTriangle, Loader2, CreditCard } from 'lucide-react';
import styles from './settings.module.css';

export default function SettingsPage() {
  const { user, session } = useSupabaseAuth();

  // Profile Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [idType, setIdType] = useState<'AADHAAR' | 'PAN' | ''>('');
  const [idNumber, setIdNumber] = useState('');

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Status feedbacks
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);

  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  // Fetch full user data including phone from PostgreSQL DB
  useEffect(() => {
    async function loadUserData() {
      try {
        const res = await fetch('/api/dashboard/settings');
        if (res.ok) {
          const data = await res.json();
          setFirstName(data.firstName || '');
          setLastName(data.lastName || '');
          setEmail(data.email || '');
          setPhone(data.phone || '');
          setIdType(data.idType || '');
          setIdNumber(data.idNumber || '');
        } else {
          setProfileError('Failed to load profile details.');
        }
      } catch {
        setProfileError('Error connecting to database.');
      } finally {
        setProfileLoading(false);
      }
    }

    if (user) {
      loadUserData();
    }
  }, [session, user]);

  // Submit profile detail updates
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileError(null);
    setProfileSuccess(null);

    try {
      const res = await fetch('/api/dashboard/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_profile',
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email,
          phone,
          idType: idType || null,
          idNumber: idNumber.trim() || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setProfileError(data.error || 'Failed to update profile.');
      } else {
        setProfileSuccess('Profile updated successfully!');
      }
    } catch {
      setProfileError('Something went wrong. Please check your connection.');
    } finally {
      setProfileSaving(false);
    }
  };

  // Submit security password changes
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long.');
      return;
    }

    setPasswordSaving(true);

    try {
      const res = await fetch('/api/dashboard/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_password', currentPassword, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setPasswordError(data.error || 'Failed to update password.');
      } else {
        setPasswordSuccess('Password updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch {
      setPasswordError('Something went wrong. Please check your connection.');
    } finally {
      setPasswordSaving(false);
    }
  };

  if (profileLoading) {
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', minHeight: '300px', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 className="animate-spin" size={24} style={{ color: '#4f46e5' }} />
        <span style={{ fontWeight: 600, color: '#475569' }}>Loading settings panels...</span>
      </div>
    );
  }

  return (
    <div className={styles.settingsWrapper}>
      
      {/* HEADER ROW */}
      <div className={styles.headerSection}>
        <h1 className={styles.title}>Settings</h1>
        <p className={styles.subtitle}>Manage your account profiles, personal information, and authentication security.</p>
      </div>

      {/* DOUBLE PANEL LAYOUT */}
      <div className={styles.settingsGrid}>
        
        {/* CARD 1: PROFILE DETAILS */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Profile Information</h2>
            <p className={styles.cardDescription}>Update your organization display name, contact email, and mobile number.</p>
          </div>

          <form onSubmit={handleProfileSubmit} className={styles.form}>
            {/* Feedback Alert Banners */}
            {profileError && (
              <div className={`${styles.alert} ${styles.errorAlert}`}>
                <AlertTriangle size={16} />
                <span>{profileError}</span>
              </div>
            )}
            {profileSuccess && (
              <div className={`${styles.alert} ${styles.successAlert}`}>
                <CheckCircle2 size={16} />
                <span>{profileSuccess}</span>
              </div>
            )}

            {/* First Name & Last Name Input Row */}
            <div className={styles.nameRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>First Name</label>
                <div className={styles.inputWrapper}>
                  <span className={styles.inputIcon}>
                    <User size={16} />
                  </span>
                  <input
                    type="text"
                    required
                    className={styles.inputField}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First name"
                  />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Last Name</label>
                <div className={styles.inputWrapper}>
                  <span className={styles.inputIcon}>
                    <User size={16} />
                  </span>
                  <input
                    type="text"
                    required
                    className={styles.inputField}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last name"
                  />
                </div>
              </div>
            </div>

            {/* Email Contact Input */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Email Address</label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}>
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  required
                  className={styles.inputField}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@company.com"
                />
              </div>
            </div>

            {/* Contact Mobile Input */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Mobile Number</label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}>
                  <Phone size={16} />
                </span>
                <input
                  type="tel"
                  className={styles.inputField}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 XXXXX XXXXX"
                />
              </div>
            </div>

            {/* Government ID (Optional) */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Government ID <span className={styles.optionalTag}>(Optional)</span></label>
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
                  <div className={styles.inputWrapper} style={{ flex: 1 }}>
                    <span className={styles.inputIcon}>
                      <CreditCard size={16} />
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

            <button type="submit" className={styles.saveBtn} disabled={profileSaving}>
              {profileSaving ? 'Saving changes...' : 'Save changes'}
            </button>
          </form>
        </div>

        {/* CARD 2: PASSWORD CHANGE SECURE FORM */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Change Password</h2>
            <p className={styles.cardDescription}>Protect your coworking account by keeping your security credentials up to date.</p>
          </div>

          <form onSubmit={handlePasswordSubmit} className={styles.form}>
            {/* Feedback Alert Banners */}
            {passwordError && (
              <div className={`${styles.alert} ${styles.errorAlert}`}>
                <AlertTriangle size={16} />
                <span>{passwordError}</span>
              </div>
            )}
            {passwordSuccess && (
              <div className={`${styles.alert} ${styles.successAlert}`}>
                <CheckCircle2 size={16} />
                <span>{passwordSuccess}</span>
              </div>
            )}

            {/* Current Password Field */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Current Password</label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}>
                  <Lock size={16} />
                </span>
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  required
                  className={`${styles.inputField} styles.passwordField`}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  className={styles.inputToggleEye}
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* New Password Field */}
            <div className={styles.formGroup}>
              <label className={styles.label}>New Password</label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}>
                  <Lock size={16} />
                </span>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  className={`${styles.inputField} styles.passwordField`}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                />
                <button
                  type="button"
                  className={styles.inputToggleEye}
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm New Password Field */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Confirm New Password</label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}>
                  <Lock size={16} />
                </span>
                <input
                  type="password"
                  required
                  className={styles.inputField}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                />
              </div>
            </div>

            <button type="submit" className={styles.saveBtn} disabled={passwordSaving}>
              {passwordSaving ? 'Updating password...' : 'Update password'}
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}
