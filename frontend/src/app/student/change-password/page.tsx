import type { Metadata } from 'next';
import ChangePasswordForm from '@/components/Portal/ChangePasswordForm';

export const metadata: Metadata = { title: 'Change Password' };

export default function StudentChangePasswordPage() {
  return <ChangePasswordForm />;
}
