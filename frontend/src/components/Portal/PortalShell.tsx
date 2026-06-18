import Link from 'next/link';
import Image from 'next/image';
import { NAV_MAP, ROLE_LABELS } from './portal-nav';
import styles from './portal.module.css';
import LogoutButton from './LogoutButton';
import PortalNav from './PortalNav';

const DASHBOARD_HREF = {
  STUDENT: '/student/dashboard',
  STAFF: '/staff/dashboard',
} as const;

interface PortalShellProps {
  role: 'STUDENT' | 'STAFF';
  displayName: string;
  identifier: string;
  pageTitle: string;
  children: React.ReactNode;
}

export default function PortalShell({
  role,
  displayName,
  identifier,
  pageTitle,
  children,
}: PortalShellProps) {
  const navItems = NAV_MAP[role];
  const roleLabel = ROLE_LABELS[role];
  const dashboardHref = DASHBOARD_HREF[role];
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className={styles.portal}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <Link href={dashboardHref} className={styles.logo}>
            <Image
              src="/images/logo.jpeg"
              alt="Sunrise Academy"
              width={40}
              height={40}
              className={styles.logoIcon}
            />
            <div className={styles.logoText}>
              <span className={styles.logoName}>Sunrise Academy</span>
              <span className={styles.logoSub}>School Portal</span>
            </div>
          </Link>
          <span className={styles.roleBadge}>{roleLabel} Portal</span>
        </div>

        <PortalNav items={navItems} />

        <div className={styles.sidebarFooter}>
          <div className={styles.userCard}>
            <div className={styles.avatar}>{initials}</div>
            <div className={styles.userInfo}>
              <div className={styles.userName}>{displayName}</div>
              <div className={styles.userId}>{identifier}</div>
            </div>
          </div>
          <LogoutButton />
        </div>
      </aside>

      <div className={styles.main}>
        <header className={styles.topbar}>
          <h1 className={styles.pageTitle}>{pageTitle}</h1>
          <LogoutButton compact />
        </header>
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}
