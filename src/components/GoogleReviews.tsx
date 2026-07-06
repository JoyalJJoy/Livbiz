'use client';

import React from 'react';
import styles from './GoogleReviews.module.css';

const reviews = [
  {
    id: 1,
    name: 'Nisa Samuel',
    role: 'Remote Professional',
    quote: 'Needed a place to work for a few hours. **The space was quiet, clean, and comfortable.** Wi-Fi worked well and I finished my work without any interruptions.',
    date: 'a month ago',
  },
  {
    id: 2,
    name: 'Suraj Shettigar',
    role: 'Founder & Consultant',
    quote: 'LivBiz is a convenient co-working space with a professional setup. It\'s a good place for small teams who need **a quiet, productive environment** with basic office facilities.',
    date: '2 months ago',
  },
  {
    id: 3,
    name: 'Nived P',
    role: 'Freelance Developer',
    quote: 'Excellent Coworking space with **a comfortable work environment, fast internet, and helpful staff**. A great place to work and collaborate. Highly recommend.',
    date: '3 weeks ago',
  },
  {
    id: 4,
    name: 'Ramdas C.',
    role: 'Corporate Trainer',
    quote: 'Very recently conducted training here. I was very delighted to experience **the superb ambience provided by LivBiz** unlike previous meeting spaces.',
    date: 'a week ago',
  },
  {
    id: 5,
    name: 'Anthony Fernandes',
    role: 'Business Manager',
    quote: '**Great business centre with good facilities** and service for corporate meets and training programs.',
    date: '2 weeks ago',
  },
  {
    id: 6,
    name: 'Team Ivy Living',
    role: 'Training Partner',
    quote: 'The meeting facilities, comfortable seating, reliable internet, and supportive staff **ensured our training session ran smoothly from start to finish**.',
    date: 'a month ago',
  },
];

/* Highlight parser for Apple Store typography (bold white highlights, muted gray secondary text) */
function HighlightedQuote({ text }: { text: string }) {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return (
    <p className={styles.quoteText}>
      {parts.map((part, i) =>
        i % 2 === 1
          ? <span key={i} className={styles.highlight}>{part}</span>
          : <span key={i} className={styles.secondaryText}>{part}</span>
      )}
    </p>
  );
}

export default function GoogleReviews() {
  // Duplicate reviews to create a seamless infinite loop in the marquee track
  const duplicatedReviews = [...reviews, ...reviews, ...reviews];

  return (
    <section className={styles.section} id="stories" aria-label="Loved by Our Community">
      <div className={styles.wrapper}>

        {/* ── Section Header (Apple Style) ─────────────────── */}
        <div className={`container ${styles.headerContainer}`}>
          <div className={styles.header}>
            <p className={styles.kicker}>LOVED BY OUR COMMUNITY</p>
            <h2>4.9★ Google Reviews</h2>
          </div>
        </div>

        {/* ── Auto-Scrolling Marquee Track ─────────────────── */}
        <div className={styles.carouselContainer}>
          <div className={styles.scrollTrack}>
            {duplicatedReviews.map((review, index) => (
              <div key={`${review.id}-${index}`} className={styles.card}>
                
                {/* 5 Stars Rating */}
                <div className={styles.starsRow} aria-label="5 stars">
                  {'★'.repeat(5)}
                </div>

                {/* Highlighted Quote text */}
                <HighlightedQuote text={review.quote} />

                {/* Author Row with Common Google Icon */}
                <div className={styles.authorRow}>
                  <div className={styles.avatarWrapper}>
                    <svg viewBox="0 0 24 24" className={styles.googleIcon} aria-hidden="true">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                  </div>
                  <div className={styles.authorInfo}>
                    <h4>{review.name}</h4>
                    <p>{review.role} · {review.date}</p>
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
