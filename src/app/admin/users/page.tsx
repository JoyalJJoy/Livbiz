'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Search, Filter, Phone, IndianRupee } from 'lucide-react';
import styles from './page.module.css';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
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
    } catch (err) {
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
              {isSuperAdmin && <th>Actions</th>}
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
                  {isSuperAdmin && (
                    <td>
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
                    </td>
                  )}
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
    </div>
  );
}
