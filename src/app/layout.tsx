import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: {
    default: 'Pixvael — Image to Pixel Art Converter',
    template: '%s | Pixvael',
  },
  description:
    'Free online image to pixel art converter. Turn any photo into pixel art in your browser — no signup, nothing uploaded. Minecraft, 8-bit, Game Boy palettes.',
  metadataBase: new URL('https://pixvael.com'),
  openGraph: {
    title: 'Pixvael — Image to Pixel Art Converter',
    description:
      'Turn any photo into pixel art in your browser. Free, private, no signup.',
    url: 'https://pixvael.com',
    siteName: 'Pixvael',
    type: 'website',
    images: [{ url: '/hero-portrait-v2.jpg', width: 1600, height: 900 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pixvael — Image to Pixel Art Converter',
    description:
      'Turn any photo into pixel art in your browser. Free, private, no signup.',
    images: ['/hero-portrait-v2.jpg'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className="h-full antialiased"
    >
      <body className="flex min-h-full flex-col">
        <Header />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
