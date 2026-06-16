import type { Metadata } from 'next';
import Link from 'next/link';
import styles from '../privacy/privacy.module.css';
import { SCHOOL_NAME } from '@/lib/constants';
import { NAV_LINKS } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Sitemap',
  description: `HTML Sitemap for ${SCHOOL_NAME}. Find links to all pages.`,
};

export default function SitemapPage() {
  return (
    <div className={styles.page}>
      <section className={styles.pageBanner}>
        <div className={styles.bannerOverlay} />
        <div className={`container ${styles.bannerContent}`}>
          <h1 className={styles.bannerTitle}>Sitemap</h1>
          <p className={styles.bannerSub}>Find your way around our school website</p>
        </div>
      </section>

      <section className="section">
        <div className={`container ${styles.content}`}>
          <p>
            Use the links below to quickly navigate to the different sections of the <strong>{SCHOOL_NAME}</strong> website.
          </p>

          <h2>Core Pages</h2>
          <ul>
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <h2>Academic Levels</h2>
          <ul>
            <li>
              <Link href="/academics#nursery" style={{ color: 'var(--color-primary)' }}>
                Nursery School Programme
              </Link>
            </li>
            <li>
              <Link href="/academics#primary" style={{ color: 'var(--color-primary)' }}>
                Primary School Programme
              </Link>
            </li>
          </ul>

          <h2>Legal & Information</h2>
          <ul>
            <li>
              <Link href="/privacy" style={{ color: 'var(--color-primary)' }}>
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/terms" style={{ color: 'var(--color-primary)' }}>
                Terms of Use
              </Link>
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
