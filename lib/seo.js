// ALL page-level SEO text lives here. Edit this one file to change titles, descriptions and share images.
// Products and upcoming booths are NOT listed here: their structured data is generated automatically
// from the Supabase `products` and `booths` tables (see lib/schema.js).

export const SITE_URL = 'https://fundys-spread.vercel.app';

export const TITLE = "Fundy's Spread | Gourmet Cheese Palaman with Imported Edam";
export const DESCRIPTION =
  "Fundy's Spread: gourmet cheese palaman made with imported Edam. Pimiento, Spicy, Truffle and Basil Pesto in 200g jars. Order on Shopee or TikTok Shop.";
export const SOCIAL_DESCRIPTION =
  'Gourmet cheese palaman made with imported Edam cheese in Pimiento, Spicy Pimiento, Truffle and Basil Pesto. Order on Shopee or TikTok Shop.';

export const SHARE_IMAGE = {
  url: '/images/og-image.jpg', // 1200x630, in public/images
  width: 1200,
  height: 630,
  type: 'image/jpeg',
  alt: "Fundy's booth with jars of Fundy's Spread displayed on a red gingham table",
};

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  applicationName: "Fundy's",
  authors: [{ name: "Fundy's" }],
  alternates: {
    canonical: '/',
    languages: { 'en-PH': '/', 'x-default': '/' },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 },
  },
  openGraph: {
    type: 'website',
    siteName: "Fundy's",
    locale: 'en_PH',
    url: '/',
    title: TITLE,
    description: SOCIAL_DESCRIPTION,
    images: [SHARE_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: SOCIAL_DESCRIPTION,
    images: [{ url: SHARE_IMAGE.url, alt: SHARE_IMAGE.alt }],
  },
  // Updated icons object to support both .ico and .svg
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
  },
  other: { 'geo.region': 'PH' },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1f4a38',
};
