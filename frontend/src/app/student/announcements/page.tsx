import type { Metadata } from 'next';
import { requireRole } from '@/lib/dal';
import { studentApi } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import styles from '@/components/Portal/portal.module.css';

export const metadata: Metadata = { title: 'Announcements' };

export default async function StudentAnnouncementsPage() {
  const session = await requireRole('STUDENT');
  const announcements = await studentApi(session.accessToken).announcements();

  return (
    <>
      {announcements.length === 0 ? (
        <div className={styles.empty}><p>No announcements at this time.</p></div>
      ) : (
        announcements.map((a) => (
          <div key={a.id} className={styles.card}>
            <h2 className={styles.cardTitle}>{a.title}</h2>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }}>{a.content}</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>
              Posted by {a.posted_by ?? 'School'} · {formatDate(a.created_at)}
            </p>
          </div>
        ))
      )}
    </>
  );
}
