import Link from 'next/link';
import styles from './WhyChooseUs.module.css';
import { Icon } from '@/components/Icon/Icon';

const reasons = [
  { icon: 'trophy', title: 'Academic Excellence', desc: 'Consistent 100% pass rates in WAEC and NECO. Our students regularly top state-level competitions.', href: '/academics' },
  { icon: 'teachers', title: 'Experienced Teachers', desc: 'Our team of qualified, passionate educators brings decades of combined teaching experience.', href: '/staff' },
  { icon: 'science', title: 'Modern Facilities', desc: 'Fully equipped science labs, a computer centre, a library, and stimulating classrooms.', href: '/about' },
  { icon: 'safety', title: 'Safe Environment', desc: 'A secure, monitored campus with strict safety protocols and a nurturing school culture.', href: '/about' },
  { icon: 'holistic', title: 'Holistic Development', desc: 'Sports, arts, debate, music, and cultural activities alongside rigorous academics.', href: '/academics' },
  { icon: 'integrity', title: 'Parent Partnership', desc: 'Regular parent-teacher engagement, transparent communication and real-time progress updates.', href: '/contact' },
];

export default function WhyChooseUs() {
  return (
    <section className={`section ${styles.section}`} aria-labelledby="why-heading">
      <div className="container">
        <div className={styles.header}>
          <span className="section-badge">Why Choose Us</span>
          <h2 id="why-heading" className="section-title">
            The Sunrise Academy Difference
          </h2>
          <p className="section-subtitle" style={{ marginInline: 'auto', textAlign: 'center' }}>
            We combine academic rigour with character building to raise well-rounded, confident, and capable young Nigerians.
          </p>
        </div>
        <div className={styles.grid}>
          {reasons.map((r) => (
            <article key={r.title} className={styles.card}>
              <div className={styles.iconWrap} aria-hidden="true">
                <Icon name={r.icon} size={28} />
              </div>
              <h3 className={styles.cardTitle}>{r.title}</h3>
              <p className={styles.cardDesc}>{r.desc}</p>
              <Link href={r.href} className={styles.cardLink}>
                Learn more <span aria-hidden="true">→</span>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

