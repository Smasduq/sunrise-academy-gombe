import type { Metadata } from 'next';
import ContactClient from './ContactClient';
import { SCHOOL_NAME } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: `Contact ${SCHOOL_NAME} Gombe. Get our physical address, phone numbers, email address, school hours, campus map directions, and send us an enquiry directly.`,
};

export default function ContactPage() {
  return <ContactClient />;
}
