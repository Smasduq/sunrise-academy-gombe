import type { Metadata } from 'next';
import { requireRole } from '@/lib/dal';
import { studentApi } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import styles from '@/components/Portal/portal.module.css';

export const metadata: Metadata = { title: 'Student Dashboard' };

export default async function StudentDashboardPage() {
  const session = await requireRole('STUDENT');
  const data = await studentApi(session.accessToken).dashboard();
  const { profile, stats } = data;

  return (
    <>
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{profile.admission_number}</div>
          <div className={styles.statLabel}>Admission Number</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{profile.class_name ?? '—'}</div>
          <div className={styles.statLabel}>Class</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{stats.results_count}</div>
          <div className={styles.statLabel}>Published Results</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{stats.assignments_count}</div>
          <div className={styles.statLabel}>Assignments</div>
        </div>
      </div>

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Profile</h2>
        <table className={styles.table}>
          <tbody>
            <tr><td><strong>Full Name</strong></td><td>{profile.first_name} {profile.last_name}</td></tr>
            <tr><td><strong>Admission No.</strong></td><td>{profile.admission_number}</td></tr>
            <tr><td><strong>Class</strong></td><td>{profile.class_name ? `${profile.class_name} (${profile.class_level})` : 'Not assigned'}</td></tr>
            <tr><td><strong>Guardian</strong></td><td>{profile.guardian_name ?? '—'}</td></tr>
            <tr><td><strong>Guardian Phone</strong></td><td>{profile.guardian_phone ?? '—'}</td></tr>
          </tbody>
        </table>
      </div>

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Quick Summary</h2>
        <table className={styles.table}>
          <tbody>
            <tr><td>Announcements</td><td>{stats.announcements_count} active</td></tr>
            <tr><td>Fee Outstanding</td><td>{formatCurrency(stats.outstanding)}</td></tr>
            <tr><td>Fee Paid</td><td>{formatCurrency(stats.total_paid)}</td></tr>
          </tbody>
        </table>
      </div>
    </>
  );
}
