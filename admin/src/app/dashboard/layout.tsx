import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AdminShell } from '@/components/AdminShell';
import { Providers } from '@/components/Providers';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/login');
  }

  return (
    <Providers session={session}>
      <AdminShell displayName={session.user.displayName} email={session.user.identifier}>
        {children}
      </AdminShell>
    </Providers>
  );
}
