import type { Metadata } from 'next';
import { requireRole } from '@/lib/dal';
import { studentApi } from '@/lib/api';
import { calculateAttendancePercentage, formatDate } from '@/lib/utils';
import styles from '@/components/Portal/portal.module.css';

export const metadata: Metadata = { title: 'My Attendance' };

export default async function StudentAttendancePage() {
  const session = await requireRole('STUDENT');
  const records = await studentApi(session.accessToken).attendance();
  const percentage = calculateAttendancePercentage(records);

  return (
    <>
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{percentage}%</div>
          <div className={styles.statLabel}>Attendance Rate</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{records.filter((r) => r.status === 'PRESENT').length}</div>
          <div className={styles.statLabel}>Days Present</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{records.filter((r) => r.status === 'ABSENT').length}</div>
          <div className={styles.statLabel}>Days Absent</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{records.length}</div>
          <div className={styles.statLabel}>Total Records</div>
        </div>
      </div>

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Attendance History</h2>
        {records.length === 0 ? (
          <div className={styles.empty}><p>No attendance records yet.</p></div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr><th>Date</th><th>Status</th><th>Remark</th></tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id}>
                  <td>{formatDate(r.date)}</td>
                  <td>
                    <span className={`${styles.badge} ${
                      r.status === 'PRESENT' ? styles.badgeSuccess :
                      r.status === 'LATE' ? styles.badgeWarning :
                      styles.badgeDanger
                    }`}>
                      {r.status}
                    </span>
                  </td>
                  <td>{r.remark ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
