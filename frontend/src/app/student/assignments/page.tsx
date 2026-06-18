import type { Metadata } from 'next';
import { requireRole } from '@/lib/dal';
import { studentApi } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import styles from '@/components/Portal/portal.module.css';
import AssignmentSubmitForm from './AssignmentSubmitForm';

export const metadata: Metadata = { title: 'My Assignments' };

export default async function StudentAssignmentsPage() {
  const session = await requireRole('STUDENT');
  const assignments = await studentApi(session.accessToken).assignments();

  return (
    <>
      {assignments.length === 0 ? (
        <div className={styles.empty}>
          <p>No assignments yet.</p>
        </div>
      ) : (
        assignments.map((a) => (
          <div key={a.id} className={styles.card}>
            <h2 className={styles.cardTitle}>{a.title}</h2>
            <table className={styles.table}>
              <tbody>
                <tr><td><strong>Subject</strong></td><td>{a.subject_name}</td></tr>
                <tr><td><strong>Teacher</strong></td><td>{a.staff_name ?? '—'}</td></tr>
                <tr><td><strong>Due Date</strong></td><td>{formatDate(a.due_date)}</td></tr>
                <tr><td><strong>Status</strong></td>
                  <td>
                    <span className={`${styles.badge} ${
                      a.submission_status === 'SUBMITTED' ? styles.badgeSuccess :
                      a.submission_status === 'GRADED' ? styles.badgeInfo :
                      styles.badgeWarning
                    }`}>
                      {a.submission_status ?? 'PENDING'}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
            {a.description && <p style={{ margin: '1rem 0', color: 'var(--color-text-muted)' }}>{a.description}</p>}
            {a.file_url && (
              <a href={a.file_url} className="btn btn-outline btn-sm" download style={{ marginBottom: '1rem', display: 'inline-flex' }}>
                Download Assignment File
              </a>
            )}
            {(!a.submission_status || a.submission_status === 'PENDING') && (
              <AssignmentSubmitForm assignmentId={a.id} />
            )}
            {a.submission_feedback && (
              <p style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
                <strong>Feedback:</strong> {a.submission_feedback}
                {a.submission_score != null && ` · Score: ${a.submission_score}`}
              </p>
            )}
          </div>
        ))
      )}
    </>
  );
}
