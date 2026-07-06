'use client';

import React, { useRef, useEffect } from 'react';
import styles from './PremiumCampuses.module.css';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const spaces = [
  {
    id: 'open-workstations',
    title: 'Open Workstations',
    description: 'Flexible hot desks in a bright, open-plan layout with ergonomic seating, power access, and natural light.',
    image: '/images/workspace-open-2.png',
    alt: 'LivBiz open workstation area with privacy dividers',
  },
  {
    id: 'meeting-rooms',
    title: 'Private Meeting Rooms',
    description: 'Acoustically soundproof meeting rooms equipped with screens, AC, and seating for up to 6.',
    image: '/images/meeting-room-3.png',
    alt: 'LivBiz meeting room with warm ambient lighting',
  },
  {
    id: 'conference-rooms',
    title: 'Executive Conference Rooms',
    description: 'Spacious boardrooms with glass walls, large displays, and seating for up to 12 — ideal for important pitches.',
    image: '/images/conference-room-1.png',
    alt: 'LivBiz conference room with long table and glass walls',
  },
  {
    id: 'training-hubs',
    title: 'Team Training Hubs',
    description: 'Fully furnished spaces with state-of-the-art presentation systems and flexible seating arrangements.',
    image: '/images/conference-training.png',
    alt: 'Training session in progress at LivBiz conference room',
  },
  {
    id: 'dedicated-desks',
    title: 'Dedicated Desks',
    description: 'Your own personal desk space reserved exclusively for you, surrounded by productivity-boosting amenities.',
    image: '/images/workspace-open-1.png',
    alt: 'LivBiz dedicated workstation area with multiple desks',
  },
];

export default function PremiumCampuses() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const updateCardTransforms = () => {
    const container = scrollRef.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const containerCenter = containerRect.left + containerRect.width / 2;
    const cards = container.querySelectorAll('.' + styles.card);

    cards.forEach((card) => {
      const rect = card.getBoundingClientRect();
      const cardCenter = rect.left + rect.width / 2;
      const distanceFromCenter = cardCenter - containerCenter;
      
      // Calculate normalised ratio between -1 and 1
      const maxDistance = containerRect.width / 1.5;
      const ratio = Math.max(-1, Math.min(1, distanceFromCenter / maxDistance));
      const absRatio = Math.abs(ratio);

      const htmlCard = card as HTMLElement;
      htmlCard.style.setProperty('--scroll-ratio', ratio.toFixed(4));
      htmlCard.style.setProperty('--scroll-ratio-abs', absRatio.toFixed(4));
    });
  };

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    // Run on mount, scroll, and resize
    updateCardTransforms();
    container.addEventListener('scroll', updateCardTransforms, { passive: true });
    window.addEventListener('resize', updateCardTransforms, { passive: true });

    // Initial positioning to center the Executive Conference Rooms (Index 2)
    const centerInitialElement = () => {
      const cards = container.querySelectorAll('.' + styles.card);
      const targetCard = cards[2] as HTMLElement;
      if (targetCard) {
        const containerCenter = container.offsetWidth / 2;
        const cardCenter = targetCard.offsetLeft + targetCard.offsetWidth / 2;
        container.scrollLeft = cardCenter - containerCenter;
      }
      updateCardTransforms();
    };

    // Trigger centering layout
    const timer = setTimeout(centerInitialElement, 150);

    return () => {
      container.removeEventListener('scroll', updateCardTransforms);
      window.removeEventListener('resize', updateCardTransforms);
      clearTimeout(timer);
    };
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollRef.current;
    if (!container) return;

    const cardWidth = container.querySelector('.' + styles.card)?.getBoundingClientRect().width || 520;
    const gap = 32; // gap size matching css
    const scrollAmount = cardWidth + gap;

    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <section id="workspace" className={styles.section} aria-label="Our Spaces">
      <div className={styles.wrapper}>
        
        {/* ── Header ───────────────────────────────────────── */}
        <div className={`container ${styles.header}`}>
          <p className={styles.kicker}>Our Spaces</p>
          <h2>Explore the LivBiz Workspace</h2>
          <p>Professional, well-maintained spaces designed for focused work, team meetings, and client conversations.</p>
        </div>

        {/* ── 3D Scroll Gallery Stage ──────────────────────── */}
        <div className={styles.galleryContainer}>
          <div className={styles.scrollStage} ref={scrollRef}>
            {spaces.map((space) => (
              <div
                key={space.id}
                className={space.id === 'conference-rooms' ? `${styles.card} ${styles.initialFocusCard}` : styles.card}
                style={{
                  '--scroll-ratio': '0',
                  '--scroll-ratio-abs': '0',
                } as React.CSSProperties}
              >
                <div className={styles.imageWrapper}>
                  <Image
                    src={space.image}
                    alt={space.alt}
                    fill
                    sizes="(max-width: 640px) 320px, 520px"
                    className={styles.image}
                    priority
                  />
                  <div className={styles.cardOverlay} />
                </div>
                <div className={styles.cardContent}>
                  <h3 className={styles.cardTitle}>{space.title}</h3>
                  <p className={space.id === 'conference-rooms' ? `${styles.cardDescription} ${styles.focusText}` : styles.cardDescription}>{space.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Controls */}
          <button
            onClick={() => scroll('left')}
            className={`${styles.navBtn} ${styles.leftBtn}`}
            aria-label="Scroll left"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            onClick={() => scroll('right')}
            className={`${styles.navBtn} ${styles.rightBtn}`}
            aria-label="Scroll right"
          >
            <ChevronRight size={22} />
          </button>
        </div>

      </div>
    </section>
  );
}
