import type { Metadata } from 'next';
import Image from 'next/image';
import styles from './staff.module.css';
import { STAFF_MEMBERS } from '@/lib/data';
import { fetchPublicTeachers } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Our Staff',
  description: 'Meet the dedicated teachers and administrative staff who make Sunrise Academy Gombe one of the best schools in Gombe State.',
};

const TEACHER_IMAGES = [
  '/images/staff-3.svg',
  '/images/staff-4.svg',
  '/images/staff-5.svg',
  '/images/staff-6.svg',
  '/images/staff-7.svg',
  '/images/staff-8.svg',
];

const headmaster = STAFF_MEMBERS.find((s) => s.isHeadmaster);

function teacherImage(index: number) {
  return TEACHER_IMAGES[index % TEACHER_IMAGES.length];
}

function classLabel(classNames: string[]) {
  if (classNames.length === 0) return null;
  return classNames.length === 1
    ? `Class: ${classNames[0]}`
    : `Classes: ${classNames.join(', ')}`;
}

export default async function StaffPage() {
  let teachers: Awaited<ReturnType<typeof fetchPublicTeachers>> = [];

  try {
    teachers = await fetchPublicTeachers();
  } catch {
    teachers = [];
  }

  return (
    <div className={styles.page}>
      {/* Banner */}
      <section className={styles.pageBanner}>
        <div className={styles.bannerOverlay} />
        <div className={`container ${styles.bannerContent}`}>
          <span className="section-badge" style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}>
            Our Team
          </span>
          <h1 className={styles.bannerTitle}>Meet Our Staff</h1>
          <p className={styles.bannerSub}>Dedicated professionals committed to your child's success</p>
        </div>
      </section>

      {/* Headmaster Profile */}
      {headmaster && (
        <section className={`section ${styles.principalSection}`} aria-labelledby="principal-staff-heading">
          <div className="container">
            <div className={styles.sectionHeader}>
              <span className="section-badge">School Leadership</span>
              <h2 id="principal-staff-heading" className="section-title">Our Headmaster</h2>
            </div>
            <div className={styles.principalCard}>
              <div className={styles.principalImgWrap}>
                <Image
                  src={headmaster.image}
                  alt={headmaster.name}
                  fill
                  className={styles.principalImg}
                  sizes="(max-width: 768px) 100vw, 380px"
                />
              </div>
              <div className={styles.principalInfo}>
                <span className={styles.principalRole}>{headmaster.role}</span>
                <h3 className={styles.principalName}>{headmaster.name}</h3>
                <p className={styles.principalQual}>{headmaster.qualification}</p>
                {headmaster.bio && (
                  <p className={styles.principalBio}>{headmaster.bio}</p>
                )}
                <div className={styles.principalStats}>
                  <div className={styles.pStat}>
                    <span className={styles.pStatValue}>20+</span>
                    <span className={styles.pStatLabel}>Years Experience</span>
                  </div>
                  <div className={styles.pStat}>
                    <span className={styles.pStatValue}>1,200+</span>
                    <span className={styles.pStatLabel}>Students Mentored</span>
                  </div>
                  <div className={styles.pStat}>
                    <span className={styles.pStatValue}>15+</span>
                    <span className={styles.pStatLabel}>Awards Won</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Teachers Grid */}
      <section className={`section ${styles.teachersSection}`} aria-labelledby="teachers-heading">
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className="section-badge">Teaching Staff</span>
            <h2 id="teachers-heading" className="section-title">Our Dedicated Teachers</h2>
            <p className="section-subtitle" style={{ marginInline: 'auto', textAlign: 'center' }}>
              Our team of qualified, passionate educators brings expertise and dedication to every classroom, every day.
            </p>
          </div>

          {teachers.length === 0 ? (
            <p className={styles.emptyTeachers}>
              Teaching staff profiles will appear here once they are added by the school administration.
            </p>
          ) : (
            <div className={styles.teachersGrid}>
              {teachers.map((member, index) => {
                const name = `${member.first_name} ${member.last_name}`;
                const subtitle = classLabel(member.class_names) ?? member.department ?? '';

                return (
                  <div key={member.id} className={styles.teacherCard}>
                    <div className={styles.teacherImgWrap}>
                      <Image
                        src={teacherImage(index)}
                        alt={name}
                        fill
                        className={styles.teacherImg}
                        sizes="(max-width: 640px) 50vw, 25vw"
                      />
                      {member.department && (
                        <div className={styles.teacherOverlay}>
                          <span className={styles.teacherDept}>{member.department}</span>
                        </div>
                      )}
                    </div>
                    <div className={styles.teacherBody}>
                      <h3 className={styles.teacherName}>{name}</h3>
                      <span className={styles.teacherRole}>{member.position ?? 'Teacher'}</span>
                      {subtitle && <span className={styles.teacherQual}>{subtitle}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Join Team CTA */}
      <section className={`section ${styles.joinSection}`}>
        <div className="container" style={{ textAlign: 'center' }}>
          <span className="section-badge">Join Our Team</span>
          <h2 className="section-title" style={{ marginInline: 'auto', maxWidth: 520 }}>
            Are You a Passionate Educator?
          </h2>
          <p className="section-subtitle" style={{ marginInline: 'auto', marginBottom: '2rem' }}>
            We are always looking for dedicated, qualified teachers who share our commitment to excellence. Send your CV to us today.
          </p>
          <a
            href="mailto:careers@sunriseacademygombe.edu.ng"
            className="btn btn-primary btn-lg"
          >
            Send Your CV →
          </a>
        </div>
      </section>
    </div>
  );
}
