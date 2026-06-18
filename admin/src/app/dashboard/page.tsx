import { auth } from '@/auth';
import { adminApi } from '@/lib/api';
import styles from '@/components/crud.module.css';
import Link from 'next/link';

export default async function DashboardPage() {
  const session = await auth();
  const api = adminApi(session!.accessToken);
  const stats = await api.stats();

  return (
    <>
      <div className={styles.stats}>
        <div className={styles.statCard}>
          <p className={styles.statValue}>{stats.students}</p>
          <p className={styles.statLabel}>Students</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statValue}>{stats.staff}</p>
          <p className={styles.statLabel}>Staff</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statValue}>{stats.classes}</p>
          <p className={styles.statLabel}>Classes</p>
        </div>
      </div>

      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <h2 className={styles.panelTitle}>Quick actions</h2>
        </div>
        <div style={{ padding: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Link href="/dashboard/students" className={styles.primaryBtn}>
            Manage students
          </Link>
          <Link href="/dashboard/staff" className={styles.secondaryBtn}>
            Manage staff
          </Link>
        </div>
      </div>
    </>
  );
}
