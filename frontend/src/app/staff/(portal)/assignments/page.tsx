import type { Metadata } from 'next';
import { requireRole } from '@/lib/dal';
import { academicApi, staffApi } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import styles from '@/components/Portal/portal.module.css';
import AssignmentForm from './AssignmentForm';

export const metadata: Metadata = { title: 'Manage Assignments' };

export default async function StaffAssignmentsPage() {
  const session = await requireRole('STAFF');
  const [assignments, classes, subjects, academic] = await Promise.all([
    staffApi(session.accessToken).assignments(),
    staffApi(session.accessToken).classes(),
    academicApi(session.accessToken).subjects(),
    academicApi(session.accessToken).current(),
  ]);

  return (
    <>
      {academic.session && academic.term && (
        <AssignmentForm
          classes={classes.map((c) => ({ id: c.id, name: c.name }))}
          subjects={subjects.map((s) => ({ id: s.id, name: s.name }))}
          sessionId={academic.session.id}
          termId={academic.term.id}
        />
      )}

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>My Assignments</h2>
        {assignments.length === 0 ? (
          <div className={styles.empty}><p>No assignments created yet.</p></div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr><th>Title</th><th>Class</th><th>Subject</th><th>Due Date</th></tr>
            </thead>
            <tbody>
              {assignments.map((a) => (
                <tr key={a.id}>
                  <td>{a.title}</td>
                  <td>{a.class_name}</td>
                  <td>{a.subject_name}</td>
                  <td>{formatDate(a.due_date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
