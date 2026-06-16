import Image from 'next/image';
import Link from 'next/link';
import styles from './ProgramsSection.module.css';
import { PROGRAMS } from '@/lib/data';
import { Icon } from '@/components/Icon/Icon';

const programImages: Record<string, string> = {
  nursery: '/images/student.jpeg',
  primary: '/images/program-primary.svg',
};

export default function ProgramsSection() {
  return (
    <section className={`section ${styles.section}`} aria-labelledby="programs-heading">
      <div className="container">
        <div className={styles.header}>
          <span className="section-badge">Academic Programmes</span>
          <h2 id="programs-heading" className="section-title">
            Quality Education at Every Stage
          </h2>
          <p className="section-subtitle" style={{ marginInline: 'auto', textAlign: 'center' }}>
            From nursery through primary, we provide structured, high-quality learning tailored to every developmental stage.
          </p>
        </div>
        <div className={styles.grid}>
          {PROGRAMS.map((program) => (
            <article key={program.id} className={styles.card}>
              <div className={styles.imageWrap}>
                <Image
                  src={programImages[program.level]}
                  alt={`${program.title} at Sunrise Academy`}
                  fill
                  className={styles.image}
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <span className={styles.level}>{program.level}</span>
              </div>
              <div className={styles.body}>
                <div className={styles.titleRow}>
                  <span className={styles.icon} aria-hidden="true">
                    <Icon name={program.icon} size={28} />
                  </span>
                  <div>
                    <h3 className={styles.cardTitle}>{program.title}</h3>
                    <span className={styles.ages}>{program.ages}</span>
                  </div>
                </div>

                <p className={styles.desc}>{program.description}</p>
                <div className={styles.subjects} aria-label="Subjects offered">
                  {program.subjects.map((s) => (
                    <span key={s} className={styles.subject}>{s}</span>
                  ))}
                </div>
                <Link
                  href={`/academics#${program.level}`}
                  className={styles.cardLink}
                  aria-label={`Learn more about ${program.title}`}
                >
                  Learn More →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
