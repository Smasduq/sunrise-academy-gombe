'use client';

import { signOut } from 'next-auth/react';
import styles from './admin-shell.module.css';

export function LogoutButton() {
  return (
    <button type="button" className={styles.logoutBtn} onClick={() => signOut({ callbackUrl: '/login' })}>
      Sign Out
    </button>
  );
}
