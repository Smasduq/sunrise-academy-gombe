'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { adminApi, ApiError, StaffRecord } from '@/lib/api';
import { useAdminData } from '@/components/AdminDataProvider';
import styles from '@/components/crud.module.css';

const POSITIONS = [
  'Class Teacher',
  'Subject Teacher',
  'Head Teacher',
  'Vice Principal',
  'Principal',
  'Administrator',
];

const DEPARTMENTS = ['Nursery', 'Primary', 'Administration', 'Support'];

const EMPTY_FORM = {
  staff_id: '',
  first_name: '',
  last_name: '',
  password: '',
  department: '',
  position: '',
  phone: '',
  status: 'ACTIVE' as 'ACTIVE' | 'SUSPENDED',
  class_ids: [] as string[],
};

export function StaffClient() {
  const { status } = useSession();
  const isAuthenticated = status === 'authenticated';

  const {
    staff,
    classes,
    staffLoading,
    staffLoaded,
    error: loadError,
    loadStaff,
    loadClasses,
    setStaff,
  } = useAdminData();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<StaffRecord | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [profile, setProfile] = useState<StaffRecord | null>(null);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadClasses();
    loadStaff();
  }, [loadClasses, loadStaff]);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setError('');
    setModalOpen(true);
  }

  function openEdit(member: StaffRecord) {
    setEditing(member);
    setForm({
      staff_id: member.staff_id,
      first_name: member.first_name,
      last_name: member.last_name,
      password: '',
      department: member.department ?? '',
      position: member.position ?? '',
      phone: member.phone ?? '',
      status: member.status,
      class_ids: [...member.class_ids],
    });
    setError('');
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditing(null);
    setForm(EMPTY_FORM);
    setError('');
  }

  function toggleClass(classId: string) {
    setForm((prev) => ({
      ...prev,
      class_ids: prev.class_ids.includes(classId)
        ? prev.class_ids.filter((id) => id !== classId)
        : [...prev.class_ids, classId],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isAuthenticated) return;
    setSaving(true);
    setError('');

    const api = adminApi();
    const body: Record<string, unknown> = {
      staff_id: form.staff_id.trim(),
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      department: form.department || null,
      position: form.position || null,
      phone: form.phone || null,
      status: form.status,
      class_ids: form.class_ids,
    };

    try {
      if (editing) {
        if (form.password) body.password = form.password;
        const updated = await api.updateStaff(editing.id, body);
        setStaff((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
      } else {
        if (!form.password || form.password.length < 8) {
          setError('Password must be at least 8 characters.');
          setSaving(false);
          return;
        }
        body.password = form.password;
        const created = await api.createStaff(body);
        setStaff((prev) => [...prev, created]);
      }
      closeModal();
      setSuccess(editing ? 'Staff updated.' : 'Staff added.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        window.location.href = '/login';
        return;
      }
      setError(err instanceof ApiError ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(member: StaffRecord) {
    if (!isAuthenticated) return;
    if (!confirm(`Delete ${member.first_name} ${member.last_name}? This cannot be undone.`)) return;

    try {
      await adminApi().deleteStaff(member.id);
      setStaff((prev) => prev.filter((m) => m.id !== member.id));
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        window.location.href = '/login';
        return;
      }
      alert(err instanceof ApiError ? err.message : 'Delete failed');
    }
  }

  const showLoading = staffLoading && !staffLoaded;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return staff.filter((m) => {
      if (deptFilter && m.department !== deptFilter) return false;
      if (!q) return true;
      return (
        m.staff_id.toLowerCase().includes(q) ||
        m.first_name.toLowerCase().includes(q) ||
        m.last_name.toLowerCase().includes(q) ||
        (m.position?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [staff, search, deptFilter]);

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <h2 className={styles.panelTitle}>All staff ({staff.length})</h2>
        <div className={styles.panelActions}>
          <button
            type="button"
            className={styles.reloadBtn}
            onClick={() => {
              loadClasses(true);
              loadStaff(true);
            }}
            disabled={staffLoading}
          >
            {staffLoading ? 'Reloading…' : 'Reload'}
          </button>
          <button type="button" className={styles.primaryBtn} onClick={openCreate}>
            Add staff
          </button>
        </div>
      </div>

      {success && <div className={styles.successBanner} style={{ margin: '0 24px' }}>{success}</div>}
      {loadError && <div className={styles.formError} style={{ margin: '16px 24px 0' }}>{loadError}</div>}

      <div className={styles.toolbar}>
        <input
          type="search"
          className={styles.searchInput}
          placeholder="Search by name, staff ID, or role…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className={styles.filterSelect}
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
        >
          <option value="">All departments</option>
          {DEPARTMENTS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      {showLoading ? (
        <div className={styles.empty}>Loading…</div>
      ) : filtered.length === 0 ? (
        <div className={styles.empty}>
          {staff.length === 0 ? 'No staff yet. Add the first staff member.' : 'No staff match your search.'}
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Staff ID</th>
                <th>Name</th>
                <th>Role</th>
                <th>Department</th>
                <th>Classes</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((member) => (
                <tr key={member.id}>
                  <td>{member.staff_id}</td>
                  <td>
                    {member.first_name} {member.last_name}
                  </td>
                  <td>{member.position ?? '—'}</td>
                  <td>{member.department ?? '—'}</td>
                  <td>{member.class_names.length ? member.class_names.join(', ') : '—'}</td>
                  <td>
                    <span
                      className={`${styles.badge} ${
                        member.status === 'ACTIVE' ? styles.badgeActive : styles.badgeSuspended
                      }`}
                    >
                      {member.status}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button type="button" className={styles.secondaryBtn} onClick={() => setProfile(member)}>
                        View
                      </button>
                      <button type="button" className={styles.secondaryBtn} onClick={() => openEdit(member)}>
                        Edit
                      </button>
                      <button type="button" className={styles.dangerBtn} onClick={() => handleDelete(member)}>
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
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>{editing ? 'Edit staff' : 'Add staff'}</h3>
            {error && <div className={styles.formError}>{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className={styles.formGrid}>
                <div className={styles.field}>
                  <label className={styles.label}>Staff ID</label>
                  <input
                    className={styles.input}
                    value={form.staff_id}
                    onChange={(e) => setForm({ ...form, staff_id: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Phone</label>
                  <input
                    className={styles.input}
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>First name</label>
                  <input
                    className={styles.input}
                    value={form.first_name}
                    onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Last name</label>
                  <input
                    className={styles.input}
                    value={form.last_name}
                    onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Role / position</label>
                  <select
                    className={styles.select}
                    value={form.position}
                    onChange={(e) => setForm({ ...form, position: e.target.value })}
                  >
                    <option value="">Select role</option>
                    {POSITIONS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Department</label>
                  <select
                    className={styles.select}
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                  >
                    <option value="">Select department</option>
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={`${styles.field} ${styles.formGridFull}`}>
                  <label className={styles.label}>
                    Password {editing ? '(leave blank to keep current)' : ''}
                  </label>
                  <input
                    type="password"
                    className={styles.input}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required={!editing}
                    minLength={editing ? undefined : 8}
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Status</label>
                  <select
                    className={styles.select}
                    value={form.status}
                    onChange={(e) =>
                      setForm({ ...form, status: e.target.value as 'ACTIVE' | 'SUSPENDED' })
                    }
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="SUSPENDED">Suspended</option>
                  </select>
                </div>
                <div className={`${styles.field} ${styles.formGridFull}`}>
                  <label className={styles.label}>Assigned classes</label>
                  <div className={styles.classList}>
                    {classes.length === 0 ? (
                      <span style={{ color: '#6b7c93', fontSize: 14 }}>No classes available</span>
                    ) : (
                      classes.map((c) => (
                        <label key={c.id} className={styles.checkboxRow}>
                          <input
                            type="checkbox"
                            checked={form.class_ids.includes(c.id)}
                            onChange={() => toggleClass(c.id)}
                          />
                          {c.name}
                        </label>
                      ))
                    )}
                  </div>
                </div>
              </div>
              <div className={styles.modalActions}>
                <button type="button" className={styles.secondaryBtn} onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className={styles.primaryBtn} disabled={saving}>
                  {saving ? 'Saving…' : editing ? 'Save changes' : 'Create staff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {profile && (
        <>
          <button type="button" className={styles.drawerOverlay} aria-label="Close" onClick={() => setProfile(null)} />
          <aside className={styles.drawer}>
            <div className={styles.avatarLarge}>
              {profile.first_name.charAt(0)}
              {profile.last_name.charAt(0)}
            </div>
            <h3 className={styles.drawerTitle}>
              {profile.first_name} {profile.last_name}
            </h3>
            <div className={styles.profileGrid}>
              <div className={styles.profileRow}>
                <span className={styles.profileLabel}>Staff ID</span>
                <span className={styles.profileValue}>{profile.staff_id}</span>
              </div>
              <div className={styles.profileRow}>
                <span className={styles.profileLabel}>Role</span>
                <span className={styles.profileValue}>{profile.position ?? '—'}</span>
              </div>
              <div className={styles.profileRow}>
                <span className={styles.profileLabel}>Department</span>
                <span className={styles.profileValue}>{profile.department ?? '—'}</span>
              </div>
              <div className={styles.profileRow}>
                <span className={styles.profileLabel}>Classes</span>
                <span className={styles.profileValue}>
                  {profile.class_names.length ? profile.class_names.join(', ') : '—'}
                </span>
              </div>
              <div className={styles.profileRow}>
                <span className={styles.profileLabel}>Phone</span>
                <span className={styles.profileValue}>{profile.phone ?? '—'}</span>
              </div>
              <div className={styles.profileRow}>
                <span className={styles.profileLabel}>Status</span>
                <span className={styles.profileValue}>{profile.status}</span>
              </div>
            </div>
            <div className={styles.modalActions} style={{ border: 'none', paddingTop: 16 }}>
              <button type="button" className={styles.secondaryBtn} onClick={() => setProfile(null)}>
                Close
              </button>
              <button
                type="button"
                className={styles.primaryBtn}
                onClick={() => {
                  openEdit(profile);
                  setProfile(null);
                }}
              >
                Edit profile
              </button>
            </div>
          </aside>
        </>
      )}
    </div>
  );
}
