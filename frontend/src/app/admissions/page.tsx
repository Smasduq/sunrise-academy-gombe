import type { Metadata } from 'next';
import AdmissionsClient from './AdmissionsClient';
import { SCHOOL_NAME } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Admissions',
  description: `Find out how to apply for admission to ${SCHOOL_NAME}. View admission requirements, enrolment processes, fee details, and FAQ list for Nursery and Primary levels.`,
};

export default function AdmissionsPage() {
  return <AdmissionsClient />;
}
