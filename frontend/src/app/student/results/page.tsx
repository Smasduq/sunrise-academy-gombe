import type { Metadata } from 'next';
import Link from 'next/link';
import { requireRole } from '@/lib/dal';
import { studentApi } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import styles from '@/components/Portal/portal.module.css';

export const metadata: Metadata = { title: 'My Results' };

export default async function StudentResultsPage() {
  const session = await requireRole('STUDENT');
  const results = await studentApi(session.accessToken).results();

  return (
    <>
      {results.length === 0 ? (
        <div className={styles.empty}>
          <p>No published results yet.</p>
        </div>
      ) : (
        results.map((result) => (
          <div key={result.id} className={styles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 className={styles.cardTitle}>
                {result.session_name} — {result.term_name}
              </h2>
              <Link
                href={`/api/student/results/${result.id}/pdf`}
                className="btn btn-outline btn-sm"
                target="_blank"
              >
                Download PDF
              </Link>
            </div>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Score</th>
                  <th>Grade</th>
                </tr>
              </thead>
              <tbody>
                {result.scores.map((s) => (
                  <tr key={s.subject_code}>
                    <td>{s.subject_name}</td>
                    <td>{s.score}</td>
                    <td>{s.grade ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
              Average: <strong>{result.average?.toFixed(1)}%</strong> · Grade: <strong>{result.grade}</strong>
              {result.published_at && ` · Published ${formatDate(result.published_at)}`}
            </p>
          </div>
        ))
      )}
    </>
  );
}
