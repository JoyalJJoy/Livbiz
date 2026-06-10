'use client';

import React, { useState } from 'react';
import styles from './InteractiveFloorPlan.module.css';

interface SeatPickerProps {
  type: 'regular' | 'premium' | '6-seat' | '12-seat';
  bookedSeats?: string[];
  selectedSeats: string[];
  onToggleSeat: (id: string) => void;
  onClearSeats?: () => void;
  onBookSeats?: () => void;
  mode?: 'seat' | 'room';
}

const UNAVAILABLE_SEATS = ['S1', 'S2', 'S11'];

const SEAT_POSITIONS: Record<string, { left: string; top: string }> = {
  // Bottom-left table (4 seats)
  S1: { left: '12.82%', top: '50.78%' },  // Circled (unavailable)
  S2: { left: '12.82%', top: '58.59%' },  // Circled (unavailable)
  S3: { left: '24.71%', top: '50.78%' },
  S4: { left: '24.71%', top: '58.59%' },
  
  // Middle table (6 seats)
  S5: { left: '34.38%', top: '50.78%' },
  S6: { left: '34.38%', top: '58.59%' },
  S7: { left: '34.38%', top: '66.41%' },
  S8: { left: '45.69%', top: '50.78%' },
  S9: { left: '45.69%', top: '58.59%' },
  S10: { left: '45.69%', top: '66.41%' },

  // Vertical bar counter (4 seats)
  S11: { left: '58.28%', top: '48.34%' }, // Circled (unavailable)
  S12: { left: '58.28%', top: '57.13%' },
  S13: { left: '58.28%', top: '66.89%' },
  S14: { left: '58.28%', top: '75.68%' }
};

const ROOM_ZONES = [
  {
    id: '6-seat',
    name: '6-Seat Conference Room',
    left: '18.99%',
    top: '22.46%',
    width: '26.22%',
    height: '35.16%'
  },
  {
    id: '12-seat',
    name: '12-Seat Conference Room',
    left: '75.51%',
    top: '70.31%',
    width: '27.27%',
    height: '47.85%'
  }
];

