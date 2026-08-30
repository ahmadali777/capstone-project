import './globals.css';
import type { Metadata, Viewport } from 'next';

export const viewport: Viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://capstone-project-three-silk-20.vercel.app'),
  title: {
    default: 'SpatialStager AI — AI-Assisted 3D Room Staging',
    template: '%s | SpatialStager AI',
  },
  description:
    'Design and stage 3D room layouts in your browser. Place furniture with arrow keys, adjust materials and lighting, and get AI-powered interior-design advice.',
  manifest: '/site.webmanifest',
  applicationName: 'SpatialStager AI',
  keywords: [
    '3D room designer',
    'interior design',
    'room staging',
    'furniture layout',
    'AI design assistant',
    'Virtual staging',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    url: 'https://capstone-project-three-silk-20.vercel.app',
    siteName: 'SpatialStager AI',
    title: 'SpatialStager AI — AI-Assisted 3D Room Staging',
    description:
      'Design and stage 3D room layouts in your browser with AI-powered interior-design advice.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'SpatialStager AI 3D room designer' }],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SpatialStager AI — AI-Assisted 3D Room Staging',
    description:
      'Design and stage 3D room layouts in your browser with AI-powered interior-design advice.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  authors: [{ name: 'Muhammad Ahmad Ali', url: 'https://ahmad-swe-portfolio.vercel.app' }],
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    other: [{ rel: 'apple-touch-icon-precomposed', url: '/apple-touch-icon.png' }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
