import type { Metadata } from 'next';
import styles from '../privacy/privacy.module.css'; // Reuse privacy styles to avoid duplicate styles
import { SCHOOL_NAME, SCHOOL_EMAIL } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Terms of Use',
  description: `Terms of Use and enrollment rules for ${SCHOOL_NAME}.`,
};

export default function TermsPage() {
  const updatedDate = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className={styles.page}>
      <section className={styles.pageBanner}>
        <div className={styles.bannerOverlay} />
        <div className={`container ${styles.bannerContent}`}>
          <h1 className={styles.bannerTitle}>Terms of Use</h1>
          <p className={styles.bannerSub}>Last updated: {updatedDate}</p>
        </div>
      </section>

      <section className="section">
        <div className={`container ${styles.content}`}>
          <p>
            Welcome to the official website of <strong>{SCHOOL_NAME}</strong>. By accessing this website or enrolling in our academic programs, you agree to comply with and be bound by the following terms and conditions.
          </p>

          <h2>1. Use of Website</h2>
          <p>
            All content on this website, including text, logos, icons, layout, and images, is the intellectual property of <strong>{SCHOOL_NAME}</strong>. You may view, download, and print pages for personal, non-commercial use only. You must not:
          </p>
          <ul>
            <li>Republish material from this website without written consent.</li>
            <li>Use this website in any way that causes, or may cause, damage or impairment of accessibility.</li>
            <li>Use the website for any fraudulent or harmful activity.</li>
          </ul>

          <h2>2. Academic & Admissions Rules</h2>
          <p>
            Any submission of admission requests or enlisting of contact info on this site is subject to review.
          </p>
          <ul>
            <li>Admissions are granted based on the school's requirements and entrance evaluations.</li>
            <li>Falsification of documents or age in the application process is grounds for immediate rejection or termination of enrolment.</li>
            <li>School fees must be settled according to the schedules announced by the administration office.</li>
          </ul>

          <h2>3. Disclaimers</h2>
          <p>
            This website is provided "as is" without any representations or warranties. While we strive to ensure that all information on this website is correct and up to date, we do not warrant its absolute completeness or accuracy.
          </p>

          <h2>4. Modifications</h2>
          <p>
            {SCHOOL_NAME} reserves the right to edit these terms, academic fees, policies, and curriculum at any time. Changes relating to tuition or fees will be communicated formally to parents/guardians.
          </p>

          <h2>5. Contact & Information</h2>
          <p>
            For any enquiries regarding these terms, please contact the administration office:
          </p>
          <p className={styles.contactBlock}>
            <strong>{SCHOOL_NAME} Administration Office</strong><br />
            Email: <a href={`mailto:${SCHOOL_EMAIL}`}>{SCHOOL_EMAIL}</a>
          </p>
        </div>
      </section>
    </div>
  );
}
