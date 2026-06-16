import type { Metadata } from 'next';
import styles from './about.module.css';
import { CORE_VALUES, ACHIEVEMENTS } from '@/lib/data';
import { SCHOOL_NAME } from '@/lib/constants';
import Image from 'next/image';
import { Icon } from '@/components/Icon/Icon';

export const metadata: Metadata = {
  title: 'About Us',
  description: `Learn about ${SCHOOL_NAME}'s history, mission, vision, core values, and the dedicated team driving academic excellence in Gombe State.`,
};

export default function AboutPage() {
  return (
    <div className={styles.page}>
      {/* Hero Banner */}
      <section className={styles.pageBanner} aria-label="About page banner">
        <div className={styles.bannerOverlay} />
        <div className={`container ${styles.bannerContent}`}>
          <span className="section-badge" style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}>
            About Us
          </span>
          <h1 className={styles.bannerTitle}>Our Story &amp; Mission</h1>
          <p className={styles.bannerSub}>
            A legacy of educational excellence in the heart of Gombe State
          </p>
        </div>
      </section>

      {/* History & Mission */}
      <section className={`section ${styles.historySection}`} aria-labelledby="history-heading">
        <div className="container">
          <div className={styles.historyGrid}>
            <div className={styles.historyImage}>
              <div className={styles.imageFrame}>
                <Image src="/images/school-photo.jpeg" alt="Sunrise Academy Gombe School Building" fill className={styles.img} sizes="(max-width: 1024px) 100vw, 50vw" priority />
              </div>
              <div className={styles.experienceBadge}>
                <span className={styles.expNum}>15+</span>
                <span className={styles.expText}>Years of Excellence</span>
              </div>
            </div>
            <div className={styles.historyText}>
              <span className="section-badge">Our History</span>
              <h2 id="history-heading" className="section-title">A School Built on Purpose</h2>
              <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.8, marginBottom: '1rem' }}>
                Sunrise Academy Gombe was founded in 2009 with a clear and powerful vision: to provide world-class education to children in Akko LGA and the broader Gombe State community. What began as a small nursery school has grown into one of the region's most respected educational institutions, now offering nursery and primary education of the highest standard.
              </p>
              <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.8, marginBottom: '1.5rem' }}>
                Over the past 15 years, we have impacted thousands of young lives, producing graduates who now excel in universities, vocations, and leadership roles across Nigeria and beyond. Our commitment to excellence, integrity, and holistic development remains unwavering.
              </p>
              <div className={styles.mvGrid}>
                <div className={styles.mvCard}>
                  <span className={styles.mvIcon}>
                    <Icon name="secondary" size={24} />
                  </span>
                  <div>
                    <h3 className={styles.mvTitle}>Our Mission</h3>
                    <p className={styles.mvText}>To provide a stimulating, inclusive, and excellence-driven educational environment that equips students with academic knowledge, moral values, and life skills.</p>
                  </div>
                </div>
                <div className={styles.mvCard}>
                  <span className={styles.mvIcon}>
                    <Icon name="inclusivity" size={24} />
                  </span>
                  <div>
                    <h3 className={styles.mvTitle}>Our Vision</h3>
                    <p className={styles.mvText}>To be the leading school in Gombe State, producing confident, creative, and globally competitive graduates who are proud ambassadors of their community.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className={`section ${styles.valuesSection}`} aria-labelledby="values-heading">
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className="section-badge">Core Values</span>
            <h2 id="values-heading" className="section-title">What We Stand For</h2>
            <p className="section-subtitle" style={{ marginInline: 'auto', textAlign: 'center' }}>
              Our six core values are not just words — they shape every decision, relationship, and experience at Sunrise Academy.
            </p>
          </div>
          <div className={styles.valuesGrid}>
            {CORE_VALUES.map((val) => (
              <div key={val.id} className={styles.valueCard}>
                <span className={styles.valueIcon}>
                  <Icon name={val.icon} size={28} />
                </span>
                <h3 className={styles.valueTitle}>{val.title}</h3>
                <p className={styles.valueDesc}>{val.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Principal's Message */}
      <section className={`section ${styles.principalSection}`} aria-labelledby="principal-heading">
        <div className="container">
          <div className={styles.principalGrid}>
            <div className={styles.principalImage}>
              <Image src="/images/staff-principal.svg" alt="Dr. Aisha Mohammed – Principal, Sunrise Academy Gombe" fill className={styles.img} sizes="(max-width: 768px) 100vw, 40vw" />
            </div>
            <div className={styles.principalText}>
              <span className="section-badge">Headmaster's Message</span>
              <h2 id="principal-heading" className="section-title">A Word from Our Headmaster</h2>
              <blockquote className={styles.quote}>
                "At Sunrise Academy, we believe that every child carries within them an extraordinary potential waiting to be unlocked. Our role as educators is not merely to fill young minds with information, but to ignite a lifelong passion for learning, equip them with critical thinking skills, and build the character that will sustain them through every challenge life presents.
                <br /><br />
                We are deeply proud of our community — our dedicated teachers, supportive parents, and above all, our brilliant students who inspire us every single day. Together, we are building a legacy of excellence that will long outlast our time."
              </blockquote>
              <div className={styles.principalInfo}>
                <strong className={styles.principalName}>Dr. Aisha Mohammed</strong>
                <span className={styles.principalRole}>Headmaster, Sunrise Academy Gombe</span>
                <span className={styles.principalQual}>PhD in Educational Administration, ABU Zaria</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className={`section ${styles.achievementsSection}`} aria-labelledby="achievements-heading">
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className="section-badge">Achievements</span>
            <h2 id="achievements-heading" className="section-title">Awards &amp; Recognition</h2>
            <p className="section-subtitle" style={{ marginInline: 'auto', textAlign: 'center' }}>
              Our commitment to excellence has been consistently recognised at local, state, and national levels.
            </p>
          </div>
          <div className={styles.achievementsGrid}>
            {ACHIEVEMENTS.map((a) => (
              <div key={a.id} className={styles.achievementCard}>
                <span className={styles.achIcon}>
                  <Icon name={a.icon} size={28} style={{ color: 'var(--color-secondary)' }} />
                </span>
                <span className={styles.achYear}>{a.year}</span>
                <h3 className={styles.achTitle}>{a.title}</h3>
                <p className={styles.achDesc}>{a.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
