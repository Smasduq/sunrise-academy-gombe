'use client';

import { useActionState } from 'react';
import { submitAssignment } from '@/actions/portal';
import styles from '@/components/Portal/portal.module.css';

export default function AssignmentSubmitForm({ assignmentId }: { assignmentId: string }) {
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string; success?: string } | null, formData: FormData) => {
      return submitAssignment(formData);
    },
    null
  );

  return (
    <form action={action} style={{ marginTop: '1rem' }}>
      <input type="hidden" name="assignmentId" value={assignmentId} />
      {state?.error && <div className={`${styles.alert} ${styles.alertError}`}>{state.error}</div>}
      {state?.success && <div className={`${styles.alert} ${styles.alertSuccess}`}>{state.success}</div>}
      <div className={styles.formGroup}>
        <label className={styles.label}>Your Submission</label>
        <textarea name="content" className={styles.textarea} placeholder="Type your answer or notes here…" required />
      </div>
      <button type="submit" className="btn btn-primary btn-sm" disabled={pending}>
        {pending ? 'Submitting…' : 'Submit Assignment'}
      </button>
    </form>
  );
}
