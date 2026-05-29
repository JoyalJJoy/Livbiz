'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Search, Phone, IndianRupee, X } from 'lucide-react';
import styles from './page.module.css';

interface User {
  id: string;
  name: string;
  firstName?: string | null;
  lastName?: string | null;
  email: string;
  phone: string | null;
  role: string;
  idType?: string | null;
  idNumber?: string | null;
  createdAt: string;
  bookingsCount: number;
  totalSpent: number;
}

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const currentRole = (session?.user as unknown as { role?: string })?.role;
  const isSuperAdmin = currentRole === 'SUPER_ADMIN';

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  // Details & Edit Modal States
  const [detailsModal, setDetailsModal] = useState<User | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editIdType, setEditIdType] = useState('');
  const [editIdNumber, setEditIdNumber] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);

  const openDetailsModal = (u: User) => {
    setDetailsModal(u);
    setEditMode(false);
    
    // Attempt to split name if firstName/lastName not populated
    const first = u.firstName || u.name.split(' ')[0] || '';
    const last = u.lastName || u.name.split(' ').slice(1).join(' ') || '';
    setEditFirstName(first);
    setEditLastName(last);
    setEditEmail(u.email);
    setEditPhone(u.phone || '');
    setEditIdType(u.idType || '');
    setEditIdNumber(u.idNumber || '');
  };

  const handleSaveEdit = async () => {
    if (!detailsModal) return;
    setSaveLoading(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: detailsModal.id,
          firstName: editFirstName.trim(),
          lastName: editLastName.trim(),
          email: editEmail.trim(),
          phone: editPhone.trim() || null,
          idType: editIdType || null,
          idNumber: editIdNumber.trim() || null,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert('Client details updated successfully!');
        setEditMode(false);
        setDetailsModal(null);
        fetchUsers();
      } else {
        alert(data.error || 'Failed to save changes');
      }
    } catch {
      alert('Network error while saving changes');
    } finally {
      setSaveLoading(false);
    }
  };

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/users?page=${page}&limit=10&search=${encodeURIComponent(search)}&role=${roleFilter}`);
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to fetch users');
      
      setUsers(data.data);
      setTotalPages(data.pagination.totalPages);
      setTotalUsers(data.pagination.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchUsers();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [fetchUsers]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (!isSuperAdmin) return;
    
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      });
      
      if (!res.ok) throw new Error('Failed to update role');
      
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch {
      alert('Failed to update role');
    }
  };

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>User Management</h1>
          <p className={styles.subtitle}>Manage all {totalUsers} registered users in the system</p>
        </div>
      </div>

      <div className={styles.controls}>
        <div className={styles.searchBox}>
          <Search size={18} className={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Search by name, email, or phone..." 
            className={styles.searchInput}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select 
          className={styles.filterSelect}
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
        >
          <option value="ALL">All Roles</option>
          <option value="CLIENT">Clients Only</option>
          <option value="ADMIN">Admins Only</option>
          <option value="SUPER_ADMIN">Super Admins</option>
        </select>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>User</th>
              <th>Phone</th>
              <th>Bookings</th>
              <th>Total Spent</th>
              <th>Joined Date</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className={styles.loading}>Loading users...</td></tr>
            ) : error ? (
              <tr><td colSpan={7} className={styles.error}>{error}</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={7} className={styles.empty}>No users found.</td></tr>
            ) : (
              users.map(user => (
                <tr key={user.id}>
                  <td>
                    <div className={styles.userCell}>
                      <div className={styles.avatar}>{getInitials(user.name)}</div>
                      <div className={styles.userInfo}>
                        <span className={styles.userName}>{user.name}</span>
                        <span className={styles.userEmail}>{user.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    {user.phone ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#475569' }}>
                        <Phone size={14} /> +91 {user.phone}
                      </div>
                    ) : (
                      <span style={{ color: '#94a3b8' }}>Not provided</span>
                    )}
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, color: '#0f172a' }}>{user.bookingsCount}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#16a34a', fontWeight: 600 }}>
                      <IndianRupee size={14} /> {user.totalSpent}
                    </div>
                  </td>
                  <td>{new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  <td>
                    <span className={`${styles.roleBadge} ${styles[user.role.toLowerCase()] || ''}`}>
                      {user.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button 
                        className={styles.detailsBtn} 
                        onClick={() => openDetailsModal(user)}
                      >
                        Details
                      </button>
                      {isSuperAdmin && (
                        <select 
                          className={styles.actionSelect}
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          disabled={user.id === (session?.user as unknown as { id: string })?.id}
                        >
                          <option value="CLIENT">Make Client</option>
                          <option value="ADMIN">Make Admin</option>
                          <option value="SUPER_ADMIN">Make Super Admin</option>
                        </select>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {!loading && !error && users.length > 0 && (
          <div className={styles.pagination}>
            <div className={styles.pageInfo}>
              Showing page {page} of {totalPages}
            </div>
            <div className={styles.pageControls}>
              <button 
                className={styles.pageBtn} 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </button>
              <button 
                className={styles.pageBtn}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Details & Edit Client Modal */}
      {detailsModal && (
        <div className={styles.modalOverlay} onClick={() => { if (!saveLoading) setDetailsModal(null); }}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeModalBtn} onClick={() => setDetailsModal(null)} disabled={saveLoading}>
              <X size={20} />
            </button>
            <h3 className={styles.modalTitle}>{editMode ? 'Edit Client Profile' : 'Client Profile Details'}</h3>
            <p className={styles.modalSubtitle}>ID: {detailsModal.id}</p>

            <div className={styles.modalGrid}>
              
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>First Name</label>
                <input 
                  type="text" 
                  className={styles.formInput} 
                  value={editFirstName}
                  onChange={(e) => setEditFirstName(e.target.value)}
                  disabled={!editMode || saveLoading} 
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Last Name</label>
                <input 
                  type="text" 
                  className={styles.formInput} 
                  value={editLastName}
                  onChange={(e) => setEditLastName(e.target.value)}
                  disabled={!editMode || saveLoading} 
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Email Address</label>
                <input 
                  type="email" 
                  className={styles.formInput} 
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  disabled={!editMode || saveLoading} 
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Phone Number</label>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ color: '#64748b', marginRight: '0.25rem', fontSize: '0.9rem' }}>+91</span>
                  <input 
                    type="tel" 
                    className={styles.formInput} 
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    disabled={!editMode || saveLoading} 
                    placeholder="9876543210"
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Government ID Type</label>
                <select
                  className={styles.formSelect}
                  value={editIdType}
                  onChange={(e) => {
                    setEditIdType(e.target.value);
                    setEditIdNumber('');
                  }}
                  disabled={!editMode || saveLoading}
                >
                  <option value="">None</option>
                  <option value="AADHAAR">Aadhaar Card</option>
                  <option value="PAN">PAN Card</option>
                </select>
              </div>

              {editIdType && (
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Government ID Number</label>
                  <input 
                    type="text" 
                    className={styles.formInput} 
                    value={editIdNumber}
                    onChange={(e) => setEditIdNumber(e.target.value)}
                    disabled={!editMode || saveLoading} 
                    placeholder={editIdType === 'AADHAAR' ? '1234 5678 9012' : 'ABCDE1234F'}
                  />
                </div>
              )}

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Total Bookings</label>
                <input type="text" className={styles.formInput} value={detailsModal.bookingsCount} disabled />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Total Spent (₹)</label>
                <input type="text" className={styles.formInput} value={`₹${detailsModal.totalSpent.toLocaleString()}`} disabled />
              </div>

            </div>

            <div className={styles.modalActions}>
              {editMode ? (
                <>
                  <button 
                    type="button" 
                    className={styles.cancelBtn} 
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
                    className={styles.cancelBtn} 
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
    </div>
  );
}
