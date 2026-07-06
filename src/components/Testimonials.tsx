'use client';

import { useEffect, useRef } from 'react';
import styles from './Testimonials.module.css';

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

/* ──────────────────────────────────────────────────────────────
   Review data — ** wraps the yellow-highlighted phrase
   ─────────────────────────────────────────────────────────── */
const reviews = [
  {
    name: 'Nisa Samuel',
    role: 'customer',
    initials: 'NS',
    avatarColor: '#3B5998',
    photo: null,
    quote: 'The space was quiet, clean and comfortable. **Wi-Fi worked perfectly** and I finished my work without any interruptions.',
    date: '14th June 2025',
    rotate: '-1.8deg',
  },
  {
    name: 'Suraj Shettigar',
    role: 'Developer',
    initials: 'SS',
    avatarColor: '#C2185B',
    photo: null,
    quote: 'A good place for small teams who need **a quiet, productive environment** with basic office facilities.',
    date: '3rd May 2025',
    rotate: '1.2deg',
  },
  {
    name: 'Nived P',
    role: 'Senior Accountant',
    initials: 'NP',
    avatarColor: '#00796B',
    photo: null,
    quote: 'Excellent coworking space with **fast internet and helpful staff.** A great place to work. Highly recommend.',
    date: '22nd June 2025',
    rotate: '-0.6deg',
  },
  {
    name: 'Ramdas C.',
    role: 'customer',
    initials: 'RC',
    avatarColor: '#E65100',
    photo: null,
    quote: 'I was delighted by **the ambience provided by LivBiz** — unlike any previous meeting space I\'ve visited.',
    date: '30th June 2025',
    rotate: '2.1deg',
  },
  {
    name: 'Anthony Fernandes',
    role: 'Business Manager',
    initials: 'AF',
    avatarColor: '#2E7D32',
    photo: null,
    quote: '**Great business centre** with good facilities and service for corporate meets and training programs.',
    date: '18th June 2025',
    rotate: '-1.3deg',
  },
  {
    name: 'Team Ivy Living',
    role: 'Training Partner',
    initials: 'TIL',
    avatarColor: '#5C35A0',
    photo: null,
    quote: 'LivBiz has become **our preferred venue** for team trainings. The experience exceeded every expectation.',
    date: '2nd July 2025',
    rotate: '0.8deg',
  },
];

/* Number of spiral holes to render */
const HOLE_COUNT = 5;

export default function Testimonials() {
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
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    cardRefs.current.forEach((card) => {
      if (card) observer.observe(card);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section id="stories" className={styles.section} aria-label="Community Reviews">
      <div className={`container ${styles.container}`}>

        {/* ── Header ───────────────────────────────────────── */}
        <div className={styles.header}>
          <h2>From Our Community</h2>
          <p>Professionals and teams who work and grow at LivBiz.</p>
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
                        style={{ backgroundColor: review.avatarColor }}
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
                    {/* Decorative ruled-page icons (mimicking the design) */}
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
