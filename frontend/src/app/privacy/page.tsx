import type { Metadata } from 'next';
import styles from './privacy.module.css';
import { SCHOOL_NAME, SCHOOL_EMAIL } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: `Privacy Policy and data protection terms for ${SCHOOL_NAME}.`,
};

export default function PrivacyPage() {
  const updatedDate = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className={styles.page}>
      <section className={styles.pageBanner}>
        <div className={styles.bannerOverlay} />
        <div className={`container ${styles.bannerContent}`}>
          <h1 className={styles.bannerTitle}>Privacy Policy</h1>
          <p className={styles.bannerSub}>Last updated: {updatedDate}</p>
        </div>
      </section>

      <section className="section">
        <div className={`container ${styles.content}`}>
          <p>
            At <strong>{SCHOOL_NAME}</strong>, we are committed to protecting the privacy and security of our students, parents, staff, and visitors. This Privacy Policy describes how we collect, use, and safeguard personal information when you visit our campus or use our website.
          </p>

          <h2>1. Information We Collect</h2>
          <p>
            We collect personal information that you voluntarily provide to us when expressing an interest in obtaining information about us, applying for admissions, or contacting us. This information may include:
          </p>
          <ul>
            <li>Personal details (e.g., Student Name, Date of Birth, Gender, Parent/Guardian Name)</li>
            <li>Contact information (e.g., Phone Number, Email Address, Residential Address)</li>
            <li>Academic history (e.g., Previous School, Report Cards, Certificates)</li>
          </ul>

          <h2>2. How We Use Your Information</h2>
          <p>
            We use the information we collect solely for educational and administrative purposes, including:
          </p>
          <ul>
            <li>Processing admissions and student registrations</li>
            <li>Providing academic updates and communications</li>
            <li>Responding to enquiries and customer support messages</li>
            <li>Improving school operations, programs, and facilities</li>
          </ul>

          <h2>3. Information Sharing and Disclosure</h2>
          <p>
            We respect your privacy. <strong>We do not sell, rent, or trade your personal information to third parties.</strong> We may share information only with authorized educational boards (e.g., Gombe State Ministry of Education, WAEC, NECO) as required by law or to provide academic certifications.
          </p>

          <h2>4. Data Security</h2>
          <p>
            We implement appropriate technical and organizational security measures to protect the safety of your personal information. However, please remember that no transmission over the internet or database storage is 100% secure.
          </p>

          <h2>5. Your Choices & Rights</h2>
          <p>
            You have the right to request access to the personal records we hold about you or request corrections to inaccurate information. If you wish to update your contact details, please reach out to the school administration office.
          </p>

          <h2>6. Contact Us</h2>
          <p>
            If you have questions or concerns about this policy, please contact us at:
          </p>
          <p className={styles.contactBlock}>
            <strong>{SCHOOL_NAME} Office</strong><br />
            Email: <a href={`mailto:${SCHOOL_EMAIL}`}>{SCHOOL_EMAIL}</a>
          </p>
        </div>
      </section>
    </div>
  );
}
