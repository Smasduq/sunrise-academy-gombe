import { requireRole } from '@/lib/dal';
import PortalShell from '@/components/Portal/PortalShell';

export default async function StaffPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireRole('STAFF');

  return (
    <PortalShell
      role="STAFF"
      displayName={session.user.displayName}
      identifier={session.user.identifier}
      pageTitle="Teacher Portal"
    >
      {children}
    </PortalShell>
  );
}
