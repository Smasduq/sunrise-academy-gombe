import type { Metadata } from 'next';
import styles from './academics.module.css';
import { PROGRAMS } from '@/lib/data';
import Image from 'next/image';
import Link from 'next/link';
import { Icon } from '@/components/Icon/Icon';

export const metadata: Metadata = {
  title: 'Academics',
  description: 'Explore Sunrise Academy Gombe\'s academic programmes — Nursery and Primary — built on a rigorous, student-centred curriculum.',
};

const curriculum = [
  { icon: 'book', title: 'National Curriculum', desc: 'We follow the Federal Government of Nigeria approved curriculum, ensuring all students are prepared with the knowledge, skills and values they need to succeed.' },
  { icon: 'innovation', title: 'Technology Integration', desc: 'ICT is woven into every subject area. Students develop digital literacy from nursery through primary school.' },
  { icon: 'science_fair', title: 'STEM Focus', desc: 'Science, Technology, Engineering and Mathematics receive special emphasis through well-equipped laboratories and project-based learning.' },
  { icon: 'inclusivity', title: 'Holistic Education', desc: 'Beyond academics, students engage in arts, sports, civic education, and character development programmes.' },
];

const approach = [
  { title: 'Student-Centred Learning', desc: 'Every lesson is designed with the student at the centre, encouraging active participation, curiosity, and independent thinking.', icon: 'secondary' },
  { title: 'Formative Assessment', desc: 'Regular assessments, quizzes, and projects track progress and allow teachers to provide timely, targeted support.', icon: 'waec' },
  { title: 'Small Class Sizes', desc: 'We maintain optimal class sizes to ensure every student receives personal attention from their teacher.', icon: 'teachers' },
  { title: 'Parental Involvement', desc: 'We actively engage parents as partners in learning through regular meetings, reports, and communication.', icon: 'integrity' },
];

export default function AcademicsPage() {
  return (
    <div className={styles.page}>
      {/* Banner */}
      <section className={styles.pageBanner}>
        <div className={styles.bannerOverlay} />
        <div className={`container ${styles.bannerContent}`}>
          <span className="section-badge" style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}>
            Academics
          </span>
          <h1 className={styles.bannerTitle}>Our Academic Programmes</h1>
          <p className={styles.bannerSub}>Excellence, rigour, and joy of learning at every stage</p>
        </div>
      </section>

      {/* Programmes */}
      <section className={`section ${styles.programsSection}`} aria-labelledby="programmes-heading">
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className="section-badge">Programmes</span>
            <h2 id="programmes-heading" className="section-title">Two Stages of Excellence</h2>
            <p className="section-subtitle" style={{ marginInline: 'auto', textAlign: 'center' }}>
              Each stage of our school is tailored to the developmental needs, learning styles, and aspirations of our students.
            </p>
          </div>

          <div className={styles.programList}>
            {PROGRAMS.map((prog, i) => (
              <div key={prog.id} id={prog.level} className={`${styles.programRow} ${i % 2 !== 0 ? styles.reverse : ''}`}>
                <div className={styles.progImage}>
                  <Image
                    src={prog.level === 'nursery' ? '/images/student.jpeg' : `/images/program-${prog.level}.svg`}
                    alt={prog.title}
                    fill
                    className={styles.img}
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                  <div className={styles.progBadge}>
                    <Icon name={prog.icon} size={18} style={{ marginRight: '6px', verticalAlign: 'middle', display: 'inline-block' }} />
                    {prog.title}
                  </div>
                </div>
                <div className={styles.progContent}>
                  <span className={styles.progAges}>{prog.ages}</span>
                  <h3 className={styles.progTitle}>{prog.title}</h3>
                  <p className={styles.progDesc}>{prog.description}</p>
                  <div className={styles.subjectGrid} aria-label="Subjects offered">
                    {prog.subjects.map((s) => (
                      <span key={s} className={styles.subject}>{s}</span>
                    ))}
                  </div>
                  <Link href="/admissions" className="btn btn-primary">
                    Enrol Now →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Curriculum */}
      <section className={`section ${styles.curriculumSection}`} aria-labelledby="curriculum-heading">
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className="section-badge">Curriculum</span>
            <h2 id="curriculum-heading" className="section-title">A World-Class Curriculum</h2>
          </div>
          <div className={styles.curriculumGrid}>
            {curriculum.map((c) => (
              <div key={c.title} className={styles.currCard}>
                <span className={styles.currIcon}>
                  <Icon name={c.icon} size={28} />
                </span>
                <h3 className={styles.currTitle}>{c.title}</h3>
                <p className={styles.currDesc}>{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Learning Approach */}
      <section className={`section ${styles.approachSection}`} aria-labelledby="approach-heading">
        <div className="container">
          <div className={styles.approachInner}>
            <div className={styles.approachText}>
              <span className="section-badge">Learning Approach</span>
              <h2 id="approach-heading" className="section-title">How We Teach</h2>
              <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.7, marginBottom: '2rem' }}>
                Our teaching philosophy is rooted in the belief that every child is unique. We combine proven pedagogical methods with modern educational research to deliver lessons that engage, challenge, and inspire.
              </p>
              <div className={styles.approachList}>
                {approach.map((a) => (
                  <div key={a.title} className={styles.approachItem}>
                    <span className={styles.approachIcon}>
                      <Icon name={a.icon} size={24} />
                    </span>
                    <div>
                      <h4 className={styles.approachTitle}>{a.title}</h4>
                      <p className={styles.approachDesc}>{a.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className={styles.approachImageWrap}>
              <Image
                src="/images/school-photo.jpeg"
                alt="Students in a classroom at Sunrise Academy Gombe"
                fill
                className={styles.img}
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Academic Excellence CTA */}
      <section className={`section ${styles.excellenceCta}`}>
        <div className="container" style={{ textAlign: 'center' }}>
          <span className="section-badge">Academic Excellence</span>
          <h2 className="section-title" style={{ marginInline: 'auto', maxWidth: 600 }}>
            Ready to Give Your Child the Best Start?
          </h2>
          <p className="section-subtitle" style={{ marginInline: 'auto', marginBottom: '2rem' }}>
            Join hundreds of families who trust Sunrise Academy to educate and inspire their children.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/admissions" className="btn btn-primary btn-lg">Apply for Admission →</Link>
            <Link href="/contact" className="btn btn-outline btn-lg">Ask a Question</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
