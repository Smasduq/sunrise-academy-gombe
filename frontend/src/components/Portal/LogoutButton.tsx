'use client';

import { signOut } from 'next-auth/react';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import styles from './portal.module.css';

interface LogoutButtonProps {
  compact?: boolean;
}

export default function LogoutButton({ compact = false }: LogoutButtonProps) {
  return (
    <button
      type="button"
      className={compact ? styles.logoutBtnCompact : styles.logoutBtn}
      onClick={() => signOut({ callbackUrl: '/login' })}
    >
      <ArrowRightOnRectangleIcon className={styles.navIcon} />
      Sign Out
    </button>
  );
}
