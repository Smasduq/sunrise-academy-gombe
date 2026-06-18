'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './admin-shell.module.css';
import { LogoutButton } from './LogoutButton';

const NAV = [
  { href: '/dashboard', label: 'Overview', title: 'Overview' },
  { href: '/dashboard/students', label: 'Students', title: 'Students' },
  { href: '/dashboard/staff', label: 'Staff', title: 'Staff' },
];

type Props = {
  displayName: string;
  email: string;
  children: React.ReactNode;
};

export function AdminShell({ displayName, email, children }: Props) {
  const pathname = usePathname();
  const current = NAV.find((item) =>
    item.href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(item.href)
  );
  const title = current?.title ?? 'Dashboard';

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          Sunrise <span>Admin</span>
        </div>
        <nav className={styles.nav}>
          {NAV.map((item) => {
            const active =
              item.href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navLink} ${active ? styles.navLinkActive : ''}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className={styles.userCard}>
          <div className={styles.userName}>{displayName}</div>
          <div className={styles.userEmail}>{email}</div>
        </div>
      </aside>
      <div className={styles.main}>
        <header className={styles.topbar}>
          <h1 className={styles.pageTitle}>{title}</h1>
          <LogoutButton />
        </header>
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
