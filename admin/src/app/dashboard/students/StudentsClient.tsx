'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { adminApi, ApiError, ClassOption, StudentRecord } from '@/lib/api';
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

  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<StudentRecord | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const api = adminApi(token);
      const [studentList, classList] = await Promise.all([api.students(), api.classes()]);
      setStudents(studentList);
      setClasses(classList);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load students');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

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
        await api.updateStudent(editing.id, body);
      } else {
        if (!form.password || form.password.length < 8) {
          setError('Password must be at least 8 characters.');
          setSaving(false);
          return;
        }
        body.password = form.password;
        await api.createStudent(body);
      }
      closeModal();
      await load();
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
      await load();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Delete failed');
    }
  }

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <h2 className={styles.panelTitle}>All students ({students.length})</h2>
        <button type="button" className={styles.primaryBtn} onClick={openCreate}>
          Add student
        </button>
      </div>

      {loading ? (
        <div className={styles.empty}>Loading…</div>
      ) : students.length === 0 ? (
        <div className={styles.empty}>No students yet. Add the first student.</div>
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
              {students.map((student) => (
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
    </div>
  );
}
