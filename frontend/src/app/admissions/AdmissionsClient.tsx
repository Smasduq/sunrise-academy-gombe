'use client';

import { useState } from 'react';
import styles from './admissions.module.css';
import { FAQS } from '@/lib/data';
import Link from 'next/link';
import { Icon } from '@/components/Icon/Icon';

const steps = [
  { num: '01', title: 'Download or Request Form', desc: 'Visit our school office or contact us via WhatsApp to receive the admission form.' },
  { num: '02', title: 'Complete the Form', desc: 'Fill in all required details accurately and attach all supporting documents.' },
  { num: '03', title: 'Submit & Pay Fee', desc: 'Submit the completed form to our admissions office along with the processing fee.' },
  { num: '04', title: 'Assessment (if required)', desc: 'Some levels require a brief entrance assessment. We will notify you of the date and time.' },
  { num: '05', title: 'Receive Admission Letter', desc: 'Successful applicants will receive an official admission letter within 5–7 working days.' },
  { num: '06', title: 'Welcome to Sunrise!', desc: 'Complete registration, purchase your school kit, and prepare for a transformative journey.' },
];

const requirements = [
  { level: 'Nursery 1', items: ['Birth Certificate', 'Immunisation Card', 'Recent Passport Photographs (×4)', "Parent/Guardian's ID"] },
  { level: 'Nursery 2', items: ['Birth Certificate', 'Immunisation Card', 'Nursery 1 Report Card', 'Recent Passport Photographs (×4)', "Parent/Guardian's ID"] },
  { level: 'Primary', items: ['Birth Certificate', 'Nursery School Report (if applicable)', 'Immunisation Card', 'Recent Passport Photographs (×4)', "Parent/Guardian's ID"] },
];

