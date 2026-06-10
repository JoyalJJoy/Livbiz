'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { X, Mail, Lock, Eye, EyeOff, ChevronLeft, ChevronRight, Phone, Users, LogIn, CheckCircle } from 'lucide-react';
import BookingLottie from './BookingLottie';
import InteractiveFloorPlan from './InteractiveFloorPlan';
import styles from './DayPassWizard.module.css';
import { createBrowserClient } from '@/lib/supabase/client';
import { useSupabaseAuth } from '@/components/SupabaseAuthProvider';

interface BookingState {
  step: number;
  usersCount: number;
  selectedSeats: string[];
  planId: 'regular';
  selectedDates: Date[];
  timeMode: 'full' | 'half' | 'custom';
  customStartTime: string;
  customEndTime: string;
  bookingType: 'daily' | 'monthly';
  monthlyStartDate: Date;
  monthlyEndDate: Date;
  monthlyDurationMode: '1month' | '2months' | '3months' | 'custom';
}

const TOTAL_STEPS = 5;

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

export default function DayPassWizard() {
  const router = useRouter();
  const { user: authUser, session, isLoading: authLoading } = useSupabaseAuth();
  const isLoggedIn = !authLoading && !!session;
  
  const today = new Date();

  const defaultMonthlyEndDate = new Date(today);
  defaultMonthlyEndDate.setMonth(defaultMonthlyEndDate.getMonth() + 1);
  defaultMonthlyEndDate.setDate(defaultMonthlyEndDate.getDate() - 1);

  const [state, setState] = useState<BookingState>({
    step: 1,
    usersCount: 1,
    selectedSeats: [],
    planId: 'regular',
    selectedDates: [today], // Default to today
    timeMode: 'full',
    customStartTime: '09:00 AM',
    customEndTime: '08:00 PM', // Default exit time updated to 8:00 PM
    bookingType: 'daily',
    monthlyStartDate: today,
    monthlyEndDate: defaultMonthlyEndDate,
    monthlyDurationMode: '1month',
  });

  // Local state for calendar navigation
  const [currentCalendarDate, setCurrentCalendarDate] = useState<Date>(today);

  // Dynamic unit price calculation based on timeMode and custom duration
  let unitPrice = 350; // default full day
  if (state.timeMode === 'half') {
    unitPrice = 250;
  } else if (state.timeMode === 'custom') {
    const duration = getDurationInHours(state.customStartTime, state.customEndTime);
    if (duration <= 5) {
      unitPrice = 250;
    } else {
      unitPrice = 350;
    }
  }

  let totalPrice = 0;
  if (state.bookingType === 'monthly') {
    let monthlyUnitPrice = 2250;
    if (state.monthlyDurationMode === '1month') {
      monthlyUnitPrice = 2250;
    } else if (state.monthlyDurationMode === '2months') {
      monthlyUnitPrice = 4500;
    } else if (state.monthlyDurationMode === '3months') {
      monthlyUnitPrice = 6750;
    } else if (state.monthlyDurationMode === 'custom') {
      const diffTime = Math.abs(state.monthlyEndDate.getTime() - state.monthlyStartDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      monthlyUnitPrice = Math.max(250, diffDays * 75);
    }
    totalPrice = monthlyUnitPrice * state.usersCount;
  } else {
    totalPrice = unitPrice * state.usersCount * Math.max(1, state.selectedDates.length);
  }

  const handleMonthlyDurationModeChange = (mode: '1month' | '2months' | '3months' | 'custom') => {
    setState(s => {
      let nextEnd = new Date(s.monthlyStartDate);
      if (mode === '1month') {
        nextEnd.setMonth(nextEnd.getMonth() + 1);
        nextEnd.setDate(nextEnd.getDate() - 1);
      } else if (mode === '2months') {
        nextEnd.setMonth(nextEnd.getMonth() + 2);
        nextEnd.setDate(nextEnd.getDate() - 1);
      } else if (mode === '3months') {
        nextEnd.setMonth(nextEnd.getMonth() + 3);
        nextEnd.setDate(nextEnd.getDate() - 1);
      }
      return {
        ...s,
        monthlyDurationMode: mode,
        monthlyEndDate: nextEnd,
        bookingType: 'monthly',
      };
    });
  };

  const handleMonthlyDateClick = (day: number) => {
    const calendarYear = currentCalendarDate.getFullYear();
    const calendarMonth = currentCalendarDate.getMonth();
    const clickedDate = new Date(calendarYear, calendarMonth, day);
    
    const todayCheck = new Date();
    todayCheck.setHours(0, 0, 0, 0);
    if (clickedDate < todayCheck) {
      return;
    }

    setState(s => {
      let nextStart = s.monthlyStartDate;
      let nextEnd = s.monthlyEndDate;

      if (s.monthlyDurationMode === 'custom') {
        const isStartSameAsEnd = s.monthlyStartDate.getTime() === s.monthlyEndDate.getTime();
        
        if (isStartSameAsEnd) {
          if (clickedDate > s.monthlyStartDate) {
            nextEnd = clickedDate;
          } else {
            nextStart = clickedDate;
            nextEnd = clickedDate;
          }
        } else {
          nextStart = clickedDate;
          nextEnd = clickedDate;
        }
      } else {
        nextStart = clickedDate;
        nextEnd = new Date(clickedDate);
        
        if (s.monthlyDurationMode === '1month') {
          nextEnd.setMonth(nextEnd.getMonth() + 1);
        } else if (s.monthlyDurationMode === '2months') {
          nextEnd.setMonth(nextEnd.getMonth() + 2);
        } else if (s.monthlyDurationMode === '3months') {
          nextEnd.setMonth(nextEnd.getMonth() + 3);
        }
        nextEnd.setDate(nextEnd.getDate() - 1);
      }

      return {
        ...s,
        monthlyStartDate: nextStart,
        monthlyEndDate: nextEnd,
      };
    });
  };

  // Login & signup form state
  const [isSignUp, setIsSignUp] = useState(true);
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

  const fetchBookedSeats = useCallback(async (startD: Date, endD?: Date) => {
    try {
      const slotsRes = await fetch('/api/slots?type=DAY_PASS');
      if (!slotsRes.ok) return;
      const slots = await slotsRes.json();
      const matchedSlot = slots.find((s: { name: string }) => s.name === 'Regular Day Pass');
      if (!matchedSlot) return;

      let url = `/api/slots/booked-seats?slotId=${matchedSlot.id}`;
      if (endD) {
        const y1 = startD.getFullYear();
        const m1 = String(startD.getMonth() + 1).padStart(2, '0');
        const d1 = String(startD.getDate()).padStart(2, '0');
        const y2 = endD.getFullYear();
        const m2 = String(endD.getMonth() + 1).padStart(2, '0');
        const d2 = String(endD.getDate()).padStart(2, '0');
        url += `&startDate=${y1}-${m1}-${d1}&endDate=${y2}-${m2}-${d2}`;
      } else {
        const y = startD.getFullYear();
        const m = String(startD.getMonth() + 1).padStart(2, '0');
        const d = String(startD.getDate()).padStart(2, '0');
        url += `&date=${y}-${m}-${d}`;
      }

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setBookedSeats(data.bookedSeatIds || []);
      }
    } catch (err) {
      console.error('Failed to fetch booked seats:', err);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(() => fetchAvailability(currentCalendarDate));
  }, [currentCalendarDate, fetchAvailability]);

  // Fetch booked seats for the selected dates or range
  useEffect(() => {
    if (state.bookingType === 'monthly') {
      void Promise.resolve().then(() => fetchBookedSeats(state.monthlyStartDate, state.monthlyEndDate));
    } else if (state.selectedDates.length > 0) {
      void Promise.resolve().then(() => fetchBookedSeats(state.selectedDates[0]));
    }
  }, [state.bookingType, state.selectedDates, state.monthlyStartDate, state.monthlyEndDate, fetchBookedSeats]);

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

      if (state.bookingType === 'monthly') {
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

        const startTime = new Date(state.monthlyStartDate.getFullYear(), state.monthlyStartDate.getMonth(), state.monthlyStartDate.getDate(), startHours, startMinutes);
        const endTime = new Date(state.monthlyEndDate.getFullYear(), state.monthlyEndDate.getMonth(), state.monthlyEndDate.getDate(), endHours, endMinutes);

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
            totalPrice: totalPrice,
            seats: state.usersCount,
            seatIds: state.selectedSeats,
            attendees: [{ name, email }],
            notes: `Monthly Pass booking - duration: ${state.monthlyDurationMode}`,
          }),
        });

        if (!bookingRes.ok) {
          const errData = await bookingRes.json();
          throw new Error(errData.error || 'Failed to create booking');
        }
      } else {
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
      }
      router.push('/dashboard/bookings');
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Failed to create booking.');
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
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: finalPassword,
      });
      
      if (signInError) {
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



  // Dynamic Calendar Data calculation
  const calendarYear = currentCalendarDate.getFullYear();
  const calendarMonth = currentCalendarDate.getMonth();
  const monthName = currentCalendarDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  
  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  const startEmptyCells = new Date(calendarYear, calendarMonth, 1).getDay();

  const emptyCells = Array.from({ length: startEmptyCells });
  const dayCells = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const isPrevMonthDisabled = new Date(calendarYear, calendarMonth - 1, 1) < new Date(today.getFullYear(), today.getMonth(), 1);

  const handlePrevMonth = () => {
    if (isPrevMonthDisabled) return;
    const nextCalDate = new Date(calendarYear, calendarMonth - 1, 1);
    setCurrentCalendarDate(nextCalDate);
    
    const todayVal = new Date();
    let targetDay = todayVal.getDate();
    const maxDays = new Date(nextCalDate.getFullYear(), nextCalDate.getMonth() + 1, 0).getDate();
    targetDay = Math.min(targetDay, maxDays);
    
    const newSelectedDate = new Date(nextCalDate.getFullYear(), nextCalDate.getMonth(), targetDay);
    const todayCheck = new Date();
    todayCheck.setHours(0, 0, 0, 0);
    
    if (newSelectedDate >= todayCheck) {
      setState(s => ({ ...s, selectedDates: [newSelectedDate] }));
    } else {
      const fallbackDate = new Date(todayCheck);
      setState(s => ({ ...s, selectedDates: [fallbackDate] }));
    }
  };

  const handleNextMonth = () => {
    const nextCalDate = new Date(calendarYear, calendarMonth + 1, 1);
    setCurrentCalendarDate(nextCalDate);
    
    const todayVal = new Date();
    let targetDay = todayVal.getDate();
    const maxDays = new Date(nextCalDate.getFullYear(), nextCalDate.getMonth() + 1, 0).getDate();
    targetDay = Math.min(targetDay, maxDays);
    
    const newSelectedDate = new Date(nextCalDate.getFullYear(), nextCalDate.getMonth(), targetDay);
    const todayCheck = new Date();
    todayCheck.setHours(0, 0, 0, 0);
    
    if (newSelectedDate >= todayCheck) {
      setState(s => ({ ...s, selectedDates: [newSelectedDate] }));
    } else {
      const fallbackDate = new Date(todayCheck);
      setState(s => ({ ...s, selectedDates: [fallbackDate] }));
    }
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
      <div className={`${styles.mainContent} ${state.step < 5 ? styles.noBorderRight : ''}`}>
        
        <div className={styles.contentHeader}>
          <h2>
            {state.step === 1 && 'Number of Users'}
            {state.step === 2 && 'Choose Dates'}
            {state.step === 3 && 'Business Hours'}
            {state.step === 4 && 'Choose Desk Layout'}
            {state.step === 5 && (isLoggedIn ? 'Confirm Booking' : (isSignUp ? 'Sign Up' : 'Login'))}
          </h2>
          <button className={styles.closeBtn} onClick={() => router.push('/book')}>
            <X size={16} />
          </button>
        </div>

        {/* Auth hint banner for unauthenticated users */}
        {!isLoggedIn && !authLoading && state.step < 5 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', margin: '0 1.5rem', marginBottom: '0.5rem', background: 'linear-gradient(135deg, #eff6ff, #f0f9ff)', border: '1px solid #bfdbfe', borderRadius: '8px', fontSize: '0.8rem', color: '#1e40af' }}>
            <LogIn size={14} />
            <span>You&apos;ll need to sign in or create an account to confirm your booking</span>
          </div>
        )}
        
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

          {/* STEP 4: CHOOSE SEAT LAYOUT */}
          {state.step === 4 && (
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

          {/* STEP 2: CHOOSE DATES */}
          {state.step === 2 && (
            <>
              <div className={styles.frequencyToggleContainer}>
                <button
                  type="button"
                  className={`${styles.frequencyToggleBtn} ${state.bookingType === 'daily' ? styles.active : ''}`}
                  onClick={() => setState(s => ({ ...s, bookingType: 'daily' }))}
                >
                  Daily Pass
                </button>
                <button
                  type="button"
                  className={`${styles.frequencyToggleBtn} ${state.bookingType === 'monthly' ? styles.active : ''}`}
                  onClick={() => handleMonthlyDurationModeChange('1month')}
                >
                  Monthly Pass
                </button>
              </div>

              <p className={styles.subTitle}>
                {state.bookingType === 'monthly' 
                  ? 'Select the starting date of your monthly workspace pass subscription'
                  : 'Select one or more dates for your booking (click to toggle)'}
              </p>
              
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
                    
                    const isSelected = state.bookingType === 'monthly'
                      ? (cellDate >= new Date(state.monthlyStartDate.getFullYear(), state.monthlyStartDate.getMonth(), state.monthlyStartDate.getDate()) &&
                         cellDate <= new Date(state.monthlyEndDate.getFullYear(), state.monthlyEndDate.getMonth(), state.monthlyEndDate.getDate()))
                      : state.selectedDates.some(
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
                        onClick={() => !isDisabled && (
                          state.bookingType === 'monthly'
                            ? handleMonthlyDateClick(day)
                            : handleDateToggle(day)
                        )}
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

              {state.bookingType === 'monthly' && (
                <div className={styles.durationSelectorContainer}>
                  <p className={styles.durationTitle}>Select Subscription Duration</p>
                  <div className={styles.durationCardsGrid}>
                    <div 
                      className={`${styles.durationCard} ${state.monthlyDurationMode === '1month' ? styles.activeDuration : ''}`}
                      onClick={() => handleMonthlyDurationModeChange('1month')}
                    >
                      <div className={styles.durationCardHeader}>1 Month</div>
                      <div className={styles.durationCardPrice}>₹2,250</div>
                      <div className={styles.durationCardRate}>₹75/day</div>
                    </div>
                    
                    <div 
                      className={`${styles.durationCard} ${state.monthlyDurationMode === '2months' ? styles.activeDuration : ''}`}
                      onClick={() => handleMonthlyDurationModeChange('2months')}
                    >
                      <div className={styles.durationCardHeader}>2 Months</div>
                      <div className={styles.durationCardPrice}>₹4,500</div>
                      <div className={styles.durationCardRate}>₹75/day</div>
                    </div>
                    
                    <div 
                      className={`${styles.durationCard} ${state.monthlyDurationMode === '3months' ? styles.activeDuration : ''}`}
                      onClick={() => handleMonthlyDurationModeChange('3months')}
                    >
                      <div className={styles.durationCardHeader}>3 Months</div>
                      <div className={styles.durationCardPrice}>₹6,750</div>
                      <div className={styles.durationCardRate}>₹75/day</div>
                    </div>

                    <div 
                      className={`${styles.durationCard} ${state.monthlyDurationMode === 'custom' ? styles.activeDuration : ''}`}
                      onClick={() => handleMonthlyDurationModeChange('custom')}
                    >
                      <div className={styles.durationCardHeader}>Custom Range</div>
                      <div className={styles.durationCardPrice}>Flex</div>
                      <div className={styles.durationCardRate}>₹75/day</div>
                    </div>
                  </div>

                  {state.monthlyDurationMode === 'custom' && (
                    <div className={styles.customRangeHelper}>
                      <span className={styles.customRangeText}>
                        Selected range: <strong>{formatDateString(state.monthlyStartDate)}</strong> to <strong>{formatDateString(state.monthlyEndDate)}</strong> 
                        ({Math.ceil(Math.abs(state.monthlyEndDate.getTime() - state.monthlyStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1} days)
                      </span>
                      <p className={styles.customRangeTip}>Click a start date, then click an end date on the calendar above to define your custom range.</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* STEP 3: TIME SLOT SELECTION */}
          {state.step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <p className={styles.subTitle}>Select your day pass access duration</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Full Day Card */}
                <div 
                  onClick={() => setState(s => ({ ...s, timeMode: 'full', customStartTime: '09:00 AM', customEndTime: '08:00 PM' }))}
                  style={{ cursor: 'pointer', padding: '1.25rem', border: '1px solid #e2e8f0', borderRadius: '12px', transition: 'all 0.2s', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: state.timeMode === 'full' ? '#f8fafc' : 'white', boxShadow: state.timeMode === 'full' ? '0 0 0 2px #0f172a' : 'none' }}
                >
                  <div>
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '1rem' }}>Full Day</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.2rem' }}>09:00 AM - 08:00 PM (11 hours)</div>
                  </div>
                  <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.15rem' }}>₹350</div>
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
                  <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.15rem' }}>₹250</div>
                </div>

                {/* Custom Time Card */}
                <div 
                  onClick={() => setState(s => ({ ...s, timeMode: 'custom' }))}
                  style={{ cursor: 'pointer', padding: '1.25rem', border: '1px solid #e2e8f0', borderRadius: '12px', transition: 'all 0.2s', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: state.timeMode === 'custom' ? '#f8fafc' : 'white', boxShadow: state.timeMode === 'custom' ? '0 0 0 2px #0f172a' : 'none' }}
                >
                  <div>
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '1rem' }}>Custom Time</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.2rem' }}>Choose your own hours. Less than 5 hrs: ₹250 | 5+ hrs: ₹350</div>
                  </div>
                  <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.15rem' }}>
                    {state.timeMode === 'custom' ? `₹${unitPrice}` : 'Flex'}
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
                Workspace access is granted strictly between the selected hours. Front reception desk check-in buffer allows entering up to 15 minutes early.
              </div>
            </div>
          )}

          {/* STEP 5: CONFIRM BOOKING (logged in) or LOGIN / SIGNUP (not logged in) */}
          {state.step === 5 && (
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
                      <div className={styles.inputField} style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <span style={{ padding: '0 0.5rem', color: '#64748b', borderRight: '1px solid #e2e8f0', marginRight: '0.5rem' }}>+91</span>
                        <input 
                          type="tel"
                          required
                          style={{ border: 'none', outline: 'none', width: '100%', padding: 0, background: 'transparent', fontSize: 'inherit', color: 'inherit' }}
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

                {!isSignUp && (
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
                )}

                {loginError && (
                  <div style={{ color: '#ef4444', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1rem', textAlign: 'center' }}>
                    {loginError}
                  </div>
                )}

                <button type="submit" className={styles.loginSubmitBtn} disabled={isLoggingIn}>
                  {isSignUp ? (isLoggingIn ? 'Signing up...' : 'Sign up & Book') : (isLoggingIn ? 'Signing in...' : 'Sign in & Book')}
                </button>

                {isSignUp ? (
                  <div className={styles.signUpText}>
                    Already registered? <span className={styles.signUpLink} onClick={() => { setIsSignUp(false); setLoginError(null); }}>Sign in</span>
                  </div>
                ) : (
                  <div className={styles.signUpText}>
                    New user? <span className={styles.signUpLink} onClick={() => { setIsSignUp(true); setLoginError(null); }}>Sign up</span>
                  </div>
                )}

              </form>
            )
          )}

        </div>

        {/* STICKY footer navigation inside middle column */}
        <div className={styles.footerNav}>
          {state.step > 1 ? (
            <button type="button" className={styles.footerBackBtn} onClick={goBack}>
              &lt; Back
            </button>
          ) : (
            <div /> // Spacer to align Next to the right
          )}
          
          {state.step < TOTAL_STEPS && (
            <button 
              type="button" 
              className={styles.footerNextBtn} 
              onClick={goNext} 
              disabled={state.step === 4 && state.selectedSeats.length !== state.usersCount}
            >
              Next
            </button>
          )}
        </div>

      </div>

      {/* 3. RIGHT COLUMN (SUMMARY) */}
      {state.step === 5 && (
        <div className={styles.summarySidebar}>
          
          <div className={styles.summaryHeader}>
            <h2>Summary</h2>
          </div>
          
          <div className={styles.summaryBody}>
            
            <div className={styles.personTag}>
              {state.usersCount} USER{state.usersCount > 1 ? 'S' : ''}
            </div>
            <div className={styles.selectedPass}>
              {state.bookingType === 'monthly' ? 'Monthly Workspace Pass' : 'Casual Day Pass'}
            </div>

            <div className={styles.summaryBox}>
              <div className={styles.summaryRow}>
                <span>Seats Picked</span>
                <span>{state.selectedSeats.length > 0 ? state.selectedSeats.join(', ') : '-'}</span>
              </div>
              
              {state.bookingType === 'monthly' ? (
                <div className={styles.summaryRow}>
                  <span>Duration</span>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.2rem', fontSize: '0.8rem', fontWeight: 700, color: '#0f172a' }}>
                    <span>From: {formatDateString(state.monthlyStartDate)}</span>
                    <span>To: {formatDateString(state.monthlyEndDate)}</span>
                  </div>
                </div>
              ) : (
                <div className={styles.summaryRow}>
                  <span>Dates ({state.selectedDates.length})</span>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.2rem', fontSize: '0.8rem', fontWeight: 700, color: '#0f172a' }}>
                    {state.selectedDates.map(d => (
                      <span key={d.getTime()}>{formatDateString(d)}</span>
                    ))}
                  </div>
                </div>
              )}
              
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
              
              {state.bookingType === 'monthly' ? (
                <div className={styles.costRow} style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '0.85rem', color: '#64748b' }}>
                    <span>Package ({state.monthlyDurationMode === 'custom' ? 'Custom Range' : state.monthlyDurationMode.replace('1month', '1 Month').replace('months', ' Months')})</span>
                    <span>₹{totalPrice / state.usersCount} / user</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '0.85rem', color: '#64748b' }}>
                    <span>Users count</span>
                    <span>× {state.usersCount}</span>
                  </div>
                </div>
              ) : (
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
              )}

              <button 
                type="button"
                className={styles.totalBtn}
                onClick={() => {
                  if (state.step < TOTAL_STEPS) {
                    goNext();
                  }
                }}
                disabled={false}
              >
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
