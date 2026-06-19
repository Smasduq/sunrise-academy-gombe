'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { adminApi, ApiError, SchoolSettings } from '@/lib/api';
import styles from '@/components/crud.module.css';

export function SettingsClient() {
  const { status, data: session } = useSession();
  const isAuthenticated = status === 'authenticated';
  const token = session?.accessToken ?? (session as any)?.access_token ?? undefined;
  const [form, setForm] = useState<SchoolSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!isAuthenticated) return;
    adminApi(token)
      .settings()
      .then(setForm)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          window.location.href = '/login';
          return;
        }
        setError(err instanceof ApiError ? err.message : 'Failed to load');
      })
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isAuthenticated || !form) return;
    setSaving(true);
    setError('');
    try {
      const updated = await adminApi(token).updateSettings(form);
      setForm(updated);
      setSuccess('Settings saved successfully.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className={styles.empty}>Loading settings…</div>;
  if (!form) return <div className={styles.formError}>{error || 'Settings unavailable'}</div>;

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <h2 className={styles.panelTitle}>School settings</h2>
      </div>
      <div style={{ padding: '24px' }}>
        {success && <div className={styles.successBanner}>{success}</div>}
        {error && <div className={styles.formError}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className={styles.formGrid}>
            <div className={`${styles.field} ${styles.formGridFull}`}>
              <label className={styles.label}>School name</label>
              <input
                className={styles.input}
                value={form.school_name}
                onChange={(e) => setForm({ ...form, school_name: e.target.value })}
                required
              />
            </div>
            <div className={`${styles.field} ${styles.formGridFull}`}>
              <label className={styles.label}>Address</label>
              <input
                className={styles.input}
                value={form.address ?? ''}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Phone</label>
              <input
                className={styles.input}
                value={form.phone ?? ''}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Email</label>
              <input
                type="email"
                className={styles.input}
                value={form.email ?? ''}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Academic session</label>
              <input
                className={styles.input}
                value={form.academic_session ?? ''}
                onChange={(e) => setForm({ ...form, academic_session: e.target.value })}
                placeholder="e.g. 2025/2026"
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Current term</label>
              <input
                className={styles.input}
                value={form.current_term ?? ''}
                onChange={(e) => setForm({ ...form, current_term: e.target.value })}
                placeholder="e.g. First Term"
              />
            </div>
            <div className={`${styles.field} ${styles.formGridFull}`}>
              <label className={styles.label}>Logo URL</label>
              <input
                className={styles.input}
                value={form.logo_url ?? ''}
                onChange={(e) => setForm({ ...form, logo_url: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </div>
          <div style={{ marginTop: 24 }}>
            <button type="submit" className={styles.primaryBtn} disabled={saving}>
              {saving ? 'Saving…' : 'Save settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
