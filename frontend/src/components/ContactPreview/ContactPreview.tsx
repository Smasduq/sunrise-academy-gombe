import Link from 'next/link';
import styles from './ContactPreview.module.css';
import {
  SCHOOL_ADDRESS, SCHOOL_PHONE_1, SCHOOL_PHONE_2,
  SCHOOL_EMAIL, SCHOOL_WHATSAPP,
} from '@/lib/constants';
import { Icon } from '@/components/Icon/Icon';

const contactItems = [
  { icon: 'location', label: 'Address', value: SCHOOL_ADDRESS, href: null },
  { icon: 'phone', label: 'Phone', value: `${SCHOOL_PHONE_1} / ${SCHOOL_PHONE_2}`, href: `tel:${SCHOOL_PHONE_1}` },
  { icon: 'email', label: 'Email', value: SCHOOL_EMAIL, href: `mailto:${SCHOOL_EMAIL}` },
  { icon: 'clock', label: 'School Hours', value: 'Mon – Fri: 7:30 AM – 3:30 PM', href: null },
];

export default function ContactPreview() {
  const waMessage = encodeURIComponent('Hello Sunrise Academy! I would like more information.');
  return (
    <section className={`section ${styles.section}`} aria-labelledby="contact-preview-heading">
      <div className="container">
        <div className={styles.inner}>
          {/* Map placeholder */}
          <div className={styles.mapWrap} aria-label="School location map">
            <div className={styles.mapPlaceholder}>
              <span className={styles.mapIcon}>
                <Icon name="location" size={48} style={{ color: 'var(--color-primary-light)' }} />
              </span>
              <p className={styles.mapText}>
                Behind Alfijir Plaza, Along Kurba Road, Akko LGA, Gombe State
              </p>
              <a
                href="https://maps.google.com/?q=Akko+LGA+Gombe+State+Nigeria"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.mapLink}
              >
                Open in Google Maps →
              </a>
            </div>
          </div>

          {/* Contact info */}
          <div className={styles.contactInfo}>
            <span className="section-badge">Get In Touch</span>
            <h2 id="contact-preview-heading" className="section-title">
              We'd Love to Hear From You
            </h2>
            <div className={styles.contactItems}>
              {contactItems.map((item) => (
                <div key={item.label} className={styles.item}>
                  <div className={styles.iconWrap} aria-hidden="true">
                    <Icon name={item.icon} size={24} />
                  </div>
                  <div className={styles.itemContent}>
                    <p className={styles.itemLabel}>{item.label}</p>
                    {item.href ? (
                      <p className={styles.itemValue}>
                        <a href={item.href}>{item.value}</a>
                      </p>
                    ) : (
                      <p className={styles.itemValue}>{item.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.ctaRow}>
              <a
                href={`https://wa.me/${SCHOOL_WHATSAPP}?text=${waMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`btn btn-lg ${styles.waBtn}`}
              >
                💬 WhatsApp Us
              </a>
              <Link href="/contact" className="btn btn-outline btn-lg">
                Send a Message
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
