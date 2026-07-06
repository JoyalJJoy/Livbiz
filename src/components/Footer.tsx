'use client';

import React from 'react';
import styles from './Footer.module.css';

export default function Footer() {
  const cols = 51;
  const rows = 12;
  const spacing = 16;
  const radius = 3.5;
  const width = (cols - 1) * spacing + radius * 2 + 10;
  const height = (rows - 1) * spacing + radius * 2 + 10;

  const circles = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      // Normalise coordinates to center the heart
      const x = (c - 25) / 7.5;
      const y = -(r - 5.0) / 4.0; // Invert y since r increases downwards

      // Heart equation: (x^2 + y^2 - 0.95)^3 - x^2 * y^3
      const eq = Math.pow(x * x + y * y - 0.95, 3) - x * x * Math.pow(y, 3);

      let color = '#E2DDD5'; // Light dot color
      if (eq <= 0) {
        color = '#1C1917'; // Heart color (charcoal)
      } else if (eq < 0.12) {
        color = '#8A8075'; // Anti-aliasing edge
      } else if (eq < 0.28) {
        color = '#B8AEA3'; // Outer smooth transition
      }

      const cx = c * spacing + radius + 5;
      const cy = r * spacing + radius + 5;

      circles.push(
        <circle
          key={`${r}-${c}`}
          cx={cx}
          cy={cy}
          r={radius}
          fill={color}
        />
      );
    }
  }

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.card}>
          
          {/* Top Row: Brand Logo + Navigation Links */}
          <div className={styles.topRow}>
            <div className={styles.brand}>
              <div className={styles.brandLogoRow}>
                <div className={styles.brandLogoMark}>
                  <img
                    src="/images/logo.png"
                    alt=""
                    style={{ width: '85%', height: '85%', objectFit: 'contain', objectPosition: 'center 35%' }}
                  />
                </div>
                <span className={styles.brandName}>LivBizz</span>
              </div>
            </div>

            <div className={styles.linksGrid}>
              <div className={styles.linkColumn}>
                <a href="#workspace" className={styles.linkBold}>Workspace</a>
                <a href="#booking" className={styles.linkBold}>Bookings</a>
                <a href="#" className={styles.linkLight}>Privacy Policy</a>
                <a href="#" className={styles.linkLight}>Terms of Service</a>
                <a href="#" className={styles.linkLight}>Cookie Policy</a>
              </div>
              <div className={styles.linkColumn}>
                <a href="#features" className={styles.linkBold}>Our Features</a>
                <a href="#stories" className={styles.linkBold}>Reviews</a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className={styles.linkLight}>Instagram</a>
              </div>
            </div>
          </div>

          {/* Middle Row: Copyright + Registration Info */}
          <div className={styles.middleRow}>
            <p className={styles.infoText}>
              &copy; {new Date().getFullYear()}, LivBizz Ltd. Bengaluru. All rights reserved.
            </p>
            <p className={styles.infoText}>
              Registered in Karnataka, India No.: 13044361
            </p>
          </div>

          {/* Bottom Row: Heart Dot Grid */}
          <div className={styles.dotGridContainer}>
            <svg
              viewBox={`0 0 ${width} ${height}`}
              width="100%"
              height="auto"
              className={styles.dotGridSvg}
              aria-hidden="true"
            >
              {circles}
            </svg>
          </div>

        </div>
      </div>
    </footer>
  );
}
