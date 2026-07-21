import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SpatialStager AI',
  description: 'AI-powered interactive 3D room staging',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
