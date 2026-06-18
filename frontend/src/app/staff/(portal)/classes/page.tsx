import type { Metadata } from 'next';
import { requireRole } from '@/lib/dal';
import { staffApi } from '@/lib/api';
import styles from '@/components/Portal/portal.module.css';

export const metadata: Metadata = { title: 'My Classes' };

export default async function StaffClassesPage() {
  const session = await requireRole('STAFF');
  const staff = await staffApi(session.accessToken).me();
  if (!staff) return null;

  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>Assigned Classes</h2>
      {staff.classes.length === 0 ? (
        <div className={styles.empty}><p>No classes assigned yet.</p></div>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr><th>Class</th><th>Level</th><th>Section</th></tr>
          </thead>
          <tbody>
            {staff.classes.map((cls) => (
              <tr key={cls.id}>
                <td>{cls.name}</td>
                <td>{cls.level}</td>
                <td>{cls.section ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
