'use client';

import { useActionState, useState } from 'react';
import { markAttendance } from '@/actions/portal';
import styles from '@/components/Portal/portal.module.css';

interface Props {
  classes: { id: string; name: string }[];
  sessionId: string;
  termId: string;
}

interface StudentRow {
  id: string;
  firstName: string;
  lastName: string;
  admissionNumber: string;
}

export default function AttendanceForm({ classes, sessionId, termId }: Props) {
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string; success?: string } | null, formData: FormData) => {
      return markAttendance(formData);
    },
    null
  );

  async function loadStudents(classId: string) {
    if (!classId) { setStudents([]); return; }
    setLoading(true);
    const res = await fetch(`/api/staff/students?classId=${classId}`);
    const data = await res.json();
    setStudents(data);
    setLoading(false);
  }

  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>Mark Attendance</h2>
      {state?.error && <div className={`${styles.alert} ${styles.alertError}`}>{state.error}</div>}
      {state?.success && <div className={`${styles.alert} ${styles.alertSuccess}`}>{state.success}</div>}
      <form action={action}>
        <input type="hidden" name="sessionId" value={sessionId} />
        <input type="hidden" name="termId" value={termId} />
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Class</label>
            <select name="classId" className={styles.select} required onChange={(e) => loadStudents(e.target.value)}>
              <option value="">Select class</option>
              {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Date</label>
            <input type="date" name="date" className={styles.input} required defaultValue={new Date().toISOString().split('T')[0]} />
          </div>
        </div>
        {loading && <p>Loading students…</p>}
        {students.length > 0 && (
          <table className={styles.table} style={{ marginTop: '1rem' }}>
            <thead><tr><th>Student</th><th>Status</th></tr></thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id}>
                  <td>{s.firstName} {s.lastName} ({s.admissionNumber})</td>
                  <td>
                    <select name={`status_${s.id}`} className={styles.select}>
                      <option value="PRESENT">Present</option>
                      <option value="ABSENT">Absent</option>
                      <option value="LATE">Late</option>
                      <option value="EXCUSED">Excused</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }} disabled={pending || students.length === 0}>
          {pending ? 'Saving…' : 'Save Attendance'}
        </button>
      </form>
    </div>
  );
}
