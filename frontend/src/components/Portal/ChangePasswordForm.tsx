'use client';

import { useActionState } from 'react';
import { changePassword } from '@/actions/portal';
import styles from '@/components/Portal/portal.module.css';

export default function ChangePasswordForm() {
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string; success?: string } | null, formData: FormData) => {
      return changePassword(formData);
    },
    null
  );

  return (
    <div className={styles.card} style={{ maxWidth: 480 }}>
      <h2 className={styles.cardTitle}>Change Password</h2>
      {state?.error && <div className={`${styles.alert} ${styles.alertError}`}>{state.error}</div>}
      {state?.success && <div className={`${styles.alert} ${styles.alertSuccess}`}>{state.success}</div>}
      <form action={action}>
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="currentPassword">Current Password</label>
          <input id="currentPassword" name="currentPassword" type="password" className={styles.input} required />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="newPassword">New Password</label>
          <input id="newPassword" name="newPassword" type="password" className={styles.input} required minLength={8} />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="confirmPassword">Confirm New Password</label>
          <input id="confirmPassword" name="confirmPassword" type="password" className={styles.input} required minLength={8} />
        </div>
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? 'Updating…' : 'Update Password'}
        </button>
      </form>
    </div>
  );
}
