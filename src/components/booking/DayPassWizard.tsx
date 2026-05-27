'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { X, Mail, Lock, Eye, EyeOff, ChevronLeft, ChevronRight, Phone, Users } from 'lucide-react';
import BookingLottie from './BookingLottie';
import InteractiveFloorPlan from './InteractiveFloorPlan';
import styles from './DayPassWizard.module.css';
import { signIn } from 'next-auth/react';

interface BookingState {
  step: number;
  usersCount: number;
  selectedSeats: string[];
  planId: 'regular';
  selectedDates: Date[];
  customStartTime: string;
  customEndTime: string;
}

const TOTAL_STEPS = 5;

const BUSINESS_HOURS_START = [
  '08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM'
];

const BUSINESS_HOURS_END = [
  '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM', 
  '05:30 PM', '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM', '08:00 PM'
];

export default function DayPassWizard() {
  const router = useRouter();
  
  const [state, setState] = useState<BookingState>({
    step: 1,
    usersCount: 1,
    selectedSeats: [],
    planId: 'regular',
    selectedDates: [new Date(2026, 4, 30)], // Default to May 30, 2026
    customStartTime: '09:00 AM',
    customEndTime: '06:00 PM',
  });

  // Local state for calendar navigation
  const [currentCalendarDate, setCurrentCalendarDate] = useState<Date>(new Date(2026, 4, 1));

  // Login & signup form state
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Availability data: maps 'YYYY-MM-DD' -> { booked, capacity, full }
  const [availability, setAvailability] = useState<Record<string, { booked: number; capacity: number; full: boolean }>>({});
  const [bookedSeats, setBookedSeats] = useState<string[]>([]);

  // Fetch availability when calendar month changes
  const fetchAvailability = useCallback(async (calDate: Date) => {
    const y = calDate.getFullYear();
    const m = String(calDate.getMonth() + 1).padStart(2, '0');
    try {
      const res = await fetch(`/api/slots/availability?type=DAY_PASS&month=${y}-${m}`);
      if (res.ok) {
        const data = await res.json();
        setAvailability(data.dates || {});
      }
    } catch (err) {
      console.error('Failed to fetch availability:', err);
    }
  }, []);

  const fetchBookedSeats = useCallback(async (targetDate: Date) => {
    try {
      const y = targetDate.getFullYear();
      const m = String(targetDate.getMonth() + 1).padStart(2, '0');
      const d = String(targetDate.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${d}`;
      
      const slotsRes = await fetch('/api/slots?type=DAY_PASS');
      if (slotsRes.ok) {
        const slots = await slotsRes.json();
        // Since all day passes on this campus are casual/regular, we query Regular Day Pass
        const matchedSlot = slots.find((s: { name: string }) => s.name === 'Regular Day Pass');
        if (matchedSlot) {
          const res = await fetch(`/api/slots/booked-seats?slotId=${matchedSlot.id}&date=${dateStr}`);
          if (res.ok) {
            const data = await res.json();
            setBookedSeats(data.bookedSeatIds || []);
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch booked seats:', err);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(() => fetchAvailability(currentCalendarDate));
  }, [currentCalendarDate, fetchAvailability]);

  // Fetch booked seats for the first selected date
  useEffect(() => {
    if (state.selectedDates.length > 0) {
      void Promise.resolve().then(() => fetchBookedSeats(state.selectedDates[0]));
    }
  }, [state.selectedDates, fetchBookedSeats]);

  const goNext = () => setState(s => ({ ...s, step: Math.min(s.step + 1, TOTAL_STEPS) }));
  const goBack = () => setState(s => ({ ...s, step: Math.max(s.step - 1, 1) }));

  const handleUsersCountChange = (delta: number) => {
    setState(s => {
      const nextCount = Math.max(1, Math.min(5, s.usersCount + delta));
      const nextSeats = s.selectedSeats.slice(0, nextCount);
      return { ...s, usersCount: nextCount, selectedSeats: nextSeats };
    });
  };

  const handleSeatToggle = (seatId: string) => {
    setState(s => {
      const isSelected = s.selectedSeats.includes(seatId);
      if (isSelected) {
        return { ...s, selectedSeats: s.selectedSeats.filter(id => id !== seatId) };
      }
      if (s.selectedSeats.length >= s.usersCount) {
        const nextSeats = [...s.selectedSeats.slice(1), seatId];
        return { ...s, selectedSeats: nextSeats };
      }
      return { ...s, selectedSeats: [...s.selectedSeats, seatId] };
    });
  };

  const handleDateToggle = (day: number) => {
    const calendarYear = currentCalendarDate.getFullYear();
    const calendarMonth = currentCalendarDate.getMonth();
    const clickedDate = new Date(calendarYear, calendarMonth, day);
    
    // Prevent past dates
    const todayCheck = new Date();
    todayCheck.setHours(0, 0, 0, 0);
    if (clickedDate < todayCheck) {
      return;
    }

    setState(s => {
      const exists = s.selectedDates.some(d => d.getDate() === day && d.getMonth() === calendarMonth && d.getFullYear() === calendarYear);
      let nextDates = [];
      if (exists) {
        if (s.selectedDates.length <= 1) return s;
        nextDates = s.selectedDates.filter(d => !(d.getDate() === day && d.getMonth() === calendarMonth && d.getFullYear() === calendarYear));
      } else {
        nextDates = [...s.selectedDates, clickedDate].sort((a, b) => a.getTime() - b.getTime());
      }
      return { ...s, selectedDates: nextDates };
    });
  };

  const createBookingAfterLogin = async () => {
    try {
      const slotsRes = await fetch('/api/slots?type=DAY_PASS');
      if (!slotsRes.ok) throw new Error('Failed to fetch slots');
      const slots = await slotsRes.json();
      
      const matchedSlot = slots.find((s: { name: string }) => s.name === 'Regular Day Pass');
      if (!matchedSlot) throw new Error('Day pass slot not found');

      // Create bookings concurrently for all chosen dates
      const bookingPromises = state.selectedDates.map(async (selectedDate) => {
        const startParts = state.customStartTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
        const endParts = state.customEndTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
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

        const startTime = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), startHours, startMinutes);
        const endTime = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), endHours, endMinutes);

        if (endTime <= startTime) {
          endTime.setDate(endTime.getDate() + 1);
        }

        const datePrice = unitPrice * state.usersCount;

        const bookingRes = await fetch('/api/bookings/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            slotId: matchedSlot.id,
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            totalPrice: datePrice,
            seats: state.usersCount,
            seatIds: state.selectedSeats,
            attendees: [{ name, email }],
          }),
        });

        if (!bookingRes.ok) {
          const errData = await bookingRes.json();
          throw new Error(errData.error || 'Failed to create booking');
        }
      });

      await Promise.all(bookingPromises);
      router.push('/dashboard/bookings');
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Failed to create booking.');
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
      
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });
      
      if (res?.error) {
        setLoginError(isSignUp ? 'Account created but login failed. Please sign in manually.' : 'Invalid email or password.');
      } else {
        await createBookingAfterLogin();
      }
    } catch {
      setLoginError('Something went wrong. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const formatDateString = (date: Date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const unitPrice = 200; // All Day Passes are casual, standard regular day pass pricing (₹200)
  const totalPrice = unitPrice * state.usersCount * Math.max(1, state.selectedDates.length);

  // Dynamic Calendar Data calculation
  const calendarYear = currentCalendarDate.getFullYear();
  const calendarMonth = currentCalendarDate.getMonth();
  const monthName = currentCalendarDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  
  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  const startEmptyCells = new Date(calendarYear, calendarMonth, 1).getDay();

  const emptyCells = Array.from({ length: startEmptyCells });
  const dayCells = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const today = new Date();
  const isPrevMonthDisabled = new Date(calendarYear, calendarMonth - 1, 1) < new Date(today.getFullYear(), today.getMonth(), 1);

  const handlePrevMonth = () => {
    if (isPrevMonthDisabled) return;
    setCurrentCalendarDate(new Date(calendarYear, calendarMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentCalendarDate(new Date(calendarYear, calendarMonth + 1, 1));
  };

  return (
    <div className={styles.modalContainer}>
      
      {/* 1. LEFT SIDEBAR */}
      <div className={styles.leftSidebar}>
        <div style={{ width: '150px', height: '150px', position: 'relative' }}>
          <div style={{ position: 'absolute', top: -30, left: 0, right: 0, zIndex: 10 }}>
            <BookingLottie />
          </div>
        </div>
        
        <h2 className={styles.leftSidebarTitle}>Workspace Pass</h2>
        <p className={styles.leftSidebarText}>
          Reserve custom high-performance workstations with flexible dates and real-time layout selection.
        </p>
      </div>

      {/* 2. MIDDLE COLUMN */}
      <div className={styles.mainContent}>
        
        <div className={styles.contentHeader}>
          <h2>
            {state.step === 1 && 'Number of Users'}
            {state.step === 2 && 'Choose Desk Layout'}
            {state.step === 3 && 'Choose Dates'}
            {state.step === 4 && 'Business Hours'}
            {state.step === 5 && (isSignUp ? 'Create Account' : 'Login or Create Account')}
          </h2>
          <button className={styles.closeBtn} onClick={() => router.push('/book')}>
            <X size={16} />
          </button>
        </div>
        
        <div className={styles.contentBody}>
          
          {/* STEP 1: ASK HOW MANY USERS */}
          {state.step === 1 && (
            <div className={styles.seatsOuterContainer}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', textAlign: 'center', margin: 0 }}>
                How many users?
              </h2>
              <p className={styles.subTitle} style={{ textAlign: 'center', marginTop: '0.25rem' }}>
                Select the number of team members attending
              </p>
              
              <div className={styles.seatsCounterBox}>
                <button 
                  type="button"
                  className={styles.seatsBtn} 
                  onClick={() => handleUsersCountChange(-1)} 
                  disabled={state.usersCount <= 1}
                >
                  -
                </button>
                <div className={styles.seatsDisplay}>
                  <span className={styles.seatsNumber}>{state.usersCount}</span>
                  <span className={styles.seatsLabelText}>{state.usersCount > 1 ? 'USERS' : 'USER'}</span>
                </div>
                <button 
                  type="button"
                  className={styles.seatsBtn} 
                  onClick={() => handleUsersCountChange(1)} 
                  disabled={state.usersCount >= 5}
                >
                  +
                </button>
              </div>
              
              <p style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, margin: '0 0 1.5rem 0', textAlign: 'center' }}>
                Up to 5 users can book together
              </p>
            </div>
          )}

          {/* STEP 2: CHOOSE SEAT LAYOUT */}
          {state.step === 2 && (
            <div className={styles.seatsOuterContainer}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', textAlign: 'center', margin: 0 }}>
                Choose Your Desks
              </h2>
              <p className={styles.subTitle} style={{ textAlign: 'center', marginTop: '0.25rem' }}>
                Select exactly {state.usersCount} desk{state.usersCount > 1 ? 's' : ''} on the live map
              </p>
              
              <InteractiveFloorPlan
                type={state.planId}
                bookedSeats={bookedSeats}
                selectedSeats={state.selectedSeats}
                onToggleSeat={handleSeatToggle}
                onClearSeats={() => setState(s => ({ ...s, selectedSeats: [] }))}
                onBookSeats={goNext}
              />
            </div>
          )}

          {/* STEP 3: CHOOSE DATES (MULTI SELECT) */}
          {state.step === 3 && (
            <>
              <p className={styles.subTitle}>Select one or more dates for your booking (click to toggle)</p>
              
              <div className={styles.calendarWrapper}>
                <div className={styles.calendarNav}>
                  <button 
                    type="button" 
                    className={`${styles.calendarNavBtn} ${isPrevMonthDisabled ? styles.disabled : ''}`} 
                    onClick={handlePrevMonth}
                    disabled={isPrevMonthDisabled}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <div className={styles.calendarMonthTitle}>{monthName}</div>
                  <button type="button" className={styles.calendarNavBtn} onClick={handleNextMonth}><ChevronRight size={16} /></button>
                </div>

                <div className={styles.calendarGrid}>
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((label, index) => (
                    <div key={index} className={styles.weekLabel}>{label}</div>
                  ))}

                  {emptyCells.map((_, index) => (
                    <div key={`empty-${index}`} className={`${styles.calendarCell} ${styles.disabled}`} />
                  ))}

                  {dayCells.map(day => {
                    const cellDate = new Date(calendarYear, calendarMonth, day);
                    const todayCheck = new Date();
                    todayCheck.setHours(0, 0, 0, 0);
                    const isPast = cellDate < todayCheck;
                    
                    const isSelected = state.selectedDates.some(
                      d => d.getDate() === day && d.getMonth() === calendarMonth && d.getFullYear() === calendarYear
                    );

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
                        onClick={() => !isDisabled && handleDateToggle(day)}
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

          {/* STEP 4: CUSTOM START / END TIME */}
          {state.step === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <p className={styles.subTitle}>Select custom business hours for your entry and exit</p>
              
              <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
                <div className={styles.formGroup}>
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

                <div className={styles.formGroup}>
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

              <div style={{ borderLeft: '3px solid #0f172a', paddingLeft: '1rem', color: '#64748b', fontSize: '0.85rem', lineHeight: 1.5 }}>
                Workspace access is granted strictly between the selected hours. Front reception desk check-in buffer allows entering up to 15 minutes early.
              </div>
            </div>
          )}

          {/* STEP 5: INLINE LOGIN / SIGNUP */}
          {state.step === 5 && (
            <form className={styles.loginFormContainer} onSubmit={handleLoginSubmit}>
              
              {isSignUp && (
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Full Name</label>
                  <div className={styles.inputWrapper}>
                    <span className={styles.inputIcon}>
                      <Users size={16} />
                    </span>
                    <input 
                      type="text"
                      required
                      className={styles.inputField}
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {isSignUp && (
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Phone Number</label>
                  <div className={styles.inputWrapper}>
                    <span className={styles.inputIcon}>
                      <Phone size={16} />
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

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  {isSignUp ? 'Email Address' : 'Email or Mobile Number'}
                </label>
                <div className={styles.inputWrapper}>
                  <span className={styles.inputIcon}>
                    <Mail size={16} />
                  </span>
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
                  <span className={styles.inputIcon}>
                    <Lock size={16} />
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
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {loginError && (
                <div style={{ color: '#ef4444', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1rem', textAlign: 'center' }}>
                  {loginError}
                </div>
              )}

              <button type="submit" className={styles.loginSubmitBtn} disabled={isLoggingIn}>
                {isSignUp ? (isLoggingIn ? 'Creating account...' : 'Sign up & Book') : (isLoggingIn ? 'Signing in...' : 'Sign in & Book')}
              </button>

              {isSignUp ? (
                <div className={styles.signUpText}>
                  Already have an account? <span className={styles.signUpLink} onClick={() => { setIsSignUp(false); setLoginError(null); }}>Sign in</span>
                </div>
              ) : (
                <div className={styles.signUpText}>
                  Don&apos;t have an account? <span className={styles.signUpLink} onClick={() => { setIsSignUp(true); setLoginError(null); }}>Sign up</span>
                </div>
              )}

            </form>
          )}

        </div>

        {/* STICKY footer navigation inside middle column */}
        {state.step > 1 && (
          <div className={styles.footerNav}>
            <button type="button" className={styles.footerBackBtn} onClick={goBack}>
              &lt; Back
            </button>
            
            {(state.step >= 2 && state.step <= 4) && (
              <button 
                type="button" 
                className={styles.footerNextBtn} 
                onClick={goNext} 
                disabled={state.step === 2 && state.selectedSeats.length !== state.usersCount}
              >
                Next
              </button>
            )}
          </div>
        )}

      </div>

      {/* 3. RIGHT COLUMN (SUMMARY) */}
      <div className={styles.summarySidebar}>
        
        <div className={styles.summaryHeader}>
          <h2>Summary</h2>
        </div>
        
        <div className={styles.summaryBody}>
          
          <div className={styles.personTag}>
            {state.usersCount} USER{state.usersCount > 1 ? 'S' : ''}
          </div>
          <div className={styles.selectedPass}>
            Casual Day Pass
          </div>

          <div className={styles.summaryBox}>
            <div className={styles.summaryRow}>
              <span>Seats Picked</span>
              <span>{state.selectedSeats.length > 0 ? state.selectedSeats.join(', ') : '-'}</span>
            </div>
            
            <div className={styles.summaryRow}>
              <span>Dates ({state.selectedDates.length})</span>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.2rem', fontSize: '0.8rem', fontWeight: 700, color: '#0f172a' }}>
                {state.selectedDates.map(d => (
                  <span key={d.getTime()}>{formatDateString(d)}</span>
                ))}
              </div>
            </div>
            
            <div className={styles.summaryRow}>
              <span>Time Slot</span>
              <span>{state.customStartTime} &ndash; {state.customEndTime}</span>
            </div>
            
            <div className={styles.summaryRow}>
              <span>Payment</span>
              <span>Pay at Desk</span>
            </div>
          </div>

          <div className={styles.costBreakdown}>
            <div className={styles.costTitle}>COST BREAKDOWN</div>
            <div className={styles.costRow} style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '0.85rem', color: '#64748b' }}>
                <span>₹{unitPrice} × {state.usersCount} seat{state.usersCount > 1 ? 's' : ''}</span>
                <span>₹{unitPrice * state.usersCount} / day</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '0.85rem', color: '#64748b' }}>
                <span>Total Days</span>
                <span>× {state.selectedDates.length}</span>
              </div>
            </div>

            <button 
              type="button"
              className={styles.totalBtn}
              onClick={() => {
                if (state.step < TOTAL_STEPS) {
                  goNext();
                }
              }}
              disabled={state.step === 2 && state.selectedSeats.length !== state.usersCount}
            >
              <span>Total Price</span>
              <span>₹{totalPrice}</span>
            </button>
          </div>
          
        </div>
        
      </div>

    </div>
  );
}
