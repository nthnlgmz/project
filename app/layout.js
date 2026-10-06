import './globals.css';
import SvgSprite from '../components/SvgSprite';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProtectImages from '../components/ProtectImages';
import ScrollReveal from '../components/ScrollReveal';
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
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Caveat:wght@500;700&family=Hanken+Grotesk:wght@400;600;700;800&display=swap" />
        {/* TEMP stand-in fonts: Caveat (for Biro Script Plus) and Hanken Grotesk (for Akzidenz-Grotesk).
            When the licensed font files arrive, load them with next/font/local and update --font-script / --font-body in globals.css. */}
        <link rel="preload" as="image" href="/images/jars-tray.webp" type="image/webp" />
      </head>
      <body>
        <SvgSprite />
        <ProtectImages />
        <ScrollReveal />
        <a className="skip-link" href="#main">Skip to main content</a>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
