'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';

const PORTAL_PREFIXES = ['/login', '/student'];
const STAFF_PORTAL_PREFIX = '/staff/';

function isPortalRoute(pathname: string): boolean {
  if (PORTAL_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return true;
  }
  if (pathname.startsWith(STAFF_PORTAL_PREFIX) && pathname !== '/staff') {
    return true;
  }
  return false;
}

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPortal = isPortalRoute(pathname);

  if (isPortal) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}
