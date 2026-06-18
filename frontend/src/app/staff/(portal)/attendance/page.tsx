import type { Metadata } from 'next';
import { requireRole } from '@/lib/dal';
import { academicApi, staffApi } from '@/lib/api';
import styles from '@/components/Portal/portal.module.css';
import AttendanceForm from './AttendanceForm';

export const metadata: Metadata = { title: 'Mark Attendance' };

export default async function StaffAttendancePage() {
  const session = await requireRole('STAFF');
  const [classes, academic] = await Promise.all([
    staffApi(session.accessToken).classes(),
    academicApi(session.accessToken).current(),
  ]);

  return (
    <>
      {academic.session && academic.term && classes.length > 0 ? (
        <AttendanceForm
          classes={classes.map((c) => ({ id: c.id, name: c.name }))}
          sessionId={academic.session.id}
          termId={academic.term.id}
        />
      ) : (
        <div className={styles.empty}><p>No classes or active session/term configured.</p></div>
      )}
    </>
  );
}
