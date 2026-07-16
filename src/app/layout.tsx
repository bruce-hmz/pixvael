import type { Metadata } from 'next';
import Script from 'next/script';
import ReactDOM from 'react-dom';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

// Google Analytics 4 Measurement ID（前端嵌入，公开非敏感）
const GA_MEASUREMENT_ID = 'G-9J8DN1GE8J';

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
  // 预加载首屏字体:否则字体请求要等 CSS 下载+解析完(@font-face)才发起,
  // 处于 HTML→CSS→字体 串行链上(低速 4G 手机端关键路径约 750ms)
  ReactDOM.preload('/fonts/geist-mono-latin.woff2', {
    as: 'font',
    crossOrigin: 'anonymous',
  });
  ReactDOM.preload('/fonts/pixelify-sans-latin.woff2', {
    as: 'font',
    crossOrigin: 'anonymous',
  });

  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className="h-full antialiased"
    >
      <body className="flex min-h-full flex-col">
        {process.env.NODE_ENV === 'production' && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="gtag-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_MEASUREMENT_ID}');
              `}
            </Script>
          </>
        )}
        <Header />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
