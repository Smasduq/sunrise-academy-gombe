import type { Metadata } from 'next';
import GalleryClient from './GalleryClient';
import { SCHOOL_NAME } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Gallery',
  description: `Explore the photo gallery of ${SCHOOL_NAME} Gombe. View pictures of classrooms, laboratories, campus facilities, sports events, graduation ceremonies, and student activities.`,
};

export default function GalleryPage() {
  return <GalleryClient />;
}
