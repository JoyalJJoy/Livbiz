'use client';

import React from 'react';
import styles from './DayInTheLife.module.css';
import Image from 'next/image';

const steps = [
  {
    id: 1,
    time: 'Step 01',
    label: 'Easy Booking',
    title: 'Find a Time That Works for You',
    description: 'Browse available day passes and meeting rooms, select your slot, and secure your workspace in a few clicks.',
    image: '/images/workspace-open-1.png',
    alt: 'Workspace desks ready for booking at LivBiz',
    rotation: '-3deg',
    offsetX: '-15px',
    offsetY: '10px',
  },
  {
    id: 2,
    time: 'Step 02',
    label: 'Arrive Ready',
    title: 'Walk Into a Focused Setup',
    description: 'Use the space for client calls, planning, desk work or team discussions without spending the day arranging basics.',
    image: '/images/meeting-room-3.png',
    alt: 'Private meeting room space at LivBiz',
    rotation: '2deg',
    offsetX: '0px',
    offsetY: '-5px',
  },
  {
    id: 3,
    time: 'Step 03',
    label: 'Grow Steady',
    title: 'Scale Your Work Rhythm',
    description: 'Keep the flexibility of booking when needed, then move toward a more regular setup as your work expands.',
    image: '/images/conference-room-1.png',
    alt: 'Large executive conference room space at LivBiz',
    rotation: '-1.5deg',
    offsetX: '15px',
    offsetY: '15px',
  },
];

export default function DayInTheLife() {
  return (
    <section id="experience" className={styles.section}>
      <div className={`container ${styles.container}`}>
        
        {/* ── Section Header ─────────────────────────────────── */}
        <div className={styles.header}>
          <h2>Get Your Office Up and Running in Minutes</h2>
          <p>
            Fully furnished, simple to book, and built to keep your workday moving. Hover to expand the steps.
          </p>
        </div>

        {/* ── Layered Card Deck ──────────────────────────────── */}
        <div className={styles.deckContainer} aria-label="Interactive workspace steps deck">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={styles.card}
              style={{
                '--default-rotate': step.rotation,
                '--default-x': step.offsetX,
                '--default-y': step.offsetY,
                '--card-index': index + 1,
                zIndex: index + 1,
              } as React.CSSProperties}
            >
              {/* Image Header */}
              <div className={styles.imageWrapper}>
                <Image
                  src={step.image}
                  alt={step.alt}
                  fill
                  sizes="(max-width: 640px) 280px, 360px"
                  className={styles.image}
                />
                <span className={styles.timeBadge}>{step.time}</span>
              </div>

              {/* Text Body */}
              <div className={styles.cardBody}>
                <span className={styles.label}>{step.label}</span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
