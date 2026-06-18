import type { Metadata } from 'next';
import { requireRole } from '@/lib/dal';
import { staffApi } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import styles from '@/components/Portal/portal.module.css';
import AnnouncementForm from './AnnouncementForm';

export const metadata: Metadata = { title: 'Post Announcements' };

export default async function StaffAnnouncementsPage() {
  const session = await requireRole('STAFF');
  const announcements = await staffApi(session.accessToken).announcements();

  return (
    <>
      <AnnouncementForm />
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Recent Announcements</h2>
        {announcements.length === 0 ? (
          <div className={styles.empty}><p>No announcements yet.</p></div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr><th>Title</th><th>Audience</th><th>Posted By</th><th>Date</th></tr>
            </thead>
            <tbody>
              {announcements.map((a) => (
                <tr key={a.id}>
                  <td>{a.title}</td>
                  <td>{a.audience}</td>
                  <td>{a.posted_by ?? 'School'}</td>
                  <td>{formatDate(a.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
