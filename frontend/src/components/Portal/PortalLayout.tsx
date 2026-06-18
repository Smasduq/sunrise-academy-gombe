'use client';

import { usePathname } from 'next/navigation';
import { NAV_MAP, type NavItem } from './portal-nav';
import PortalShell from './PortalShell';

interface PortalLayoutProps {
  role: 'STUDENT' | 'STAFF';
  navItems: NavItem[];
  displayName: string;
  identifier: string;
  children: React.ReactNode;
}

export default function PortalLayout({
  role,
  navItems,
  displayName,
  identifier,
  children,
}: PortalLayoutProps) {
  const pathname = usePathname();
  const current = navItems.find(
    (item) =>
      pathname === item.href ||
      (item.href !== navItems[0].href && pathname.startsWith(item.href))
  );
  const pageTitle = current?.label ?? 'Dashboard';

  return (
    <PortalShell
      role={role}
      displayName={displayName}
      identifier={identifier}
      pageTitle={pageTitle}
    >
      {children}
    </PortalShell>
  );
}

export { NAV_MAP };
