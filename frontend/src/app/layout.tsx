import type { Metadata, Viewport } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import { SCHOOL_NAME, SCHOOL_TAGLINE, SCHOOL_ADDRESS } from '@/lib/constants';

export const metadata: Metadata = {
  title: {
    default: `${SCHOOL_NAME} | ${SCHOOL_TAGLINE}`,
    template: `%s | ${SCHOOL_NAME}`,
  },
  description: `${SCHOOL_NAME} is a premier nursery and primary school located in Akko LGA, Gombe State, Nigeria. We offer world-class education with a focus on academic excellence, character development, and holistic growth.`,
  keywords: ['Sunrise Academy', 'Gombe school', 'nursery school Gombe', 'primary school Gombe', 'best school in Gombe', 'Akko LGA school'],
  authors: [{ name: SCHOOL_NAME }],
  creator: SCHOOL_NAME,
  openGraph: {
    type: 'website',
    locale: 'en_NG',
    url: 'https://sunriseacademygombe.edu.ng',
    siteName: SCHOOL_NAME,
    title: `${SCHOOL_NAME} | ${SCHOOL_TAGLINE}`,
    description: `Premier nursery and primary school in Gombe State, Nigeria. Nurturing minds and shaping futures since 2009.`,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SCHOOL_NAME} | ${SCHOOL_TAGLINE}`,
    description: 'Premier nursery and primary school in Gombe State, Nigeria.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <script
          type={typeof window === 'undefined' ? 'text/javascript' : 'text/plain'}
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('theme');
                  if (stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.setAttribute('data-theme', 'dark');
                  } else {
                    document.documentElement.removeAttribute('data-theme');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
