import type { Metadata } from 'next';
import { checkBackendHealth } from '@/lib/api';
import LoginClient from './LoginClient';

export const metadata: Metadata = {
  title: 'Portal Login',
  description: 'Sign in to the Sunrise Academy Gombe school portal.',
};

export default async function LoginPage() {
  const serviceAvailable = await checkBackendHealth();

  return <LoginClient serviceAvailable={serviceAvailable} />;
}
