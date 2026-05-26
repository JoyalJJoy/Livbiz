'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Check, Users, ChevronLeft, ChevronRight, Mail, Lock, Eye, EyeOff, Presentation, CreditCard, Phone } from 'lucide-react';
import BookingLottie from './BookingLottie';
import styles from './MeetingRoomWizard.module.css';
import { signIn } from 'next-auth/react';

type RoomId = '4-seat' | '16-seat' | null;

interface BookingState {
  step: number;
  roomId: RoomId;
  date: Date | null;
  timeSlot: string | null;
  duration: number;
}

const TOTAL_STEPS = 7;

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

export default function MeetingRoomWizard() {
  const router = useRouter();

  const [state, setState] = useState<BookingState>({
    step: 1,
    roomId: null,
    date: null,
    timeSlot: null,
    duration: 1,
  });

  const [currentCalendarDate, setCurrentCalendarDate] = useState<Date>(new Date());
  const [attendees, setAttendees] = useState<{name: string, email: string}[]>([]);

  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const selectedRoom = ROOMS.find(r => r.id === state.roomId);
  const unitPrice = selectedRoom?.price ?? 0;
  const totalPrice = unitPrice * state.duration;

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
    setState(s => ({ ...s, date: selectedDate, timeSlot: null }));
    setTimeout(goNext, 300);
  };

  const handleTimeSelect = (timeSlot: string) => {
    setState(s => ({ ...s, timeSlot }));
  };

  const handleDurationChange = (delta: number) => {
    setState(s => ({ ...s, duration: Math.max(1, Math.min(8, s.duration + delta)) }));
  };

  const createBookingAfterLogin = async () => {
    try {
      // Fetch meeting room slots
      const slotsRes = await fetch('/api/slots?type=MEETING_ROOM');
      if (!slotsRes.ok) throw new Error('Failed to fetch slots');
      const slots = await slotsRes.json();
      const matchedSlot = slots.find((s: { name: string }) => s.name === selectedRoom?.dbName);
      if (!matchedSlot) throw new Error('Meeting room slot not found');

      // Calculate times
      const datePart = state.date!;
      const timeParts = state.timeSlot!.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (!timeParts) throw new Error('Invalid time format');
      let hours = parseInt(timeParts[1]);
      const minutes = parseInt(timeParts[2]);
      const ampm = timeParts[3].toUpperCase();
      if (ampm === 'PM' && hours !== 12) hours += 12;
      if (ampm === 'AM' && hours === 12) hours = 0;

      const startTime = new Date(datePart.getFullYear(), datePart.getMonth(), datePart.getDate(), hours, minutes);
      const endTime = new Date(startTime.getTime() + state.duration * 60 * 60 * 1000);

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
      // Still redirect to dashboard so user can see their account
      setTimeout(() => router.push('/dashboard/bookings'), 2000);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    if (isSignUp && !name) return;

    setIsLoggingIn(true);
    setLoginError(null);

    try {
      if (isSignUp) {
        const signupRes = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password, phone }),
        });
        const signupData = await signupRes.json();
        if (!signupRes.ok) {
          setLoginError(signupData.error || 'Failed to create account.');
          setIsLoggingIn(false);
          return;
        }
      }

      const res = await signIn('credentials', { email, password, redirect: false });

      if (res?.error) {
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

  // Calendar data
  const calendarYear = currentCalendarDate.getFullYear();
  const calendarMonth = currentCalendarDate.getMonth();
  const monthName = currentCalendarDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  const startEmptyCells = new Date(calendarYear, calendarMonth, 1).getDay();
  const emptyCells = Array.from({ length: startEmptyCells });
  const dayCells = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const today = new Date();
  const isPrevMonthDisabled = new Date(calendarYear, calendarMonth - 1, 1) < new Date(today.getFullYear(), today.getMonth(), 1);

  const timeSlots = ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM'];

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
      <div className={styles.mainContent}>
        <div className={styles.contentHeader}>
          <h2>
            {state.step === 1 && 'Select Room'}
            {state.step === 2 && 'Select Date'}
            {state.step === 3 && 'Select Time'}
            {state.step === 4 && 'Duration'}
            {state.step === 5 && 'Attendees Details'}
            {state.step === 6 && 'Payment Method'}
            {state.step === 7 && (isSignUp ? 'Create Account' : 'Login or Create Account')}
          </h2>
          <button className={styles.closeBtn} onClick={() => router.push('/book')}>
            <X size={16} />
          </button>
        </div>

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
                    return (
                      <div key={day} className={`${styles.calendarCell} ${isSelected ? styles.selected : ''} ${isPast ? styles.disabled : ''}`} onClick={() => !isPast && handleDateSelect(day)}>
                        <span>{day}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* STEP 3: TIME */}
          {state.step === 3 && (
            <>
              <p className={styles.subTitle}>Choose your meeting start time</p>
              <div className={styles.timeSlotsGrid}>
                {timeSlots.map(time => (
                  <button key={time} className={`${styles.timePill} ${state.timeSlot === time ? styles.selected : ''}`} onClick={() => handleTimeSelect(time)}>
                    {time}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* STEP 4: DURATION */}
          {state.step === 4 && (
            <div className={styles.seatsOuterContainer}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', textAlign: 'center', margin: 0 }}>How many hours?</h2>
              <p className={styles.subTitle} style={{ textAlign: 'center', marginTop: '0.25rem' }}>Select the meeting duration</p>
              <div className={styles.seatsCounterBox}>
                <button className={styles.seatsBtn} onClick={() => handleDurationChange(-1)} disabled={state.duration <= 1}>-</button>
                <div className={styles.seatsDisplay}>
                  <span className={styles.seatsNumber}>{state.duration}</span>
                  <span className={styles.seatsLabelText}>{state.duration > 1 ? 'HOURS' : 'HOUR'}</span>
                </div>
                <button className={styles.seatsBtn} onClick={() => handleDurationChange(1)} disabled={state.duration >= 8}>+</button>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, margin: '0 0 1.5rem 0', textAlign: 'center' }}>Max 8 hours per booking</p>
            </div>
          )}

          {/* STEP 5: ATTENDEES */}
          {state.step === 5 && (
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
            </div>
          )}

          {/* STEP 6: PAYMENT */}
          {state.step === 6 && (
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

          {/* STEP 7: LOGIN */}
          {state.step === 7 && (
            <form className={styles.loginFormContainer} onSubmit={handleLoginSubmit}>
              {isSignUp && (
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Full Name</label>
                  <div className={styles.inputWrapper}>
                    <span className={styles.inputIcon}><Mail size={16} /></span>
                    <input type="text" required className={styles.inputField} placeholder="Enter your full name" value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                </div>
              )}
              {isSignUp && (
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Phone Number</label>
                  <div className={styles.inputWrapper}>
                    <span className={styles.inputIcon}><Phone size={16} /></span>
                    <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <span style={{ padding: '0 0.5rem', color: '#64748b', borderRight: '1px solid #e2e8f0', marginRight: '0.5rem' }}>+91</span>
                      <input type="tel" required className={styles.inputField} style={{ paddingLeft: '0' }} placeholder="9876543210" pattern="[6-9][0-9]{9}" title="Please enter a valid 10-digit Indian mobile number" value={phone} onChange={(e) => setPhone(e.target.value)} />
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
              {loginError && (
                <div style={{ color: '#ef4444', fontSize: '0.85rem', fontWeight: 600, textAlign: 'center' }}>{loginError}</div>
              )}
              <button type="submit" className={styles.loginSubmitBtn} disabled={isLoggingIn}>
                {isSignUp ? (isLoggingIn ? 'Creating...' : 'Sign up & Book') : (isLoggingIn ? 'Signing in...' : 'Sign in & Book')}
              </button>
              {isSignUp ? (
                <div className={styles.signUpText}>Already have an account? <span className={styles.signUpLink} onClick={() => { setIsSignUp(false); setLoginError(null); }}>Sign in</span></div>
              ) : (
                <div className={styles.signUpText}>Don&apos;t have an account? <span className={styles.signUpLink} onClick={() => { setIsSignUp(true); setLoginError(null); }}>Sign up</span></div>
              )}
            </form>
          )}
        </div>

        {/* Footer Nav */}
        {state.step > 1 && (
          <div className={styles.footerNav}>
            <button className={styles.footerBackBtn} onClick={goBack}>&lt; Back</button>
            {(state.step >= 3 && state.step <= 6) && (
              <button className={styles.footerNextBtn} onClick={goNext} disabled={state.step === 3 && !state.timeSlot}>Next</button>
            )}
          </div>
        )}
      </div>

      {/* RIGHT SUMMARY */}
      <div className={styles.summarySidebar}>
        <div className={styles.summaryHeader}><h2>Summary</h2></div>
        <div className={styles.summaryBody}>
          <div className={styles.personTag}>{selectedRoom?.capacity ?? '—'} SEATS</div>
          <div className={styles.selectedPass}>{selectedRoom?.name ?? 'Select a room'}</div>
          <div className={styles.summaryBox}>
            <div className={styles.summaryRow}><span>Duration</span><span>{state.duration} hr{state.duration > 1 ? 's' : ''}</span></div>
            <div className={styles.summaryRow}><span>Date</span><span>{formatDateString(state.date)}</span></div>
            <div className={styles.summaryRow}><span>Time</span><span>{state.timeSlot || '-'}</span></div>
            <div className={styles.summaryRow}><span>Payment</span><span>Pay at Desk</span></div>
          </div>
          <div className={styles.costBreakdown}>
            <div className={styles.costTitle}>COST BREAKDOWN</div>
            <div className={styles.costRow}>
              <span>{selectedRoom?.name || 'Meeting Room'} × {state.duration}hr</span>
              <span>₹{totalPrice}</span>
            </div>
            <button className={styles.totalBtn} disabled={state.step === 3 && !state.timeSlot} onClick={goNext}>
              <span>Total Price</span>
              <span>₹{totalPrice}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
