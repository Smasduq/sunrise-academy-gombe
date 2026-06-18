'use client';

import { useActionState } from 'react';
import { saveResult } from '@/actions/portal';
import styles from '@/components/Portal/portal.module.css';

interface Props {
  students: { id: string; name: string; classId: string }[];
  subjects: { id: string; name: string }[];
  sessionId: string;
  termId: string;
}

export default function ResultForm({ students, subjects, sessionId, termId }: Props) {
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string; success?: string } | null, formData: FormData) => {
      return saveResult(formData);
    },
    null
  );

  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>Upload / Edit Results</h2>
      {state?.error && <div className={`${styles.alert} ${styles.alertError}`}>{state.error}</div>}
      {state?.success && <div className={`${styles.alert} ${styles.alertSuccess}`}>{state.success}</div>}
      <form action={action}>
        <input type="hidden" name="sessionId" value={sessionId} />
        <input type="hidden" name="termId" value={termId} />
        <div className={styles.formGroup}>
          <label className={styles.label}>Student</label>
          <select name="studentId" className={styles.select} required onChange={(e) => {
            const opt = e.target.selectedOptions[0];
            const classInput = document.getElementById('classId') as HTMLInputElement;
            if (classInput) classInput.value = opt.dataset.classId ?? '';
          }}>
            <option value="">Select student</option>
            {students.map((s) => (
              <option key={s.id} value={s.id} data-class-id={s.classId}>{s.name}</option>
            ))}
          </select>
        </div>
        <input type="hidden" id="classId" name="classId" value="" />
        <div className={styles.formRow}>
          {subjects.map((sub) => (
            <div key={sub.id} className={styles.formGroup}>
              <label className={styles.label}>{sub.name}</label>
              <input type="number" name={`score_${sub.id}`} className={styles.input} min="0" max="100" step="0.5" />
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <button type="submit" name="publish" value="false" className="btn btn-outline" disabled={pending}>
            Save Draft
          </button>
          <button type="submit" name="publish" value="true" className="btn btn-primary" disabled={pending}>
            {pending ? 'Saving…' : 'Publish Result'}
          </button>
        </div>
      </form>
    </div>
  );
}
