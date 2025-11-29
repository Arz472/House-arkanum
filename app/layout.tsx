import type { Metadata, Viewport } from 'next';
import './globals.css';
import { MobileControlsProvider } from '@/lib/MobileControlsContext';

export const metadata: Metadata = {
  title: 'House Arkanum: Haunted Codebase',
  description: 'A spooky interactive 3D experience where you fix haunted bugs',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <MobileControlsProvider>
          {children}
        </MobileControlsProvider>
      </body>
    </html>
  );
}
