'use client';

import { useState } from 'react';
import styles from './contact.module.css';
import {
  SCHOOL_NAME,
  SCHOOL_ADDRESS,
  SCHOOL_PHONE_1,
  SCHOOL_PHONE_2,
  SCHOOL_EMAIL,
  SCHOOL_WHATSAPP,
  SCHOOL_FACEBOOK,
  SCHOOL_TWITTER,
  SCHOOL_INSTAGRAM
} from '@/lib/constants';
import { Icon } from '@/components/Icon/Icon';

export default function ContactClient() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // Simulate API request
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      setForm({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
    }, 1200);
  };

  const waMessage = encodeURIComponent('Hello Sunrise Academy! I would like to make an enquiry.');

  const contactDetails = [
    {
      icon: 'location',
      title: 'Our Location',
      lines: [SCHOOL_ADDRESS],
      action: {
        text: 'Get Directions',
        href: 'https://maps.google.com/?q=Behind+Alfijir+Plaza,+Along+Kurba+Road,+Akko+LGA,+Gombe+State'
      }
    },
    {
      icon: 'phone',
      title: 'Phone Numbers',
      lines: [`Primary: ${SCHOOL_PHONE_1}`, `Secondary: ${SCHOOL_PHONE_2}`],
      action: {
        text: 'Call Us Now',
        href: `tel:${SCHOOL_PHONE_1}`
      }
    },
    {
      icon: 'email',
      title: 'Email Address',
      lines: [SCHOOL_EMAIL, 'admissions@sunriseacademygombe.edu.ng'],
      action: {
        text: 'Send Email',
        href: `mailto:${SCHOOL_EMAIL}`
      }
    },
    {
      icon: 'clock',
      title: 'School Hours',
      lines: ['Monday – Friday:', '7:30 AM – 3:30 PM', 'Closed on Weekends & Public Holidays'],
      action: null
    }
  ];

  return (
    <div className={styles.page}>
      {/* Banner */}
      <section className={styles.pageBanner}>
        <div className={styles.bannerOverlay} />
        <div className={`container ${styles.bannerContent}`}>
          <span className="section-badge" style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}>
            Contact Us
          </span>
          <h1 className={styles.bannerTitle}>Get In Touch</h1>
          <p className={styles.bannerSub}>Have questions? We're here to help and welcome you to our community.</p>
        </div>
      </section>

      {/* Main Contact Section */}
      <section className="section" aria-labelledby="contact-heading">
        <div className="container">
          <div className={styles.grid}>
            {/* Info Column */}
            <div className={styles.infoCol}>
              <div className={styles.intro}>
                <span className="section-badge">Reach Out</span>
                <h2 id="contact-heading" className="section-title">We are Here for You</h2>
                <p className="section-subtitle">
                  Whether you are a prospective parent seeking admission details, a community member, or an alumnus, feel free to reach out to us.
                </p>
              </div>

              <div className={styles.detailsGrid}>
                {contactDetails.map((detail, index) => (
                  <div key={index} className={styles.detailCard}>
                    <div className={styles.detailIcon}>
                      <Icon name={detail.icon} size={28} />
                    </div>
                    <div className={styles.detailText}>
                      <h3>{detail.title}</h3>
                      {detail.lines.map((line, lIdx) => (
                        <p key={lIdx}>{line}</p>
                      ))}
                      {detail.action && (
                        <a
                          href={detail.action.href}
                          target={detail.action.href.startsWith('http') ? '_blank' : undefined}
                          rel={detail.action.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                          className={styles.detailLink}
                        >
                          {detail.action.text} &rarr;
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Social Channels & WhatsApp */}
              <div className={styles.socialCard}>
                <h3>Direct Messaging & Socials</h3>
                <p>Connect with us on social media or reach out directly on WhatsApp for instant support.</p>
                <div className={styles.socialActions}>
                  <a
                    href={`https://wa.me/${SCHOOL_WHATSAPP}?text=${waMessage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.waButton}
                  >
                    <Icon name="whatsapp" size={18} style={{ marginRight: '6px', verticalAlign: 'middle', display: 'inline-block' }} /> Chat on WhatsApp
                  </a>
                  <div className={styles.socialIcons}>
                    <a href={SCHOOL_FACEBOOK} target="_blank" rel="noopener noreferrer" aria-label="Facebook" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon name="facebook" size={20} />
                    </a>
                    <a href={SCHOOL_TWITTER} target="_blank" rel="noopener noreferrer" aria-label="Twitter" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon name="twitter" size={20} />
                    </a>
                    <a href={SCHOOL_INSTAGRAM} target="_blank" rel="noopener noreferrer" aria-label="Instagram" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon name="instagram" size={20} />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Column */}
            <div className={styles.formCol}>
              <div className={styles.formWrap}>
                {submitted ? (
                  <div className={styles.successState}>
                    <span className={styles.successIcon}>
                      <Icon name="email" size={36} />
                    </span>
                    <h2>Message Sent!</h2>
                    <p>
                      Thank you for contacting Sunrise Academy. We have received your message and will respond to you as soon as possible.
                    </p>
                    <button onClick={() => setSubmitted(false)} className="btn btn-primary">
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className={styles.form} noValidate>
                    <h3 className={styles.formTitle}>Send Us a Message</h3>
                    <p className={styles.formSub}>Fill out the form below and we'll get back to you shortly.</p>

                    <div className={styles.field}>
                      <label htmlFor="name">Full Name *</label>
                      <input
                        id="name"
                        type="text"
                        required
                        placeholder="Your full name"
                        className={styles.input}
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                      />
                    </div>

                    <div className={styles.row}>
                      <div className={styles.field}>
                        <label htmlFor="email">Email Address *</label>
                        <input
                          id="email"
                          type="email"
                          required
                          placeholder="name@example.com"
                          className={styles.input}
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                        />
                      </div>
                      <div className={styles.field}>
                        <label htmlFor="phone">Phone Number</label>
                        <input
                          id="phone"
                          type="tel"
                          placeholder="+234..."
                          className={styles.input}
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className={styles.field}>
                      <label htmlFor="subject">Subject *</label>
                      <input
                        id="subject"
                        type="text"
                        required
                        placeholder="How can we help you?"
                        className={styles.input}
                        value={form.subject}
                        onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      />
                    </div>

                    <div className={styles.field}>
                      <label htmlFor="message">Message *</label>
                      <textarea
                        id="message"
                        required
                        rows={5}
                        placeholder="Type your message here..."
                        className={styles.textarea}
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn btn-primary btn-lg"
                      style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}
                    >
                      {submitting ? 'Sending Message...' : 'Send Message →'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className={styles.mapSection} aria-label="Our campus location on map">
        <div className="container">
          <div className={styles.mapHeader}>
            <span className="section-badge">Find Us</span>
            <h2 className="section-title">Visit Our Campus</h2>
            <p className="section-subtitle">
              We are located in a secure, accessible area of Gombe. Schedule a visit or stop by during open hours.
            </p>
          </div>
          <div className={styles.mapCard}>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3921.2338148858223!2d11.127814476020585!3d10.283030389837138!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x10fa1b6cfbc82949%3A0xe54d092d6e3c0f4f!2sGombe!5e0!3m2!1sen!2sng!4v1700000000000!5m2!1sen!2sng"
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={`${SCHOOL_NAME} location map`}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
