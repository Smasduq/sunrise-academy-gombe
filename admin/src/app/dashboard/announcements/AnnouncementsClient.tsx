'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { adminApi, AnnouncementRecord, ApiError } from '@/lib/api';
import styles from '@/components/crud.module.css';

const EMPTY = { title: '', content: '', audience: 'ALL', is_active: true };

export function AnnouncementsClient() {
  const { data: session } = useSession();
  const token = session?.accessToken ?? '';
  const [list, setList] = useState<AnnouncementRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AnnouncementRecord | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      setList(await adminApi(token).announcements());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY);
    setError('');
    setModalOpen(true);
  }

  function openEdit(row: AnnouncementRecord) {
    setEditing(row);
    setForm({
      title: row.title,
      content: row.content,
      audience: row.audience,
      is_active: row.is_active,
    });
    setError('');
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    setError('');
    const api = adminApi(token);
    try {
      if (editing) {
        const updated = await api.updateAnnouncement(editing.id, form);
        setList((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      } else {
        const created = await api.createAnnouncement(form);
        setList((prev) => [created, ...prev]);
      }
      setModalOpen(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!token || !confirm('Delete this announcement?')) return;
    try {
      await adminApi(token).deleteAnnouncement(id);
      setList((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Delete failed');
    }
  }

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <h2 className={styles.panelTitle}>Announcements ({list.length})</h2>
        <div className={styles.panelActions}>
          <button type="button" className={styles.reloadBtn} onClick={load} disabled={loading}>
            Reload
          </button>
          <button type="button" className={styles.primaryBtn} onClick={openCreate}>
            New announcement
          </button>
        </div>
      </div>

      {loading ? (
        <div className={styles.empty}>Loading…</div>
      ) : list.length === 0 ? (
        <div className={styles.empty}>No announcements yet. Create the first one.</div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Title</th>
                <th>Audience</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((a) => (
                <tr key={a.id}>
                  <td>{a.title}</td>
                  <td>{a.audience}</td>
                  <td>
                    <span className={`${styles.badge} ${a.is_active ? styles.badgeActive : styles.badgeSuspended}`}>
                      {a.is_active ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td>{new Date(a.created_at).toLocaleDateString()}</td>
                  <td>
                    <div className={styles.actions}>
                      <button type="button" className={styles.secondaryBtn} onClick={() => openEdit(a)}>
                        Edit
                      </button>
                      <button type="button" className={styles.dangerBtn} onClick={() => handleDelete(a.id)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <div className={styles.modalOverlay} onClick={() => setModalOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>{editing ? 'Edit announcement' : 'New announcement'}</h3>
            {error && <div className={styles.formError}>{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className={styles.formGrid}>
                <div className={`${styles.field} ${styles.formGridFull}`}>
                  <label className={styles.label}>Title</label>
                  <input
                    className={styles.input}
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    required
                  />
                </div>
                <div className={`${styles.field} ${styles.formGridFull}`}>
                  <label className={styles.label}>Content</label>
                  <textarea
                    className={`${styles.input} ${styles.textarea}`}
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Audience</label>
                  <select
                    className={styles.select}
                    value={form.audience}
                    onChange={(e) => setForm({ ...form, audience: e.target.value })}
                  >
                    <option value="ALL">Everyone</option>
                    <option value="STUDENTS">Students</option>
                    <option value="STAFF">Staff</option>
                  </select>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Visible</label>
                  <select
                    className={styles.select}
                    value={form.is_active ? 'yes' : 'no'}
                    onChange={(e) => setForm({ ...form, is_active: e.target.value === 'yes' })}
                  >
                    <option value="yes">Active</option>
                    <option value="no">Hidden</option>
                  </select>
                </div>
              </div>
              <div className={styles.modalActions}>
                <button type="button" className={styles.secondaryBtn} onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className={styles.primaryBtn} disabled={saving}>
                  {saving ? 'Saving…' : editing ? 'Save' : 'Publish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
