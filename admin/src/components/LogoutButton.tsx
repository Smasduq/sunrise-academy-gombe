'use client';

import { signOut } from 'next-auth/react';

type LogoutButtonProps = {
  className?: string;
};

export function LogoutButton({ className }: LogoutButtonProps) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => signOut({ callbackUrl: '/login' })}
    >
      Sign Out
    </button>
  );
}
