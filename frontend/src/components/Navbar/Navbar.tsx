'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import styles from './Navbar.module.css';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { NAV_LINKS } from '@/lib/data';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const pathname = usePathname();

  const isHome = pathname === '/';

  useEffect(() => {
    const stored = localStorage.getItem('theme');
    if (stored === 'dark') {
      setDarkMode(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 20);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const toggleDark = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  const navClass = [
    styles.navbar,
    scrolled || !isHome ? styles.scrolled : styles.transparent,
  ].join(' ');

  return (
    <>
      <header className={navClass} role="banner">
        <div className={`container ${styles.inner}`}>
          {/* Logo */}
          <Link href="/" className={styles.logo} aria-label="Sunrise Academy Gombe – Home">
            <div className={styles.logoIcon}>
              <Image
                src="/images/logo.jpeg"
                alt="Sunrise Academy Gombe Logo"
                width={44}
                height={44}
                className={styles.logoImg}
                style={{ borderRadius: '4px', objectFit: 'contain' }}
              />
            </div>
            <div className={styles.logoText}>
              <span className={styles.logoName}>Sunrise Academy</span>
              <span className={styles.logoSub}>Gombe State • Est. 2009</span>
            </div>
          </Link>


          {/* Desktop navigation */}
          <nav className={styles.desktopNav} aria-label="Main navigation">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`${styles.navLink} ${pathname === link.href ? styles.active : ''}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.themeToggle}
              onClick={toggleDark}
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              title={darkMode ? 'Light mode' : 'Dark mode'}
            >
              {darkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
            </button>

            <Link href="/admissions" className={`btn btn-primary ${styles.applyBtn}`}>
              <span className={styles.applyLabelFull}>Apply Now</span>
              <span className={styles.applyLabelShort}>Apply</span>
            </Link>

            <Link href="/login" className={`btn btn-outline ${styles.portalBtn}`}>
              <span className={styles.portalLabelFull}>Portal Login</span>
              <span className={styles.portalLabelShort}>Portal</span>
            </Link>

            <button
              type="button"
              className={styles.hamburger}
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              aria-controls="mobile-drawer"
            >
              <span className={`${styles.bar} ${menuOpen ? styles.open : ''}`} />
              <span className={`${styles.bar} ${menuOpen ? styles.open : ''}`} />
              <span className={`${styles.bar} ${menuOpen ? styles.open : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Overlay */}
      <div
        className={`${styles.overlay} ${menuOpen ? styles.visible : ''}`}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile Drawer */}
      <nav
        id="mobile-drawer"
        className={`${styles.mobileDrawer} ${menuOpen ? styles.open : ''}`}
        aria-label="Mobile navigation"
        aria-hidden={!menuOpen}
      >
        <ul className={styles.mobileNavLinks}>
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`${styles.mobileNavLink} ${pathname === link.href ? styles.active : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className={styles.mobileCta}>
          <Link
            href="/admissions"
            className={`btn btn-primary btn-lg ${styles.mobileApplyBtn}`}
            onClick={() => setMenuOpen(false)}
          >
            Apply Now →
          </Link>
          <Link
            href="/login"
            className={`btn btn-outline btn-lg ${styles.mobilePortalBtn}`}
            onClick={() => setMenuOpen(false)}
          >
            Portal Login
          </Link>
        </div>
      </nav>
    </>
  );
}
