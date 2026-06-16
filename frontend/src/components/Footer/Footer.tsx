import Link from 'next/link';
import Image from 'next/image';
import styles from './Footer.module.css';
import {
  SCHOOL_NAME, SCHOOL_ADDRESS, SCHOOL_EMAIL,
  SCHOOL_PHONE_1, SCHOOL_PHONE_2, SCHOOL_TAGLINE,
  SCHOOL_FACEBOOK, SCHOOL_TWITTER, SCHOOL_INSTAGRAM,
} from '@/lib/constants';
import { Icon } from '@/components/Icon/Icon';

const quickLinks = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '/about' },
  { label: 'Academics', href: '/academics' },
  { label: 'Admissions', href: '/admissions' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'News & Events', href: '/news' },
];

const programLinks = [
  { label: 'Nursery School', href: '/academics#nursery' },
  { label: 'Primary School', href: '/academics#primary' },
  { label: 'Our Staff', href: '/staff' },
  { label: 'Contact Us', href: '/contact' },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer} role="contentinfo">
      <div className="container">
        <div className={styles.topSection}>
          {/* Brand */}
          <div className={styles.brand}>
            <Link href="/" className={styles.footerLogo} aria-label="Sunrise Academy Gombe">
              <div className={styles.logoIcon}>
                <Image
                  src="/images/logo.jpeg"
                  alt="Sunrise Academy Gombe Logo"
                  width={40}
                  height={40}
                  style={{ borderRadius: '4px', objectFit: 'contain' }}
                />
              </div>
              <div className={styles.logoText}>
                <span className={styles.logoName}>Sunrise Academy</span>
                <span className={styles.logoSub}>Gombe State • Est. 2009</span>
              </div>
            </Link>
            <p className={styles.tagline}>
              {SCHOOL_TAGLINE}. A premier nursery and primary school dedicated to academic excellence and holistic development.
            </p>
            <div className={styles.socials} aria-label="Social media links">
              <a href={SCHOOL_FACEBOOK} target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="Facebook">
                <Icon name="facebook" size={16} />
              </a>
              <a href={SCHOOL_TWITTER} target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="Twitter/X">
                <Icon name="twitter" size={16} />
              </a>
              <a href={SCHOOL_INSTAGRAM} target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="Instagram">
                <Icon name="instagram" size={16} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className={styles.column}>
            <h3 className={styles.columnTitle}>Quick Links</h3>
            <ul className={styles.linkList}>
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={styles.footerLink}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Programs */}
          <div className={styles.column}>
            <h3 className={styles.columnTitle}>Programmes</h3>
            <ul className={styles.linkList}>
              {programLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={styles.footerLink}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className={styles.column}>
            <h3 className={styles.columnTitle}>Contact Us</h3>
            <div className={styles.contactItem} style={{ alignItems: 'flex-start' }}>
              <span className={styles.contactIcon} style={{ display: 'inline-flex', marginTop: '4px' }}>
                <Icon name="location" size={16} />
              </span>
              <span className={styles.contactText}>{SCHOOL_ADDRESS}</span>
            </div>
            <div className={styles.contactItem}>
              <span className={styles.contactIcon} style={{ display: 'inline-flex' }}>
                <Icon name="phone" size={16} />
              </span>
              <span className={styles.contactText}>
                <a href={`tel:${SCHOOL_PHONE_1}`}>{SCHOOL_PHONE_1}</a><br />
                <a href={`tel:${SCHOOL_PHONE_2}`}>{SCHOOL_PHONE_2}</a>
              </span>
            </div>
            <div className={styles.contactItem}>
              <span className={styles.contactIcon} style={{ display: 'inline-flex' }}>
                <Icon name="email" size={16} />
              </span>
              <span className={styles.contactText}>
                <a href={`mailto:${SCHOOL_EMAIL}`}>{SCHOOL_EMAIL}</a>
              </span>
            </div>
          </div>
        </div>


        {/* Bottom Bar */}
        <div className={styles.bottomSection}>
          <p className={styles.copyright}>
            &copy; {year} <strong>{SCHOOL_NAME}</strong>. All rights reserved.
          </p>
          <nav className={styles.bottomLinks} aria-label="Footer legal links">
            <Link href="/privacy" className={styles.bottomLink}>Privacy Policy</Link>
            <Link href="/terms" className={styles.bottomLink}>Terms of Use</Link>
            <Link href="/sitemap" className={styles.bottomLink}>Sitemap</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