export default function InteractiveFloorPlan({
  bookedSeats = [],
  selectedSeats,
  onToggleSeat,
  onClearSeats,
  onBookSeats,
  mode = 'seat'
}: SeatPickerProps) {

  // Viewport Zoom & Drag State
  const [scale, setScale] = useState(1.0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Prevent dragging when clicking active button elements
    if ((e.target as HTMLElement).tagName === 'BUTTON') return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).tagName === 'BUTTON') return;
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX - position.x, y: e.touches[0].clientY - position.y });
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    if (e.touches.length === 1) {
      setPosition({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleZoomIn = () => setScale(s => Math.min(2.5, s + 0.15));
  const handleZoomOut = () => setScale(s => Math.max(0.5, s - 0.15));
  const handleReset = () => {
    setScale(1.0);
    setPosition({ x: 0, y: 0 });
  };

  const renderSeatButton = (seatId: string) => {
    const isBooked = bookedSeats.includes(seatId) || UNAVAILABLE_SEATS.includes(seatId);
    const isSelected = selectedSeats.includes(seatId);
    const isAvailable = !isBooked;

    let statusClass = styles.available;
    if (isBooked) statusClass = styles.booked;
    else if (isSelected) statusClass = styles.selected;

    const pos = SEAT_POSITIONS[seatId];
    if (!pos) return null;

    return (
      <button
        key={seatId}
        type="button"
        disabled={!isAvailable}
        onClick={() => onToggleSeat(seatId)}
        className={`${styles.seatPill} ${statusClass}`}
        style={{
          position: 'absolute',
          left: pos.left,
          top: pos.top,
          transform: 'translate(-50%, -50%)',
          zIndex: 20
        }}
        title={isBooked ? `Seat ${seatId} (Unavailable)` : isSelected ? `Seat ${seatId} (Selected)` : `Seat ${seatId} (Available)`}
      >
        {seatId}
      </button>
    );
  };

  return (
    <div className={styles.floorPlanContainer}>
      
      {/* ── TOP LEGEND ROW (OUTSIDE CANVAS BUT INSIDE CARD) ── */}
      <div className={styles.legendHeader}>
        {mode === 'room' ? (
          <div className={styles.legendItem}>
            <span className={styles.legendLabel} style={{ fontSize: '0.85rem', color: '#ffffff', fontWeight: 700 }}>
              🗺️ Select your conference room directly on the floor plan
            </span>
          </div>
        ) : (
          <>
            <div className={styles.legendItem}>
              <span className={`${styles.legendBox} ${styles.availableBox}`}></span>
              <span className={styles.legendLabel}>Available</span>
            </div>
            <div className={styles.legendItem}>
              <span className={`${styles.legendBox} ${styles.selectedBox}`}></span>
              <span className={styles.legendLabel}>Selected</span>
            </div>
            <div className={styles.legendItem}>
              <span className={`${styles.legendBox} ${styles.bookedBox}`}></span>
              <span className={styles.legendLabel}>Booked/Unavailable</span>
            </div>
          </>
        )}
      </div>
 
      {/* ── ZOOMABLE & PANNING VIEWPORT WRAPPER ── */}
      <div className={styles.viewportWrapper}>
        
        <div 
          className={styles.cadViewport}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* ── MAIN FLAT 2D BLUEPRINT CANVAS ── */}
          <div 
            className={styles.cadFloor}
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              transformOrigin: 'center center',
              cursor: isDragging ? 'grabbing' : 'grab',
              transition: isDragging ? 'none' : 'transform 0.15s ease-out'
            }}
          >
            {mode === 'room' ? (
              ROOM_ZONES.map(room => {
                const isSelected = selectedSeats.includes(room.id);
                return (
                  <button
                    key={room.id}
                    type="button"
                    onClick={() => onToggleSeat(room.id)}
                    className={`${styles.roomZone} ${isSelected ? styles.roomSelected : ''}`}
                    style={{
                      position: 'absolute',
                      left: room.left,
                      top: room.top,
                      width: room.width,
                      height: room.height,
                      transform: 'translate(-50%, -50%)',
                      zIndex: 30
                    }}
                    title={`Click to select ${room.name}`}
                  >
                    <span className={styles.roomZoneLabel}>{room.name}</span>
                  </button>
                );
              })
            ) : (
              Object.keys(SEAT_POSITIONS).map(seatId => renderSeatButton(seatId))
            )}
          </div>
          
        </div>

        {/* Floating Pan Help Text */}
        <div className={styles.panHelpText}>↔ Drag/Swipe to move layout</div>

        {/* Viewport Floating Zoom Controls */}
        <div className={styles.viewportControls}>
          <button type="button" className={styles.controlBtn} onClick={handleZoomIn} title="Zoom In">+</button>
          <button type="button" className={styles.controlBtn} onClick={handleZoomOut} title="Zoom Out">-</button>
          <button type="button" className={styles.controlBtn} onClick={handleReset} title="Reset View">↺</button>
        </div>

      </div>

      {/* ── MOCKUP FOOTER CONTROL BAR ── */}
      {mode === 'seat' && (
        <div className={styles.footerBar}>
          <div className={styles.selectedSeatStatus}>
            {selectedSeats.length > 0 ? (
              <span>Seat selected: <strong style={{ color: '#ffffff' }}>{selectedSeats.join(', ')}</strong></span>
            ) : (
              <span>No seat selected</span>
            )}
          </div>
          <div className={styles.footerActions}>
            <button
              type="button"
              className={styles.clearBtn}
              onClick={onClearSeats}
              disabled={selectedSeats.length === 0}
            >
              Clear
            </button>
            <button
              type="button"
              className={styles.bookBtn}
              onClick={onBookSeats}
              disabled={selectedSeats.length === 0}
            >
              Book seat
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
