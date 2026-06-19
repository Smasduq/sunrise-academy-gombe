'use client';

import { useState } from 'react';
import { adminApi, ApiError, ClassOption, StudentRecord } from '@/lib/api';
import crud from '@/components/crud.module.css';

type EditStudentModalProps = {
  student: StudentRecord;
  classes: ClassOption[];
  open: boolean;
  onClose: () => void;
  onSaved: (updated: StudentRecord) => void;
};

export function EditStudentModal({
  student,
  classes,
  open,
  onClose,
  onSaved,
}: EditStudentModalProps) {
  const [form, setForm] = useState({
    first_name: student.first_name,
    last_name: student.last_name,
    middle_name: student.middle_name ?? '',
    gender: student.gender ?? '',
    date_of_birth: student.date_of_birth ? student.date_of_birth.slice(0, 10) : '',
    class_id: student.class_id ?? '',
    guardian_name: student.guardian_name ?? '',
    mother_name: student.mother_name ?? '',
    guardian_phone: student.guardian_phone ?? '',
    guardian_email: student.guardian_email ?? '',
    guardian_relationship: student.guardian_relationship ?? '',
    emergency_contact: student.emergency_contact ?? '',
    address: student.address ?? '',
    photo_url: student.photo_url ?? '',
    status: student.status,
    password: '',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  if (!open) return null;

  async function handlePhoto(file: File) {
    setUploading(true);
    setError('');
    try {
      const res = await adminApi().uploadImage(file, 'students');
      setForm((f) => ({ ...f, photo_url: res.url }));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Photo upload failed');
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.first_name.trim() || !form.last_name.trim()) {
      setError('First and last name are required.');
      return;
    }

    setSaving(true);
    setError('');

    const body: Record<string, string | null> = {
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      middle_name: form.middle_name || null,
      gender: form.gender || null,
      date_of_birth: form.date_of_birth || null,
      class_id: form.class_id || null,
      guardian_name: form.guardian_name || null,
      mother_name: form.mother_name || null,
      guardian_phone: form.guardian_phone || null,
      guardian_email: form.guardian_email || null,
      guardian_relationship: form.guardian_relationship || null,
      emergency_contact: form.emergency_contact || null,
      address: form.address || null,
      photo_url: form.photo_url || null,
      status: form.status,
    };
    if (form.password) body.password = form.password;

    try {
      const updated = await adminApi().updateStudent(student.id, body);
      onSaved(updated);
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={crud.modalOverlay} onClick={onClose}>
      <div className={crud.modal} style={{ maxWidth: 640 }} onClick={(e) => e.stopPropagation()}>
        <h3 className={crud.modalTitle}>Edit student</h3>
        {error && <div className={crud.formError}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className={crud.formGrid}>
                <div className={crud.field}>
                  <label className={crud.label}>First name *</label>
                  <input className={crud.input} value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} required />
                </div>
                <div className={crud.field}>
                  <label className={crud.label}>Middle name</label>
                  <input className={crud.input} value={form.middle_name} onChange={(e) => setForm({ ...form, middle_name: e.target.value })} placeholder="Optional" />
                </div>
                <div className={crud.field}>
                  <label className={crud.label}>Last name *</label>
                  <input className={crud.input} value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} required />
                </div>
            <div className={crud.field}>
              <label className={crud.label}>Gender</label>
              <select className={crud.select} value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                <option value="">—</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div className={crud.field}>
              <label className={crud.label}>Date of birth</label>
              <input type="date" className={crud.input} value={form.date_of_birth} onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })} />
            </div>
            <div className={crud.field}>
              <label className={crud.label}>Class</label>
              <select className={crud.select} value={form.class_id} onChange={(e) => setForm({ ...form, class_id: e.target.value })}>
                <option value="">No class</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className={crud.field}>
              <label className={crud.label}>Status</label>
              <select
                className={crud.select}
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as 'ACTIVE' | 'SUSPENDED' })}
              >
                <option value="ACTIVE">Active</option>
                <option value="SUSPENDED">Inactive</option>
              </select>
            </div>
            <div className={`${crud.field} ${crud.formGridFull}`}>
              <label className={crud.label}>Student photo</label>
              <input
                type="file"
                accept="image/*"
                className={crud.input}
                disabled={uploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handlePhoto(file);
                }}
              />
              {uploading && <span style={{ fontSize: 12, color: '#6b7c93' }}>Uploading…</span>}
              {form.photo_url && <span style={{ fontSize: 12, color: '#1a7a4a' }}>Photo saved</span>}
            </div>
            <div className={crud.field}>
              <label className={crud.label}>Parent / Guardian name</label>
              <input className={crud.input} value={form.guardian_name} onChange={(e) => setForm({ ...form, guardian_name: e.target.value })} />
            </div>
            <div className={crud.field}>
              <label className={crud.label}>Mother name</label>
              <input className={crud.input} value={form.mother_name} onChange={(e) => setForm({ ...form, mother_name: e.target.value })} />
            </div>
            <div className={crud.field}>
              <label className={crud.label}>Phone</label>
              <input className={crud.input} value={form.guardian_phone} onChange={(e) => setForm({ ...form, guardian_phone: e.target.value })} />
            </div>
            <div className={crud.field}>
              <label className={crud.label}>Email</label>
              <input type="email" className={crud.input} value={form.guardian_email} onChange={(e) => setForm({ ...form, guardian_email: e.target.value })} />
            </div>
            <div className={`${crud.field} ${crud.formGridFull}`}>
              <label className={crud.label}>Address</label>
              <input className={crud.input} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
            <div className={`${crud.field} ${crud.formGridFull}`}>
              <label className={crud.label}>New password (optional)</label>
              <input type="password" className={crud.input} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} minLength={8} />
            </div>
          </div>
          <div className={crud.modalActions}>
            <button type="button" className={crud.secondaryBtn} onClick={onClose}>Cancel</button>
            <button type="submit" className={crud.primaryBtn} disabled={saving || uploading}>
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
