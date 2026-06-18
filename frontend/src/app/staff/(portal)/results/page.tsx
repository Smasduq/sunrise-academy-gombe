import type { Metadata } from 'next';
import { requireRole } from '@/lib/dal';
import { academicApi, staffApi } from '@/lib/api';
import styles from '@/components/Portal/portal.module.css';
import ResultForm from './ResultForm';

export const metadata: Metadata = { title: 'Manage Results' };

export default async function StaffResultsPage() {
  const session = await requireRole('STAFF');
  const [students, subjects, academic, results] = await Promise.all([
    staffApi(session.accessToken).students(),
    academicApi(session.accessToken).subjects(),
    academicApi(session.accessToken).current(),
    staffApi(session.accessToken).results(),
  ]);

  return (
    <>
      {academic.session && academic.term && students.length > 0 && (
        <ResultForm
          students={students.map((s) => ({
            id: s.id,
            name: `${s.first_name} ${s.last_name}`,
            classId: s.class_id ?? '',
          }))}
          subjects={subjects.map((s) => ({ id: s.id, name: s.name }))}
          sessionId={academic.session.id}
          termId={academic.term.id}
        />
      )}

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Recent Results</h2>
        {results.length === 0 ? (
          <div className={styles.empty}><p>No results uploaded yet.</p></div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr><th>Student</th><th>Term</th><th>Average</th><th>Grade</th><th>Status</th></tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r.id}>
                  <td>{r.student_name}</td>
                  <td>{r.term_name}</td>
                  <td>{r.average?.toFixed(1)}%</td>
                  <td>{r.grade}</td>
                  <td>
                    <span className={`${styles.badge} ${r.status === 'PUBLISHED' ? styles.badgeSuccess : styles.badgeWarning}`}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
