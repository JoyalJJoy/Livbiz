'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, ChevronLeft, ChevronRight, Eye, ShieldCheck, UserCog, Key, AlertTriangle } from 'lucide-react';
import styles from './page.module.css';

interface AuditLog {
  id: string;
  action: string;
  userId: string | null;
  userName: string;
  userEmail: string | null;
  targetId: string;
  targetType: string;
  changes: Record<string, any> | null;
  ipAddress: string | null;
  createdAt: string;
}

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/audit-logs?page=${page}&limit=15`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalLogs(data.pagination?.total || 0);
      }
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const getActionBadgeClass = (action: string) => {
    if (action.includes('APPROVED')) return styles.badgeSuccess;
    if (action.includes('REJECTED') || action.includes('CANCELLED')) return styles.badgeDanger;
    if (action.includes('UPDATED')) return styles.badgeInfo;
    if (action.includes('ROLE_CHANGED')) return styles.badgeWarning;
    return styles.badgeSecondary;
  };

  const getActionIcon = (action: string) => {
    if (action.includes('APPROVED')) return <ShieldCheck size={14} className={styles.iconSuccess} />;
    if (action.includes('ROLE_CHANGED') || action.includes('PROFILE')) return <UserCog size={14} className={styles.iconWarning} />;
    if (action.includes('VERIFIED')) return <Key size={14} className={styles.iconInfo} />;
    return <AlertTriangle size={14} className={styles.iconSecondary} />;
  };

  const formatActionName = (action: string) => {
    return action
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b[a-z]/g, (char) => char.toUpperCase());
  };

  const toggleExpand = (id: string) => {
    setExpandedLogId(expandedLogId === id ? null : id);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h1 className={styles.title}>System Audit Trail</h1>
        <p className={styles.subtitle}>Track admin actions, role adjustments, and workspace entries for compliance</p>
      </div>

      {loading ? (
        <div className={styles.loadingState}>
          <Loader2 className="animate-spin" size={24} />
          <span>Loading audit trail...</span>
        </div>
      ) : logs.length === 0 ? (
        <div className={styles.emptyState}>No audit logs found in the database.</div>
      ) : (
        <>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Action</th>
                  <th>Performed By</th>
                  <th>Target Type</th>
                  <th>Target ID</th>
                  <th>IP Address</th>
                  <th>Changes</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <React.Fragment key={log.id}>
                    <tr className={styles.row}>
                      <td className={styles.dateCell}>
                        {new Date(log.createdAt).toLocaleString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                          hour12: true,
                        })}
                      </td>
                      <td>
                        <span className={`${styles.badge} ${getActionBadgeClass(log.action)}`}>
                          {getActionIcon(log.action)}
                          <span style={{ marginLeft: '4px' }}>{formatActionName(log.action)}</span>
                        </span>
                      </td>
                      <td>
                        <div className={styles.userCell}>
                          <span className={styles.userName}>{log.userName}</span>
                          {log.userEmail && <span className={styles.userEmail}>{log.userEmail}</span>}
                        </div>
                      </td>
                      <td>
                        <span className={styles.targetTypeBadge}>{log.targetType}</span>
                      </td>
                      <td className={styles.targetIdCell}>{log.targetId}</td>
                      <td className={styles.ipCell}>{log.ipAddress || '—'}</td>
                      <td>
                        {log.changes ? (
                          <button 
                            className={styles.viewChangesBtn}
                            onClick={() => toggleExpand(log.id)}
                            title="Toggle Changes details"
                          >
                            <Eye size={14} />
                            <span>{expandedLogId === log.id ? 'Hide' : 'View'}</span>
                          </button>
                        ) : (
                          <span className={styles.noChanges}>None</span>
                        )}
                      </td>
                    </tr>
                    {expandedLogId === log.id && log.changes && (
                      <tr className={styles.expandedRow}>
                        <td colSpan={7}>
                          <div className={styles.changesBox}>
                            <h4 className={styles.changesBoxTitle}>Modification Metadata:</h4>
                            <pre className={styles.changesPre}>
                              {JSON.stringify(log.changes, null, 2)}
                            </pre>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className={styles.pageBtn}>
                <ChevronLeft size={16} /> Prev
              </button>
              <span className={styles.pageInfo}>Page {page} of {totalPages} (Total logs: {totalLogs})</span>
              <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className={styles.pageBtn}>
                Next <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
