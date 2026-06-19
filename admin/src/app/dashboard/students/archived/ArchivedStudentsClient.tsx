'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { adminApi, ApiError, StudentRecord } from '@/lib/api';
import { useAdminData } from '@/components/AdminDataProvider';
import { ConfirmDialog } from '@/components/students/ConfirmDialog';
import { EditStudentModal } from '@/components/students/EditStudentModal';
import { PromoteModal } from '@/components/students/PromoteModal';
import { fullName, initials } from '@/components/students/utils';
import crud from '@/components/crud.module.css';
import styles from '@/components/students/students.module.css';

export function ArchivedStudentsClient() {
  const { status, data: session } = useSession();
  const isAuthenticated = status === 'authenticated';
  const token = session?.accessToken ?? (session as any)?.access_token ?? undefined;
  const { classes, loadClasses, setStudents } = useAdminData();

  const [archived, setArchived] = useState<StudentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [editStudent, setEditStudent] = useState<StudentRecord | null>(null);
  const [promoteId, setPromoteId] = useState<string | null>(null);

  const flash = useCallback((msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 3500);
  }, []);

  const loadArchived = useCallback(() => {
    if (!isAuthenticated) return;
    setLoading(true);
    adminApi(token)
      .archivedStudents()
      .then(setArchived)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          window.location.href = '/login';
          return;
        }
        setError(err instanceof ApiError ? err.message : 'Failed to load');
      })
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  useEffect(() => {
    loadClasses();
    loadArchived();
  }, [loadClasses, loadArchived]);

  async function handleRestore(student: StudentRecord) {
    if (!isAuthenticated) return;
    setRestoringId(student.id);
    try {
      const res = await adminApi(token).restoreStudent(student.id);
      setArchived((prev) => prev.filter((s) => s.id !== student.id));
      setStudents((prev) => [...prev, res.student]);
      flash(`${fullName(student)} restored.`);
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Restore failed');
    } finally {
      setRestoringId(null);
    }
  }

  return (
    <div>
      <Link href="/dashboard/students" style={{ fontSize: 13, color: '#0b6fd4', textDecoration: 'none' }}>
        ← Active students
      </Link>
      <h1 className={styles.pageTitle} style={{ marginTop: 12 }}>Archived Students</h1>
      <p className={styles.pageDesc}>
        Archived students are hidden from active lists. All records are preserved and can be restored.
      </p>

      {success && <div className={crud.successBanner}>{success}</div>}
      {error && <div className={crud.formError}>{error}</div>}

      <div className={crud.panel} style={{ marginTop: 20 }}>
        {loading ? (
          <div className={crud.empty}>Loading archived students…</div>
        ) : archived.length === 0 ? (
          <div className={styles.emptyWrap}>
            <div className={styles.emptyIcon} aria-hidden />
            <h3 className={styles.emptyTitle}>No archived students</h3>
            <p className={styles.emptyBody}>Students you archive will appear here for easy restoration.</p>
          </div>
        ) : (
          <div className={crud.tableWrap}>
            <table className={crud.table}>
              <thead>
                <tr>
                  <th>Photo</th>
                  <th>Name</th>
                  <th>Admission No.</th>
                  <th>Class</th>
                  <th>Archived status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {archived.map((student) => (
                  <tr key={student.id}>
                    <td>
                      <div className={styles.photoCell}>
                        {student.photo_url ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={student.photo_url} alt="" />
                        ) : (
                          initials(student)
                        )}
                      </div>
                    </td>
                    <td><strong>{fullName(student)}</strong></td>
                    <td>{student.admission_number}</td>
                    <td>{student.class_name ?? '—'}</td>
                    <td><span className={`${crud.badge} ${crud.badgeSuspended}`}>Archived</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <Link href={`/dashboard/students/${student.id}`} className={crud.secondaryBtn}>View</Link>
                        <button type="button" className={crud.primaryBtn} disabled={restoringId === student.id} onClick={() => handleRestore(student)}>
                          {restoringId === student.id ? 'Restoring…' : 'Restore'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editStudent && (
        <EditStudentModal
          student={editStudent}
          classes={classes}
          open
          onClose={() => setEditStudent(null)}
          onSaved={(updated) => {
            setArchived((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
            flash('Student updated.');
          }}
        />
      )}

      {promoteId && (
        <PromoteModal
          studentIds={[promoteId]}
          onClose={() => setPromoteId(null)}
          onDone={() => {
            setPromoteId(null);
            loadArchived();
            flash('Promotion complete.');
          }}
        />
      )}
    </div>
  );
}
