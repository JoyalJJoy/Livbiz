'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import styles from './Navbar.module.css';
import Link from 'next/link';
import NavbarAccountButton from './NavbarAccountButton';
import InquiryModal from './InquiryModal';
import { Phone, ChevronDown, Menu, X, MessageSquare } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '#booking', label: 'Booking' },
  { href: '#workspace', label: 'Workspace' },
  { href: '#stories', label: 'Reviews' },
  { href: '#features', label: 'Features' },
];

export default function Navbar() {
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const openInquiry = () => {
    setIsContactOpen(false);
    setIsMobileOpen(false);
    setIsInquiryOpen(true);
  };
  const closeInquiry = useCallback(() => setIsInquiryOpen(false), []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsContactOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!isMobileOpen) return;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [isMobileOpen]);

  return (
    <header className={styles.header}>
      <div className={`container ${styles.navContainer}`}>
        <div className={styles.logo}>
          <Link href="/" onClick={() => setIsMobileOpen(false)}>
            <div className={styles.logoIcon}>
              <Image 
                src="/images/logo.png" 
                alt="LivBizz emblem" 
                width={0}
                height={0}
                sizes="100vw"
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
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className={styles.link}>{item.label}</Link>
          ))}
        </nav>

        <div className={styles.action}>
          
          {/* Contact Dropdown */}
          <div className={styles.contactDropdown} ref={dropdownRef}>
            <button 
              onClick={() => setIsContactOpen(!isContactOpen)}
              className={`${styles.contactButton} ${isContactOpen ? styles.contactButtonActive : ''}`}
              aria-haspopup="true"
              aria-expanded={isContactOpen}
            >
              <Phone size={16} />
              <span>Contact</span>
              <ChevronDown size={14} style={{ transform: isContactOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
            </button>
            {isContactOpen && (
              <div className={styles.dropdownMenu}>
                <a href="tel:8088631765" className={styles.dropdownItem}>
                  <Phone size={14} className={styles.phoneIcon} />
                  <span>8088631765</span>
                </a>
                <a href="tel:8095797304" className={styles.dropdownItem}>
                  <Phone size={14} className={styles.phoneIcon} />
                  <span>8095797304</span>
                </a>
                <button type="button" className={styles.dropdownItem} onClick={openInquiry}>
                  <MessageSquare size={14} className={styles.phoneIcon} />
                  <span>Send an Inquiry</span>
                </button>
              </div>
            )}
          </div>

          <NavbarAccountButton />

          {/* Hamburger Toggle */}
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className={styles.hamburger}
            aria-label={isMobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMobileOpen}
          >
            {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileOpen && (
        <div className={styles.mobileOverlay} onClick={() => setIsMobileOpen(false)}>
          <nav className={styles.mobileMenu} onClick={(e) => e.stopPropagation()}>
            <div className={styles.mobileLinks}>
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={styles.mobileLink}
                  onClick={() => setIsMobileOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <div className={styles.mobileContact}>
              <a href="tel:8088631765" className={styles.mobilePhone}>8088 631 765</a>
              <a href="tel:8095797304" className={styles.mobilePhone}>8095 797 304</a>
              <button type="button" className={styles.mobilePhone} onClick={openInquiry}>Send an Inquiry</button>
            </div>
          </nav>
        </div>
      )}

      {isInquiryOpen && <InquiryModal onClose={closeInquiry} />}
    </header>
  );
}