export default function AdmissionsClient() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [form, setForm] = useState({
    studentName: '', dateOfBirth: '', gender: '', level: '',
    parentName: '', parentPhone: '', parentEmail: '', address: '',
    previousSchool: '', message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className={styles.page}>
      {/* Banner */}
      <section className={styles.pageBanner}>
        <div className={styles.bannerOverlay} />
        <div className={`container ${styles.bannerContent}`}>
          <span className="section-badge" style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}>
            Admissions
          </span>
          <h1 className={styles.bannerTitle}>Join Sunrise Academy</h1>
          <p className={styles.bannerSub}>Your child's future starts here. Enrolment is now open for 2025/2026.</p>
        </div>
      </section>

      {/* Admission Process */}
      <section className={`section ${styles.processSection}`} aria-labelledby="process-heading">
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className="section-badge">How to Apply</span>
            <h2 id="process-heading" className="section-title">Simple 6-Step Admission Process</h2>
            <p className="section-subtitle" style={{ marginInline: 'auto', textAlign: 'center' }}>
              We make admissions straightforward and stress-free. Follow these steps to secure your child's place.
            </p>
          </div>
          <div className={styles.stepsGrid}>
            {steps.map((s) => (
              <div key={s.num} className={styles.stepCard}>
                <span className={styles.stepNum}>{s.num}</span>
                <h3 className={styles.stepTitle}>{s.title}</h3>
                <p className={styles.stepDesc}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section className={`section ${styles.reqSection}`} aria-labelledby="req-heading">
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className="section-badge">Requirements</span>
            <h2 id="req-heading" className="section-title">Admission Requirements</h2>
          </div>
          <div className={styles.reqGrid}>
            {requirements.map((r) => (
              <div key={r.level} className={styles.reqCard}>
                <h3 className={styles.reqLevel}>{r.level}</h3>
                <ul className={styles.reqList}>
                  {r.items.map((item) => (
                    <li key={item} className={styles.reqItem}>
                      <span className={styles.reqCheck}>
                        <Icon name="check" size={14} />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section className={`section ${styles.formSection}`} aria-labelledby="form-heading">
        <div className="container">
          <div className={styles.formGrid}>
            <div className={styles.formSidebar}>
              <span className="section-badge">Enquiry Form</span>
              <h2 id="form-heading" className="section-title">Apply or Enquire Online</h2>
              <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                Fill the form below to apply or make an enquiry. Our admissions team will contact you within 24 hours.
              </p>
              <div className={styles.contactQuick}>
                <a href="https://wa.me/2348030000000" target="_blank" rel="noopener noreferrer" className={styles.quickBtn} style={{ background: '#25D366', color: 'white' }}>
                  <Icon name="whatsapp" size={18} style={{ marginRight: '6px', verticalAlign: 'middle', display: 'inline-block' }} /> WhatsApp Us
                </a>
                <a href="tel:+2348030000000" className={styles.quickBtn} style={{ background: 'var(--color-primary)', color: 'white' }}>
                  <Icon name="phone" size={18} style={{ marginRight: '6px', verticalAlign: 'middle', display: 'inline-block' }} /> Call Admissions
                </a>
              </div>
            </div>

            <div className={styles.formWrap}>
              {submitted ? (
                <div className={styles.successMsg}>
                  <span className={styles.successIcon}>
                    <Icon name="check_circle" size={48} style={{ color: 'var(--color-primary)' }} />
                  </span>
                  <h3>Application Received!</h3>
                  <p>Thank you for your interest in Sunrise Academy. Our admissions team will contact you within 24 hours.</p>
                  <button onClick={() => setSubmitted(false)} className="btn btn-primary">Submit Another</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className={styles.form} noValidate>
                  <div className={styles.formRow}>
                    <div className={styles.field}>
                      <label htmlFor="studentName" className={styles.label}>Student Name *</label>
                      <input id="studentName" type="text" required className={styles.input} placeholder="Full name of student"
                        value={form.studentName} onChange={(e) => setForm({ ...form, studentName: e.target.value })} />
                    </div>
                    <div className={styles.field}>
                      <label htmlFor="dob" className={styles.label}>Date of Birth *</label>
                      <input id="dob" type="date" required className={styles.input}
                        value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} />
                    </div>
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.field}>
                      <label htmlFor="gender" className={styles.label}>Gender *</label>
                      <select id="gender" required className={styles.input}
                        value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                        <option value="">Select gender</option>
                        <option>Male</option>
                        <option>Female</option>
                      </select>
                    </div>
                    <div className={styles.field}>
                      <label htmlFor="level" className={styles.label}>Applying For *</label>
                      <select id="level" required className={styles.input}
                        value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}>
                        <option value="">Select level</option>
                        <option>Nursery 1</option>
                        <option>Nursery 2</option>
                        <option>Primary 1</option>
                        <option>Primary 2</option>
                        <option>Primary 3</option>
                        <option>Primary 4</option>
                        <option>Primary 5</option>
                        <option>Primary 6</option>
                      </select>
                    </div>
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.field}>
                      <label htmlFor="parentName" className={styles.label}>Parent/Guardian Name *</label>
                      <input id="parentName" type="text" required className={styles.input} placeholder="Full name"
                        value={form.parentName} onChange={(e) => setForm({ ...form, parentName: e.target.value })} />
                    </div>
                    <div className={styles.field}>
                      <label htmlFor="parentPhone" className={styles.label}>Phone Number *</label>
                      <input id="parentPhone" type="tel" required className={styles.input} placeholder="+234..."
                        value={form.parentPhone} onChange={(e) => setForm({ ...form, parentPhone: e.target.value })} />
                    </div>
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="parentEmail" className={styles.label}>Email Address</label>
                    <input id="parentEmail" type="email" className={styles.input} placeholder="your@email.com"
                      value={form.parentEmail} onChange={(e) => setForm({ ...form, parentEmail: e.target.value })} />
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="address" className={styles.label}>Home Address *</label>
                    <input id="address" type="text" required className={styles.input} placeholder="Your residential address"
                      value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="previousSchool" className={styles.label}>Previous School (if any)</label>
                    <input id="previousSchool" type="text" className={styles.input} placeholder="Name of previous school"
                      value={form.previousSchool} onChange={(e) => setForm({ ...form, previousSchool: e.target.value })} />
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="message" className={styles.label}>Additional Information</label>
                    <textarea id="message" rows={3} className={styles.textarea} placeholder="Any special needs or questions..."
                      value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
                  </div>
                  <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }}>
                    Submit Application →
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className={`section ${styles.faqSection}`} aria-labelledby="faq-heading">
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className="section-badge">FAQs</span>
            <h2 id="faq-heading" className="section-title">Frequently Asked Questions</h2>
          </div>
          <div className={styles.faqList}>
            {FAQS.map((faq) => (
              <div key={faq.id} className={`${styles.faqItem} ${openFaq === faq.id ? styles.faqOpen : ''}`}>
                <button
                  className={styles.faqQuestion}
                  onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                  aria-expanded={openFaq === faq.id}
                >
                  <span>{faq.question}</span>
                  <span className={styles.faqIcon}>{openFaq === faq.id ? '−' : '+'}</span>
                </button>
                {openFaq === faq.id && (
                  <div className={styles.faqAnswer}>
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
