// Builds the page's JSON-LD (Google structured data) at build time.
//   Organization / WebSite / WebPage ... lib/schema-base.json
//   FAQPage ............................. lib/faq.js (same text that shows on the page)
//   Product + ItemList + Event .......... generated from public/data/*.json
import Core from '../public/fundys-core.js';
import baseRaw from './schema-base.json';
import { FAQ } from './faq';
import { SITE_URL } from './seo';

// schema-base.json uses __SITE__ so the address comes from one place (lib/seo.js)
const base = JSON.parse(JSON.stringify(baseRaw).split('__SITE__').join(SITE_URL));

export function buildSchema(products, booths) {
  const faqPage = {
    '@type': 'FAQPage',
    mainEntity: FAQ.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
  const graph = Core.applyToGraph([...base, faqPage], { products, booths });
  return { '@context': 'https://schema.org', '@graph': graph };
}

// Safe to place inside <script type="application/ld+json">
export function toJsonLd(obj) {
  return JSON.stringify(obj).replace(/</g, '\\u003c');
}

export { SITE_URL };
