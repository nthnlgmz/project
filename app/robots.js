import { SITE_URL, NOINDEX } from '../lib/seo';

export const dynamic = 'force-static';

// While NOINDEX is on, crawling stays allowed on purpose: Google must be able to fetch the pages to see the
// noindex tag and drop them. Blocking with "Disallow: /" would stop it from seeing the tag. No sitemap is listed.
export default function robots() {
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    ...(NOINDEX ? {} : { sitemap: `${SITE_URL}/sitemap.xml` }),
  };
}
