'use client';

import React, { useState } from 'react';
import styles from './InteractiveFloorPlan.module.css';

interface SeatPickerProps {
  type: 'regular' | 'premium';
  bookedSeats: string[];
  selectedSeats: string[];
  onToggleSeat: (id: string) => void;
  onClearSeats?: () => void;
  onBookSeats?: () => void;
}

export default function InteractiveFloorPlan({
  type,
  bookedSeats,
  selectedSeats,
  onToggleSeat,
  onClearSeats,
  onBookSeats
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
    const isBooked = bookedSeats.includes(seatId);
    const isSelected = selectedSeats.includes(seatId);
    const isAvailable = !isBooked;

    let statusClass = styles.available;
    if (isBooked) statusClass = styles.booked;
    else if (isSelected) statusClass = styles.selected;

    return (
      <button
        key={seatId}
        type="button"
        disabled={!isAvailable}
        onClick={() => onToggleSeat(seatId)}
        className={`${styles.seatPill} ${statusClass}`}
        title={isBooked ? `Seat ${seatId} (Booked)` : isSelected ? `Seat ${seatId} (Selected)` : `Seat ${seatId} (Available)`}
      >
        {seatId}
      </button>
    );
  };

  return (
    <div className={styles.floorPlanContainer}>
      
      {/* ── TOP LEGEND ROW (OUTSIDE CANVAS BUT INSIDE CARD) ── */}
      <div className={styles.legendHeader}>
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
          <span className={styles.legendLabel}>Booked</span>
        </div>
        <div className={styles.legendItem}>
          <span className={`${styles.legendBox} ${styles.conferenceBox}`}></span>
          <span className={styles.legendLabel}>Conference</span>
        </div>
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
            
            {/* ── TOP SECTION (CONFERENCE, WC, LOBBY CORE) ── */}
            <div className={styles.topRow}>
              
              {/* Small Conference Room (Top-Left) */}
              <div className={styles.smallConferenceTop}>
                <div className={styles.smallConfLabel}>Small Conference</div>
                <div className={styles.smallConfTable}>
                  {/* 4 purple seats C1, C2, C3, C4 */}
                  <div className={styles.confSeatsTop}>
                    <span className={styles.confSeat}>C1</span>
                    <span className={styles.confSeat}>C2</span>
                  </div>
                  <div className={styles.confTableBody}></div>
                  <div className={styles.confSeatsBottom}>
                    <span className={styles.confSeat}>C3</span>
                    <span className={styles.confSeat}>C4</span>
                  </div>
                </div>
              </div>

              {/* WC Toilet (Top-Middle) */}
              <div className={styles.wcTop}>
                <span className={styles.wcTopLabel}>WC</span>
                <div className={styles.wcTopsContainer}>
                  {/* Left toilet drawing */}
                  <div className={styles.wcToiletDrawing}>
                    <div className={styles.toiletBack}></div>
                    <div className={styles.toiletBowl}></div>
                  </div>
                  {/* Right toilet drawing */}
                  <div className={styles.wcToiletDrawing}>
                    <div className={styles.toiletBack}></div>
                    <div className={styles.toiletBowl}></div>
                  </div>
                </div>
              </div>

              {/* Lobby Core with lift and stairs (Top-Right) */}
              <div className={styles.lobbyCore}>
                <div className={styles.stairLabelUp}>UP ↗</div>
                <div className={styles.liftCore}>
                  <div className={styles.liftText}>LIFT</div>
                  <div className={styles.liftSize}>5'x5'</div>
                </div>
                <div className={styles.stairLabelDn}>DN ↘</div>
              </div>

            </div>

            {/* ── HORIZONTAL WALL DIVIDER ── */}
            <div className={styles.horizontalWall}></div>

            {/* ── BOTTOM SECTION ── */}
            <div className={styles.bottomRow}>
              
              {/* Left Side: Workstations A, B, C, D (63% width) */}
              <div className={styles.workstationsArea}>
                
                {/* Workstation A (Top-Left Cluster) */}
                <div className={styles.workstationCluster} style={{ top: '10px', left: '10px' }}>
                  <div className={styles.clusterTitle}>Workstation A</div>
                  <div className={styles.desksRow}>
                    <div className={styles.deskItem}>
                      <div className={styles.seatTop}>{renderSeatButton('S1')}</div>
                      <div className={styles.deskBody}></div>
                      <div className={styles.seatBottom}>{renderSeatButton('S3')}</div>
                    </div>
                    <div className={styles.deskItem}>
                      <div className={styles.seatTop}>{renderSeatButton('S2')}</div>
                      <div className={styles.deskBody}></div>
                      <div className={styles.seatBottom}>{renderSeatButton('S4')}</div>
                    </div>
                  </div>
                </div>

                {/* Workstation B (Top-Right Cluster) */}
                <div className={styles.workstationCluster} style={{ top: '10px', right: '10px' }}>
                  <div className={styles.clusterTitle}>Workstation B</div>
                  <div className={styles.desksRow}>
                    <div className={styles.deskItem}>
                      <div className={styles.seatTop}>{renderSeatButton('S5')}</div>
                      <div className={styles.deskBody}></div>
                      <div className={styles.seatBottom}>{renderSeatButton('S7')}</div>
                    </div>
                    <div className={styles.deskItem}>
                      <div className={styles.seatTop}>{renderSeatButton('S6')}</div>
                      <div className={styles.deskBody}></div>
                      <div className={styles.seatBottom}>{renderSeatButton('S8')}</div>
                    </div>
                  </div>
                </div>

                {/* Workstation C (Bottom-Left Cluster) */}
                <div className={styles.workstationCluster} style={{ bottom: '10px', left: '10px' }}>
                  <div className={styles.clusterTitle}>Workstation C</div>
                  <div className={styles.desksRow}>
                    <div className={styles.deskItem}>
                      <div className={styles.seatTop}>{renderSeatButton('S9')}</div>
                      <div className={styles.deskBody}></div>
                      <div className={styles.seatBottom}>{renderSeatButton('S11')}</div>
                    </div>
                    <div className={styles.deskItem}>
                      <div className={styles.seatTop}>{renderSeatButton('S10')}</div>
                      <div className={styles.deskBody}></div>
                      <div className={styles.seatBottom}>{renderSeatButton('S12')}</div>
                    </div>
                  </div>
                </div>

                {/* Workstation D (Bottom-Right Cluster) */}
                <div className={styles.workstationCluster} style={{ bottom: '10px', right: '10px' }}>
                  <div className={styles.clusterTitle}>Workstation D</div>
                  <div className={styles.desksRow}>
                    <div className={styles.deskItem}>
                      <div className={styles.seatTop}>{renderSeatButton('S13')}</div>
                      <div className={styles.deskBody}></div>
                      <div className={styles.seatBottom}>{renderSeatButton('S15')}</div>
                    </div>
                    <div className={styles.deskItem}>
                      <div className={styles.seatTop}>{renderSeatButton('S14')}</div>
                      <div className={styles.deskBody}></div>
                      <div className={styles.seatBottom}>{renderSeatButton('S16')}</div>
                    </div>
                  </div>
                </div>

              </div>

              {/* ── DASHED VERTICAL PARTITION LINE ── */}
              <div className={styles.verticalDashedLine}></div>

              {/* Right Side: WC & Large Conference (37% width) */}
              <div className={styles.conferenceArea}>
                
                {/* Side Toilet/WC */}
                <div className={styles.toiletRight}>
                  <div className={styles.toiletBasin}></div>
                  <div className={styles.toiletRightDrawing}>
                    <div className={styles.toiletBackRight}></div>
                    <div className={styles.toiletBowlRight}></div>
                  </div>
                </div>

                {/* Large Conference Room */}
                <div className={styles.largeConference}>
                  <div className={styles.largeConfLabel}>Large Conference</div>
                  <div className={styles.largeConfTableContainer}>
                    
                    {/* Seats left */}
                    <div className={styles.largeConfSeatsLeft}>
                      <span className={styles.confSeat}>L13</span>
                      <span className={styles.confSeat}>L14</span>
                    </div>

                    {/* Table center and Top/Bottom seats */}
                    <div className={styles.largeConfTableCenter}>
                      <div className={styles.largeConfSeatsTop}>
                        {['L1', 'L2', 'L3', 'L4', 'L5', 'L6'].map(id => (
                          <span key={id} className={styles.confSeat}>{id}</span>
                        ))}
                      </div>
                      
                      <div className={styles.largeConfTableBody}></div>
                      
                      <div className={styles.largeConfSeatsBottom}>
                        {['L7', 'L8', 'L9', 'L10', 'L11', 'L12'].map(id => (
                          <span key={id} className={styles.confSeat}>{id}</span>
                        ))}
                      </div>
                    </div>

                    {/* Seats right */}
                    <div className={styles.largeConfSeatsRight}>
                      <span className={styles.confSeat}>L15</span>
                      <span className={styles.confSeat}>L16</span>
                    </div>

                  </div>
                </div>

              </div>

            </div>

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

    </div>
  );
}
