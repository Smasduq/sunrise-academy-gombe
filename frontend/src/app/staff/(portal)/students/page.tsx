import type { Metadata } from 'next';
import { requireRole } from '@/lib/dal';
import { staffApi } from '@/lib/api';
import styles from '@/components/Portal/portal.module.css';

export const metadata: Metadata = { title: 'Manage Students' };

export default async function StaffStudentsPage() {
  const session = await requireRole('STAFF');
  const students = await staffApi(session.accessToken).students();

  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>Students in My Classes</h2>
      {students.length === 0 ? (
        <div className={styles.empty}><p>No students in your assigned classes.</p></div>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr><th>Admission No.</th><th>Name</th><th>Class</th><th>Guardian</th></tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id}>
                <td>{s.admission_number}</td>
                <td>{s.first_name} {s.last_name}</td>
                <td>{s.class_name ?? '—'}</td>
                <td>{s.guardian_name ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
