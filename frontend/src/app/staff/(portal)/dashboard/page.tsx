import type { Metadata } from 'next';
import { requireRole } from '@/lib/dal';
import { staffApi } from '@/lib/api';
import styles from '@/components/Portal/portal.module.css';

export const metadata: Metadata = { title: 'Teacher Dashboard' };

export default async function StaffDashboardPage() {
  const session = await requireRole('STAFF');
  const staff = await staffApi(session.accessToken).me();
  if (!staff) return null;

  return (
    <>
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{staff.stats.class_count}</div>
          <div className={styles.statLabel}>Assigned Classes</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{staff.stats.student_count}</div>
          <div className={styles.statLabel}>Students</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{staff.stats.assignment_count}</div>
          <div className={styles.statLabel}>Assignments Created</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{staff.stats.announcement_count}</div>
          <div className={styles.statLabel}>Announcements</div>
        </div>
      </div>

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Profile</h2>
        <table className={styles.table}>
          <tbody>
            <tr><td><strong>Name</strong></td><td>{staff.first_name} {staff.last_name}</td></tr>
            <tr><td><strong>Staff ID</strong></td><td>{staff.staff_id}</td></tr>
            <tr><td><strong>Department</strong></td><td>{staff.department ?? '—'}</td></tr>
            <tr><td><strong>Position</strong></td><td>{staff.position ?? '—'}</td></tr>
          </tbody>
        </table>
      </div>
    </>
  );
}
