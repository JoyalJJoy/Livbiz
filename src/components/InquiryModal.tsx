'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import BookingLottie from './booking/BookingLottie';
import wizardStyles from './booking/DayPassWizard.module.css';
import styles from './InquiryModal.module.css';
import { PROPEXCEL_LINKS } from '@/lib/propexcel-links';

// The form is cross-origin, so its height can't be read at runtime; this is its tallest layout (narrow screens)
const FORM_HEIGHT = 800;

interface InquiryModalProps {
  onClose: () => void;
}

export default function InquiryModal({ onClose }: InquiryModalProps) {
  const frameAreaRef = useRef<HTMLDivElement>(null);
  const [frameArea, setFrameArea] = useState({ width: 0, height: 0 });

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  useEffect(() => {
    const element = frameAreaRef.current;
    if (!element) return;

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setFrameArea({ width, height });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const scale = frameArea.height > 0 ? Math.min(1, frameArea.height / FORM_HEIGHT) : 1;

  // Portal to <body>: the navbar uses a CSS transform, which would otherwise trap a fixed overlay inside it
  return createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={`${wizardStyles.modalContainer} ${styles.modal}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="inquiry-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={wizardStyles.leftSidebar}>
          <div style={{ width: '150px', height: '150px', position: 'relative' }}>
            <div style={{ position: 'absolute', top: -30, left: 0, right: 0, zIndex: 10 }}>
              <BookingLottie />
            </div>
          </div>

          <h2 className={wizardStyles.leftSidebarTitle}>Get in Touch</h2>
          <p className={wizardStyles.leftSidebarText}>
            Tell us what you need and our team will get back to you with availability and pricing.
          </p>
        </div>

        <div className={`${wizardStyles.mainContent} ${wizardStyles.noBorderRight}`}>
          <div className={wizardStyles.contentHeader}>
            <h2 id="inquiry-modal-title">Send an Inquiry</h2>
            <button className={wizardStyles.closeBtn} onClick={onClose} aria-label="Close inquiry form">
              <X size={16} />
            </button>
          </div>

          <div ref={frameAreaRef} className={styles.frameArea}>
            <iframe
              src={PROPEXCEL_LINKS.inquiryEmbed}
              title="Send an Inquiry"
              className={styles.frame}
              style={{
                width: frameArea.width / scale || '100%',
                height: frameArea.height / scale || '100%',
                transform: `scale(${scale})`,
              }}
            />
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
