import type { Metadata } from 'next';
import NewsClient from './NewsClient';
import { SCHOOL_NAME } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'News & Events',
  description: `Stay informed with the latest updates from ${SCHOOL_NAME} Gombe. Read our science competition success stories, computer lab launches, inter-house sports events, and view the school calendar.`,
};

export default function NewsPage() {
  return <NewsClient />;
}
