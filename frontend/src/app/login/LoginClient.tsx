'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import styles from './login.module.css';

type LoginRole = 'student' | 'staff';

interface Props {
  serviceAvailable: boolean;
}

const ROLE_CONFIG = {
  student: {
    label: 'Student / Parent',
    idLabel: 'Admission Number',
    idName: 'admissionNumber',
    idPlaceholder: 'Enter your admission number',
    provider: 'student',
    dashboard: '/student/dashboard',
  },
  staff: {
    label: 'Teacher',
    idLabel: 'Teacher ID',
    idName: 'staffId',
    idPlaceholder: 'Enter your teacher ID',
    provider: 'staff',
    dashboard: '/staff/dashboard',
  },
};

const SERVICE_UNAVAILABLE_MESSAGE =
  'Portal sign-in is temporarily unavailable. Please try again shortly or contact the school office.';

export default function LoginClient({ serviceAvailable }: Props) {
  const router = useRouter();
  const [role, setRole] = useState<LoginRole>('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const config = ROLE_CONFIG[role];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');

    if (!serviceAvailable) {
      setError(SERVICE_UNAVAILABLE_MESSAGE);
      return;
    }

    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const password = formData.get('password') as string;
    const identifier = formData.get(config.idName) as string;

    const credentials: Record<string, string> = { password };
    credentials[config.idName] = identifier;

    const result = await signIn(config.provider, {
      redirect: false,
      ...credentials,
    });

    setLoading(false);

    if (result?.error) {
      setError('Invalid admission number, teacher ID, or password. Please try again.');
      return;
    }

    router.push(config.dashboard);
    router.refresh();
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <Image
            src="/images/logo.jpeg"
            alt="Sunrise Academy Gombe"
            width={64}
            height={64}
            className={styles.logo}
          />
          <h1 className={styles.title}>School Portal</h1>
          <p className={styles.subtitle}>
            Sign in with the details provided by the school.
          </p>
        </div>

        <div className={styles.tabs} role="tablist">
          {(Object.keys(ROLE_CONFIG) as LoginRole[]).map((r) => (
            <button
              key={r}
              type="button"
              role="tab"
              className={`${styles.tab} ${role === r ? styles.active : ''}`}
              onClick={() => { setRole(r); setError(''); }}
              aria-selected={role === r}
            >
              {ROLE_CONFIG[r].label}
            </button>
          ))}
        </div>

        {!serviceAvailable && (
          <div className={styles.error} role="alert">
            {SERVICE_UNAVAILABLE_MESSAGE}
          </div>
        )}

        {error && <div className={styles.error} role="alert">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="identifier" className={styles.label}>
              {config.idLabel}
            </label>
            <input
              id="identifier"
              name={config.idName}
              type="text"
              className={styles.input}
              placeholder={config.idPlaceholder}
              required
              autoComplete="username"
              disabled={!serviceAvailable}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className={styles.input}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
              disabled={!serviceAvailable}
            />
          </div>

          <button
            type="submit"
            className={`btn btn-primary btn-lg ${styles.submitBtn}`}
            disabled={loading || !serviceAvailable}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className={styles.footer}>
          <Link href="/">← Back to website</Link>
        </p>
      </div>
    </div>
  );
}
