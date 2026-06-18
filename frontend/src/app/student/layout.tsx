import { requireRole } from '@/lib/dal';
import PortalShell from '@/components/Portal/PortalShell';

export default async function StudentPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireRole('STUDENT');

  return (
    <PortalShell
      role="STUDENT"
      displayName={session.user.displayName}
      identifier={session.user.identifier}
      pageTitle="Student / Parent Portal"
    >
      {children}
    </PortalShell>
  );
}
