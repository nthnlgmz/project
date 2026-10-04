import './globals.css';
import SvgSprite from '../components/SvgSprite';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { metadata as seoMetadata, viewport as seoViewport } from '../lib/seo';

// Title, description, canonical, Open Graph, Twitter and icons all come from lib/seo.js
export const metadata = seoMetadata;
export const viewport = seoViewport;

export default function RootLayout({ children }) {
  return (
    <html lang="en-PH">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,800&family=Nunito:wght@400;600;700&display=swap" />
        <link rel="preload" as="image" href="/images/jars-tray.webp" type="image/webp" />
      </head>
      <body>
        <SvgSprite />
        <a className="skip-link" href="#main">Skip to main content</a>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
