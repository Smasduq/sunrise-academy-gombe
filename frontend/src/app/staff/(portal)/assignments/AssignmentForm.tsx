'use client';

import { useActionState } from 'react';
import { createAssignment } from '@/actions/portal';
import styles from '@/components/Portal/portal.module.css';

interface Props {
  classes: { id: string; name: string }[];
  subjects: { id: string; name: string }[];
  sessionId: string;
  termId: string;
}

export default function AssignmentForm({ classes, subjects, sessionId, termId }: Props) {
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string; success?: string } | null, formData: FormData) => {
      return createAssignment(formData);
    },
    null
  );

  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>Create Assignment</h2>
      {state?.error && <div className={`${styles.alert} ${styles.alertError}`}>{state.error}</div>}
      {state?.success && <div className={`${styles.alert} ${styles.alertSuccess}`}>{state.success}</div>}
      <form action={action}>
        <input type="hidden" name="sessionId" value={sessionId} />
        <input type="hidden" name="termId" value={termId} />
        <div className={styles.formGroup}>
          <label className={styles.label}>Title</label>
          <input name="title" className={styles.input} required />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Description</label>
          <textarea name="description" className={styles.textarea} />
        </div>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Class</label>
            <select name="classId" className={styles.select} required>
              <option value="">Select class</option>
              {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Subject</label>
            <select name="subjectId" className={styles.select} required>
              <option value="">Select subject</option>
              {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Due Date</label>
            <input type="datetime-local" name="dueDate" className={styles.input} required />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>File URL (optional)</label>
            <input name="fileUrl" className={styles.input} placeholder="https://..." />
          </div>
        </div>
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? 'Creating…' : 'Create Assignment'}
        </button>
      </form>
    </div>
  );
}
