'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { adminApi, ApiError, StudentProfile } from '@/lib/api';
import { useAdminData } from '@/components/AdminDataProvider';
import { EditStudentModal } from '@/components/students/EditStudentModal';
import { PromoteModal } from '@/components/students/PromoteModal';
import { openStudentIdCard } from '@/components/students/studentCard';
import { fullName, initials } from '@/components/students/utils';
import crud from '@/components/crud.module.css';
import styles from '@/components/students/students.module.css';

export function StudentProfileClient() {
  const { id } = useParams<{ id: string }>();
  const { data: session } = useSession();
  const token = session?.accessToken ?? '';
  const { classes, loadClasses } = useAdminData();

  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [promoteOpen, setPromoteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  useEffect(() => {
    if (!token || !id) return;
    setLoading(true);
    adminApi(token)
      .studentProfile(id)
      .then(setProfile)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Failed to load profile'))
      .finally(() => setLoading(false));

    adminApi(token).logStudentView(id).catch(() => null);
  }, [token, id]);

  async function handlePrintCard() {
    if (!profile || !token) return;
    const settings = await adminApi(token).settings().catch(() => null);
    openStudentIdCard(profile.student, settings);
  }

  if (loading) {
    return <div className={crud.empty}>Loading student profile…</div>;
  }

  if (error || !profile) {
    return (
      <div>
        <div className={crud.formError}>{error || 'Student not found'}</div>
        <Link href="/dashboard/students" className={crud.secondaryBtn} style={{ marginTop: 16, display: 'inline-block' }}>
          ← Back to students
        </Link>
      </div>
    );
  }

  const { student: s } = profile;

  return (
    <div>
      <div className={styles.headerRow}>
        <div>
          <Link href="/dashboard/students" style={{ fontSize: 13, color: '#0b6fd4', textDecoration: 'none' }}>
            ← Students
          </Link>
          <h1 className={styles.pageTitle} style={{ marginTop: 8 }}>{fullName(s)}</h1>
          <p className={styles.pageDesc}>{s.admission_number} · {s.class_name ?? 'No class'}</p>
        </div>
        <div className={styles.headerActions}>
          <button type="button" className={crud.secondaryBtn} onClick={() => setEditOpen(true)}>Edit</button>
          <button type="button" className={crud.secondaryBtn} onClick={() => setPromoteOpen(true)}>Promote</button>
          <button type="button" className={crud.secondaryBtn} onClick={handlePrintCard}>Print ID card</button>
          <Link href={`/dashboard/students/${s.id}/results`} className={crud.secondaryBtn}>Results</Link>
          <Link href={`/dashboard/students/${s.id}/attendance`} className={crud.primaryBtn}>Attendance</Link>
        </div>
      </div>

      <div className={styles.profileGrid}>
        <aside className={styles.profileSidebar}>
          <div className={styles.profilePhoto}>
            {s.photo_url ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={s.photo_url} alt="" />
            ) : (
              initials(s)
            )}
          </div>
          <h2 style={{ margin: '0 0 4px', fontSize: 18, color: '#0b3d6d' }}>{fullName(s)}</h2>
          <p style={{ margin: '0 0 16px', fontSize: 13, color: '#6b7c93' }}>{s.admission_number}</p>
          <span
            className={`${crud.badge} ${
              s.is_archived ? crud.badgeSuspended : s.status === 'ACTIVE' ? crud.badgeActive : crud.badgeSuspended
            }`}
          >
            {s.is_archived ? 'Archived' : s.status === 'ACTIVE' ? 'Active' : 'Inactive'}
          </span>

          <div style={{ marginTop: 24, textAlign: 'left' }}>
            {[
              ['Class', s.class_name ?? '—'],
              ['Gender', s.gender ?? '—'],
              ['Date of birth', s.date_of_birth ? new Date(s.date_of_birth).toLocaleDateString() : '—'],
              [
                'Admission date',
                s.admission_date
                  ? new Date(s.admission_date).toLocaleDateString()
                  : new Date(s.created_at).toLocaleDateString(),
              ],
            ].map(([label, value]) => (
              <div key={label} style={{ marginBottom: 12, fontSize: 13 }}>
                <span style={{ display: 'block', color: '#6b7c93', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {label}
                </span>
                <strong style={{ color: '#1a2b4a' }}>{value}</strong>
              </div>
            ))}
          </div>
        </aside>

        <div>
          <div className={styles.summaryCards}>
            <div className={styles.statCard}>
              <p className={styles.statValue}>{profile.academic_session ?? '—'}</p>
              <p className={styles.statLabel}>Current Session</p>
            </div>
            <div className={styles.statCard}>
              <p className={styles.statValue}>{profile.attendance_percent}%</p>
              <p className={styles.statLabel}>Attendance</p>
            </div>
            <div className={styles.statCard}>
              <p className={styles.statValue}>{profile.average_score ?? '—'}</p>
              <p className={styles.statLabel}>Average Score</p>
            </div>
            <div className={styles.statCard}>
              <p className={styles.statValue}>{profile.class_position ?? '—'}</p>
              <p className={styles.statLabel}>Class Position</p>
            </div>
          </div>

          <div className={crud.panel} style={{ marginBottom: 20 }}>
            <div className={crud.panelHeader}>
              <h2 className={crud.panelTitle}>Parent information</h2>
            </div>
            <div style={{ padding: '16px 24px 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              {[
                ['Parent / Guardian', s.guardian_name],
                ['Mother', s.mother_name],
                ['Phone', s.guardian_phone],
                ['Email', s.guardian_email],
                ['Relationship', s.guardian_relationship],
                ['Emergency contact', s.emergency_contact],
                ['Address', s.address],
              ].map(([label, value]) => (
                <div key={label}>
                  <span style={{ fontSize: 11, color: '#6b7c93', textTransform: 'uppercase' }}>{label}</span>
                  <p style={{ margin: '4px 0 0', fontSize: 14, color: '#1a2b4a' }}>{value ?? '—'}</p>
                </div>
              ))}
            </div>
          </div>

          <div className={crud.panel} style={{ marginBottom: 20 }}>
            <div className={crud.panelHeader}>
              <h2 className={crud.panelTitle}>Recent results</h2>
              <Link href={`/dashboard/students/${s.id}/results`} className={crud.secondaryBtn}>View full history</Link>
            </div>
            {profile.latest_results.length === 0 ? (
              <div className={crud.empty}>No results recorded yet.</div>
            ) : (
              <div className={crud.tableWrap}>
                <table className={crud.table}>
                  <thead>
                    <tr>
                      <th>Subject</th>
                      <th>Score</th>
                      <th>Grade</th>
                      <th>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profile.latest_results.map((r, i) => (
                      <tr key={i}>
                        <td>{r.subject_name}</td>
                        <td>{r.score}</td>
                        <td>{r.grade ?? '—'}</td>
                        <td>{r.remark ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className={crud.panel} style={{ marginBottom: 20 }}>
            <div className={crud.panelHeader}>
              <h2 className={crud.panelTitle}>Recent attendance</h2>
              <Link href={`/dashboard/students/${s.id}/attendance`} className={crud.secondaryBtn}>View details</Link>
            </div>
            {!profile.recent_attendance?.length ? (
              <div className={crud.empty}>No attendance records yet.</div>
            ) : (
              <div className={crud.tableWrap}>
                <table className={crud.table}>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Term</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profile.recent_attendance.map((r) => (
                      <tr key={r.id}>
                        <td>{new Date(r.date).toLocaleDateString()}</td>
                        <td>{r.status}</td>
                        <td>{r.term_name ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className={crud.panel}>
            <div className={crud.panelHeader}>
              <h2 className={crud.panelTitle}>Recent activity</h2>
              <Link href="/dashboard/activity" className={crud.secondaryBtn}>View all logs</Link>
            </div>
            {!profile.recent_activities?.length ? (
              <div className={crud.empty}>No activity recorded for this student.</div>
            ) : (
              <div style={{ padding: '8px 24px 20px' }}>
                <ul className={styles.activityList}>
                  {profile.recent_activities.map((a) => (
                    <li key={a.id} className={styles.activityItem}>
                      <span className={styles.activityDot} />
                      <div>
                        <strong>{a.action}</strong> — {a.details ?? ''}
                        <div className={styles.activityMeta}>
                          {a.admin_name} · {new Date(a.created_at).toLocaleString()}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {promoteOpen && (
        <PromoteModal
          token={token}
          studentIds={[s.id]}
          onClose={() => setPromoteOpen(false)}
          onDone={() => {
            setPromoteOpen(false);
            adminApi(token).studentProfile(id).then(setProfile).catch(() => null);
          }}
        />
      )}

      {editOpen && (
        <EditStudentModal
          token={token}
          student={s}
          classes={classes}
          open
          onClose={() => setEditOpen(false)}
          onSaved={(updated) => {
            setProfile((p) => (p ? { ...p, student: updated } : p));
            setEditOpen(false);
          }}
        />
      )}
    </div>
  );
}
