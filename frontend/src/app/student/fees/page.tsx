import type { Metadata } from 'next';
import { requireRole } from '@/lib/dal';
import { studentApi } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import styles from '@/components/Portal/portal.module.css';

export const metadata: Metadata = { title: 'School Fees' };

export default async function StudentFeesPage() {
  const session = await requireRole('STUDENT');
  const fees = await studentApi(session.accessToken).fees();

  const totalDue = fees.reduce((s, f) => s + f.amount_due, 0);
  const totalPaid = fees.reduce((s, f) => s + f.amount_paid, 0);
  const outstanding = totalDue - totalPaid;

  return (
    <>
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{formatCurrency(totalDue)}</div>
          <div className={styles.statLabel}>Total Due</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{formatCurrency(totalPaid)}</div>
          <div className={styles.statLabel}>Total Paid</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{formatCurrency(outstanding)}</div>
          <div className={styles.statLabel}>Outstanding Balance</div>
        </div>
      </div>

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Payment History</h2>
        {fees.length === 0 ? (
          <div className={styles.empty}><p>No fee records found.</p></div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Session / Term</th>
                <th>Description</th>
                <th>Due</th>
                <th>Paid</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {fees.map((f) => (
                <tr key={f.id}>
                  <td>{f.session_name} / {f.term_name}</td>
                  <td>{f.description ?? 'School Fees'}</td>
                  <td>{formatCurrency(f.amount_due)}</td>
                  <td>{formatCurrency(f.amount_paid)}</td>
                  <td>
                    <span className={`${styles.badge} ${
                      f.status === 'PAID' ? styles.badgeSuccess :
                      f.status === 'PARTIAL' ? styles.badgeWarning :
                      styles.badgeDanger
                    }`}>{f.status}</span>
                  </td>
                  <td>{f.payment_date ? formatDate(f.payment_date) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
