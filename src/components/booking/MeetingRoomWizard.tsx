'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { X, Check, Users, ChevronLeft, ChevronRight, Mail, Lock, Eye, EyeOff, Presentation, CreditCard, Phone, LogIn, CheckCircle } from 'lucide-react';
import BookingLottie from './BookingLottie';
import styles from './MeetingRoomWizard.module.css';
import { createBrowserClient } from '@/lib/supabase/client';
import { useSupabaseAuth } from '@/components/SupabaseAuthProvider';
import { z } from 'zod';

const attendeeSchema = z.object({
  name: z.string().trim().min(1),
  email: z.string().trim().email(),
});
const attendeesSchema = z.array(attendeeSchema);

type RoomId = '4-seat' | '16-seat' | null;

interface BookingState {
  step: number;
  roomId: RoomId;
  date: Date | null;
  timeMode: 'full' | 'half' | 'custom';
  customStartTime: string;
  customEndTime: string;
}

const TOTAL_STEPS = 6;

const ROOMS = [
  {
    id: '4-seat' as RoomId,
    name: '4-Seat Conference Room',
    dbName: '4-Seat Conference Room',
    price: 200,
    capacity: 4,
    features: ['Whiteboard', 'High-Speed WiFi', 'Air Conditioning', 'Power Backup'],
  },
  {
    id: '16-seat' as RoomId,
    name: '16-Seat Conference Room',
    dbName: '16-Seat Conference Room',
    price: 500,
    capacity: 16,
    features: ['Projector', 'Whiteboard', 'High-Speed WiFi', 'Air Conditioning', 'Power Backup', 'Complimentary Coffee'],
  },
];

const BUSINESS_HOURS_START = [
  '08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM'
];

const BUSINESS_HOURS_END = [
  '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM', 
  '05:30 PM', '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM', '08:00 PM'
];

function parseTimeStringToMinutes(timeStr: string): number {
  const parts = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!parts) return 0;
  let hours = parseInt(parts[1]);
  const minutes = parseInt(parts[2]);
  const ampm = parts[3].toUpperCase();

  if (ampm === 'PM' && hours !== 12) hours += 12;
  if (ampm === 'AM' && hours === 12) hours = 0;

  return hours * 60 + minutes;
}

function getDurationInHours(startTime: string, endTime: string): number {
  const startMin = parseTimeStringToMinutes(startTime);
  const endMin = parseTimeStringToMinutes(endTime);
  if (endMin <= startMin) return 0;
  return (endMin - startMin) / 60;
}

