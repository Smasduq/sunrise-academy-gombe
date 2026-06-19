'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { ActivityLog, adminApi, ApiError } from '@/lib/api';
import styles from '@/components/crud.module.css';

export function ActivityClient() {
  const { status } = useSession();
  const isAuthenticated = status === 'authenticated';
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) return;
    adminApi()
      .activityLogs()
      .then(setLogs)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          window.location.href = '/login';
          return;
        }
        setError(err instanceof ApiError ? err.message : 'Failed to load');
      })
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <h2 className={styles.panelTitle}>Activity log</h2>
      </div>
      {error && <div className={styles.formError} style={{ margin: '16px 24px 0' }}>{error}</div>}
      {loading ? (
        <div className={styles.empty}>Loading activity…</div>
      ) : logs.length === 0 ? (
        <div className={styles.empty}>No admin actions recorded yet.</div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>When</th>
                <th>Admin</th>
                <th>Action</th>
                <th>Type</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td>{new Date(log.created_at).toLocaleString()}</td>
                  <td>{log.admin_name}</td>
                  <td>{log.action}</td>
                  <td>{log.entity_type}</td>
                  <td>{log.details ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
