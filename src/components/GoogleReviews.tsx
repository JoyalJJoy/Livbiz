'use client';

import React from 'react';
import styles from './GoogleReviews.module.css';

const reviews = [
  {
    id: 1,
    name: 'Nisa Samuel',
    quote: 'Needed a place to work for a few hours. **The space was quiet, clean, and comfortable.** Wi-Fi worked well and I finished my work without any interruptions.',
  },
  {
    id: 2,
    name: 'Suraj Shettigar',
    quote: 'LivBiz is a convenient co-working space with a professional setup. It\'s a good place for small teams who need **a quiet, productive environment** with basic office facilities.',
  },
  {
    id: 3,
    name: 'Nived P',
    quote: 'Excellent Coworking space with **a comfortable work environment, fast internet, and helpful staff**. A great place to work and collaborate. Highly recommend.',
  },
  {
    id: 4,
    name: 'Ramdas C.',
    quote: 'Very recently conducted training here. I was very delighted to experience **the superb ambience provided by LivBiz** unlike previous meeting spaces.',
  },
  {
    id: 5,
    name: 'Anthony Fernandes',
    quote: '**Great business centre with good facilities** and service for corporate meets and training programs.',
  },
  {
    id: 6,
    name: 'Team Ivy Living',
    quote: 'The meeting facilities, comfortable seating, reliable internet, and supportive staff **ensured our training session ran smoothly from start to finish**.',
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

                {/* Author Info Row without Google Icon but with source text */}
                <div className={styles.authorRow}>
                  <div className={styles.authorInfo}>
                    <h4>{review.name}</h4>
                    <p className={styles.sourceText}>via Google Maps</p>
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