export default function MeetingRoomWizard() {
  const router = useRouter();
  const { user: authUser, session, isLoading: authLoading } = useSupabaseAuth();
  const isLoggedIn = !authLoading && !!session;

  const [state, setState] = useState<BookingState>({
    step: 1,
    roomId: null,
    date: null,
    timeMode: 'full',
    customStartTime: '09:00 AM',
    customEndTime: '06:00 PM',
  });

  const [currentCalendarDate, setCurrentCalendarDate] = useState<Date>(new Date());
  const [attendees, setAttendees] = useState<{name: string, email: string}[]>([]);

  const [isSignUp, setIsSignUp] = useState(true);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Availability data
  const [availability, setAvailability] = useState<Record<string, { booked: number; capacity: number; full: boolean }>>({});

  const fetchAvailability = useCallback(async (calDate: Date) => {
    const y = calDate.getFullYear();
    const m = String(calDate.getMonth() + 1).padStart(2, '0');
    try {
      const res = await fetch(`/api/slots/availability?type=MEETING_ROOM&month=${y}-${m}`);
      if (res.ok) {
        const data = await res.json();
        setAvailability(data.dates || {});
      }
    } catch (err) {
      console.error('Failed to fetch availability:', err);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(() => fetchAvailability(currentCalendarDate));
  }, [currentCalendarDate, fetchAvailability]);

  const selectedRoom = ROOMS.find(r => r.id === state.roomId);
  const unitPrice = selectedRoom?.price ?? 0;
  
  let duration = 9;
  if (state.timeMode === 'half') {
    duration = 5;
  } else if (state.timeMode === 'custom') {
    duration = getDurationInHours(state.customStartTime, state.customEndTime);
  }
  
  const totalPrice = unitPrice * duration;

  const isAttendeesValid = attendeesSchema.safeParse(attendees).success;

  const goNext = () => setState(s => ({ ...s, step: Math.min(s.step + 1, TOTAL_STEPS) }));
  const goBack = () => setState(s => ({ ...s, step: Math.max(s.step - 1, 1) }));

  const handleRoomSelect = (roomId: RoomId) => {
    setState(s => ({ ...s, roomId }));
    const cap = ROOMS.find(r => r.id === roomId)?.capacity || 4;
    setAttendees(Array(cap).fill({ name: '', email: '' }));
    setTimeout(goNext, 300);
  };

  const handleDateSelect = (day: number) => {
    const calendarYear = currentCalendarDate.getFullYear();
    const calendarMonth = currentCalendarDate.getMonth();
    const selectedDate = new Date(calendarYear, calendarMonth, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) return;
    setState(s => ({ ...s, date: selectedDate }));
    setTimeout(goNext, 300);
  };

  const createBookingAfterLogin = async () => {
    try {
      const slotsRes = await fetch('/api/slots?type=MEETING_ROOM');
      if (!slotsRes.ok) throw new Error('Failed to fetch slots');
      const slots = await slotsRes.json();
      const matchedSlot = slots.find((s: { name: string }) => s.name === selectedRoom?.dbName);
      if (!matchedSlot) throw new Error('Meeting room slot not found');

      const datePart = state.date!;
      const startTimeStr = state.timeMode === 'full' ? '09:00 AM' : state.timeMode === 'half' ? '01:00 PM' : state.customStartTime;
      const endTimeStr = state.timeMode === 'full' ? '06:00 PM' : state.timeMode === 'half' ? '06:00 PM' : state.customEndTime;

      const startParts = startTimeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
      const endParts = endTimeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (!startParts || !endParts) throw new Error('Invalid time format');

      let startHours = parseInt(startParts[1]);
      const startMinutes = parseInt(startParts[2]);
      const startAmpm = startParts[3].toUpperCase();
      if (startAmpm === 'PM' && startHours !== 12) startHours += 12;
      if (startAmpm === 'AM' && startHours === 12) startHours = 0;

      let endHours = parseInt(endParts[1]);
      const endMinutes = parseInt(endParts[2]);
      const endAmpm = endParts[3].toUpperCase();
      if (endAmpm === 'PM' && endHours !== 12) endHours += 12;
      if (endAmpm === 'AM' && endHours === 12) endHours = 0;

      const startTime = new Date(datePart.getFullYear(), datePart.getMonth(), datePart.getDate(), startHours, startMinutes);
      const endTime = new Date(datePart.getFullYear(), datePart.getMonth(), datePart.getDate(), endHours, endMinutes);

      if (endTime <= startTime) {
        endTime.setDate(endTime.getDate() + 1);
      }

      const bookingRes = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slotId: matchedSlot.id,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          totalPrice,
          seats: selectedRoom?.capacity || 4,
          attendees,
        }),
      });

      if (!bookingRes.ok) {
        const errData = await bookingRes.json();
        throw new Error(errData.error || 'Failed to create booking');
      }

      router.push('/dashboard/bookings');
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Failed to create booking. Please try from your dashboard.');
      setTimeout(() => router.push('/dashboard/bookings'), 2000);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    if (!isSignUp && !password) return;
    if (isSignUp && !name) return;

    setIsLoggingIn(true);
    setLoginError(null);

    let signupPassword = '';
    if (isSignUp) {
      signupPassword = 'Temp@1234' + Math.random().toString(36).slice(-8);
    }
    const finalPassword = isSignUp ? signupPassword : password;

    try {
      if (isSignUp) {
        const nameParts = name.trim().split(/\s+/);
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '.';
        const signupRes = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ firstName, lastName, email, password: finalPassword, phone, sendSetupLink: true }),
        });
        const signupData = await signupRes.json();
        if (!signupRes.ok) {
          setLoginError(signupData.error || 'Failed to create account.');
          setIsLoggingIn(false);
          return;
        }
      }

      const supabase = createBrowserClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password: finalPassword });

      if (signInError) {
        setLoginError(isSignUp ? 'Account created but login failed. Please sign in manually.' : 'Invalid email or password.');
        setIsLoggingIn(false);
      } else {
        await createBookingAfterLogin();
      }
    } catch {
      setLoginError('Something went wrong. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const calendarYear = currentCalendarDate.getFullYear();
  const calendarMonth = currentCalendarDate.getMonth();
  const monthName = currentCalendarDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  const startEmptyCells = new Date(calendarYear, calendarMonth, 1).getDay();
  const emptyCells = Array.from({ length: startEmptyCells });
  const dayCells = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const today = new Date();
  const isPrevMonthDisabled = new Date(calendarYear, calendarMonth - 1, 1) < new Date(today.getFullYear(), today.getMonth(), 1);

  const formatDateString = (date: Date | null) => {
    if (!date) return '-';
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className={styles.modalContainer}>
      {/* LEFT SIDEBAR */}
      <div className={styles.leftSidebar}>
        <div style={{ width: '150px', height: '150px', position: 'relative' }}>
          <div style={{ position: 'absolute', top: -30, left: 0, right: 0, zIndex: 10 }}>
            <BookingLottie />
          </div>
        </div>
        <h2 className={styles.leftSidebarTitle}>Meeting Room</h2>
        <p className={styles.leftSidebarText}>
          Book a conference room for your team meetings, presentations, or client calls
        </p>
      </div>

      {/* MIDDLE COLUMN */}
      <div className={`${styles.mainContent} ${state.step < 6 ? styles.noBorderRight : ''}`}>
        <div className={styles.contentHeader}>
          <h2>
            {state.step === 1 && 'Select Room'}
            {state.step === 2 && 'Select Date'}
            {state.step === 3 && 'Select Time'}
            {state.step === 4 && 'Attendees Details'}
            {state.step === 5 && 'Payment Method'}
            {state.step === 6 && (isLoggedIn ? 'Confirm Booking' : (isSignUp ? 'Sign Up' : 'Login'))}
          </h2>
          <button className={styles.closeBtn} onClick={() => router.push('/book')}>
            <X size={16} />
          </button>
        </div>

        {/* Auth hint banner for unauthenticated users */}
        {!isLoggedIn && !authLoading && state.step < 6 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', margin: '0 1.5rem', marginBottom: '0.5rem', background: 'linear-gradient(135deg, #eff6ff, #f0f9ff)', border: '1px solid #bfdbfe', borderRadius: '8px', fontSize: '0.8rem', color: '#1e40af' }}>
            <LogIn size={14} />
            <span>You&apos;ll need to sign in or create an account to confirm your booking</span>
          </div>
        )}

        <div className={styles.contentBody}>
          {/* STEP 1: ROOM SELECTION */}
          {state.step === 1 && (
            <>
              <p className={styles.subTitle}>Choose a conference room that suits your needs</p>
              {ROOMS.map(room => (
                <div
                  key={room.id}
                  className={`${styles.passCard} ${state.roomId === room.id ? styles.selected : ''}`}
                  onClick={() => handleRoomSelect(room.id)}
                >
                  <div className={styles.cardHeader}>
                    <div className={styles.iconWrapper}><Presentation size={20} /></div>
                    <div>
                      <div className={styles.cardTitle}>{room.name}</div>
                      <div className={styles.cardPrice}><span>₹{room.price}</span>/hr</div>
                    </div>
                  </div>
                  <ul className={styles.featureList}>
                    {room.features.map(f => (
                      <li key={f} className={styles.featureItem}>
                        <Check size={14} className={styles.featureIcon} /> {f}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </>
          )}

          {/* STEP 2: DATE */}
          {state.step === 2 && (
            <>
              <p className={styles.subTitle}>Pick a date for your meeting</p>
              <div className={styles.calendarWrapper}>
                <div className={styles.calendarNav}>
                  <button type="button" className={`${styles.calendarNavBtn} ${isPrevMonthDisabled ? styles.disabled : ''}`} onClick={() => !isPrevMonthDisabled && setCurrentCalendarDate(new Date(calendarYear, calendarMonth - 1, 1))} disabled={isPrevMonthDisabled}>
                    <ChevronLeft size={16} />
                  </button>
                  <div className={styles.calendarMonthTitle}>{monthName}</div>
                  <button type="button" className={styles.calendarNavBtn} onClick={() => setCurrentCalendarDate(new Date(calendarYear, calendarMonth + 1, 1))}>
                    <ChevronRight size={16} />
                  </button>
                </div>
                <div className={styles.calendarGrid}>
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((label, i) => (
                    <div key={i} className={styles.weekLabel}>{label}</div>
                  ))}
                  {emptyCells.map((_, i) => (
                    <div key={`e-${i}`} className={`${styles.calendarCell} ${styles.disabled}`} />
                  ))}
                  {dayCells.map(day => {
                    const cellDate = new Date(calendarYear, calendarMonth, day);
                    const todayCheck = new Date(); todayCheck.setHours(0,0,0,0);
                    const isPast = cellDate < todayCheck;
                    const isSelected = state.date?.getDate() === day && state.date?.getMonth() === calendarMonth && state.date?.getFullYear() === calendarYear;
                    
                    const dateKey = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const avail = availability[dateKey];
                    const isFullyBooked = avail?.full === true;
                    const isLimited = avail && !avail.full && avail.booked > 0;
                    const isDisabled = isPast || isFullyBooked;

                    return (
                      <div 
                        key={day} 
                        className={`
                          ${styles.calendarCell} 
                          ${isSelected ? styles.selected : ''} 
                          ${isDisabled ? styles.disabled : ''}
                          ${isFullyBooked && !isPast ? styles.fullyBooked : ''}
                        `} 
                        onClick={() => !isDisabled && handleDateSelect(day)}
                        title={isFullyBooked ? 'Fully booked' : isLimited ? `${avail.booked}/${avail.capacity} booked` : 'Available'}
                      >
                        <span>{day}</span>
                        {isFullyBooked && !isPast && <div className={styles.cellRedDot} />}
                        {isLimited && !isPast && <div className={styles.cellOrangeDot} />}
                      </div>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className={styles.legendContainer}>
                  <div className={styles.legendItem}><div className={`${styles.legendDot} ${styles.dotGreen}`} /><span>Available</span></div>
                  <div className={styles.legendItem}><div className={`${styles.legendDot} ${styles.dotOrange}`} /><span>Limited</span></div>
                  <div className={styles.legendItem}><div className={`${styles.legendDot} ${styles.dotRed}`} /><span>Fully Booked</span></div>
                  <div className={styles.legendItem}><div className={`${styles.legendDot} ${styles.dotLightGray}`} /><span>Selected</span></div>
                </div>
              </div>
            </>
          )}

          {/* STEP 3: TIME SLOT SELECTION */}
          {state.step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <p className={styles.subTitle}>Select your conference room access duration</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Full Day Card */}
                <div 
                  onClick={() => setState(s => ({ ...s, timeMode: 'full', customStartTime: '09:00 AM', customEndTime: '06:00 PM' }))}
                  style={{ cursor: 'pointer', padding: '1.25rem', border: '1px solid #e2e8f0', borderRadius: '12px', transition: 'all 0.2s', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: state.timeMode === 'full' ? '#f8fafc' : 'white', boxShadow: state.timeMode === 'full' ? '0 0 0 2px #0f172a' : 'none' }}
                >
                  <div>
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '1rem' }}>Full Day</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.2rem' }}>09:00 AM - 06:00 PM (9 hours)</div>
                  </div>
                  <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.15rem' }}>₹{unitPrice * 9}</div>
                </div>

                {/* Half Day Card */}
                <div 
                  onClick={() => setState(s => ({ ...s, timeMode: 'half', customStartTime: '01:00 PM', customEndTime: '06:00 PM' }))}
                  style={{ cursor: 'pointer', padding: '1.25rem', border: '1px solid #e2e8f0', borderRadius: '12px', transition: 'all 0.2s', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: state.timeMode === 'half' ? '#f8fafc' : 'white', boxShadow: state.timeMode === 'half' ? '0 0 0 2px #0f172a' : 'none' }}
                >
                  <div>
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '1rem' }}>Half Day</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.2rem' }}>01:00 PM - 06:00 PM (5 hours)</div>
                  </div>
                  <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.15rem' }}>₹{unitPrice * 5}</div>
                </div>

                {/* Custom Time Card */}
                <div 
                  onClick={() => setState(s => ({ ...s, timeMode: 'custom' }))}
                  style={{ cursor: 'pointer', padding: '1.25rem', border: '1px solid #e2e8f0', borderRadius: '12px', transition: 'all 0.2s', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: state.timeMode === 'custom' ? '#f8fafc' : 'white', boxShadow: state.timeMode === 'custom' ? '0 0 0 2px #0f172a' : 'none' }}
                >
                  <div>
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '1rem' }}>Custom Time</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.2rem' }}>Choose your own hours. Charged hourly based on room rate.</div>
                  </div>
                  <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.15rem' }}>
                    {state.timeMode === 'custom' ? `₹${totalPrice}` : 'Flex'}
                  </div>
                </div>
              </div>

              {/* Show dropdowns only when Custom Time is active */}
              {state.timeMode === 'custom' && (
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                  <div className={styles.formGroup} style={{ flex: 1 }}>
                    <label className={styles.formLabel}>ENTRY TIME</label>
                    <select 
                      className={styles.inputField} 
                      style={{ paddingLeft: '1rem', cursor: 'pointer' }}
                      value={state.customStartTime}
                      onChange={(e) => setState(s => ({ ...s, customStartTime: e.target.value }))}
                    >
                      {BUSINESS_HOURS_START.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.formGroup} style={{ flex: 1 }}>
                    <label className={styles.formLabel}>EXIT TIME</label>
                    <select 
                      className={styles.inputField} 
                      style={{ paddingLeft: '1rem', cursor: 'pointer' }}
                      value={state.customEndTime}
                      onChange={(e) => setState(s => ({ ...s, customEndTime: e.target.value }))}
                    >
                      {BUSINESS_HOURS_END.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div style={{ borderLeft: '3px solid #0f172a', paddingLeft: '1rem', color: '#64748b', fontSize: '0.85rem', lineHeight: 1.5 }}>
                Conference room access is granted strictly between the selected hours. Please ensure your team checks in at the reception desk.
              </div>
            </div>
          )}

          {/* STEP 4: ATTENDEES */}
          {state.step === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '60vh', overflowY: 'auto', paddingRight: '0.5rem' }}>
              <p className={styles.subTitle}>Please provide details for the attendees</p>
              {attendees.map((attendee, index) => (
                <div key={index} className={styles.formGroup} style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#f8fafc' }}>
                  <label className={styles.formLabel} style={{ marginBottom: '0.75rem', color: '#0f172a' }}>Attendee {index + 1}</label>
                  <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
                    <div className={styles.inputWrapper}>
                      <span className={styles.inputIcon}><Users size={16} /></span>
                      <input 
                        type="text" 
                        placeholder="Full Name" 
                        className={styles.inputField} 
                        value={attendee.name}
                        onChange={e => {
                          const newAtt = [...attendees];
                          newAtt[index] = { ...newAtt[index], name: e.target.value };
                          setAttendees(newAtt);
                        }}
                      />
                    </div>
                    <div className={styles.inputWrapper}>
                      <span className={styles.inputIcon}><Mail size={16} /></span>
                      <input 
                        type="email" 
                        placeholder="Email Address" 
                        className={styles.inputField}
                        value={attendee.email}
                        onChange={e => {
                          const newAtt = [...attendees];
                          newAtt[index] = { ...newAtt[index], email: e.target.value };
                          setAttendees(newAtt);
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}

              {!isAttendeesValid && (
                <div style={{ color: '#ef4444', fontSize: '0.85rem', fontWeight: 600, marginTop: '0.5rem', textAlign: 'center', backgroundColor: '#fef2f2', padding: '0.75rem', borderRadius: '8px', border: '1px solid #fee2e2' }}>
                  ⚠️ Please fill in all attendee names and valid email addresses.
                </div>
              )}
            </div>
          )}

          {/* STEP 5: PAYMENT */}
          {state.step === 5 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <p className={styles.subTitle}>How would you like to pay?</p>
              <div className={`${styles.passCard} ${styles.selected}`} style={{ cursor: 'default' }}>
                <div className={styles.cardHeader}>
                  <div className={styles.iconWrapper}><CreditCard size={20} /></div>
                  <div>
                    <div className={styles.cardTitle}>Pay at Desk</div>
                    <div className={styles.cardPrice}>Cash / UPI / Card</div>
                  </div>
                </div>
                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.5rem 0 0' }}>
                  Pay at the front desk when you arrive. Your booking will be confirmed by our admin team after review.
                </p>
              </div>
            </div>
          )}

          {/* STEP 6: LOGIN / SIGN UP or CONFIRM BOOKING */}
          {state.step === 6 && (
            isLoggedIn ? (
              <div className={styles.loginFormContainer} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', padding: '2rem' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle size={32} color="white" />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.5rem' }}>Ready to book!</p>
                  <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>Signed in as <strong>{authUser?.email}</strong></p>
                </div>
                {loginError && (
                  <div style={{ color: '#ef4444', fontSize: '0.85rem', fontWeight: 600, textAlign: 'center', width: '100%' }}>{loginError}</div>
                )}
                <button
                  type="button"
                  className={styles.loginSubmitBtn}
                  disabled={isLoggingIn}
                  onClick={async () => {
                    setIsLoggingIn(true);
                    setLoginError(null);
                    try {
                      await createBookingAfterLogin();
                    } catch (err) {
                      setLoginError(err instanceof Error ? err.message : 'Failed to create booking.');
                    } finally {
                      setIsLoggingIn(false);
                    }
                  }}
                >
                  {isLoggingIn ? 'Confirming...' : 'Confirm Booking'}
                </button>
              </div>
            ) : (
              <form className={styles.loginFormContainer} onSubmit={handleLoginSubmit}>
                {isSignUp && (
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Full Name</label>
                    <div className={styles.inputWrapper}>
                      <span className={styles.inputIcon}><Users size={16} /></span>
                      <input type="text" required className={styles.inputField} placeholder="Enter your full name" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                  </div>
                )}
                {isSignUp && (
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Phone Number</label>
                    <div className={styles.inputWrapper}>
                      <span className={styles.inputIcon}><Phone size={16} /></span>
                      <div className={styles.inputField} style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <span style={{ padding: '0 0.5rem', color: '#64748b', borderRight: '1px solid #e2e8f0', marginRight: '0.5rem' }}>+91</span>
                        <input type="tel" required style={{ border: 'none', outline: 'none', width: '100%', padding: 0, background: 'transparent', fontSize: 'inherit', color: 'inherit' }} placeholder="9876543210" pattern="[6-9][0-9]{9}" title="Please enter a valid 10-digit Indian mobile number" value={phone} onChange={(e) => setPhone(e.target.value)} />
                      </div>
                    </div>
                  </div>
                )}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    {isSignUp ? 'Email Address' : 'Email or Mobile Number'}
                  </label>
                  <div className={styles.inputWrapper}>
                    <span className={styles.inputIcon}><Mail size={16} /></span>
                    <input 
                      type={isSignUp ? 'email' : 'text'} 
                      required 
                      className={styles.inputField} 
                      placeholder={isSignUp ? 'Enter your email' : 'Enter email or 10-digit mobile number'} 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                    />
                  </div>
                </div>
                {!isSignUp && (
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Password</label>
                    <div className={styles.inputWrapper}>
                      <span className={styles.inputIcon}><Lock size={16} /></span>
                      <input type={showPassword ? 'text' : 'password'} required className={styles.inputField} placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} />
                      <button type="button" className={styles.inputToggleEye} onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                )}
                {loginError && (
                  <div style={{ color: '#ef4444', fontSize: '0.85rem', fontWeight: 600, textAlign: 'center' }}>{loginError}</div>
                )}
                <button type="submit" className={styles.loginSubmitBtn} disabled={isLoggingIn}>
                  {isSignUp ? (isLoggingIn ? 'Signing up...' : 'Sign up & Book') : (isLoggingIn ? 'Signing in...' : 'Sign in & Book')}
                </button>
                {isSignUp ? (
                  <div className={styles.signUpText}>Already registered? <span className={styles.signUpLink} onClick={() => { setIsSignUp(false); setLoginError(null); }}>Sign in</span></div>
                ) : (
                  <div className={styles.signUpText}>New user? <span className={styles.signUpLink} onClick={() => { setIsSignUp(true); setLoginError(null); }}>Sign up</span></div>
                )}
              </form>
            )
          )}
        </div>

        {/* Footer Nav */}
        {state.step > 1 && (
          <div className={styles.footerNav}>
            <button className={styles.footerBackBtn} onClick={goBack}>&lt; Back</button>
            {(state.step >= 2 && state.step <= 5) && (
              <button 
                className={styles.footerNextBtn} 
                onClick={goNext} 
                disabled={
                  (state.step === 2 && !state.date) || 
                  (state.step === 3 && duration <= 0) ||
                  (state.step === 4 && !isAttendeesValid)
                }
              >
                Next
              </button>
            )}
          </div>
        )}
      </div>

      {/* RIGHT SUMMARY */}
      {state.step === 6 && (
        <div className={styles.summarySidebar}>
          <div className={styles.summaryHeader}><h2>Summary</h2></div>
          <div className={styles.summaryBody}>
            <div className={styles.personTag}>{selectedRoom?.capacity ?? '—'} SEATS</div>
            <div className={styles.selectedPass}>{selectedRoom?.name ?? 'Select a room'}</div>
            <div className={styles.summaryBox}>
              <div className={styles.summaryRow}><span>Duration</span><span>{duration} hr{duration > 1 ? 's' : ''}</span></div>
              <div className={styles.summaryRow}><span>Date</span><span>{formatDateString(state.date)}</span></div>
              <div className={styles.summaryRow}><span>Time</span><span>{state.timeMode === 'full' ? '09:00 AM - 06:00 PM' : state.timeMode === 'half' ? '01:00 PM - 06:00 PM' : `${state.customStartTime} - ${state.customEndTime}`}</span></div>
              <div className={styles.summaryRow}><span>Payment</span><span>Pay at Desk</span></div>
            </div>
            <div className={styles.costBreakdown}>
              <div className={styles.costTitle}>COST BREAKDOWN</div>
              <div className={styles.costRow}>
                <span>{selectedRoom?.name || 'Meeting Room'} × {duration}hr</span>
                <span>₹{totalPrice}</span>
              </div>
              <button className={styles.totalBtn} disabled={false} onClick={goNext}>
                <span>Total Price</span>
                <span>₹{totalPrice}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
