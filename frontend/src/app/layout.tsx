import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'The Oasis | Curated Luxury Stays & Resort Reservations',
  description: 'The Oasis - Live luxury hotel reservation and resort sanctuary platform powered by Java and Next.js.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body>{children}</body>
    </html>
  );
}
