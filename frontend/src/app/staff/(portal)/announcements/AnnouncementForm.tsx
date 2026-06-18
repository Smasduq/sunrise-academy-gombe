'use client';

import { useActionState } from 'react';
import { postAnnouncement } from '@/actions/portal';
import styles from '@/components/Portal/portal.module.css';

export default function AnnouncementForm() {
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string; success?: string } | null, formData: FormData) => {
      return postAnnouncement(formData);
    },
    null
  );

  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>Post Announcement</h2>
      {state?.error && <div className={`${styles.alert} ${styles.alertError}`}>{state.error}</div>}
      {state?.success && <div className={`${styles.alert} ${styles.alertSuccess}`}>{state.success}</div>}
      <form action={action}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Title</label>
          <input name="title" className={styles.input} required />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Content</label>
          <textarea name="content" className={styles.textarea} required />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Audience</label>
          <select name="audience" className={styles.select}>
            <option value="ALL">Everyone</option>
            <option value="STUDENTS">Students / Parents</option>
            <option value="STAFF">Teachers</option>
          </select>
        </div>
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? 'Posting…' : 'Post Announcement'}
        </button>
      </form>
    </div>
  );
}
