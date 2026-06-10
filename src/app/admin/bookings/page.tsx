'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Loader2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './bookings.module.css';

interface BookingItem {
  id: string;
  userName: string;
  userEmail: string;
  userPhone: string | null;
  slotName: string;
  slotType: string;
  campusName: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string | null;
  paymentReference: string | null;
  paymentDate: string | null;
  notes: string | null;
  adminNotes: string | null;
  seats?: number;
  seatIds?: string[];
  createdAt: string;
  tickets: {
    id: string;
    code: string;
    qrData: string;
    status: string;
    validFrom: string;
    validUntil: string;
    usedAt: string | null;
    attendeeIndex?: number | null;
    recipientEmail?: string | null;
    sentAt?: string | null;
  }[];
}

const TABS = ['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'];

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [qrModal, setQrModal] = useState<BookingItem | null>(null);
  
  // Payment Confirm Modal States
  const [paymentConfirmModal, setPaymentConfirmModal] = useState<BookingItem | null>(null);
  const [paymentDone, setPaymentDone] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'UPI'>('UPI');
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentDate, setPaymentDate] = useState('');

  // Details & Edit Modal States
  const [detailsModal, setDetailsModal] = useState<BookingItem | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editStartTime, setEditStartTime] = useState('');
  const [editEndTime, setEditEndTime] = useState('');
  const [editSeats, setEditSeats] = useState(1);
  const [editSeatIds, setEditSeatIds] = useState('');
  const [editTotalPrice, setEditTotalPrice] = useState(0);
  const [editNotes, setEditNotes] = useState('');
  const [editAdminNotes, setEditAdminNotes] = useState('');
  const [editPaymentStatus, setEditPaymentStatus] = useState('PENDING');
  const [editPaymentMethod, setEditPaymentMethod] = useState('UPI');
  const [editPaymentReference, setEditPaymentReference] = useState('');
  const [editPaymentDate, setEditPaymentDate] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const statusParam = activeTab !== 'ALL' ? `&status=${activeTab}` : '';
      const res = await fetch(`/api/admin/bookings?page=${page}&limit=10${statusParam}`);
      if (res.ok) {
        const data = await res.json();
        setBookings(data.bookings || []);
        setTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, page]);

  useEffect(() => {
    (async () => {
      await fetchBookings();
    })();
  }, [fetchBookings]);

  const handleAction = async (bookingId: string, action: 'approve' | 'reject' | 'cancel') => {
    if (action === 'approve') {
      const b = bookings.find((item) => item.id === bookingId);
      if (b) {
        setPaymentConfirmModal(b);
        setPaymentDone(false);
        setPaymentMethod('UPI');
        setPaymentReference('');
        setPaymentDate(new Date().toISOString().split('T')[0]);
      }
      return;
    }

    const confirmMsg = action === 'reject'
      ? 'Reject this booking? The user will be notified.'
      : 'Cancel this booking?';

    if (!confirm(confirmMsg)) return;

    setActionLoading(bookingId);
    try {
      const res = await fetch('/api/admin/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, action }),
      });

      if (res.ok) {
        fetchBookings();
      } else {
        const data = await res.json();
        alert(data.error || 'Action failed');
      }
    } catch {
      alert('Network error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleApproveWithPayment = async () => {
    if (!paymentConfirmModal) return;
    const bookingId = paymentConfirmModal.id;
    setActionLoading(bookingId);
    
    const body: Record<string, any> = {
      bookingId,
      action: 'approve'
    };
    
    if (paymentDone) {
      body.paymentStatus = 'PAID';
      body.paymentMethod = paymentMethod;
      body.paymentReference = paymentReference;
      body.paymentDate = new Date(paymentDate).toISOString();
    } else {
      body.paymentStatus = 'PENDING';
    }
    
    setPaymentConfirmModal(null);
    
    try {
      const res = await fetch('/api/admin/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        fetchBookings();
      } else {
        const data = await res.json();
        alert(data.error || 'Action failed');
      }
    } catch {
      alert('Network error');
    } finally {
      setActionLoading(null);
    }
  };

  const openDetailsModal = (b: BookingItem) => {
    setDetailsModal(b);
    setEditMode(false);
    
    // Format dates safely for datetime-local input (YYYY-MM-DDThh:mm)
    const localStart = new Date(b.startTime);
    const tzOffsetStart = localStart.getTimezoneOffset() * 60000;
    const formattedStart = new Date(localStart.getTime() - tzOffsetStart).toISOString().slice(0, 16);
    setEditStartTime(formattedStart);

    const localEnd = new Date(b.endTime);
    const tzOffsetEnd = localEnd.getTimezoneOffset() * 60000;
    const formattedEnd = new Date(localEnd.getTime() - tzOffsetEnd).toISOString().slice(0, 16);
    setEditEndTime(formattedEnd);

    setEditSeats(b.seats ?? 1);
    setEditSeatIds(b.seatIds?.join(', ') || '');
    setEditTotalPrice(b.totalPrice);
    setEditNotes(b.notes || '');
    setEditAdminNotes(b.adminNotes || '');
    setEditPaymentStatus(b.paymentStatus || 'PENDING');
    setEditPaymentMethod((b.paymentMethod as 'CASH' | 'UPI') || 'UPI');
    setEditPaymentReference(b.paymentReference || '');
    setEditPaymentDate(b.paymentDate ? b.paymentDate.split('T')[0] : new Date().toISOString().split('T')[0]);
  };

  const handleSaveEdit = async () => {
    if (!detailsModal) return;
    setSaveLoading(true);
    try {
      const res = await fetch('/api/admin/bookings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: detailsModal.id,
          startTime: new Date(editStartTime).toISOString(),
          endTime: new Date(editEndTime).toISOString(),
          totalPrice: Number(editTotalPrice),
          seats: Number(editSeats),
          seatIds: editSeatIds,
          notes: editNotes || null,
          adminNotes: editAdminNotes || null,
          paymentStatus: editPaymentStatus,
          paymentMethod: editPaymentStatus === 'PAID' ? editPaymentMethod : null,
          paymentReference: editPaymentStatus === 'PAID' ? editPaymentReference : null,
          paymentDate: editPaymentStatus === 'PAID' ? new Date(editPaymentDate).toISOString() : null,
        }),
      });

      if (res.ok) {
        alert('Booking details updated successfully!');
        setEditMode(false);
        setDetailsModal(null);
        fetchBookings();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to save changes');
      }
    } catch {
      alert('Network error while saving changes');
    } finally {
      setSaveLoading(false);
    }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const formatTime = (d: string) => new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

  const getStatusClass = (status: string) => {
    const map: Record<string, string> = {
      PENDING: styles.statusPending,
      APPROVED: styles.statusApproved,
      REJECTED: styles.statusRejected,
      CANCELLED: styles.statusCancelled,
    };
    return map[status] || '';
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h1 className={styles.title}>Manage Bookings</h1>
        <p className={styles.subtitle}>Review, approve, or reject booking requests</p>
      </div>

      <div className={styles.tabs}>
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
            onClick={() => { setActiveTab(tab); setPage(1); }}
          >
            {tab === 'ALL' ? 'All' : tab.charAt(0) + tab.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {loading ? (
        <div className={styles.loadingState}>
          <Loader2 className="animate-spin" size={24} />
          <span>Loading bookings...</span>
        </div>
      ) : bookings.length === 0 ? (
        <div className={styles.emptyState}>No bookings found for this filter.</div>
      ) : (
        <>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Space</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id}>
                    <td>
                      <div className={styles.userCell}>
                        <span className={styles.userName}>{b.userName}</span>
                        <span className={styles.userEmail}>{b.userEmail}</span>
                      </div>
                    </td>
                    <td>
                      <span className={styles.slotName}>{b.slotName}</span>
                      <br />
                      <span className={styles.campusName}>{b.campusName}</span>
                    </td>
                    <td className={styles.dateCell}>{formatDate(b.startTime)}</td>
                    <td className={styles.timeCell}>{formatTime(b.startTime)} – {formatTime(b.endTime)}</td>
                    <td className={styles.amountCell}>₹{Number(b.totalPrice).toLocaleString()}</td>
                    <td>
                      <span className={`${styles.statusPill} ${getStatusClass(b.status)}`}>
                        {b.status.toLowerCase()}
                      </span>
                    </td>
                    <td>
                      <span className={`${styles.statusPill} ${b.paymentStatus === 'PAID' ? styles.statusPaid : b.paymentStatus === 'PENDING' ? styles.statusPendingPayment : styles.statusUnpaid}`}>
                        {b.paymentStatus.toLowerCase()}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actionBtns}>
                        <button className={styles.detailsBtn} onClick={() => openDetailsModal(b)}>
                          Details
                        </button>
                        {b.status === 'PENDING' && (
                          <>
                            <button
                              className={styles.approveBtn}
                              onClick={() => handleAction(b.id, 'approve')}
                              disabled={actionLoading === b.id}
                            >
                              {actionLoading === b.id ? '...' : 'Approve'}
                            </button>
                            <button
                              className={styles.rejectBtn}
                              onClick={() => handleAction(b.id, 'reject')}
                              disabled={actionLoading === b.id}
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {b.status === 'APPROVED' && b.tickets?.length > 0 && (
                          <button className={styles.viewQrBtn} onClick={() => setQrModal(b)}>
                            View QR
                          </button>
                        )}
                        {!['CANCELLED', 'REJECTED'].includes(b.status) && b.status !== 'PENDING' && (
                          <button
                            className={styles.cancelBtn}
                            onClick={() => handleAction(b.id, 'cancel')}
                            disabled={actionLoading === b.id}
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className={styles.pageBtn}>
                <ChevronLeft size={16} /> Prev
              </button>
              <span className={styles.pageInfo}>Page {page} of {totalPages}</span>
              <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className={styles.pageBtn}>
                Next <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}

      {/* QR Modal */}
      {qrModal && qrModal.tickets?.length > 0 && (
        <div className={styles.modalOverlay} onClick={() => setQrModal(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeModalBtn} onClick={() => setQrModal(null)}>
              <X size={20} />
            </button>
            <h3 className={styles.modalTitle}>Access Pass</h3>
            <p className={styles.modalSubtitle}>{qrModal.userName} — {qrModal.slotName}</p>
            <div className={styles.qrContainer}>
              <Image
                src={qrModal.tickets[0].qrData}
                alt="QR Code"
                width={200}
                height={200}
                style={{ borderRadius: '8px' }}
              />
            </div>
            <div className={styles.ticketCode}>{qrModal.tickets[0].code}</div>
            <div className={styles.modalDetails}>
              <div><strong>Valid:</strong> {formatDate(qrModal.tickets[0].validFrom)} {formatTime(qrModal.tickets[0].validFrom)} – {formatTime(qrModal.tickets[0].validUntil)}</div>
              <div><strong>Status:</strong> {qrModal.tickets[0].status}</div>
              {qrModal.tickets.length > 1 && (
                <div><strong>Tickets:</strong> {qrModal.tickets.length} generated</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Details & Edit Booking Modal */}
      {detailsModal && (
        <div className={styles.modalOverlay} onClick={() => { if (!saveLoading) setDetailsModal(null); }}>
          <div className={styles.modalContentLarge} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeModalBtn} onClick={() => setDetailsModal(null)} disabled={saveLoading}>
              <X size={20} />
            </button>
            <h3 className={styles.modalTitle}>{editMode ? 'Edit Slot Request' : 'Slot Request Details'}</h3>
            <p className={styles.modalSubtitle}>ID: {detailsModal.id}</p>

            <div className={styles.modalGrid}>
              
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>User Name</label>
                <input type="text" className={styles.formInput} value={detailsModal.userName} disabled />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>User Email</label>
                <input type="text" className={styles.formInput} value={detailsModal.userEmail} disabled />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>User Phone</label>
                <input type="text" className={styles.formInput} value={detailsModal.userPhone || 'N/A'} disabled />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Workspace Slot</label>
                <input type="text" className={styles.formInput} value={`${detailsModal.slotName} (${detailsModal.campusName})`} disabled />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Start Time (Entry)</label>
                <input 
                  type="datetime-local" 
                  className={styles.formInput} 
                  value={editStartTime}
                  onChange={(e) => setEditStartTime(e.target.value)}
                  disabled={!editMode || saveLoading} 
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>End Time (Exit)</label>
                <input 
                  type="datetime-local" 
                  className={styles.formInput} 
                  value={editEndTime}
                  onChange={(e) => setEditEndTime(e.target.value)}
                  disabled={!editMode || saveLoading} 
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Total Seats</label>
                <input 
                  type="number" 
                  min="1" 
                  max="100"
                  className={styles.formInput} 
                  value={editSeats}
                  onChange={(e) => setEditSeats(parseInt(e.target.value) || 1)}
                  disabled={!editMode || saveLoading} 
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Seat Codes / IDs</label>
                <input 
                  type="text" 
                  placeholder="e.g. S1, S2"
                  className={styles.formInput} 
                  value={editSeatIds}
                  onChange={(e) => setEditSeatIds(e.target.value)}
                  disabled={!editMode || saveLoading} 
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Total Price (₹)</label>
                <input 
                  type="number" 
                  className={styles.formInput} 
                  value={editTotalPrice}
                  onChange={(e) => setEditTotalPrice(parseFloat(e.target.value) || 0)}
                  disabled={!editMode || saveLoading} 
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Booking Status</label>
                <input type="text" className={styles.formInput} value={detailsModal.status} disabled />
              </div>

              {editMode ? (
                <>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Payment Status</label>
                    <select
                      className={styles.formInput}
                      value={editPaymentStatus}
                      onChange={(e) => setEditPaymentStatus(e.target.value)}
                      disabled={saveLoading}
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="PAID">PAID</option>
                      <option value="UNPAID">UNPAID</option>
                    </select>
                  </div>

                  {editPaymentStatus === 'PAID' && (
                    <>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Payment Method</label>
                        <select
                          className={styles.formInput}
                          value={editPaymentMethod}
                          onChange={(e) => setEditPaymentMethod(e.target.value)}
                          disabled={saveLoading}
                        >
                          <option value="UPI">UPI</option>
                          <option value="CASH">CASH</option>
                        </select>
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Payment Reference</label>
                        <input
                          type="text"
                          className={styles.formInput}
                          value={editPaymentReference}
                          onChange={(e) => setEditPaymentReference(e.target.value)}
                          disabled={saveLoading}
                          placeholder="UPI Transaction ID or Receipt No."
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Payment Date</label>
                        <input
                          type="date"
                          className={styles.formInput}
                          value={editPaymentDate}
                          onChange={(e) => setEditPaymentDate(e.target.value)}
                          disabled={saveLoading}
                        />
                      </div>
                    </>
                  )}
                </>
              ) : (
                <>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Payment Status</label>
                    <div style={{ display: 'flex', alignItems: 'center', height: '100%', minHeight: '38px', paddingLeft: '0.2rem' }}>
                      <span className={`${styles.statusPill} ${detailsModal.paymentStatus === 'PAID' ? styles.statusPaid : detailsModal.paymentStatus === 'PENDING' ? styles.statusPendingPayment : styles.statusUnpaid}`}>
                        {detailsModal.paymentStatus}
                      </span>
                    </div>
                  </div>

                  {detailsModal.paymentStatus === 'PAID' && (
                    <>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Payment Method</label>
                        <input type="text" className={styles.formInput} value={detailsModal.paymentMethod || 'N/A'} disabled />
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Payment Reference</label>
                        <input type="text" className={styles.formInput} value={detailsModal.paymentReference || 'N/A'} disabled />
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Payment Date</label>
                        <input type="text" className={styles.formInput} value={detailsModal.paymentDate ? formatDate(detailsModal.paymentDate) : 'N/A'} disabled />
                      </div>
                    </>
                  )}
                </>
              )}

              <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
                <label className={styles.formLabel}>User Custom Notes</label>
                <textarea 
                  className={styles.formTextarea} 
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  disabled={!editMode || saveLoading}
                  placeholder="No notes provided by user."
                />
              </div>

              <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
                <label className={styles.formLabel}>Admin Internal Notes</label>
                <textarea 
                  className={styles.formTextarea} 
                  value={editAdminNotes}
                  onChange={(e) => setEditAdminNotes(e.target.value)}
                  disabled={!editMode || saveLoading}
                  placeholder="Add administrative or audit notes here..."
                />
              </div>

            </div>

            <div className={styles.modalActions}>
              {editMode ? (
                <>
                  <button 
                    type="button" 
                    className={styles.editBtn} 
                    onClick={() => setEditMode(false)}
                    disabled={saveLoading}
                  >
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    className={styles.saveBtn} 
                    onClick={handleSaveEdit}
                    disabled={saveLoading}
                  >
                    {saveLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </>
              ) : (
                <>
                  <button 
                    type="button" 
                    className={styles.editBtn} 
                    onClick={() => setDetailsModal(null)}
                  >
                    Close
                  </button>
                  <button 
                    type="button" 
                    className={styles.saveBtn} 
                    onClick={() => setEditMode(true)}
                  >
                    Edit Details
                  </button>
                </>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Payment Confirmation Modal */}
      {paymentConfirmModal && (
        <div className={styles.modalOverlay} onClick={() => setPaymentConfirmModal(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '450px' }}>
            <button className={styles.closeModalBtn} onClick={() => setPaymentConfirmModal(null)}>
              <X size={20} />
            </button>
            <h3 className={styles.modalTitle} style={{ marginBottom: '0.5rem' }}>Confirm Booking Access</h3>
            <p className={styles.modalSubtitle} style={{ marginBottom: '1.25rem' }}>
              Confirm slot allocation for <strong>{paymentConfirmModal.userName}</strong>.
            </p>

            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <span className={styles.formLabel}>Has the payment been completed?</span>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.2rem' }}>
                  <button
                    type="button"
                    style={{
                      flex: 1,
                      padding: '0.6rem',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: '1.5px solid',
                      borderColor: paymentDone ? '#10b981' : '#e2e8f0',
                      backgroundColor: paymentDone ? '#ecfdf5' : '#fff',
                      color: paymentDone ? '#065f46' : '#64748b',
                      transition: 'all 0.15s'
                    }}
                    onClick={() => setPaymentDone(true)}
                  >
                    Yes, Paid Done
                  </button>
                  <button
                    type="button"
                    style={{
                      flex: 1,
                      padding: '0.6rem',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: '1.5px solid',
                      borderColor: !paymentDone ? '#ef4444' : '#e2e8f0',
                      backgroundColor: !paymentDone ? '#fef2f2' : '#fff',
                      color: !paymentDone ? '#991b1b' : '#64748b',
                      transition: 'all 0.15s'
                    }}
                    onClick={() => setPaymentDone(false)}
                  >
                    No, Pay Later
                  </button>
                </div>
              </div>

              {paymentDone && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', animation: 'fadeIn 0.2s' }}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Payment Method</label>
                    <select
                      className={styles.formInput}
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as 'CASH' | 'UPI')}
                    >
                      <option value="UPI">UPI Payment</option>
                      <option value="CASH">Cash Payment</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Transaction Reference ID</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      placeholder="e.g. UPI Ref Number or Receipt ID"
                      value={paymentReference}
                      onChange={(e) => setPaymentReference(e.target.value)}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Payment Date</label>
                    <input
                      type="date"
                      className={styles.formInput}
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', width: '100%', borderTop: '1px solid #f1f5f9', paddingTop: '1rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className={styles.editBtn}
                style={{ padding: '0.5rem 1.25rem' }}
                onClick={() => setPaymentConfirmModal(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.saveBtn}
                style={{
                  padding: '0.5rem 1.25rem',
                  backgroundColor: paymentDone ? '#10b981' : '#6366f1'
                }}
                onClick={handleApproveWithPayment}
              >
                Confirm & Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
