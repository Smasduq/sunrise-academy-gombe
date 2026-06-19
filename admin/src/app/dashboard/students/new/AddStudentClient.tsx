'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { adminApi, ApiError } from '@/lib/api';
import { useAdminData } from '@/components/AdminDataProvider';
import crud from '@/components/crud.module.css';
import styles from '@/components/students/students.module.css';

const STEPS = ['Personal', 'Academic', 'Parent', 'Documents'] as const;

const INITIAL = {
  first_name: '',
  last_name: '',
  middle_name: '',
  gender: '',
  date_of_birth: '',
  photo_url: '',
  admission_number: '',
  class_id: '',
  admission_date: '',
  session: '',
  guardian_name: '',
  guardian_relationship: '',
  guardian_phone: '',
  guardian_email: '',
  mother_name: '',
  emergency_contact: '',
  address: '',
  password: '',
  birth_cert_note: '',
  other_docs_note: '',
};

function randomPassword() {
  return `Sun${Math.random().toString(36).slice(2, 10)}!`;
}

export function AddStudentClient() {
  const router = useRouter();
  const { status, data: session } = useSession();
  const isAuthenticated = status === 'authenticated';
  const token = session?.accessToken ?? (session as any)?.access_token ?? undefined;
  const { classes, loadClasses, setStudents } = useAdminData();

  const [step, setStep] = useState(0);
  const [form, setForm] = useState(INITIAL);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  useEffect(() => {
    if (!isAuthenticated) return;
    adminApi(token)
      .settings()
      .then((s) => setForm((f) => ({ ...f, session: s.academic_session ?? '2025/2026' })))
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          window.location.href = '/login';
        }
      });
  }, [isAuthenticated]);

  async function handlePhoto(file: File) {
    if (!isAuthenticated) return;
    setUploading(true);
    setError('');
    try {
      const res = await adminApi(token).uploadImage(file, 'students');
      setForm((f) => ({ ...f, photo_url: res.url }));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Photo upload failed');
    } finally {
      setUploading(false);
    }
  }

  function validateStep(): boolean {
    if (step === 0) {
      if (!form.first_name.trim() || !form.last_name.trim()) {
        setError('First and last name are required.');
        return false;
      }
    }
    if (step === 1) {
      if (!form.admission_number.trim()) {
        setError('Admission number is required.');
        return false;
      }
    }
    if (step === 2) {
      if (!form.guardian_name.trim() || !form.guardian_phone.trim()) {
        setError('Guardian name and phone are required.');
        return false;
      }
    }
    setError('');
    return true;
  }

  function next() {
    if (!validateStep()) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function back() {
    setError('');
    setStep((s) => Math.max(s - 1, 0));
  }

  async function handleSubmit() {
    if (!isAuthenticated) return;
    if (!validateStep()) return;

    const password = form.password || randomPassword();
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setSaving(true);
    setError('');

    const body: Record<string, string | null> = {
      admission_number: form.admission_number.trim(),
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      middle_name: form.middle_name || null,
      password,
      class_id: form.class_id || null,
      guardian_name: form.guardian_name || null,
      mother_name: form.mother_name || null,
      guardian_phone: form.guardian_phone || null,
      guardian_email: form.guardian_email || null,
      guardian_relationship: form.guardian_relationship || null,
      emergency_contact: form.emergency_contact || null,
      gender: form.gender || null,
      address: form.address || null,
      photo_url: form.photo_url || null,
      date_of_birth: form.date_of_birth || null,
      admission_date: form.admission_date || null,
      status: 'ACTIVE',
    };

    try {
      const created = await adminApi(token).createStudent(body);
      setStudents((prev) => [...prev, created]);
      router.push(`/dashboard/students/${created.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to create student');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <Link href="/dashboard/students" style={{ fontSize: 13, color: '#0b6fd4', textDecoration: 'none' }}>
        ← Back to students
      </Link>
      <h1 className={styles.pageTitle} style={{ marginTop: 12 }}>Add New Student</h1>
      <p className={styles.pageDesc}>Complete all steps to register a new student at Sunrise Academy Gombe.</p>

      <div className={styles.wizardSteps}>
        {STEPS.map((label, i) => (
          <div
            key={label}
            className={`${styles.wizardStep} ${i === step ? styles.wizardStepActive : ''} ${i < step ? styles.wizardStepDone : ''}`}
          >
            {i + 1}. {label}
          </div>
        ))}
      </div>

      <div className={crud.panel} style={{ padding: 24, maxWidth: 720 }}>
        {error && <div className={crud.formError}>{error}</div>}

        {step === 0 && (
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
            <div className={`${crud.field} ${crud.formGridFull}`}>
              <label className={crud.label}>Student photograph</label>
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
              {form.photo_url && (
                <span style={{ fontSize: 12, color: '#1a7a4a' }}>Photo uploaded</span>
              )}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className={crud.formGrid}>
            <div className={crud.field}>
              <label className={crud.label}>Admission number *</label>
              <input className={crud.input} value={form.admission_number} onChange={(e) => setForm({ ...form, admission_number: e.target.value })} />
            </div>
            <div className={crud.field}>
              <label className={crud.label}>Class</label>
              <select className={crud.select} value={form.class_id} onChange={(e) => setForm({ ...form, class_id: e.target.value })}>
                <option value="">Select class</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className={crud.field}>
              <label className={crud.label}>Admission date</label>
              <input type="date" className={crud.input} value={form.admission_date} onChange={(e) => setForm({ ...form, admission_date: e.target.value })} />
            </div>
            <div className={crud.field}>
              <label className={crud.label}>Session</label>
              <input className={crud.input} value={form.session} readOnly />
            </div>
            <div className={`${crud.field} ${crud.formGridFull}`}>
              <label className={crud.label}>Portal password (auto-generated if blank)</label>
              <input
                type="password"
                className={crud.input}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Min. 8 characters"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className={crud.formGrid}>
            <div className={crud.field}>
              <label className={crud.label}>Parent / Guardian name *</label>
              <input className={crud.input} value={form.guardian_name} onChange={(e) => setForm({ ...form, guardian_name: e.target.value })} />
            </div>
            <div className={crud.field}>
              <label className={crud.label}>Relationship</label>
              <select className={crud.select} value={form.guardian_relationship} onChange={(e) => setForm({ ...form, guardian_relationship: e.target.value })}>
                <option value="">—</option>
                <option value="Father">Father</option>
                <option value="Mother">Mother</option>
                <option value="Guardian">Guardian</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className={crud.field}>
              <label className={crud.label}>Mother name</label>
              <input className={crud.input} value={form.mother_name} onChange={(e) => setForm({ ...form, mother_name: e.target.value })} />
            </div>
            <div className={crud.field}>
              <label className={crud.label}>Phone number *</label>
              <input className={crud.input} value={form.guardian_phone} onChange={(e) => setForm({ ...form, guardian_phone: e.target.value })} />
            </div>
            <div className={crud.field}>
              <label className={crud.label}>Email address</label>
              <input type="email" className={crud.input} value={form.guardian_email} onChange={(e) => setForm({ ...form, guardian_email: e.target.value })} />
            </div>
            <div className={crud.field}>
              <label className={crud.label}>Emergency contact</label>
              <input className={crud.input} value={form.emergency_contact} onChange={(e) => setForm({ ...form, emergency_contact: e.target.value })} />
            </div>
            <div className={`${crud.field} ${crud.formGridFull}`}>
              <label className={crud.label}>Home address</label>
              <input className={crud.input} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <p style={{ fontSize: 14, color: '#6b7c93', marginBottom: 20 }}>
              Upload supporting documents. Files are stored securely when Hugging Face storage is configured.
            </p>
            <div className={crud.formGrid}>
              <div className={`${crud.field} ${crud.formGridFull}`}>
                <label className={crud.label}>Passport photograph</label>
                <input type="file" accept="image/*" className={crud.input} disabled />
                <span style={{ fontSize: 12, color: '#6b7c93' }}>
                  {form.photo_url ? 'Uploaded in step 1' : 'Add photo in Personal Information step'}
                </span>
              </div>
              <div className={`${crud.field} ${crud.formGridFull}`}>
                <label className={crud.label}>Birth certificate</label>
                <input type="file" accept=".pdf,image/*" className={crud.input} disabled />
                <input
                  className={crud.input}
                  placeholder="Reference note (optional)"
                  value={form.birth_cert_note}
                  onChange={(e) => setForm({ ...form, birth_cert_note: e.target.value })}
                  style={{ marginTop: 8 }}
                />
              </div>
              <div className={`${crud.field} ${crud.formGridFull}`}>
                <label className={crud.label}>Other documents</label>
                <input type="file" multiple className={crud.input} disabled />
                <input
                  className={crud.input}
                  placeholder="Notes about other documents"
                  value={form.other_docs_note}
                  onChange={(e) => setForm({ ...form, other_docs_note: e.target.value })}
                  style={{ marginTop: 8 }}
                />
              </div>
            </div>
          </div>
        )}

        <div className={crud.modalActions} style={{ border: 'none', paddingTop: 24, marginTop: 8 }}>
          {step > 0 && (
            <button type="button" className={crud.secondaryBtn} onClick={back}>
              Back
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button type="button" className={crud.primaryBtn} onClick={next}>
              Continue
            </button>
          ) : (
            <button type="button" className={crud.primaryBtn} disabled={saving} onClick={handleSubmit}>
              {saving ? 'Creating…' : 'Create student'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
