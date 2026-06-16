import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import Hero from '@/components/Hero/Hero';
import StatsSection from '@/components/StatsSection/StatsSection';
import WhyChooseUs from '@/components/WhyChooseUs/WhyChooseUs';
import ProgramsSection from '@/components/ProgramsSection/ProgramsSection';
import { SCHOOL_NAME, SCHOOL_TAGLINE } from '@/lib/constants';

// Lazy loading below-the-fold sections using React.lazy/dynamic imports
const NewsSection = dynamic(() => import('@/components/NewsSection/NewsSection'), {
  loading: () => <div className="skeleton" style={{ height: '400px', marginBlock: '4rem' }} />
});
const GalleryPreview = dynamic(() => import('@/components/GalleryPreview/GalleryPreview'), {
  loading: () => <div className="skeleton" style={{ height: '300px', marginBlock: '4rem' }} />
});
const ContactPreview = dynamic(() => import('@/components/ContactPreview/ContactPreview'), {
  loading: () => <div className="skeleton" style={{ height: '400px', marginBlock: '4rem' }} />
});

export const metadata: Metadata = {
  title: `${SCHOOL_NAME} | ${SCHOOL_TAGLINE}`,
  description: 'Sunrise Academy Gombe is a premier nursery and primary school in Akko LGA, Gombe State. We nurture minds and shape futures through academic excellence and holistic development.',
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <StatsSection />
      <WhyChooseUs />
      <ProgramsSection />
      <NewsSection />
      <GalleryPreview />
      <ContactPreview />
    </>
  );
}

