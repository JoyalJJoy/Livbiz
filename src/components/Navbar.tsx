'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from './Navbar.module.css';
import Link from 'next/link';
import NavbarAccountButton from './NavbarAccountButton';
import { Phone, ChevronDown } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className={styles.header}>
      <div className={`container ${styles.navContainer}`}>
        <div className={styles.logo}>
          <Link href="/">
            <div className={styles.logoIcon}>
              <img 
                src="/images/logo.png" 
                alt="LivBizz emblem" 
                style={{ 
                  width: '80%', 
                  height: '80%', 
                  objectFit: 'contain',
                  objectPosition: 'center 35%'
                }} 
              />
            </div>
            <span className={styles.logoText}>
              LivBizz
            </span>
          </Link>
        </div>
        <nav className={styles.navLinks}>
          <Link href="/" className={styles.link}>Home</Link>
          <Link href="#booking" className={styles.link}>Booking</Link>
          <Link href="#workspace" className={styles.link}>Workspace</Link>
          <Link href="#stories" className={styles.link}>Reviews</Link>
          <Link href="#features" className={styles.link}>Features</Link>
        </nav>
        <div className={styles.action}>
          
          {/* Contact Dropdown */}
          <div className={styles.contactDropdown} ref={dropdownRef}>
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className={`${styles.contactButton} ${isOpen ? styles.contactButtonActive : ''}`}
              aria-haspopup="true"
              aria-expanded={isOpen}
            >
              <Phone size={16} />
              <span>Contact</span>
              <ChevronDown size={14} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
            </button>
            {isOpen && (
              <div className={styles.dropdownMenu}>
                <a href="tel:8088631765" className={styles.dropdownItem}>
                  <Phone size={14} className={styles.phoneIcon} />
                  <span>8088631765</span>
                </a>
                <a href="tel:8095797304" className={styles.dropdownItem}>
                  <Phone size={14} className={styles.phoneIcon} />
                  <span>8095797304</span>
                </a>
              </div>
            )}
          </div>

          <NavbarAccountButton />
        </div>
      </div>
    </header>
  );
}
