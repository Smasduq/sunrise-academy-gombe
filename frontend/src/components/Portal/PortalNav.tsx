'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  AcademicCapIcon,
  ClipboardDocumentListIcon,
  CalendarDaysIcon,
  MegaphoneIcon,
  BanknotesIcon,
  KeyIcon,
  UserGroupIcon,
  BookOpenIcon,
} from '@heroicons/react/24/outline';
import type { NavItem, PortalIcon } from './portal-nav';
import styles from './portal.module.css';

const ICONS: Record<PortalIcon, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  home: HomeIcon,
  'academic-cap': AcademicCapIcon,
  clipboard: ClipboardDocumentListIcon,
  calendar: CalendarDaysIcon,
  megaphone: MegaphoneIcon,
  banknotes: BanknotesIcon,
  key: KeyIcon,
  users: UserGroupIcon,
  book: BookOpenIcon,
};

export default function PortalNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className={styles.nav} aria-label="Portal navigation">
      <ul className={styles.navList}>
        {items.map((item) => {
          const Icon = ICONS[item.icon];
          const isActive =
            pathname === item.href ||
            (item.href !== pathname && pathname.startsWith(`${item.href}/`));
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`${styles.navLink} ${isActive ? styles.active : ''}`}
              >
                <Icon className={styles.navIcon} />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
