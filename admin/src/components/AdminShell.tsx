'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import styles from './admin-shell.module.css';
import { LogoutButton } from './LogoutButton';

const NAV_GROUPS = [
  {
    label: 'Main',
    items: [{ href: '/dashboard', label: 'Overview', short: 'Home' }],
  },
  {
    label: 'People',
    items: [
      { href: '/dashboard/students', label: 'Students', short: 'Students' },
      { href: '/dashboard/students/archived', label: 'Archived', short: 'Archive' },
      { href: '/dashboard/staff', label: 'Staff', short: 'Staff' },
      { href: '/dashboard/admissions', label: 'Admissions', short: 'Admit' },
    ],
  },
  {
    label: 'Academics',
    items: [
      { href: '/dashboard/attendance', label: 'Attendance', short: 'Attend' },
      { href: '/dashboard/results', label: 'Results', short: 'Results' },
    ],
  },
  {
    label: 'Communication',
    items: [
      { href: '/dashboard/announcements', label: 'Announcements', short: 'News' },
      { href: '/dashboard/content', label: 'Website Content', short: 'Site' },
    ],
  },
  {
    label: 'System',
    items: [
      { href: '/dashboard/settings', label: 'Settings', short: 'Settings' },
      { href: '/dashboard/activity', label: 'Activity Log', short: 'Log' },
    ],
  },
];

const ALL_ITEMS = NAV_GROUPS.flatMap((g) => g.items);

type Props = {
  displayName: string;
  email: string;
  children: React.ReactNode;
};

export function AdminShell({ displayName, email, children }: Props) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const current = ALL_ITEMS.find((item) =>
    item.href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(item.href)
  );
  const title = current?.label ?? 'Dashboard';

  function isActive(href: string) {
    return href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href);
  }

  return (
    <div className={styles.shell}>
      {menuOpen && (
        <button
          type="button"
          className={styles.backdrop}
          aria-label="Close menu"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <aside className={`${styles.sidebar} ${menuOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.brandBlock}>
          <div className={styles.brand}>
            Sunrise <span>Admin</span>
          </div>
          <p className={styles.brandSub}>Sunrise Academy Gombe</p>
        </div>

        <nav className={styles.nav}>
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className={styles.navGroup}>
              <p className={styles.navGroupLabel}>{group.label}</p>
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${styles.navLink} ${isActive(item.href) ? styles.navLinkActive : ''}`}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        <div className={styles.userCard}>
          <div className={styles.userAvatar}>{displayName.charAt(0).toUpperCase()}</div>
          <div>
            <div className={styles.userName}>{displayName}</div>
            <div className={styles.userEmail}>{email}</div>
          </div>
        </div>
      </aside>

      <div className={styles.main}>
        <header className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <button
              type="button"
              className={styles.menuBtn}
              aria-label="Open menu"
              onClick={() => setMenuOpen(true)}
            >
              ☰
            </button>
            <div>
              <h1 className={styles.pageTitle}>{title}</h1>
              <p className={styles.pageSubtitle}>Nursery & Primary Administration</p>
            </div>
          </div>
          <LogoutButton className={styles.logoutBtn} />
        </header>
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
