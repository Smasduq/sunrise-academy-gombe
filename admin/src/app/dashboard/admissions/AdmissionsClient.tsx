'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { adminApi, AdmissionRecord, ApiError } from '@/lib/api';
import styles from '@/components/crud.module.css';

const TABS = [
  { key: '', label: 'All' },
  { key: 'PENDING', label: 'Pending' },
  { key: 'APPROVED', label: 'Approved' },
  { key: 'REJECTED', label: 'Rejected' },
];

export function AdmissionsClient() {
  const { data: session } = useSession();
  const token = session?.accessToken ?? '';
  const [list, setList] = useState<AdmissionRecord[]>([]);
  const [tab, setTab] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await adminApi(token).admissions(tab || undefined);
      setList(data);
      setError('');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  }, [token, tab]);

  useEffect(() => {
    load();
  }, [load]);

  async function updateStatus(id: string, status: string) {
    if (!token) return;
    try {
      const updated = await adminApi(token).updateAdmission(id, status);
      setList((prev) => prev.map((a) => (a.id === id ? updated : a)));
      setSuccess(`Application ${updated.application_no} marked as ${status.toLowerCase()}.`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Update failed');
    }
  }

  function statusBadge(status: string) {
    const cls =
      status === 'APPROVED'
        ? styles.badgeApproved
        : status === 'REJECTED'
          ? styles.badgeRejected
          : styles.badgePending;
    return <span className={`${styles.badge} ${cls}`}>{status}</span>;
  }

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <h2 className={styles.panelTitle}>Admission applications ({list.length})</h2>
        <button type="button" className={styles.reloadBtn} onClick={load} disabled={loading}>
          Reload
        </button>
      </div>

      {success && <div className={styles.successBanner} style={{ margin: '16px 24px 0' }}>{success}</div>}
      {error && <div className={styles.formError} style={{ margin: '16px 24px 0' }}>{error}</div>}

      <div className={styles.tabs}>
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            className={`${styles.tab} ${tab === t.key ? styles.tabActive : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className={styles.empty}>Loading applications…</div>
      ) : list.length === 0 ? (
        <div className={styles.empty}>No applications in this category.</div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>App No.</th>
                <th>Child</th>
                <th>Class</th>
                <th>Guardian</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((a) => (
                <tr key={a.id}>
                  <td>{a.application_no}</td>
                  <td>
                    {a.first_name} {a.last_name}
                  </td>
                  <td>{a.class_applied}</td>
                  <td>
                    {a.guardian_name}
                    <br />
                    <small style={{ color: '#6b7c93' }}>{a.guardian_phone}</small>
                  </td>
                  <td>{statusBadge(a.status)}</td>
                  <td>
                    <div className={styles.actions}>
                      {a.status !== 'APPROVED' && (
                        <button
                          type="button"
                          className={styles.secondaryBtn}
                          onClick={() => updateStatus(a.id, 'APPROVED')}
                        >
                          Approve
                        </button>
                      )}
                      {a.status !== 'REJECTED' && (
                        <button
                          type="button"
                          className={styles.dangerBtn}
                          onClick={() => updateStatus(a.id, 'REJECTED')}
                        >
                          Reject
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
