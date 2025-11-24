import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'House Arkanum: Haunted Codebase',
  description: 'A spooky interactive 3D experience where you fix haunted bugs',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
