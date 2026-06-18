'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { adminApi, ApiError, StudentRecord } from '@/lib/api';
import { useAdminData } from '@/components/AdminDataProvider';
import styles from '@/components/crud.module.css';

const EMPTY_FORM = {
  admission_number: '',
  first_name: '',
  last_name: '',
  password: '',
  class_id: '',
  guardian_name: '',
  guardian_phone: '',
  gender: '',
  address: '',
  status: 'ACTIVE' as 'ACTIVE' | 'SUSPENDED',
};

export function StudentsClient() {
  const { data: session } = useSession();
  const token = session?.accessToken ?? '';

  const {
    students,
    classes,
    studentsLoading,
    studentsLoaded,
    error: loadError,
    loadStudents,
    loadClasses,
    setStudents,
  } = useAdminData();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<StudentRecord | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [profile, setProfile] = useState<StudentRecord | null>(null);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadClasses();
    loadStudents();
  }, [loadClasses, loadStudents]);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setError('');
    setModalOpen(true);
  }

  function openEdit(student: StudentRecord) {
    setEditing(student);
    setForm({
      admission_number: student.admission_number,
      first_name: student.first_name,
      last_name: student.last_name,
      password: '',
      class_id: student.class_id ?? '',
      guardian_name: student.guardian_name ?? '',
      guardian_phone: student.guardian_phone ?? '',
      gender: student.gender ?? '',
      address: student.address ?? '',
      status: student.status,
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    setError('');

    const api = adminApi(token);
    const body: Record<string, string | null> = {
      admission_number: form.admission_number.trim(),
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      class_id: form.class_id || null,
      guardian_name: form.guardian_name || null,
      guardian_phone: form.guardian_phone || null,
      gender: form.gender || null,
      address: form.address || null,
      status: form.status,
    };

    try {
      if (editing) {
        if (form.password) body.password = form.password;
        const updated = await api.updateStudent(editing.id, body);
        setStudents((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      } else {
        if (!form.password || form.password.length < 8) {
          setError('Password must be at least 8 characters.');
          setSaving(false);
          return;
        }
        body.password = form.password;
        const created = await api.createStudent(body);
        setStudents((prev) => [...prev, created]);
      }
      closeModal();
      setSuccess(editing ? 'Student updated.' : 'Student added.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(student: StudentRecord) {
    if (!token) return;
    if (!confirm(`Delete ${student.first_name} ${student.last_name}? This cannot be undone.`)) return;

    try {
      await adminApi(token).deleteStudent(student.id);
      setStudents((prev) => prev.filter((s) => s.id !== student.id));
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Delete failed');
    }
  }

  const showLoading = studentsLoading && !studentsLoaded;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return students.filter((s) => {
      if (classFilter && s.class_id !== classFilter) return false;
      if (statusFilter && s.status !== statusFilter) return false;
      if (!q) return true;
      return (
        s.admission_number.toLowerCase().includes(q) ||
        s.first_name.toLowerCase().includes(q) ||
        s.last_name.toLowerCase().includes(q) ||
        (s.guardian_name?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [students, search, classFilter, statusFilter]);

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <h2 className={styles.panelTitle}>All students ({students.length})</h2>
        <div className={styles.panelActions}>
          <button
            type="button"
            className={styles.reloadBtn}
            onClick={() => {
              loadClasses(true);
              loadStudents(true);
            }}
            disabled={studentsLoading}
          >
            {studentsLoading ? 'Reloading…' : 'Reload'}
          </button>
          <button type="button" className={styles.primaryBtn} onClick={openCreate}>
            Add student
          </button>
        </div>
      </div>

      {success && <div className={styles.successBanner} style={{ margin: '0 24px' }}>{success}</div>}
      {loadError && <div className={styles.formError} style={{ margin: '16px 24px 0' }}>{loadError}</div>}

      <div className={styles.toolbar}>
        <input
          type="search"
          className={styles.searchInput}
          placeholder="Search by name, admission no., or guardian…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className={styles.filterSelect}
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}
        >
          <option value="">All classes</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          className={styles.filterSelect}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="SUSPENDED">Inactive</option>
        </select>
      </div>

      {showLoading ? (
        <div className={styles.empty}>Loading…</div>
      ) : filtered.length === 0 ? (
        <div className={styles.empty}>
          {students.length === 0 ? 'No students yet. Add the first student.' : 'No students match your search.'}
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Admission No.</th>
                <th>Name</th>
                <th>Class</th>
                <th>Guardian</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((student) => (
                <tr key={student.id}>
                  <td>{student.admission_number}</td>
                  <td>
                    {student.first_name} {student.last_name}
                  </td>
                  <td>{student.class_name ?? '—'}</td>
                  <td>{student.guardian_name ?? '—'}</td>
                  <td>
                    <span
                      className={`${styles.badge} ${
                        student.status === 'ACTIVE' ? styles.badgeActive : styles.badgeSuspended
                      }`}
                    >
                      {student.status}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button type="button" className={styles.secondaryBtn} onClick={() => setProfile(student)}>
                        View
                      </button>
                      <button type="button" className={styles.secondaryBtn} onClick={() => openEdit(student)}>
                        Edit
                      </button>
                      <button type="button" className={styles.dangerBtn} onClick={() => handleDelete(student)}>
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
            <h3 className={styles.modalTitle}>{editing ? 'Edit student' : 'Add student'}</h3>
            {error && <div className={styles.formError}>{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className={styles.formGrid}>
                <div className={styles.field}>
                  <label className={styles.label}>Admission number</label>
                  <input
                    className={styles.input}
                    value={form.admission_number}
                    onChange={(e) => setForm({ ...form, admission_number: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Class</label>
                  <select
                    className={styles.select}
                    value={form.class_id}
                    onChange={(e) => setForm({ ...form, class_id: e.target.value })}
                  >
                    <option value="">No class</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
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
                  <label className={styles.label}>Gender</label>
                  <select
                    className={styles.select}
                    value={form.gender}
                    onChange={(e) => setForm({ ...form, gender: e.target.value })}
                  >
                    <option value="">—</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
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
                <div className={styles.field}>
                  <label className={styles.label}>Guardian name</label>
                  <input
                    className={styles.input}
                    value={form.guardian_name}
                    onChange={(e) => setForm({ ...form, guardian_name: e.target.value })}
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Guardian phone</label>
                  <input
                    className={styles.input}
                    value={form.guardian_phone}
                    onChange={(e) => setForm({ ...form, guardian_phone: e.target.value })}
                  />
                </div>
                <div className={`${styles.field} ${styles.formGridFull}`}>
                  <label className={styles.label}>Address</label>
                  <input
                    className={styles.input}
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                  />
                </div>
              </div>
              <div className={styles.modalActions}>
                <button type="button" className={styles.secondaryBtn} onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className={styles.primaryBtn} disabled={saving}>
                  {saving ? 'Saving…' : editing ? 'Save changes' : 'Create student'}
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
                <span className={styles.profileLabel}>Admission No.</span>
                <span className={styles.profileValue}>{profile.admission_number}</span>
              </div>
              <div className={styles.profileRow}>
                <span className={styles.profileLabel}>Class</span>
                <span className={styles.profileValue}>{profile.class_name ?? '—'}</span>
              </div>
              <div className={styles.profileRow}>
                <span className={styles.profileLabel}>Status</span>
                <span className={styles.profileValue}>{profile.status}</span>
              </div>
              <div className={styles.profileRow}>
                <span className={styles.profileLabel}>Gender</span>
                <span className={styles.profileValue}>{profile.gender ?? '—'}</span>
              </div>
              <div className={styles.profileRow}>
                <span className={styles.profileLabel}>Guardian</span>
                <span className={styles.profileValue}>{profile.guardian_name ?? '—'}</span>
              </div>
              <div className={styles.profileRow}>
                <span className={styles.profileLabel}>Guardian phone</span>
                <span className={styles.profileValue}>{profile.guardian_phone ?? '—'}</span>
              </div>
              <div className={styles.profileRow}>
                <span className={styles.profileLabel}>Address</span>
                <span className={styles.profileValue}>{profile.address ?? '—'}</span>
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
