'use client';

import { useEffect, useRef } from 'react';
import styles from './GoogleReviews.module.css';

/* ──────────────────────────────────────────────────────────────
   Highlight helper — wraps marked phrases in yellow spans
   Format: "Normal text **highlighted phrase** more text"
   ─────────────────────────────────────────────────────────── */
function HighlightedQuote({ text }: { text: string }) {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return (
    <p className={styles.quoteText}>
      {parts.map((part, i) =>
        i % 2 === 1
          ? <mark key={i} className={styles.highlight}>{part}</mark>
          : <span key={i}>{part}</span>
      )}
    </p>
  );
}

const reviews = [
  {
    name: 'Nisa Samuel',
    role: 'customer',
    photo: '/images/testimonial-woman.jpg',
    quote: 'Needed a place to work for a few hours. The space was quiet and clean. **Wi-Fi worked well** and I finished my work without any interruptions.',
    date: '14th June 2026',
    rotate: '-1.8deg',
  },
  {
    name: 'Suraj Shettigar',
    role: 'customer',
    photo: '/images/testimonial-man.jpg',
    quote: 'LivBiz is a convenient co-working space with a professional setup. It\'s a good place for small teams who need **a quiet, productive environment**.',
    date: '3rd May 2026',
    rotate: '1.2deg',
  },
  {
    name: 'Nived P',
    role: 'customer',
    photo: '/images/featured-testimonial-man.jpg',
    quote: 'Excellent Coworking space with **a comfortable work environment, Fast internet and helpful staff**. Highly recommend.',
    date: '22nd June 2026',
    rotate: '-0.6deg',
  },
  {
    name: 'Ramdas C.',
    role: 'customer',
    photo: null,
    initials: 'RC',
    bgColor: '#ff9800',
    quote: 'Delighted to experience the training session here just because of **the ambience provided by LivBiz Coworking** unlike previous meeting spaces.',
    date: '30th June 2026',
    rotate: '2.1deg',
  },
  {
    name: 'Anthony Fernandes',
    role: 'Business Manager',
    photo: null,
    initials: 'AF',
    bgColor: '#4caf50',
    quote: '**Great business centre** with good facilities and service for corporate meets and training programs.',
    date: '18th June 2026',
    rotate: '-1.3deg',
  },
  {
    name: 'Team Ivy Living',
    role: 'Training Partner',
    photo: '/images/featured-testimonial-man.jpg',
    quote: 'We recently conducted training here. The meeting facilities, seating, and support ensured **our session ran smoothly from start to finish**.',
    date: '2nd July 2026',
    rotate: '0.8deg',
  },
];

const HOLE_COUNT = 5;

export default function GoogleReviews() {
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).classList.add(styles.visible);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -20px 0px' }
    );

    cardRefs.current.forEach((card) => {
      if (card) observer.observe(card);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section className={styles.section} id="stories" aria-label="Loved by Our Community">
      <div className={`container ${styles.container}`}>

        {/* ── Section Header ─────────────────────────────────── */}
        <div className={styles.header}>
          <p className={styles.kicker}>LOVED BY OUR COMMUNITY</p>
          <h2>4.9★ Google Reviews</h2>
          <p>Real reviews from real professionals who work at LivBiz.</p>
        </div>

        {/* ── Cards Grid ───────────────────────────────────── */}
        <div className={styles.cardsGrid}>
          {reviews.map((review, index) => (
            <div
              key={review.name}
              ref={(el) => { cardRefs.current[index] = el; }}
              className={styles.card}
              style={{
                '--card-rotate': review.rotate,
                transitionDelay: `${index * 0.08}s`,
              } as React.CSSProperties}
            >
              {/* Ruled paper texture */}
              <div className={styles.cardRuled} aria-hidden="true" />

              {/* Spiral binding holes */}
              <div className={styles.spiralHoles} aria-hidden="true">
                {Array.from({ length: HOLE_COUNT }).map((_, i) => (
                  <div key={i} className={styles.hole} />
                ))}
              </div>

              {/* Card content */}
              <div className={styles.cardBody}>

                {/* Header: name + photo */}
                <div className={styles.cardHeader}>
                  <div>
                    <p className={styles.authorName}>{review.name}</p>
                    <p className={styles.authorRole}>{review.role}</p>
                  </div>
                  <div className={styles.authorPhoto} aria-hidden="true">
                    {review.photo ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={review.photo} alt={`${review.name} photo`} />
                    ) : (
                      <div
                        className={styles.authorAvatar}
                        style={{ backgroundColor: review.bgColor }}
                      >
                        {review.initials}
                      </div>
                    )}
                  </div>
                </div>

                {/* Highlighted quote */}
                <HighlightedQuote text={review.quote} />

                {/* Footer */}
                <div className={styles.cardFooter}>
                  <div className={styles.footerIcons} aria-hidden="true">
                    <div className={styles.footerIcon}>
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <circle cx="5" cy="5" r="3.5" stroke="#999" strokeWidth="1.2"/>
                        <path d="M5 3v2l1.5 1.5" stroke="#999" strokeWidth="1.2" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <div className={styles.footerIcon}>
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <rect x="1.5" y="1.5" width="7" height="7" rx="1" stroke="#999" strokeWidth="1.2"/>
                        <path d="M3 5h4M3 3.5h4M3 6.5h2" stroke="#999" strokeWidth="1.2" strokeLinecap="round"/>
                      </svg>
                    </div>
                  </div>
                  <time className={styles.reviewDate}>{review.date}</time>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
